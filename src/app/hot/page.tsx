"use client";

import { Flame } from "lucide-react";
import { mockPosts } from "@/lib/data";
import PostCard from "@/components/PostCard";

export default function HotPage() {
  const sorted = [...mockPosts].sort((a, b) => b.likes - a.likes);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          <span className="gradient-text">Hot</span> Right Now
        </h1>
        <p className="mt-1 text-sm text-muted">
          The most popular posts trending today
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {sorted.map((post, index) => (
          <div key={post.id} className="relative">
            <div className="absolute -left-1 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white shadow-lg">
              {index + 1}
            </div>
            <div className="pl-8">
              <PostCard post={post} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
        <Flame size={32} className="mb-3 opacity-40" />
        <p className="text-sm font-bold">That is all for now</p>
      </div>
    </div>
  );
}
