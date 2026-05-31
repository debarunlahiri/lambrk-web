"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  uploadFile,
  createPost,
  getUserSubscriptions,
  ApiError,
  type Community,
} from "@/lib/api";
import {
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
  Upload,
  AlertTriangle,
} from "lucide-react";
import BackButton from "@/components/BackButton";

const MAX_CHARS = 500;

interface PendingMedia {
  type: "image" | "video";
  file: File;
  previewUrl: string;
}

interface UploadProgress {
  index: number;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
}

export default function ComposePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { show: showToast, update: updateToast, dismiss: dismissToast } = useToast();
  const router = useRouter();

  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<"image" | "video" | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [communityId, setCommunityId] = useState<string | null>(null);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [commLoading, setCommLoading] = useState(true);
  const [showCommDropdown, setShowCommDropdown] = useState(false);

  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    getUserSubscriptions()
      .then(setCommunities)
      .catch(() => {})
      .finally(() => setCommLoading(false));
  }, []);

  const selectedCommunity = communities.find((c) => c.id === communityId);

  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "YO";

  const charCount = content.length;
  const charPercentRaw = (charCount / MAX_CHARS) * 100;
  const charPercent = Math.min(charPercentRaw, 100);
  const isOverLimit = charCount > MAX_CHARS;
  const remainingChars = MAX_CHARS - charCount;
  const canPublish =
    !isOverLimit && (content.trim().length > 0 || media.length > 0) && !publishing;

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  useLayoutEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, [content]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;

    const isGif = file.type === "image/gif";
    if ((pendingType === "video" || isGif) && media.some((m) => m.type === "video" || m.file.type === "image/gif")) return;

    const previewUrl = URL.createObjectURL(file);
    setMedia((prev) => [...prev, { type: pendingType, file, previewUrl }]);
    setPendingType(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (type: "image" | "video") => {
    if (type === "video" && hasSingleOnly) return;
    setPendingType(type);
    fileInputRef.current?.click();
  };

  const hasSingleOnly = media.some((m) => m.type === "video" || m.file.type === "image/gif");

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handlePublish = async () => {
    if (!canPublish) return;
    setPublishing(true);
    setPublishError("");

    const toastId = showToast(
      media.length > 0 ? "Uploading media..." : "Publishing post...",
      "loading"
    );

    try {
      const uploadedFileIds: string[] = [];
      const uploadResults: { type: "image" | "video"; url: string }[] = [];

      if (media.length > 0) {
        const progressItems: UploadProgress[] = media.map((m, i) => ({
          index: i,
          fileName: m.file.name,
          progress: 0,
          status: "pending" as const,
        }));
        setUploads(progressItems);

        for (let i = 0; i < media.length; i++) {
          setUploads((prev) =>
            prev.map((p) =>
              p.index === i ? { ...p, status: "uploading" as const, progress: 20 } : p
            )
          );

          try {
            const apiType: "POST_IMAGE" | "POST_VIDEO" = media[i].type === "image" ? "POST_IMAGE" : "POST_VIDEO";
            const uploaded = await uploadFile({
              file: media[i].file,
              type: apiType,
              fileName: media[i].file.name,
              description: "Post media",
              isPublic: true,
              isNSFW: false,
            });

            setUploads((prev) =>
              prev.map((p) =>
                p.index === i
                  ? { ...p, status: "done" as const, progress: 100, url: uploaded.fileUrl }
                  : p
              )
            );

            uploadedFileIds.push(uploaded.fileId);
            uploadResults.push({
              type: media[i].type,
              url: uploaded.fileUrl,
            });
          } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Upload failed";
            setUploads((prev) =>
              prev.map((p) =>
                p.index === i
                  ? { ...p, status: "error" as const, error: message }
                  : p
              )
            );
            throw new Error(message);
          }
        }
      }

      updateToast(toastId, "Creating post...", "loading");
      const post = await createPost({
        content: content.trim(),
        postType: uploadedFileIds.length > 0 ? "IMAGE" : "TEXT",
        communityId: communityId,
        mediaIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
      });

      // Clean up preview URLs
      media.forEach((m) => URL.revokeObjectURL(m.previewUrl));

      updateToast(toastId, "Post published!", "success");

      if (communityId && selectedCommunity) {
        router.push(`/community/${selectedCommunity.name}`);
      } else {
        router.push(`/post/${post.id}`);
      }
    } catch (err: unknown) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Failed to publish. Please try again.";
      setPublishError(message);
      updateToast(toastId, message, "error");
    } finally {
      setPublishing(false);
    }
  };

  const cancelPublishing = () => {
    setPublishing(false);
    setUploads([]);
    setPublishError("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 mb-4 bg-background/85 px-4 py-3 backdrop-blur-2xl md:-mx-0 md:mb-6 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center justify-between">
          <BackButton fallback="/" />

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
              <Send size={16} />
              <span className="hidden sm:inline">Publish</span>
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

              {/* Publish error */}
              {publishError && (
                <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
                  <AlertTriangle size={16} />
                  {publishError}
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
                          src={item.previewUrl}
                          alt={item.file.name}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <video
                          src={item.previewUrl}
                          className="h-full w-full object-cover"
                          muted
                          loop
                          playsInline
                          preload="none"
                        />
                      )}
                      <button
                        onClick={() => removeMedia(index)}
                        disabled={publishing}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all hover:bg-black/70 hover:scale-110 active:scale-95 disabled:opacity-30"
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
              disabled={publishing}
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-all hover:bg-accent/10 active:scale-90 disabled:opacity-50"
              title="Add image"
            >
              <ImageIcon size={20} />
            </button>

            <button
              onClick={() => triggerUpload("video")}
              disabled={publishing || hasSingleOnly}
              className={`flex h-10 w-10 items-center justify-center rounded-full transition-all active:scale-90 ${
                hasSingleOnly
                  ? "text-muted/40 cursor-not-allowed"
                  : "text-accent hover:bg-accent/10 disabled:opacity-50"
              }`}
              title={hasSingleOnly ? "Only one video or GIF allowed" : "Add video"}
            >
              <Film size={20} />
            </button>

            <div className="mx-1 h-5 w-px bg-border" />

            {/* Community selector */}
            <div className="relative">
              <button
                onClick={() => setShowCommDropdown(!showCommDropdown)}
                disabled={publishing}
                className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm transition-all hover:bg-surface/80 active:scale-95 disabled:opacity-50"
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
                            setCommunityId(c.id);
                            setShowCommDropdown(false);
                          }}
                          className={`flex w-full items-center gap-3 px-3 py-2.5 text-sm transition-colors hover:bg-surface ${
                            c.id === communityId ? "bg-surface" : ""
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
            <Send size={16} />
            Publish
          </button>
        </div>
      </div>

      {/* Publishing overlay */}
      {publishing && (
        <div className="fixed inset-x-4 bottom-6 z-50 mx-auto max-w-sm rounded-3xl bg-card p-5 shadow-2xl ring-1 ring-border animate-in slide-in-from-bottom-4 fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Upload size={18} className="text-accent" />
              <h3 className="text-sm font-bold">Publishing...</h3>
            </div>
            <button
              onClick={cancelPublishing}
              className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-surface transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {uploads.length > 0 && (
            <div className="space-y-2 mb-3">
              {uploads.map((u) => (
                <div key={u.index} className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate">{u.fileName}</p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          u.status === "error" ? "bg-red-500" : "bg-accent"
                        }`}
                        style={{ width: `${u.progress}%` }}
                      />
                    </div>
                  </div>
                  {u.status === "uploading" && (
                    <Loader2 size={14} className="animate-spin text-muted shrink-0" />
                  )}
                  {u.status === "done" && (
                    <span className="text-xs text-green-500 shrink-0">Done</span>
                  )}
                  {u.status === "error" && (
                    <span className="text-xs text-red-500 shrink-0">Failed</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {!uploads.length && (
            <div className="flex items-center gap-2 mb-3 text-sm text-muted">
              <Loader2 size={14} className="animate-spin" />
              <span>Creating post...</span>
            </div>
          )}

          <p className="text-xs text-muted">
            {uploads.some((u) => u.status === "error")
              ? "Some uploads failed. Please try again."
              : "Please wait while we publish your post."}
          </p>
        </div>
      )}
    </div>
  );
}
