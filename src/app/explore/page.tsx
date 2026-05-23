"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search, TrendingUp, ArrowUpRight, Loader2, Users, Hash } from "lucide-react";
import { listCategories, listTrendingCommunities, type Category } from "@/lib/api";
import type { Community } from "@/lib/api";

const trending = [
  { tag: "#SummerVibes", posts: "2.4M" },
  { tag: "#AIRevolution", posts: "1.8M" },
  { tag: "#MinimalistDesign", posts: "890K" },
  { tag: "#StreetPhotography", posts: "654K" },
  { tag: "#IndieGames", posts: "432K" },
];

export default function ExplorePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [catLoading, setCatLoading] = useState(true);
  const [commLoading, setCommLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [commError, setCommError] = useState("");

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.content))
      .catch((err) => setCatError(err instanceof Error ? err.message : "Failed to load categories"))
      .finally(() => setCatLoading(false));

    listTrendingCommunities()
      .then((data) => setCommunities(data.content))
      .catch((err) => setCommError(err instanceof Error ? err.message : "Failed to load communities"))
      .finally(() => setCommLoading(false));
  }, []);

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          <span className="gradient-text">Explore</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          Discover communities and categories
        </p>
      </div>

      <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border">
        <Search size={20} className="text-muted" />
        <input
          type="text"
          placeholder="Search communities, topics, or tags..."
          className="flex-1 bg-transparent outline-none placeholder:text-muted/60"
        />
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold">Categories</h2>

        {catLoading && (
          <div className="flex items-center justify-center py-12 text-muted">
            <Loader2 size={28} className="animate-spin" />
          </div>
        )}

        {catError && (
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {catError}
          </div>
        )}

        {!catLoading && !catError && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-3xl"
              >
                <img
                  src={cat.imageUrl || `https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80`}
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-lg font-bold text-white">{cat.name}</p>
                  {cat.communityCount > 0 && (
                    <p className="text-xs text-white/80">{cat.communityCount} communities</p>
                  )}
                </div>
                <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                  <ArrowUpRight size={16} className="text-white" />
                </div>
                {cat.color && (
                  <div
                    className="absolute left-0 top-0 h-1 w-full"
                    style={{ backgroundColor: cat.color }}
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold">Trending Now</h2>
        <div className="flex flex-col gap-2">
          {trending.map((item, i) => (
            <div
              key={i}
              className="flex cursor-pointer items-center justify-between rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted">
                  {i + 1}
                </span>
                <div>
                  <p className="font-bold">{item.tag}</p>
                  <p className="text-xs text-muted">{item.posts} posts</p>
                </div>
              </div>
              <TrendingUp size={18} className="text-accent" />
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold">Communities</h2>

        {commLoading && (
          <div className="flex items-center justify-center py-12 text-muted">
            <Loader2 size={28} className="animate-spin" />
          </div>
        )}

        {commError && (
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {commError}
          </div>
        )}

        {!commLoading && !commError && communities.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
            <Hash size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-bold">No communities yet</p>
            <p className="text-xs">Communities will appear here</p>
          </div>
        )}

        {!commLoading && !commError && (
          <div className="flex flex-col gap-3">
            {communities.map((comm) => (
              <Link
                key={comm.id}
                href={`/community/${comm.name}`}
                className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden">
                  {comm.iconImageUrl ? (
                    <img src={comm.iconImageUrl} alt="" className="h-full w-full object-cover" />
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
        )}
      </div>
    </div>
  );
}
