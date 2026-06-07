"use client";

import { useState, useEffect } from "react";
import { listPostsHot } from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import LoopMixViewer from "@/components/LoopMixViewer";
import { Loader2 } from "lucide-react";

export default function LoopMixPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    listPostsHot(0, 50)
      .then((data) => {
        if (cancelled) return;
        const mapped = data.content.map(mapFeedPost);
        const withMedia = mapped.filter((p) => p.media && p.media.length > 0);
        setPosts(withMedia);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
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

      <LoopMixViewer posts={posts} />
    </div>
  );
}
