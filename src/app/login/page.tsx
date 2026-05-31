"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { ApiError } from "@/lib/api";
import { Loader2, AlertCircle, Mail, Lock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 py-12">
        <Loader2 size={32} className="animate-spin text-muted" />
        <p className="text-sm text-muted">Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 py-12">
        <Loader2 size={32} className="animate-spin text-accent" />
        <p className="text-sm text-muted">Redirecting...</p>
      </div>
    );
  }

  return <LoginForm login={login} />;
}

function LoginForm({ login }: { login: (username: string, password: string) => Promise<void> }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
    } catch (err: unknown) {
      let message = "Login failed. Please try again.";
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-black tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-muted">
            Sign in to your Lambrk account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 px-4 py-3.5 text-sm text-red-500 animate-in fade-in slide-in-from-top-2">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Username</label>
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="johndoe"
                className="w-full rounded-2xl bg-card py-3.5 pl-11 pr-4 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-accent/30 hover:ring-accent/20"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-2xl bg-card py-3.5 pl-11 pr-4 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-accent/30 hover:ring-accent/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-13 items-center justify-center gap-2 rounded-full bg-foreground text-sm font-bold text-background transition-all hover:opacity-80 disabled:opacity-50 shadow-lg shadow-foreground/10"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-accent hover:underline underline-offset-4">
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
