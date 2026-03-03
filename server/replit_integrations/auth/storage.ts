import { users, type User, type UpsertUser } from "@shared/models/auth";
import { db } from "../../db";
import { eq, sql } from "drizzle-orm";

// Interface for auth storage operations
export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<(User & { passwordHash?: string | null; salt?: string | null }) | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createUserWithPassword(data: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    passwordHash: string;
    salt: string;
  }): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<(User & { passwordHash?: string | null; salt?: string | null }) | undefined> {
    const result = await db.execute(
      sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`
    );
    const row = result.rows?.[0] as any;
    if (!row) return undefined;
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      profileImageUrl: row.profile_image_url,
      role: row.role || "member",
      totalPoints: row.total_points || 0,
      currentStreak: row.current_streak || 0,
      mentalLoadScore: row.mental_load_score || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      passwordHash: row.password_hash,
      salt: row.salt,
    };
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createUserWithPassword(data: {
    email: string;
    firstName: string | null;
    lastName: string | null;
    passwordHash: string;
    salt: string;
  }): Promise<User> {
    const result = await db.execute(
      sql`INSERT INTO users (id, email, first_name, last_name, password_hash, salt, created_at, updated_at)
          VALUES (gen_random_uuid(), ${data.email}, ${data.firstName}, ${data.lastName}, ${data.passwordHash}, ${data.salt}, NOW(), NOW())
          RETURNING *`
    );
    const row = result.rows[0] as any;
    return {
      id: row.id,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      profileImageUrl: row.profile_image_url,
      role: row.role || "member",
      totalPoints: row.total_points || 0,
      currentStreak: row.current_streak || 0,
      mentalLoadScore: row.mental_load_score || 0,
      passwordHash: row.password_hash,
      salt: row.salt,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}

export const authStorage = new AuthStorage();
