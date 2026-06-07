"use client";

import { useState, useEffect, useCallback } from "react";
import { listPostsMedia, getRelatedPosts } from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import LoopMixViewer from "@/components/LoopMixViewer";
import { Loader2 } from "lucide-react";

export default function LoopMixPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchPosts = useCallback(async (nextPage: number) => {
    const data = await listPostsMedia("ALL", nextPage, 20);
    const mapped = data.content.map(mapFeedPost);
    if (nextPage === 0) {
      setPosts(mapped);
    } else {
      setPosts((prev) => [...prev, ...mapped]);
    }
    setHasMore(!data.last);
    setPage(nextPage);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchPosts(0)
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchPosts]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      await fetchPosts(page + 1);
    } catch {} finally {
      setLoadingMore(false);
    }
  }, [fetchPosts, loadingMore, hasMore, page]);

  const loadRelated = useCallback(async (postId: string) => {
    try {
      const related = await getRelatedPosts(postId, 10);
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newPosts = related.map(mapFeedPost).filter((p) => !existingIds.has(p.id));
        return [...prev, ...newPosts];
      });
    } catch {}
  }, []);

  if (loading) {
    return (
      <div className="flex h-[100dvh] w-full items-center justify-center bg-black">
        <Loader2 size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-2 bg-black">
        <p className="text-lg font-bold text-white/70">Something went wrong</p>
        <button
          onClick={() => { if (typeof window !== "undefined") window.location.reload(); }}
          className="rounded-full bg-accent px-5 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-black -mx-4 md:-mx-0">
      {/* Hide top nav on mobile for immersion */}
      <style>{`
        #top-nav { display: none !important; }
      `}</style>

      <LoopMixViewer posts={posts} onLoadMore={loadMore} onLoadRelated={loadRelated} />
    </div>
  );
}
