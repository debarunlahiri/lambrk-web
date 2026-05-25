"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Users,
  Flame,
  Loader2,
  Image as ImageIcon,
  MessageCircle,
} from "lucide-react";
import {
  getCurrentUser,
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

const tabs = ["Posts", "Media", "Likes"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Posts");

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
    setProfileLoading(true);
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
    setPostsLoading(true);
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

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Banner & Avatar */}
      <div className="relative">
        <div className="aspect-[3/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-accent-2/20">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80"
            alt="Banner"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute -bottom-10 left-6 z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl font-black text-white shadow-lg ring-4 ring-background overflow-hidden">
            {displayUser?.avatarUrl ? (
              <img
                src={displayUser.avatarUrl}
                alt=""
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
        {profileLoading && !profile && (
          <div className="animate-pulse space-y-3">
            <div className="h-6 w-48 rounded-full bg-surface" />
            <div className="h-4 w-32 rounded-full bg-surface" />
            <div className="h-4 w-3/4 rounded-full bg-surface" />
          </div>
        )}

        {!profileLoading && (
          <>
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
              <button className="rounded-full bg-surface px-5 py-2 text-sm font-bold transition-colors hover:bg-border">
                Edit Profile
              </button>
            </div>

            {displayUser?.bio && (
              <p className="mt-3 text-[15px] leading-relaxed">
                {displayUser.bio}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
              {displayUser?.karma !== undefined && (
                <span className="flex items-center gap-1">
                  <Flame size={15} />
                  {displayUser.karma} karma
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={15} />
                Joined{" "}
                {displayUser?.createdAt
                  ? formatDate(displayUser.createdAt)
                  : "recently"}
              </span>
            </div>

            <div className="mt-4 flex gap-5 text-sm">
              <span className="flex items-center gap-1">
                <strong className="text-foreground">{posts.length}</strong>
                <span className="text-muted">Posts</span>
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-foreground">
                  {mediaPosts.length}
                </strong>
                <span className="text-muted">Media</span>
              </span>
            </div>
          </>
        )}
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

      {/* Content */}
      {postsLoading && (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {!postsLoading && error && (
        <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          {error}
        </div>
      )}

      {!postsLoading && !error && activeTab === "Posts" && (
        <>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <MessageCircle size={40} className="mb-3 opacity-40" />
              <p className="text-lg font-bold">No posts yet</p>
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
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <ImageIcon size={40} className="mb-3 opacity-40" />
              <p className="text-lg font-bold">No media yet</p>
              <p className="text-sm">Uploaded images and videos appear here</p>
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
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt=""
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

      {!postsLoading && !error && activeTab === "Likes" && (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <Flame size={40} className="mb-3 opacity-40" />
          <p className="text-lg font-bold">Coming Soon</p>
          <p className="text-sm">Liked posts will appear here</p>
        </div>
      )}
    </div>
  );
}
