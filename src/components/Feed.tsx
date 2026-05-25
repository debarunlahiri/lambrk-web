"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { mapFeedPost, type Post } from "@/lib/data";
import { getFeed, getFeedHot, getFeedNew, getFeedTop, createPost, type FeedPost } from "@/lib/api";
import { Loader2, Sparkles, Flame, Clock, TrendingUp, Inbox } from "lucide-react";

type FeedTab = "algorithm" | "hot" | "new" | "top";

const tabs: { key: FeedTab; label: string; icon: typeof Sparkles }[] = [
  { key: "algorithm", label: "Best", icon: Sparkles },
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
];

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<FeedTab>("algorithm");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    let promise: Promise<{ posts: FeedPost[] }>;
    switch (tab) {
      case "hot":
        promise = getFeedHot(20);
        break;
      case "new":
        promise = getFeedNew(20);
        break;
      case "top":
        promise = getFeedTop(20);
        break;
      default:
        promise = getFeed({ limit: 20, sortBy: tab });
    }

    promise
      .then((data) => {
        if (cancelled) return;
        setPosts((data.posts || []).map(mapFeedPost));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load feed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const handleNewPost = async (
    content: string,
    media: { type: "image" | "video"; url: string }[]
  ) => {
    try {
      const apiPost = await createPost({ content: content.trim(), postType: "TEXT" });
      const newPost = mapFeedPost(apiPost);
      setPosts((prev) => [newPost, ...prev]);
    } catch {
      // Optimistic fallback on failure
      const newPost: Post = {
        id: `pending-${Date.now()}`,
        author: {
          name: user?.displayName || "You",
          handle: user?.username ? `@${user.username}` : "@you",
          avatar: user?.displayName
            ? user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "YO",
          avatarUrl: user?.avatarUrl,
        },
        content,
        media: media.length > 0 ? media : undefined,
        likes: 0,
        dislikes: 0,
        comments: 0,
        reposts: 0,
        timestamp: "now",
      };
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isAuthenticated && <CreatePost onPost={handleNewPost} />}

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-surface p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-all ${
                isActive
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Inbox size={32} className="opacity-40" />
          <p className="text-sm font-bold">Failed to load feed</p>
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
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <Inbox size={40} className="opacity-30" />
          <p className="text-lg font-bold">No posts yet</p>
          <p className="text-sm">
            Follow communities or create your first post
          </p>
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
