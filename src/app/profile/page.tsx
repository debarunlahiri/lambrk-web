"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Flame,
  Globe,
  Image as ImageIcon,
  MessageCircle,
  MapPin,
} from "lucide-react";
import {
  getCurrentUser,
  listUserPosts,
  type UserProfile,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";
import BackButton from "@/components/BackButton";
import { ProfileSkeleton, PostSkeletonList } from "@/components/Skeleton";
import SocialListDialog, { type SocialListKind } from "@/components/SocialListDialog";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

const tabs = ["Posts", "Media", "Likes"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Posts");
  const [socialList, setSocialList] = useState<SocialListKind | null>(null);

  const displayUser = profile || user;
  const avatarText = displayUser?.displayName
    ? displayUser.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  useEffect(() => {
    let cancelled = false;
    getCurrentUser()
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
      })
      .catch(() => {
        // Fall back to auth context user
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!displayUser) return;
    let cancelled = false;
    listUserPosts(displayUser.id, 0, 30)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.content.map(mapFeedPost));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load posts");
      })
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });
    return () => { cancelled = true; };
  }, [displayUser]);

  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  if (profileLoading && !profile) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <BackButton fallback="/" />

      {/* Banner & Avatar */}
      <div className="relative -mx-4 md:-mx-0">
        <div
          className="aspect-[3/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-accent-2/20"
          style={
            displayUser?.headerImageUrl
              ? { backgroundImage: `url(${displayUser.headerImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!displayUser?.headerImageUrl && (
            <div className="flex h-full w-full items-center justify-center">
              <MapPin size={32} className="text-muted/20" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-8 left-4 md:left-6 z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl font-black text-white shadow-xl ring-4 ring-background overflow-hidden">
            {displayUser?.avatarUrl ? (
              <img
                src={displayUser.avatarUrl}
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
      <div className="mt-6 px-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">
                {displayUser?.displayName || "Unknown"}
              </h1>
              {displayUser?.isVerified && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  ✓
                </span>
              )}
            </div>
            <p className="text-sm text-muted">
              @{displayUser?.username || "unknown"}
            </p>
          </div>
          <Link
            href="/settings/edit-profile"
            className="rounded-full bg-surface px-5 py-2.5 text-sm font-bold transition-all hover:bg-border active:scale-95"
          >
            Edit Profile
          </Link>
        </div>

        {displayUser?.bio && (
          <p className="mt-3 text-[15px] leading-relaxed">
            {displayUser.bio}
          </p>
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {displayUser?.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={15} />
              {displayUser.location}
            </span>
          )}
          {displayUser?.website && (
            <a
              href={displayUser.website.startsWith("http") ? displayUser.website : `https://${displayUser.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-accent hover:underline"
            >
              <Globe size={15} />
              {displayUser.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {displayUser?.karma !== undefined && (
            <span className="flex items-center gap-1.5">
              <Flame size={15} className="text-accent" />
              <span className="font-semibold text-foreground">{displayUser.karma}</span> karma
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar size={15} />
            Joined{" "}
            {displayUser?.createdAt
              ? formatDate(displayUser.createdAt)
              : "recently"}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <span className="flex items-center gap-1.5">
            <strong className="text-foreground text-lg font-bold tabular-nums">{posts.length}</strong>
            <span className="text-muted">Posts</span>
          </span>
          <button
            onClick={() => setSocialList("followers")}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <strong className="text-foreground text-lg font-bold tabular-nums">
              {displayUser?.followerCount ?? 0}
            </strong>
            <span className="text-muted">Followers</span>
          </button>
          <button
            onClick={() => setSocialList("following")}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <strong className="text-foreground text-lg font-bold tabular-nums">
              {displayUser?.followingCount ?? 0}
            </strong>
            <span className="text-muted">Following</span>
          </button>
          <button
            onClick={() => setSocialList("friends")}
            className="flex items-center gap-1.5 transition-colors hover:text-accent"
          >
            <strong className="text-foreground text-lg font-bold tabular-nums">
              {displayUser?.friendCount ?? 0}
            </strong>
            <span className="text-muted">Friends</span>
          </button>
          <span className="flex items-center gap-1.5">
            <strong className="text-foreground text-lg font-bold tabular-nums">
              {mediaPosts.length}
            </strong>
            <span className="text-muted">Media</span>
          </span>
        </div>
      </div>

      {displayUser && (
        <SocialListDialog
          open={socialList !== null}
          kind={socialList ?? "followers"}
          userId={displayUser.id}
          username={displayUser.username}
          canView
          onClose={() => setSocialList(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {postsLoading && <PostSkeletonList count={2} />}

      {!postsLoading && error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <MessageCircle size={24} className="text-red-500/70" />
          </div>
          <p className="text-sm font-bold text-foreground">Failed to load posts</p>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {!postsLoading && !error && activeTab === "Posts" && (
        <>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <MessageCircle size={24} className="text-accent" />
              </div>
              <p className="text-lg font-bold text-foreground">No posts yet</p>
              <p className="text-sm">Posts will appear here</p>
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

      {!postsLoading && !error && activeTab === "Media" && (
        <>
          {mediaPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
                <ImageIcon size={24} className="text-accent" />
              </div>
              <p className="text-lg font-bold text-foreground">No media yet</p>
              <p className="text-sm">Uploaded images and videos appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mediaPosts.flatMap((p) =>
                (p.media || []).map((m, i) => (
                  <div
                    key={`${p.id}-${i}`}
                    className="aspect-square overflow-hidden rounded-2xl ring-1 ring-border transition-all hover:ring-accent/30 hover:shadow-md"
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
                        className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}

      {!postsLoading && !error && activeTab === "Likes" && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Flame size={24} className="text-accent" />
          </div>
          <p className="text-lg font-bold text-foreground">Coming Soon</p>
          <p className="text-sm">Liked posts will appear here</p>
        </div>
      )}
    </div>
  );
}
