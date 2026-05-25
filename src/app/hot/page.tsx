"use client";

import { useEffect, useState } from "react";
import { Flame, Loader2, TrendingUp, Inbox } from "lucide-react";
import { getFeedHot } from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";

export default function HotPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    getFeedHot(30)
      .then((data) => {
        if (cancelled) return;
        setPosts((data.posts || []).map(mapFeedPost));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load hot posts");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          <span className="gradient-text">Hot</span> Right Now
        </h1>
        <p className="mt-1 text-sm text-muted">
          The most popular posts trending today
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Flame size={32} className="opacity-40" />
          <p className="text-sm font-bold">Failed to load hot posts</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-full bg-surface px-4 py-1.5 text-xs font-medium transition-colors hover:bg-border"
          >
            Retry
          </button>
        </div>
      )}

      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <TrendingUp size={40} className="opacity-30" />
          <p className="text-lg font-bold">No trending posts</p>
          <p className="text-sm">Check back later for what is hot</p>
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post, index) => (
            <div key={post.id} className="relative">
              {index < 3 && (
                <div className="absolute -left-1 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white shadow-lg">
                  {index + 1}
                </div>
              )}
              <div className={index < 3 ? "pl-8" : ""}>
                <PostCard post={post} />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && posts.length > 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Flame size={32} className="mb-3 opacity-40" />
          <p className="text-sm font-bold">That is all for now</p>
          <p className="text-xs">Check back later for more trending posts</p>
        </div>
      )}
    </div>
  );
}
