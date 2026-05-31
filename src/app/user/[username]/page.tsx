"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Flame,
  Globe,
  Loader2,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserByUsername,
  listUserPosts,
  type UserProfile,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

const tabs = ["Posts", "Media"];

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Posts");

  const isOwnProfile = currentUser?.username === username;
  const avatarText = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    getUserByUsername(username)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "User not found");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    setPostsLoading(true);

    listUserPosts(profile.id, 0, 30)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.content.map(mapFeedPost));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 px-2 py-3 backdrop-blur-xl">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="h-5 w-32 animate-pulse rounded-full bg-surface" />
        </div>
        <div className="animate-pulse space-y-6">
          <div className="aspect-[3/1] rounded-3xl bg-surface" />
          <div className="flex items-center gap-4 px-2">
            <div className="h-20 w-20 shrink-0 rounded-full bg-surface" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 rounded-full bg-surface" />
              <div className="h-4 w-32 rounded-full bg-surface" />
              <div className="h-4 w-3/4 rounded-full bg-surface" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <MessageCircle size={48} className="mb-4 opacity-30" />
        <p className="text-xl font-bold">User not found</p>
        <p className="mt-1 text-sm">{error || "This user does not exist."}</p>
        <Link href="/search" className="mt-4 text-accent hover:underline">
          Search users
        </Link>
      </div>
    );
  }

  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold truncate">
            {profile.displayName}
          </h1>
        </div>
        {isOwnProfile && (
          <Link
            href="/profile"
            className="rounded-full bg-surface px-4 py-2 text-sm font-bold transition-colors hover:bg-border"
          >
            My Profile
          </Link>
        )}
      </div>

      {/* Banner & Avatar */}
      <div className="relative -mx-4 md:-mx-0">
        <div
          className="aspect-[3/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-accent-2/20"
          style={
            profile.headerImageUrl
              ? { backgroundImage: `url(${profile.headerImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!profile.headerImageUrl && (
            <div className="flex h-full w-full items-center justify-center">
              <Globe size={32} className="text-muted/20" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-10 left-6 z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl font-black text-white shadow-lg ring-4 ring-background overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              avatarText
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-8 px-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{profile.displayName}</h1>
              {profile.isVerified && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  ✓
                </span>
              )}
            </div>
            <p className="text-sm text-muted">@{profile.username}</p>
          </div>
        </div>

        {profile.bio && (
          <p className="mt-3 text-[15px] leading-relaxed">{profile.bio}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin size={15} />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent hover:underline"
            >
              <Globe size={15} />
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {profile.karma !== undefined && (
            <span className="flex items-center gap-1">
              <Flame size={15} />
              {profile.karma} karma
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={15} />
            Joined {formatDate(profile.createdAt)}
          </span>
        </div>

        <div className="mt-4 flex gap-5 text-sm">
          <span className="flex items-center gap-1">
            <strong className="text-foreground">{posts.length}</strong>
            <span className="text-muted">Posts</span>
          </span>
          <span className="flex items-center gap-1">
            <strong className="text-foreground">{mediaPosts.length}</strong>
            <span className="text-muted">Media</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading && (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {!postsLoading && activeTab === "Posts" && (
        <>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <MessageCircle size={40} className="mb-3 opacity-40" />
              <p className="text-lg font-bold">No posts yet</p>
              <p className="text-sm">@{profile.username} has not posted anything</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}

      {!postsLoading && activeTab === "Media" && (
        <>
          {mediaPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <ImageIcon size={40} className="mb-3 opacity-40" />
              <p className="text-lg font-bold">No media yet</p>
              <p className="text-sm">@{profile.username} has not shared any media</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mediaPosts.flatMap((p) =>
                (p.media || []).map((m, i) => (
                  <div
                    key={`${p.id}-${i}`}
                    className="aspect-square overflow-hidden rounded-2xl ring-1 ring-border"
                  >
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="none"
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
