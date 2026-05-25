"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Feed from "@/components/Feed";
import { ArrowRight, Sparkles, Users, Globe } from "lucide-react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  const isClient = useIsClient();

  if (!isClient || !isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center gap-8 py-16 text-center">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
            Welcome to <span className="gradient-text">lambrk</span>
          </h1>
          <p className="max-w-md text-lg text-muted">
            Share your moments, discover communities, and connect with people around the world.
          </p>
        </div>

        <div className="grid w-full max-w-md gap-4">
          <Link
            href="/register"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-background transition-opacity hover:opacity-80"
          >
            Get Started
            <ArrowRight size={20} />
          </Link>
          <Link
            href="/login"
            className="flex h-14 items-center justify-center gap-2 rounded-full bg-card text-base font-bold ring-1 ring-border transition-colors hover:bg-surface"
          >
            Sign In
          </Link>
        </div>

        <div className="grid w-full max-w-md grid-cols-3 gap-3 pt-4">
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <Sparkles size={24} className="text-accent" />
            <p className="text-xs font-bold">Share</p>
            <p className="text-[10px] text-muted">Photos & videos</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <Users size={24} className="text-accent" />
            <p className="text-xs font-bold">Communities</p>
            <p className="text-[10px] text-muted">Join groups</p>
          </div>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
            <Globe size={24} className="text-accent" />
            <p className="text-xs font-bold">Discover</p>
            <p className="text-[10px] text-muted">Trending topics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">
          Your <span className="gradient-text">Feed</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          See what the world is sharing today
        </p>
      </div>
      <Feed />
    </div>
  );
}
