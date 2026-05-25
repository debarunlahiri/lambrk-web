"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  uploadFile,
  createPost,
  getUserSubscriptions,
  ApiError,
  type Community,
} from "@/lib/api";
import {
  ArrowLeft,
  Image as ImageIcon,
  Film,
  X,
  Loader2,
  Send,
  Type,
  Sparkles,
  Globe,
  ChevronDown,
  Hash,
} from "lucide-react";

const MAX_CHARS = 500;

export default function ComposePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{ type: "image" | "video"; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<"image" | "video" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [communityId, setCommunityId] = useState<number | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [commLoading, setCommLoading] = useState(true);
  const [showCommDropdown, setShowCommDropdown] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "YO";

  useEffect(() => {
    getUserSubscriptions()
      .then(setCommunities)
      .catch(() => {})
      .finally(() => setCommLoading(false));
  }, []);

  const selectedCommunity = communities.find((c) => Number(c.id) === communityId);

  const charCount = content.length;
  const charPercentRaw = (charCount / MAX_CHARS) * 100;
  const charPercent = Math.min(charPercentRaw, 100);
  const isOverLimit = charCount > MAX_CHARS;
  const remainingChars = MAX_CHARS - charCount;
  const canPublish =
    !isOverLimit && (content.trim().length > 0 || media.length > 0) && !uploading && !submitting;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;
    setUploading(true);
    setUploadError("");
    try {
      const apiType = pendingType === "image" ? "POST_IMAGE" : "POST_VIDEO";
      const uploaded = await uploadFile({
        file,
        type: apiType,
        fileName: file.name,
        description: "Post media",
        isPublic: true,
        isNSFW: false,
      });
      setMedia((prev) => [...prev, { type: pendingType, url: uploaded.fileUrl }]);
    } catch (err: unknown) {
      let message = "Upload failed. Please try again.";
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setUploadError(message);
    } finally {
      setUploading(false);
      setPendingType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = (type: "image" | "video") => {
    setPendingType(type);
    fileInputRef.current?.click();
  };

  const removeMedia = (index: number) => {
    setMedia((prev) => prev.filter((_, i) => i !== index));
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, [content]);

  const handlePublish = async () => {
    if (!canPublish) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const post = await createPost({
        content: content.trim(),
        postType: "TEXT",
        communityId: communityId,
      });

      if (communityId && selectedCommunity) {
        router.push(`/community/${selectedCommunity.name}`);
      } else {
        router.push(`/post/${post.id}`);
      }
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else if (err instanceof Error) {
        setSubmitError(err.message);
      } else {
        setSubmitError("Failed to publish. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:mb-6 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>

          <div className="flex items-center gap-3">
            {/* Character count */}
            <div
              className={`flex items-center gap-2 text-xs font-medium transition-colors ${
                isOverLimit ? "text-red-500" : "text-muted"
              }`}
            >
              <div className="relative h-6 w-6">
                <svg className="h-6 w-6 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    className="text-surface"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="15.915"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${charPercent} ${100 - charPercent}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    className={`transition-all duration-300 ${
                      isOverLimit
                        ? "text-red-500"
                        : charPercent > 90
                          ? "text-accent"
                          : "text-muted"
                    }`}
                  />
                </svg>
              </div>
              <span className="tabular-nums">
                {isOverLimit
                  ? Math.abs(remainingChars)
                  : remainingChars < MAX_CHARS * 0.2
                    ? remainingChars
                    : charCount}
              </span>
            </div>

            <button
              onClick={handlePublish}
              disabled={!canPublish}
              className="flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
            >
              {submitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              <span className="hidden sm:inline">
                {submitting ? "Publishing..." : "Publish"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main composer card */}
      <div
        className={`overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border transition-all duration-300 ${
          isFocused ? "ring-2 ring-accent/30 shadow-md" : ""
        }`}
      >
        <div className="p-5 md:p-6">
          <div className="flex gap-4">
            {/* Avatar column */}
            <div className="flex shrink-0 flex-col items-center gap-2">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white shadow-sm">
                {avatarText}
              </div>
              <div className="hidden h-full w-px bg-border md:block" />
            </div>

            {/* Content column */}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
              {/* User info */}
              <div>
                <p className="text-sm font-bold">{user?.displayName || "You"}</p>
                <p className="text-xs text-muted">@{user?.username || "username"}</p>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={handleContentChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="What's on your mind? Share your thoughts, ideas, or moments..."
                className="w-full resize-none bg-transparent text-xl font-light leading-relaxed placeholder:text-muted/40 outline-none md:text-2xl"
                rows={3}
                autoFocus
              />

              {/* Upload error */}
              {uploadError && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                  <X size={16} />
                  {uploadError}
                </div>
              )}

              {/* Submit error */}
              {submitError && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                  <X size={16} />
                  {submitError}
                </div>
              )}

              {/* Media previews */}
              {media.length > 0 && (
                <div
                  className={`grid gap-2 ${
                    media.length === 1
                      ? "grid-cols-1"
                      : media.length === 2
                        ? "grid-cols-2"
                        : "grid-cols-2"
                  }`}
                >
                  {media.map((item, index) => (
                    <div
                      key={index}
                      className={`relative overflow-hidden rounded-2xl ring-1 ring-border ${
                        media.length === 1
                          ? "aspect-video max-h-[320px]"
                          : media.length === 3 && index === 0
                            ? "col-span-2 aspect-video max-h-[240px]"
                            : "aspect-square max-h-[180px]"
                      }`}
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.url}
                          className="h-full w-full object-cover"
                          muted
                          loop
                          playsInline
                        />
                      )}
                      <button
                        onClick={() => removeMedia(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95"
                      >
                        <X size={16} />
                      </button>
                      {item.type === "video" && (
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-md">
                          <Film size={12} />
                          <span>Video</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-t border-border bg-surface/50 px-5 py-3 md:px-6">
          <div className="flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={handleFileSelect}
            />

            <button
              onClick={() => triggerUpload("image")}
              disabled={uploading}
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-all hover:bg-accent/10 active:scale-90 disabled:opacity-50"
              title="Add image"
            >
              {uploading && pendingType === "image" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <ImageIcon size={20} />
              )}
            </button>

            <button
              onClick={() => triggerUpload("video")}
              disabled={uploading}
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-all hover:bg-accent/10 active:scale-90 disabled:opacity-50"
              title="Add video"
            >
              {uploading && pendingType === "video" ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Film size={20} />
              )}
            </button>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent-2 transition-all hover:bg-accent-2/10 active:scale-90"
              title="AI assist"
            >
              <Sparkles size={20} />
            </button>

            <div className="mx-1 h-5 w-px bg-border" />

            {/* Community selector */}
            <div className="relative">
              <button
                onClick={() => setShowCommDropdown(!showCommDropdown)}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all hover:bg-surface/80 active:scale-95"
              >
                {selectedCommunity ? (
                  <Hash size={16} className="text-accent" />
                ) : (
                  <Globe size={16} className="text-muted" />
                )}
                <span className="max-w-[100px] truncate">
                  {selectedCommunity ? `r/${selectedCommunity.name}` : "No community"}
                </span>
                <ChevronDown size={14} className="text-muted" />
              </button>

              {showCommDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setShowCommDropdown(false)}
                  />
                  <div className="absolute bottom-full left-0 z-30 mb-2 w-56 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <button
                      onClick={() => {
                        setCommunityId(null);
                        setShowCommDropdown(false);
                      }}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-surface ${
                        !communityId ? "bg-surface" : ""
                      }`}
                    >
                      <Globe size={16} className="text-muted" />
                      <span>No community</span>
                    </button>
                    {commLoading && (
                      <div className="flex items-center justify-center py-3">
                        <Loader2 size={16} className="animate-spin text-muted" />
                      </div>
                    )}
                    {!commLoading && communities.length === 0 && (
                      <div className="px-3 py-3 text-xs text-muted text-center">
                        No subscriptions yet
                      </div>
                    )}
                    {!commLoading &&
                      communities.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setCommunityId(Number(c.id));
                            setShowCommDropdown(false);
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-surface ${
                            Number(c.id) === communityId ? "bg-surface" : ""
                          }`}
                        >
                          <Hash size={16} className="text-muted" />
                          <span className="truncate">r/{c.name}</span>
                        </button>
                      ))}
                  </div>
                </>
              )}
            </div>

            <button
              className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground active:scale-90"
              title="Formatting"
              onClick={() => textareaRef.current?.focus()}
            >
              <Type size={20} />
            </button>
          </div>

          {/* Mobile publish button in toolbar */}
          <button
            onClick={handlePublish}
            disabled={!canPublish}
            className="flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 md:hidden"
          >
            {submitting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Publish
          </button>
        </div>
      </div>

      {/* Tips footer */}
      <div className="mt-6 flex items-center justify-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1">
          <Sparkles size={12} className="text-accent-2" />
          Press Enter to add a new line
        </span>
        <span className="hidden sm:inline">·</span>
        <span className="hidden sm:inline">Supports images & videos</span>
      </div>
    </div>
  );
}
