"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Shield,
  Hash,
  Loader2,
  Globe,
  UserPlus,
  UserCheck,
  Eye,
  Clock,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCommunityByName,
  subscribeToCommunity,
  unsubscribeFromCommunity,
  listCommunityPosts,
  ApiError,
  type Community,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCount(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return `${n}`;
}

export default function CommunityPage() {
  const params = useParams();
  const communityName = params.name as string;
  const { isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState("");

  useEffect(() => {
    if (!communityName) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    getCommunityByName(communityName)
      .then((data) => {
        if (cancelled) return;
        setCommunity(data);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 404) {
          setError("Community not found");
        } else {
          setError(err instanceof Error ? err.message : "Failed to load community");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [communityName]);

  const handleSubscribe = useCallback(async () => {
    if (!community || !isAuthenticated) return;
    setSubscribing(true);
    try {
      if (community.isUserSubscribed) {
        await unsubscribeFromCommunity(community.id);
        setCommunity({
          ...community,
          isUserSubscribed: false,
          subscriberCount: community.subscriberCount - 1,
          memberCount: community.memberCount - 1,
        });
      } else {
        await subscribeToCommunity(community.id);
        setCommunity({
          ...community,
          isUserSubscribed: true,
          subscriberCount: community.subscriberCount + 1,
          memberCount: community.memberCount + 1,
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubscribing(false);
    }
  }, [community, isAuthenticated]);

  useEffect(() => {
    if (!community) return;
    let cancelled = false;
    setPostsLoading(true);
    setPostsError("");
    listCommunityPosts(community.id, 0, 20)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.content.map(mapFeedPost));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPostsError(err instanceof Error ? err.message : "Failed to load posts");
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });
    return () => { cancelled = true; };
  }, [community]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 px-2 py-3 backdrop-blur-xl">
          <Link
            href="/explore"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="h-5 w-32 animate-pulse rounded-full bg-surface" />
        </div>

        <div className="animate-pulse rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-surface" />
              <div>
                <div className="mb-1 h-5 w-40 rounded-full bg-surface" />
                <div className="h-4 w-24 rounded-full bg-surface" />
              </div>
            </div>
            <div className="h-9 w-20 rounded-full bg-surface" />
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-4 w-full rounded-full bg-surface" />
            <div className="h-4 w-3/4 rounded-full bg-surface" />
          </div>
        </div>
      </div>
    );
  }

  if (error && error.includes("not found")) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Hash size={48} className="mb-4 opacity-30" />
        <p className="text-xl font-bold">Community not found</p>
        <p className="mt-1 text-sm">
          The community r/{communityName} does not exist.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/explore"
            className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-80"
          >
            <Eye size={16} />
            Explore Communities
          </Link>
          <Link
            href="/create-community"
            className="flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-sm font-bold transition-colors hover:bg-border"
          >
            <UserPlus size={16} />
            Create One
          </Link>
        </div>
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Shield size={40} className="mb-3 opacity-40" />
        <p className="text-lg font-bold">Something went wrong</p>
        <p className="text-sm">{error || "Failed to load community"}</p>
        <Link href="/explore" className="mt-4 text-accent hover:underline">
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header bar */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <Link
          href="/explore"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold truncate">r/{community.name}</h1>
        </div>
        {isAuthenticated && (
          <button
            onClick={handleSubscribe}
            disabled={subscribing}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 ${
              community.isUserSubscribed
                ? "bg-surface text-foreground hover:bg-border"
                : "bg-foreground text-background hover:opacity-80"
            }`}
          >
            {subscribing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : community.isUserSubscribed ? (
              <UserCheck size={16} />
            ) : (
              <UserPlus size={16} />
            )}
            <span className="hidden sm:inline">
              {subscribing
                ? "Loading..."
                : community.isUserSubscribed
                  ? "Joined"
                  : "Join"}
            </span>
          </button>
        )}
      </div>

      {/* Header image */}
      {community.headerImageUrl && (
        <div className="-mx-4 aspect-[3/1] w-[calc(100%+2rem)] overflow-hidden md:mx-0 md:w-full md:rounded-3xl">
          <img
            src={community.headerImageUrl}
            alt={community.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      {/* Community info card */}
      <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-lg font-bold text-white overflow-hidden shadow-sm">
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
            <div className="min-w-0">
              <h2 className="text-xl font-black truncate">{community.title}</h2>
              <p className="text-sm text-muted">r/{community.name}</p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`hidden sm:flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition-all active:scale-95 disabled:opacity-50 ${
                community.isUserSubscribed
                  ? "bg-surface text-foreground hover:bg-border"
                  : "bg-foreground text-background hover:opacity-80"
              }`}
            >
              {subscribing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Loading...
                </>
              ) : community.isUserSubscribed ? (
                <>
                  <UserCheck size={16} />
                  Joined
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Join
                </>
              )}
            </button>
          )}
        </div>

        {community.description && (
          <p className="text-[15px] leading-relaxed">
            {community.description}
          </p>
        )}

        {/* Stats row */}
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-muted">
            <Users size={14} />
            <span className="font-medium text-foreground">
              {formatCount(community.memberCount)}
            </span>
            <span>members</span>
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-muted">
            <Eye size={14} />
            <span className="font-medium text-foreground">
              {formatCount(community.subscriberCount)}
            </span>
            <span>subscribers</span>
          </span>
          {community.activeUserCount > 0 && (
            <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-muted">
              <Clock size={14} />
              <span className="font-medium text-foreground">
                {community.activeUserCount}
              </span>
              <span>online</span>
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-muted">
            <Calendar size={14} />
            <span>Created {formatDate(community.createdAt)}</span>
          </span>
        </div>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          {community.isPublic ? (
            <span className="flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600">
              <Globe size={12} />
              Public
            </span>
          ) : community.isRestricted ? (
            <span className="flex items-center gap-1 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
              <Shield size={12} />
              Restricted
            </span>
          ) : (
            <span className="flex items-center gap-1 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium text-red-600">
              <Shield size={12} />
              Private
            </span>
          )}
          {community.isOver18 && (
            <span className="rounded-full bg-red-500/10 px-3 py-1 text-xs font-bold text-red-500">
              18+
            </span>
          )}
          {community.isUserModerator && (
            <span className="flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Shield size={12} />
              Moderator
            </span>
          )}
        </div>

        {/* Categories */}
        {community.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {community.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full px-3 py-1 text-xs font-medium"
                style={{
                  backgroundColor: cat.color ? `${cat.color}15` : undefined,
                  color: cat.color || "inherit",
                }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}

        {/* Creator */}
        <div className="flex items-center gap-2 border-t border-border pt-4 text-xs text-muted">
          <span>Created by</span>
          <Link
            href={`/profile`}
            className="font-medium text-foreground hover:underline"
          >
            u/{community.createdBy.username}
          </Link>
        </div>
      </div>

      {/* Sidebar / Rules */}
      {community.sidebarText && (
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
          <h3 className="mb-3 text-sm font-bold text-muted uppercase tracking-wide">
            Rules
          </h3>
          <div className="text-sm leading-relaxed text-muted whitespace-pre-wrap">
            {community.sidebarText}
          </div>
        </div>
      )}

      {/* Posts */}
      {postsLoading && (
        <div className="flex items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}

      {!postsLoading && postsError && (
        <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 ring-1 ring-border">
          {postsError}
        </div>
      )}

      {!postsLoading && !postsError && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <Hash size={36} className="mb-4 opacity-30" />
          <p className="text-lg font-bold">No posts yet</p>
          <p className="mt-1 text-sm">
            Be the first to post in r/{community.name}
          </p>
          <Link
            href="/compose"
            className="mt-4 flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-80"
          >
            Create Post
          </Link>
        </div>
      )}

      {!postsLoading && !postsError && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}
    </div>
  );
}
