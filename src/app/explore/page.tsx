"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search,
  TrendingUp,
  ArrowUpRight,
  Loader2,
  Users,
  Hash,
  Plus,
  X,
  Sparkles,
} from "lucide-react";
import {
  listCategories,
  listTrendingCommunities,
  searchCommunities,
  getRecommendedCommunities,
  type Category,
  type Community,
} from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";

export default function ExplorePage() {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [recommended, setRecommended] = useState<Community[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [catLoading, setCatLoading] = useState(true);
  const [commLoading, setCommLoading] = useState(true);
  const [catError, setCatError] = useState("");
  const [commError, setCommError] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Community[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    listCategories()
      .then((data) => setCategories(data.content))
      .catch((err) =>
        setCatError(err instanceof Error ? err.message : "Failed to load categories")
      )
      .finally(() => setCatLoading(false));

    listTrendingCommunities()
      .then((data) => setCommunities(data.content))
      .catch((err) =>
        setCommError(err instanceof Error ? err.message : "Failed to load communities")
      )
      .finally(() => setCommLoading(false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    setRecLoading(true);
    getRecommendedCommunities(user.id, 10)
      .then((data) => setRecommended(data.communities))
      .catch(() => {})
      .finally(() => setRecLoading(false));
  }, [isAuthenticated, user]);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      if (!query.trim()) {
        setSearchResults([]);
        setShowResults(false);
        setSearchError("");
        return;
      }

      setSearchLoading(true);
      setSearchError("");

      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const data = await searchCommunities(query.trim());
          setSearchResults(data.content);
          setShowResults(true);
        } catch (err) {
          setSearchError(
            err instanceof Error ? err.message : "Search failed"
          );
          setSearchResults([]);
          setShowResults(true);
        } finally {
          setSearchLoading(false);
        }
      }, 300);
    },
    []
  );

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
    setSearchError("");
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="gradient-text">Explore</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            Discover communities and categories
          </p>
        </div>
        <Link
          href="/create-community"
          className="flex items-center gap-2 rounded-full bg-gradient-to-br from-accent to-accent-2 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
        >
          <Plus size={18} />
          <span className="hidden sm:inline">Create</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <div className="flex items-center gap-3 rounded-3xl bg-card p-4 shadow-sm ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/40 transition-all">
          <Search size={20} className="text-muted shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search communities..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60"
            onFocus={() => {
              if (searchResults.length > 0 || searchError) setShowResults(true);
            }}
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-muted transition-colors hover:bg-border hover:text-foreground"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Search results dropdown */}
        {showResults && (
          <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-3xl bg-card shadow-xl ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-150">
            {searchLoading && (
              <div className="flex items-center justify-center py-8 text-muted">
                <Loader2 size={24} className="animate-spin" />
              </div>
            )}

            {searchError && (
              <div className="px-4 py-6 text-center">
                <Search size={24} className="mx-auto mb-2 text-muted opacity-40" />
                <p className="text-sm text-red-500">{searchError}</p>
              </div>
            )}

            {!searchLoading && !searchError && searchResults.length === 0 && (
              <div className="px-4 py-6 text-center">
                <Hash size={24} className="mx-auto mb-2 text-muted opacity-40" />
                <p className="text-sm text-muted">No communities found</p>
                <p className="text-xs text-muted">
                  Try a different search term
                </p>
              </div>
            )}

            {!searchLoading && searchResults.length > 0 && (
              <div className="py-1">
                {searchResults.map((comm) => (
                  <Link
                    key={comm.id}
                    href={`/community/${comm.name}`}
                    onClick={() => clearSearch()}
                    className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white overflow-hidden">
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
                      <p className="text-sm font-bold truncate">
                        r/{comm.name}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {comm.title}
                      </p>
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
        )}

        {/* Overlay to close search */}
        {showResults && (
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowResults(false)}
          />
        )}
      </div>

      {/* Categories */}
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
                  src={
                    cat.imageUrl ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=80"
                  }
                  alt={cat.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 p-4">
                  <p className="text-lg font-bold text-white">{cat.name}</p>
                  {cat.communityCount > 0 && (
                    <p className="text-xs text-white/80">
                      {cat.communityCount} communities
                    </p>
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

      {/* Recommended For You */}
      {isAuthenticated && (recLoading || recommended.length > 0) && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recommended For You</h2>
            <Sparkles size={18} className="text-accent-2" />
          </div>

          {recLoading && (
            <div className="flex items-center justify-center py-12 text-muted">
              <Loader2 size={28} className="animate-spin" />
            </div>
          )}

          {!recLoading && recommended.length > 0 && (
            <div className="flex flex-col gap-3">
              {recommended.map((comm) => (
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
          )}
        </div>
      )}

      {/* Trending Communities */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold">Trending Communities</h2>
          <TrendingUp size={18} className="text-accent" />
        </div>

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
            <p className="text-xs">Be the first to create one</p>
            <Link
              href="/create-community"
              className="mt-4 flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-bold text-background transition-opacity hover:opacity-80"
            >
              <Plus size={14} />
              Create Community
            </Link>
          </div>
        )}

        {!commLoading && !commError && communities.length > 0 && (
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
        )}
      </div>
    </div>
  );
}
