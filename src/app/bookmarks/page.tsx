"use client";

import { useState, useEffect } from "react";
import { Bookmark, Loader2 } from "lucide-react";
import { listBookmarks } from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";

export default function BookmarksPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchBookmarks = async (nextPage: number) => {
    const data = await listBookmarks(nextPage, 20);
    const mapped = data.content.map((post) => ({
      ...mapFeedPost(post),
      isBookmarked: true,
    }));
    if (nextPage === 0) {
      setPosts(mapped);
    } else {
      setPosts((prev) => [...prev, ...mapped]);
    }
    setHasMore(!data.last);
    setPage(nextPage);
  };

  useEffect(() => {
    let cancelled = false;
    fetchBookmarks(0)
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const loadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchBookmarks(page + 1);
    } catch {} finally {
      setLoadingMore(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-lg font-bold text-muted">Something went wrong</p>
        <button
          onClick={() => { if (typeof window !== "undefined") window.location.reload(); }}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-black tracking-tight">
          <span className="gradient-text">Bookmarks</span>
        </h1>
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
          <Bookmark size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-bold">Nothing saved yet</p>
          <p className="text-sm">Posts you bookmark will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="gradient-text">Bookmarks</span>
      </h1>

      <div className="flex flex-col gap-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center py-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="rounded-full bg-surface px-5 py-2 text-sm font-bold text-foreground ring-1 ring-border transition-all hover:bg-border disabled:opacity-50"
          >
            {loadingMore ? <Loader2 size={16} className="animate-spin" /> : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
