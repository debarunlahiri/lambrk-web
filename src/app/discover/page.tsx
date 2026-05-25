"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Sparkles,
  Loader2,
  Zap,
  Compass,
  Hash,
  Users,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getTrendingRecommendations,
  getRecommendedPosts,
  getRecommendedCommunities,
  type FeedPost,
  type Community,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";

export default function DiscoverPage() {
  const { user, isAuthenticated } = useAuth();

  const [posts, setPosts] = useState<Post[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"trending" | "for-you">("trending");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    const trendingPromise = getTrendingRecommendations("posts", 20).then(
      (r) => ({ posts: r.posts, communities: [] as Community[] })
    );

    const personalizedPromise =
      isAuthenticated && user
        ? Promise.all([
            getRecommendedPosts(user.id, 20),
            getRecommendedCommunities(user.id, 10),
          ]).then(([postsR, commsR]) => ({
            posts: postsR.posts,
            communities: commsR.communities,
          }))
        : Promise.resolve({ posts: [] as FeedPost[], communities: [] as Community[] });

    const promise = tab === "for-you" ? personalizedPromise : trendingPromise;

    promise
      .then((data) => {
        if (cancelled) return;
        setPosts(data.posts.map(mapFeedPost));
        setCommunities(data.communities);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Failed to load recommendations"
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab, isAuthenticated, user]);

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="gradient-text">Discover</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Discover trending and personalized content
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-surface p-1">
        {(
          [
            { key: "trending" as const, label: "Trending", icon: TrendingUp },
            ...(isAuthenticated
              ? [{ key: "for-you" as const, label: "For You", icon: Sparkles }]
              : []),
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-20 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Zap size={32} className="opacity-40" />
          <p className="text-sm font-bold">Could not load recommendations</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => setTab(tab)}
            className="mt-2 rounded-full bg-surface px-4 py-1.5 text-xs font-medium transition-colors hover:bg-border"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && communities.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <Compass size={40} className="opacity-30" />
          <p className="text-lg font-bold">Nothing to show yet</p>
          <p className="text-sm">
            Keep engaging and recommendations will appear
          </p>
        </div>
      )}

      {/* Communities */}
      {!loading && !error && communities.length > 0 && (
        <div>
          <div className="mb-4 flex items-center gap-2">
            <Hash size={18} className="text-muted" />
            <h2 className="text-lg font-bold">Communities</h2>
          </div>
          <div className="flex flex-col gap-3">
            {communities.map((comm) => (
              <Link
                key={comm.id}
                href={`/community/${comm.name}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden">
                  {comm.iconImageUrl ? (
                    <img
                      src={comm.iconImageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    comm.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">r/{comm.name}</p>
                  <p className="text-xs text-muted truncate">{comm.title}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted shrink-0">
                  <Users size={14} />
                  <span>{comm.memberCount}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Posts */}
      {!loading && !error && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
