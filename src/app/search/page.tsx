"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Loader2,
  TrendingUp,
  Hash,
  Users,
  MessageCircle,
  Clock,
  FileText,
  X,
  Globe,
} from "lucide-react";
import {
  searchAll,
  globalSearchPosts,
  searchCommunitiesApi,
  searchUsers,
  getSearchSuggestions,
  getTrendingSearches,
  type SearchResponse,
  type SearchUser,
  type FeedPost,
  type Community,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";

type SearchTab = "all" | "posts" | "communities" | "users";

const tabs: { key: SearchTab; label: string; icon: typeof FileText }[] = [
  { key: "all", label: "All", icon: Search },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "communities", label: "Communities", icon: Hash },
  { key: "users", label: "Users", icon: Users },
];

function UserCard({ user }: { user: SearchUser }) {
  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  return (
    <Link
      href={`/profile`}
      className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-bold truncate">{user.displayName}</p>
          {user.isVerified && (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
              ✓
            </span>
          )}
        </div>
        <p className="text-xs text-muted">@{user.username}</p>
        {user.bio && (
          <p className="text-xs text-muted truncate mt-0.5">{user.bio}</p>
        )}
      </div>
      <div className="flex items-center gap-1 text-xs text-muted shrink-0">
        {user.karma > 0 && <span>{user.karma} karma</span>}
      </div>
    </Link>
  );
}

