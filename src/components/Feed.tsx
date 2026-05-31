"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { mapFeedPost, type Post } from "@/lib/data";
import { getFeed, getFeedHot, getFeedNew, getFeedTop, createPost, uploadFile, type FeedPost } from "@/lib/api";
import { Sparkles, Flame, Clock, TrendingUp, Inbox, RefreshCw } from "lucide-react";
import { PostSkeletonList } from "./Skeleton";

type FeedTab = "algorithm" | "hot" | "new" | "top";

const tabs: { key: FeedTab; label: string; icon: typeof Sparkles }[] = [
  { key: "algorithm", label: "Best", icon: Sparkles },
  { key: "hot", label: "Hot", icon: Flame },
  { key: "new", label: "New", icon: Clock },
  { key: "top", label: "Top", icon: TrendingUp },
];

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const { show: showToast, update: updateToast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<FeedTab>("algorithm");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");

    let promise: Promise<{ posts: FeedPost[] }>;
    switch (tab) {
      case "hot":
        promise = getFeedHot(20);
        break;
      case "new":
        promise = getFeedNew(20);
        break;
      case "top":
        promise = getFeedTop(20);
        break;
      default:
        promise = getFeed({ limit: 20, sortBy: tab });
    }

    promise
      .then((data) => {
        if (cancelled) return;
        setPosts((data.posts || []).map(mapFeedPost));
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load feed");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [tab]);

  const handleNewPost = async (
    content: string,
    mediaFiles: { type: "image" | "video"; file: File; previewUrl: string }[]
  ) => {
    const toastId = showToast(
      mediaFiles.length > 0 ? "Uploading media..." : "Publishing post...",
      "loading"
    );

    const uploadedFileIds: string[] = [];
    const uploadedMedia: { type: "image" | "video"; url: string }[] = [];
    try {
      for (const m of mediaFiles) {
        const apiType: "POST_IMAGE" | "POST_VIDEO" = m.type === "image" ? "POST_IMAGE" : "POST_VIDEO";
        const uploaded = await uploadFile({
          file: m.file,
          type: apiType,
          fileName: m.file.name,
          description: "Post media",
          isPublic: true,
          isNSFW: false,
        });
        uploadedFileIds.push(uploaded.fileId);
        uploadedMedia.push({ type: m.type, url: uploaded.fileUrl });
      }

      updateToast(toastId, "Creating post...", "loading");
      const apiPost = await createPost({
        content: content.trim(),
        postType: uploadedFileIds.length > 0 ? "IMAGE" : "TEXT",
        mediaIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      });
      const newPost = mapFeedPost(apiPost);
      if (uploadedMedia.length > 0) {
        newPost.media = uploadedMedia;
      }
      setPosts((prev) => [newPost, ...prev]);
      updateToast(toastId, "Post published!", "success");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to publish post";
      updateToast(toastId, message, "error");

      // Optimistic fallback so UI doesn't break
      const newPost: Post = {
        id: `pending-${Date.now()}`,
        author: {
          name: user?.displayName || "You",
          handle: user?.username ? `@${user.username}` : "@you",
          avatar: user?.displayName
            ? user.displayName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()
            : "YO",
          avatarUrl: user?.avatarUrl,
        },
        content,
        media: uploadedMedia,
        likes: 0,
        dislikes: 0,
        comments: 0,
        reposts: 0,
        timestamp: "now",
      };
      setPosts((prev) => [newPost, ...prev]);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {isAuthenticated && <CreatePost onPost={handleNewPost} />}

      {/* Tabs */}
      <div className="flex gap-1 rounded-full bg-surface p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
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

      {/* Loading */}
      {loading && <PostSkeletonList count={3} />}

      {/* Error */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-14 text-muted ring-1 ring-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
            <Inbox size={28} className="text-red-500/70" />
          </div>
          <p className="text-sm font-bold text-foreground">Failed to load feed</p>
          <p className="text-xs max-w-xs text-center">{error}</p>
          <button
            onClick={() => setTab(tab)}
            className="mt-2 flex items-center gap-2 rounded-full bg-surface px-5 py-2.5 text-xs font-bold transition-all hover:bg-border active:scale-95"
          >
            <RefreshCw size={14} />
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
            <Inbox size={28} className="text-accent" />
          </div>
          <p className="text-lg font-bold text-foreground">No posts yet</p>
          <p className="text-sm text-center max-w-xs">
            Follow communities or create your first post to get started
          </p>
        </div>
      )}

      {/* Posts */}
      {!loading && !error && posts.length > 0 && (
        <div className="flex flex-col gap-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
