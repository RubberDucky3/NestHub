import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import { createHash, randomBytes } from "crypto";
import jwt from "jsonwebtoken";
import { authStorage } from "./storage";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client();

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret_key_123";
const JWT_EXPIRES_IN = "7d";
const DEV_LOGIN_USER_ID = process.env.DEV_LOGIN_USER_ID || "dev-homehub-user";
const DEV_LOGIN_EMAIL = process.env.DEV_LOGIN_EMAIL || "dev@homehub.local";
const DEV_LOGIN_FIRST_NAME = process.env.DEV_LOGIN_FIRST_NAME || "Dev";
const DEV_LOGIN_LAST_NAME = process.env.DEV_LOGIN_LAST_NAME || "User";

// Simple password hashing using crypto
function hashPassword(password: string, salt: string): string {
  return createHash("sha256").update(password + salt).digest("hex");
}

function generateSalt(): string {
  return randomBytes(16).toString("hex");
}

function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function verifyToken(token: string): { id: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string };
  } catch {
    return null;
  }
}

function sanitizeUser(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    profileImageUrl: user.profileImageUrl,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  return session({
    secret: process.env.SESSION_SECRET || "dev_secret_key_123",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Local strategy for login
  passport.use(
    "local",
    new LocalStrategy(
      { usernameField: "email", passwordField: "password" },
      async (email, password, done) => {
        try {
          const user = await authStorage.getUserByEmail(email);
          if (!user) {
            return done(null, false, { message: "Invalid email or password" });
          }
          if (!user.passwordHash || !user.salt) {
            return done(null, false, { message: "Invalid email or password" });
          }
          const hash = hashPassword(password, user.salt);
          if (hash !== user.passwordHash) {
            return done(null, false, { message: "Invalid email or password" });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  passport.serializeUser((user: any, cb) => cb(null, user.id));
  passport.deserializeUser(async (id: string, cb) => {
    try {
      const user = await authStorage.getUser(id);
      cb(null, user || null);
    } catch (err) {
      cb(err);
    }
  });

  // ============ WEB AUTH (session-based) ============

  // Register endpoint (web)
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      const user = await authStorage.createUserWithPassword({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash,
        salt,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.status(201).json(sanitizeUser(user));
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint (web)
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(sanitizeUser(user));
      });
    })(req, res, next);
  });

  // Dev login endpoint (web) - only available in development
  app.post("/api/dev-login", async (req, res, next) => {
    if (process.env.NODE_ENV !== "development") {
      return res.status(404).json({ message: "Not found" });
    }

    const isChild = req.query.role === "child";

    try {
      const user = await authStorage.upsertUser({
        id: isChild ? "dev-child-user" : DEV_LOGIN_USER_ID,
        email: isChild ? "child@homehub.local" : DEV_LOGIN_EMAIL,
        firstName: isChild ? "Dev" : DEV_LOGIN_FIRST_NAME,
        lastName: isChild ? "Child" : DEV_LOGIN_LAST_NAME,
        profileImageUrl: null,
        passwordHash: null,
        salt: null,
        role: isChild ? "child" : "parent",
      });

      req.login(user, (err) => {
        if (err) return next(err);
        return res.json(sanitizeUser(user));
      });
    } catch (error) {
      console.error("Dev login error:", error);
      return res.status(500).json({ message: "Dev login failed" });
    }
  });

  // Logout endpoint (web)
  app.post("/api/logout", (req, res) => {
    req.logout(() => {
      res.json({ message: "Logged out" });
    });
  });

  // ============ MOBILE AUTH (JWT-based) ============

  // Register endpoint (mobile) — returns JWT token
  app.post("/api/mobile/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const existing = await authStorage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const salt = generateSalt();
      const passwordHash = hashPassword(password, salt);

      const user = await authStorage.createUserWithPassword({
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        passwordHash,
        salt,
      });

      const token = generateToken(user.id);
      return res.status(201).json({ token, user: sanitizeUser(user) });
    } catch (error) {
      console.error("Mobile registration error:", error);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Login endpoint (mobile) — returns JWT token
  app.post("/api/mobile/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const user = await authStorage.getUserByEmail(email);
      if (!user || !user.passwordHash || !user.salt) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const hash = hashPassword(password, user.salt);
      if (hash !== user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const token = generateToken(user.id);
      return res.json({ token, user: sanitizeUser(user) });
    } catch (error) {
      console.error("Mobile login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Google Login endpoint (mobile)
  app.post("/api/mobile/google-login", async (req, res) => {
    try {
      const { idToken, clientId } = req.body;

      if (!idToken) {
        return res.status(400).json({ message: "ID Token is required" });
      }

      // Verify the token
      const ticket = await client.verifyIdToken({
        idToken,
        audience: [
          process.env.GOOGLE_CLIENT_ID_IOS || "",
          process.env.GOOGLE_CLIENT_ID_WEB || "",
          clientId || ""
        ].filter(Boolean),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        return res.status(400).json({ message: "Invalid token payload" });
      }

      // Check for existing user or create new one
      let user = await authStorage.getUserByEmail(payload.email);

      if (!user) {
        // Create new user for social login
        user = await authStorage.upsertUser({
          email: payload.email,
          firstName: payload.given_name || null,
          lastName: payload.family_name || null,
          profileImageUrl: payload.picture || null,
          role: "parent", // Default role
          isSubscribed: false,
        });
      }

      const token = generateToken(user.id);
      return res.json({ token, user: sanitizeUser(user) });
    } catch (error) {
      console.error("Mobile Google login error:", error);
      res.status(500).json({ message: "Google login failed" });
    }
  });
}

// Middleware: accepts BOTH session cookies (web) AND Bearer tokens (mobile)
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // 1. Check session auth first (web)
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }

  // 2. Check Bearer token (mobile)
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const decoded = verifyToken(token);
    if (decoded) {
      const user = await authStorage.getUser(decoded.id);
      if (user) {
        req.user = user;
        return next();
      }
    }
  }

  return res.status(401).json({ message: "Unauthorized" });
};
