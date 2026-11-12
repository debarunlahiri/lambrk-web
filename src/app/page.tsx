"use client";

import { useSyncExternalStore } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Feed from "@/components/Feed";
import Landing from "@/components/Landing";

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
    return <Landing />;
  }

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
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
