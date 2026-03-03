import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, Sparkles, Heart, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { GoogleAuth } from "@codetrix-studio/capacitor-google-auth";
import { getApiUrl } from "@/lib/api-config";
import { Capacitor } from "@capacitor/core";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [devLoading, setDevLoading] = useState(false);
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const showDevLogin = import.meta.env.DEV;

  const features = [
    { title: "Shared Tasks", desc: "Gamified chores for the whole family" },
    { title: "Smart Grocery List", desc: "Never forget milk again" },
    { title: "Family Calendar", desc: "Coordinate schedules in one place" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = isLogin ? "/api/login" : "/api/register";
      const body = isLogin
        ? { email, password }
        : { email, password, firstName, lastName };

      const res = await fetch(`${getApiUrl()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Something went wrong");
        return;
      }

      queryClient.setQueryData(["/api/auth/user"], data);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDevLogin = async (role: "admin" | "child") => {
    setError("");
    setDevLoading(true);

    try {
      const res = await fetch(`/api/dev-login?role=${role}`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Dev login failed");
        return;
      }

      queryClient.setQueryData(["/api/auth/user"], data);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch {
      setError("Dev login failed. Please try again.");
    } finally {
      setDevLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);

    try {
      const googleUser = await GoogleAuth.signIn();
      const idToken = googleUser.authentication.idToken;

      const res = await fetch(`${getApiUrl()}/api/mobile/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          clientId: Capacitor.getPlatform() === 'ios' ? import.meta.env.VITE_GOOGLE_CLIENT_ID_IOS : undefined
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Google login failed");
        return;
      }

      // For mobile, we store the token and refetch the user
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      queryClient.setQueryData(["/api/auth/user"], data.user);
      await queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setLocation("/");
    } catch (err: any) {
      if (err.message !== "User cancelled login") {
        setError("Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navigation */}
      <nav className="border-b border-border/40 bg-background/80 backdrop-blur-md fixed top-0 w-full z-50 pt-[env(safe-area-inset-top)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <Heart className="h-5 w-5 fill-current" />
            </div>
            <span className="font-display font-bold text-xl">HomeHub</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Create Account" : "Log In"}
          </Button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-medium">
              <Sparkles className="w-4 h-4 mr-2" />
              Your digital family command center
            </div>
            <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight text-foreground">
              Organize your family life{" "}
              <span className="text-primary">in one place</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              Coordinate chores, meals, and schedules with a beautiful dashboard
              designed for modern families.
            </p>

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4 max-w-sm">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
              <Button
                type="submit"
                size="lg"
                className="w-full text-lg h-14"
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : null}
                {isLogin ? "Log In" : "Get Started for Free"}
              </Button>
              <div className="relative pt-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full h-12 flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                  />
                </svg>
                Google
              </Button>

              {showDevLogin && (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full h-12"
                    onClick={() => handleDevLogin("admin")}
                    disabled={devLoading}
                  >
                    Parent Login
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 border-primary text-primary hover:bg-primary/5"
                    onClick={() => handleDevLogin("child")}
                    disabled={devLoading}
                  >
                    Child Login
                  </Button>
                </div>
              )}
              <p className="text-sm text-muted-foreground text-center">
                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  className="text-primary underline-offset-4 hover:underline"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError("");
                  }}
                >
                  {isLogin ? "Sign up" : "Log in"}
                </button>
              </p>
            </form>

            <div className="space-y-4 pt-8 border-t border-border">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-6 w-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-medium">{f.title}:</span>
                  <span className="text-muted-foreground">{f.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary to-secondary opacity-20 blur-3xl rounded-full" />
            <img
              src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1600&h=1200&fit=crop"
              alt="Happy family using tablet"
              className="relative rounded-3xl shadow-2xl border border-white/20 transform rotate-2 hover:rotate-0 transition-all duration-500"
            />
          </div>
        </div>
      </main>
    </div>
  );
}
