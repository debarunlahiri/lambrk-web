"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Loader2,
  TrendingUp,
  Hash,
  Users,
  UserPlus,
  UserCheck,
  MessageCircle,
  FileText,
  X,
  Globe,
  RefreshCw,
} from "lucide-react";
import {
  searchAll,
  globalSearchPosts,
  searchCommunitiesApi,
  searchUsers,
  getTrendingSearches,
  followUser,
  unfollowUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  type SearchResponse,
  type SearchUser,
  type Community,
} from "@/lib/api";
import { mapFeedPost } from "@/lib/data";
import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { SearchSkeleton, PostSkeletonList, CommunityCardSkeleton } from "@/components/Skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

type SearchTab = "all" | "posts" | "communities" | "users";

const tabs: { key: SearchTab; label: string; icon: typeof FileText }[] = [
  { key: "all", label: "All", icon: Search },
  { key: "posts", label: "Posts", icon: FileText },
  { key: "communities", label: "Communities", icon: Hash },
  { key: "users", label: "Users", icon: Users },
];

function UserCard({ user }: { user: SearchUser }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const { show: showToast } = useToast();
  const [following, setFollowing] = useState(user.followedByCurrentUser ?? false);
  const [friendStatus, setFriendStatus] = useState(
    (user.friendshipStatus ?? (user.friend ? "ACCEPTED" : "NONE")).toUpperCase()
  );
  const [counts, setCounts] = useState(
    {
      followers: user.followerCount ?? 0,
      following: user.followingCount ?? 0,
      friends: user.friendCount ?? 0,
    }
  );
  const [followLoading, setFollowLoading] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);

  const initials = user.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";
  const isOwnUser = currentUser?.username === user.username || currentUser?.id === user.id;
  const isFriend = friendStatus === "ACCEPTED";
  const isFriendPending = friendStatus === "PENDING";
  const requestFromUser = isFriendPending && user.followingCurrentUser;
  const canShowFollowButton = user.canShowFollowButton ?? true;
  const canShowAddFriendButton = user.canShowAddFriendButton ?? true;
  const canViewFollowerCount = user.canViewFollowerCount ?? true;

  const requireAuth = (action: string) => {
    if (isAuthenticated) return true;
    showToast(`Log in to ${action}`, "info");
    return false;
  };

  const handleFollow = async () => {
    if (!requireAuth(following ? "unfollow users" : "follow users")) return;
    if (followLoading) return;

    const next = !following;
    setFollowing(next);
    setCounts((current) => ({
      ...current,
      followers: Math.max(0, current.followers + (next ? 1 : -1)),
    }));
    setFollowLoading(true);

    try {
      if (next) {
        await followUser(user.id, "search");
      } else {
        await unfollowUser(user.id);
      }
      showToast(next ? "Following user" : "Unfollowed user", "success");
    } catch (err: unknown) {
      setFollowing(!next);
      setCounts((current) => ({
        ...current,
        followers: Math.max(0, current.followers + (next ? -1 : 1)),
      }));
      showToast(err instanceof Error ? err.message : "Failed to update follow", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFriendAction = async (action: "send" | "accept" | "decline" | "cancel" | "remove") => {
    if (!requireAuth("manage friends")) return;
    if (friendLoading) return;

    const previous = friendStatus;
    setFriendLoading(true);

    try {
      if (action === "remove") {
        setFriendStatus("NONE");
        setCounts((current) => ({ ...current, friends: Math.max(0, current.friends - 1) }));
        await removeFriend(user.id);
        showToast("Friend removed", "success");
      } else if (action === "accept") {
        setFriendStatus("ACCEPTED");
        setCounts((current) => ({ ...current, friends: current.friends + 1 }));
        await acceptFriendRequest(user.id);
        showToast("Friend request accepted", "success");
      } else if (action === "decline") {
        setFriendStatus("NONE");
        await declineFriendRequest(user.id);
        showToast("Friend request declined", "success");
      } else if (action === "cancel") {
        setFriendStatus("NONE");
        await cancelFriendRequest(user.id);
        showToast("Friend request cancelled", "success");
      } else {
        setFriendStatus("PENDING");
        await sendFriendRequest(user.id, { source: "search" });
        showToast("Friend request sent", "success");
      }
    } catch (err: unknown) {
      setFriendStatus(previous);
      showToast(err instanceof Error ? err.message : "Failed to send friend request", "error");
    } finally {
      setFriendLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-accent/20 sm:flex-row sm:items-center">
      <Link href={`/user/${user.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden shadow-sm">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              loading="lazy"
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
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted">
            {user.karma > 0 && <span>{user.karma} karma</span>}
            <span>{canViewFollowerCount ? counts.followers : "—"} followers</span>
            <span>{counts.friends} friends</span>
          </div>
        </div>
      </Link>

      {!isOwnUser && (
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {(canShowFollowButton || following) && (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all disabled:opacity-60 ${
                following
                  ? "bg-surface text-foreground ring-1 ring-border hover:bg-border"
                  : "bg-foreground text-background hover:opacity-80"
              }`}
            >
              {followLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
              {following ? "Unfollow" : "Follow"}
            </button>
          )}

          {requestFromUser ? (
            <>
              <button
                onClick={() => handleFriendAction("accept")}
                disabled={friendLoading}
                className="flex h-9 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-bold text-white transition-all hover:opacity-80 disabled:opacity-60"
              >
                {friendLoading ? <Loader2 size={14} className="animate-spin" /> : <UserCheck size={14} />}
                Accept
              </button>
              <button
                onClick={() => handleFriendAction("decline")}
                disabled={friendLoading}
                className="flex h-9 items-center gap-1.5 rounded-full bg-surface px-3 text-xs font-bold text-foreground ring-1 ring-border transition-all hover:bg-border disabled:opacity-60"
              >
                Decline
              </button>
            </>
          ) : (canShowAddFriendButton || isFriend || isFriendPending) ? (
            <button
              onClick={() => handleFriendAction(isFriend ? "remove" : isFriendPending ? "cancel" : "send")}
              disabled={friendLoading}
              className="flex h-9 items-center gap-1.5 rounded-full bg-surface px-3 text-xs font-bold text-foreground ring-1 ring-border transition-all hover:bg-border disabled:opacity-60"
            >
              {friendLoading ? <Loader2 size={14} className="animate-spin" /> : isFriend ? <UserCheck size={14} /> : <UserPlus size={14} />}
              {isFriend ? "Friends" : isFriendPending ? "Cancel request" : "Add Friend"}
            </button>
          ) : null}

          {isFriend && (
            <Link
              href={`/messages?user=${encodeURIComponent(user.username)}`}
              className="flex h-9 items-center gap-1.5 rounded-full bg-accent px-3 text-xs font-bold text-white transition-all hover:opacity-80"
            >
              <MessageCircle size={14} />
              Message
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function CommunityCard({ community }: { community: Community }) {
  return (
    <Link
      href={`/community/${community.name}`}
      className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md hover:ring-accent/20"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden shadow-sm">
        {community.iconImageUrl ? (
          <img
            src={community.iconImageUrl}
            alt=""
            loading="lazy"
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
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("all");
  const [results, setResults] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [usingTopSearch, setUsingTopSearch] = useState(false);

  const [suggestions, setSuggestions] = useState<SearchUser[]>([]);
  const [suggLoading, setSuggLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [trending, setTrending] = useState<SearchResponse | null>(null);
  const [trendingLoading, setTrendingLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const initializedTopSearchRef = useRef(false);

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

  useEffect(() => {
    const runTopSearch = (value: string) => {
      const nextQuery = value.trim();
      if (!nextQuery) return;
      setUsingTopSearch(true);
      setQuery(nextQuery);
      setSuggestions([]);
      setShowSuggestions(false);
      void doSearch(nextQuery);
    };

    if (!initializedTopSearchRef.current) {
      initializedTopSearchRef.current = true;
      const initialQuery = new URLSearchParams(window.location.search).get("q");
      if (initialQuery) runTopSearch(initialQuery);
    }

    const handleTopSearch = (event: Event) => {
      const nextQuery = (event as CustomEvent<string>).detail;
      if (typeof nextQuery === "string") runTopSearch(nextQuery);
    };

    window.addEventListener("lambrk:search", handleTopSearch);
    return () => window.removeEventListener("lambrk:search", handleTopSearch);
  }, [doSearch]);

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
        const data = await searchUsers(value.trim(), 0, 5);
        setSuggestions(data.users || []);
      } catch {
        setSuggestions([]);
      } finally {
        setSuggLoading(false);
      }
    }, 250);
  };

  const handleSuggestionClick = (user: SearchUser) => {
    setShowSuggestions(false);
    router.push(`/user/${user.username}`);
  };

  const handleTabChange = (newTab: SearchTab) => {
    setTab(newTab);
    if (searched && query.trim()) {
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
      {!usingTopSearch && (
      <div className="sticky top-0 z-10 -mx-4 bg-background/85 px-4 py-3 backdrop-blur-2xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center gap-3">
          <BackButton fallback="/" label="" />

          <div className="relative flex-1">
            <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2.5 shadow-sm ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/40 transition-all">
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
                placeholder="Search users, posts, communities..."
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/50"
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
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-muted hover:bg-border hover:text-foreground transition-colors"
                >
                  <X size={14} />
                </button>
              )}
              {!query && (
                <button
                  onClick={() => doSearch(query)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background transition-all hover:opacity-80 shadow-sm"
                >
                  <Search size={14} />
                </button>
              )}
            </div>

            {/* User search dropdown */}
            {showSuggestions && (suggestions.length > 0 || suggLoading) && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowSuggestions(false)}
                />
                <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-150">
                  {suggLoading && (
                    <div className="flex items-center justify-center py-5">
                      <Loader2 size={18} className="animate-spin text-muted" />
                    </div>
                  )}
                  {!suggLoading &&
                    suggestions.map((user) => {
                      const initials = user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase() || "??";
                      return (
                        <button
                          key={user.id}
                          onClick={() => handleSuggestionClick(user)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-surface text-left"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[11px] font-bold text-white overflow-hidden">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                            ) : (
                              initials
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="font-bold truncate text-sm">{user.displayName}</p>
                              {user.isVerified && (
                                <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-accent text-[7px] font-bold text-white">✓</span>
                              )}
                            </div>
                            <p className="text-xs text-muted">@{user.username}</p>
                          </div>
                          <span className="text-xs text-muted shrink-0">
                            {user.karma > 0 && <span>{user.karma} karma</span>}
                          </span>
                        </button>
                      );
                    })}
                  {!suggLoading && suggestions.length === 0 && (
                    <div className="flex items-center justify-center gap-2 py-5 text-sm text-muted">
                      <Search size={14} />
                      No users found
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {usingTopSearch && searched && (
        <div className="flex items-center gap-3">
          <BackButton fallback="/" label="" />
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Search results</p>
            <h1 className="truncate text-xl font-black text-foreground">{query}</h1>
          </div>
        </div>
      )}

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
      {loading && <SearchSkeleton />}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <Search size={24} className="text-red-500/70" />
          </div>
          <p className="text-sm font-bold text-foreground">Search failed</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => doSearch(query)}
            className="mt-2 flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-xs font-bold transition-all hover:bg-border active:scale-95"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Empty results */}
      {!loading && !error && searched && posts.length === 0 && communities.length === 0 && users.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Search size={24} className="text-accent" />
          </div>
          <p className="text-lg font-bold text-foreground">No results found</p>
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
            <div className="flex flex-col gap-3">
              <CommunityCardSkeleton />
              <PostSkeletonList count={2} />
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
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <TrendingUp size={24} className="text-accent" />
              </div>
              <p className="text-sm font-bold text-foreground">No trending searches</p>
              <p className="text-xs">Check back later</p>
            </div>
          )}

          {/* Search tips */}
          <div className="flex flex-col gap-4 rounded-3xl bg-card p-6 shadow-sm ring-1 ring-border">
            <h3 className="text-sm font-bold text-muted">Search Tips</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 text-sm text-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                  <FileText size={14} />
                </div>
                <span>Search posts by keywords, titles, or content</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                  <Hash size={14} />
                </div>
                <span>Find communities by name or topic</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                  <Users size={14} />
                </div>
                <span>Discover users by username or display name</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface">
                  <Globe size={14} />
                </div>
                <span>Use &quot;All&quot; to search across everything at once</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