function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      href={`/community/${community.name}`}
      className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden">
        {community.iconImageUrl ? (
          <img
            src={community.iconImageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          community.name.slice(0, 2).toUpperCase()
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-bold truncate">r/{community.name}</p>
        <p className="text-xs text-muted truncate">{community.title}</p>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted shrink-0">
        <Users size={14} />
        <span>{community.memberCount}</span>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("all");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [trending, setTrending] = useState<SearchResponse | null>(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    getTrendingSearches()
      .then(setTrending)
      .catch(() => {})
      .finally(() => setTrendingLoading(false));
  }, []);

  const doSearch = useCallback(
    async (searchQuery: string) => {
      if (!searchQuery.trim()) return;
      setSearched(true);
      setShowSuggestions(false);
      setLoading(true);
      setError("");

      try {
        let data: SearchResponse;
        switch (tab) {
          case "posts":
            data = await globalSearchPosts(searchQuery.trim());
            break;
          case "communities":
            data = await searchCommunitiesApi(searchQuery.trim());
            break;
          case "users":
            data = await searchUsers(searchQuery.trim());
            break;
          default:
            data = await searchAll(searchQuery.trim());
        }
        setResults(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Search failed");
        setResults(null);
      } finally {
        setLoading(false);
      }
    },
    [tab]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      doSearch(query);
    }
  };

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (suggTimeoutRef.current) clearTimeout(suggTimeoutRef.current);

    if (!value.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setShowSuggestions(true);
    setSuggLoading(true);

    suggTimeoutRef.current = setTimeout(async () => {
      try {
        const suggs = await getSearchSuggestions(value.trim());
        setSuggestions(suggs);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggLoading(false);
      }
    }, 250);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    doSearch(suggestion);
  };

  const handleTabChange = (newTab: SearchTab) => {
    setTab(newTab);
    if (searched && query.trim()) {
      // Re-search with new tab
      setLoading(true);
      setError("");
      let fn: typeof searchAll;
      switch (newTab) {
        case "posts":
          fn = globalSearchPosts;
          break;
        case "communities":
          fn = searchCommunitiesApi;
          break;
        case "users":
          fn = searchUsers;
          break;
        default:
          fn = searchAll;
      }
      fn(query.trim())
        .then(setResults)
        .catch((err: unknown) =>
          setError(err instanceof Error ? err.message : "Search failed")
        )
        .finally(() => setLoading(false));
    }
  };

  const posts = (results?.posts || []).map(mapFeedPost);
  const communities = results?.communities || [];
  const users = results?.users || [];
  const metadata = results?.metadata;
  const trendingPosts = trending?.posts.map(mapFeedPost) || [];
  const trendingComms = trending?.communities || [];

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="relative flex-1">
            <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-sm ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/40 transition-all">
              <Search size={18} className="text-muted shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  if (suggestions.length > 0) setShowSuggestions(true);
                }}
                placeholder="Search posts, communities, users..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60"
                autoFocus
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSuggestions([]);
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-muted hover:bg-border"
                >
                  <X size={12} />
                </button>
              )}
              {!query && (
                <button
                  onClick={() => doSearch(query)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition-opacity hover:opacity-80"
                >
                  <Search size={14} />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && (suggestions.length > 0 || suggLoading) && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-150">
                  {suggLoading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 size={18} className="animate-spin text-muted" />
                    </div>
                  )}
                  {!suggLoading &&
                    suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestionClick(s)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface text-left"
                      >
                        <Search size={14} className="text-muted shrink-0" />
                        <span className="truncate">{s}</span>
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      {searched && (
        <div className="flex gap-1 rounded-full bg-surface p-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => handleTabChange(t.key)}
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
      )}

      {/* Metadata */}
      {metadata && !loading && (
        <p className="text-xs text-muted">
          {metadata.totalResults} results{" "}
          <span className="opacity-60">
            in {metadata.searchTimeMs}ms
          </span>
        </p>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Search size={32} className="opacity-40" />
          <p className="text-sm font-bold">Search failed</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => doSearch(query)}
            className="mt-2 rounded-full bg-surface px-4 py-1.5 text-xs font-medium transition-colors hover:bg-border"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty results */}
      {!loading && !error && searched && posts.length === 0 && communities.length === 0 && users.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <Search size={40} className="opacity-30" />
          <p className="text-lg font-bold">No results found</p>
          <p className="text-sm">Try a different search term</p>
        </div>
      )}

      {/* Posts */}
      {(tab === "all" || tab === "posts") && posts.length > 0 && !loading && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Communities */}
      {(tab === "all" || tab === "communities") && communities.length > 0 && !loading && (
        <div className="flex flex-col gap-3">
          {communities.map((c) => (
            <CommunityCard key={c.id} community={c} />
          ))}
        </div>
      )}

      {/* Users */}
      {(tab === "all" || tab === "users") && users.length > 0 && !loading && (
        <div className="flex flex-col gap-3">
          {users.map((u) => (
            <UserCard key={u.id} user={u} />
          ))}
        </div>
      )}

      {/* Trending (when no search) */}
      {!searched && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Trending Searches</h2>
            <TrendingUp size={18} className="text-accent" />
          </div>

          {trendingLoading && (
            <div className="flex items-center justify-center py-12 text-muted">
              <Loader2 size={28} className="animate-spin" />
            </div>
          )}

          {!trendingLoading && (trendingPosts.length > 0 || trendingComms.length > 0) && (
            <>
              {trendingComms.length > 0 && (
                <div className="flex flex-col gap-3">
                  {trendingComms.slice(0, 5).map((c) => (
                    <CommunityCard key={c.id} community={c} />
                  ))}
                </div>
              )}
              {trendingPosts.length > 0 && (
                <div className="flex flex-col gap-4">
                  {trendingPosts.slice(0, 5).map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </>
          )}

          {!trendingLoading && trendingPosts.length === 0 && trendingComms.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
              <TrendingUp size={32} className="opacity-40" />
              <p className="text-sm font-bold">No trending searches</p>
              <p className="text-xs">Check back later</p>
            </div>
          )}

          {/* Search tips */}
          <div className="flex flex-col gap-3 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
            <h3 className="text-sm font-bold text-muted">Search Tips</h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted">
                <FileText size={14} />
                <span>Search posts by keywords, titles, or content</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Hash size={14} />
                <span>Find communities by name or topic</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Users size={14} />
                <span>Discover users by username or display name</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted">
                <Globe size={14} />
                <span>Use &quot;All&quot; to search across everything at once</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
