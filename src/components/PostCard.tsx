"use client";

import { useState, memo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Repeat,
  Share2,
  Bookmark,
  MoreHorizontal,
  Play,
  Copy,
  ExternalLink,
  Trash2,
  Flag,
  Loader2,
} from "lucide-react";
import type { Post } from "@/lib/data";
import { votePost, deletePost } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ImagePreviewModal from "./ImagePreviewModal";

interface PostCardProps {
  post: Post;
}

function PostCard({ post }: PostCardProps) {
  const { user } = useAuth();
  const { show: showToast } = useToast();
  const [liked, setLiked] = useState(post.userVote === "LIKE");
  const [disliked, setDisliked] = useState(post.userVote === "DISLIKE");
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes);
  const [voting, setVoting] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isOwnPost = user?.username === post.author.handle.replace("@", "");

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const getPostUrl = () => {
    if (typeof window === "undefined") return "";
    return `${window.location.origin}/post/${post.id}`;
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getPostUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: post.content.substring(0, 60), url });
        return;
      } catch {
        // fallthrough to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      showToast("Link copied to clipboard", "success");
    } catch {
      showToast("Failed to copy link", "error");
    }
  };

  const handleDelete = async () => {
    if (!post.id || post.id.startsWith("pending-")) return;
    setDeleting(true);
    try {
      await deletePost(post.id);
      showToast("Post deleted", "success");
      // Hide the card visually
      setShowDeleteConfirm(false);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete post", "error");
    } finally {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (voting) return;
    setVoting(true);

    const wasLiked = liked;
    const wasDisliked = disliked;

    if (wasLiked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      if (wasDisliked) {
        setDisliked(false);
        setDislikeCount((prev) => prev - 1);
      }
    }

    try {
      if (post.id && !post.id.startsWith("pending-")) {
        await votePost(post.id, "LIKE");
      }
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      setLikeCount(post.likes);
      setDislikeCount(post.dislikes);
    } finally {
      setVoting(false);
    }
  };

  const handleDislike = async () => {
    if (voting) return;
    setVoting(true);

    const wasLiked = liked;
    const wasDisliked = disliked;

    if (wasDisliked) {
      setDisliked(false);
      setDislikeCount((prev) => prev - 1);
    } else {
      setDisliked(true);
      setDislikeCount((prev) => prev + 1);
      if (wasLiked) {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }

    try {
      if (post.id && !post.id.startsWith("pending-")) {
        await votePost(post.id, "DISLIKE");
      }
    } catch {
      // Revert on failure
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      setLikeCount(post.likes);
      setDislikeCount(post.dislikes);
    } finally {
      setVoting(false);
    }
  };

  const mediaCount = post.media?.length ?? 0;

  return (
    <>
      <Link href={`/post/${post.id}`} className="block group/card">
        <article className="relative overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border transition-all duration-300 hover:shadow-lg hover:ring-accent/20 hover:-translate-y-0.5">
          <div className="flex flex-col gap-3 p-4 sm:p-5">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white overflow-hidden shadow-sm">
                    {post.author.avatarUrl ? (
                    <img src={post.author.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    post.author.avatar
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold leading-tight">{post.author.name}</p>
                  <p className="text-xs text-muted">{post.author.handle}</p>
                </div>
              </div>
              <span className="text-xs text-muted whitespace-nowrap">{post.timestamp}</span>
            </div>

            {/* Content */}
            <p className="text-[15px] leading-relaxed text-foreground/90 line-clamp-6">
              {post.content}
            </p>

            {/* Media */}
            {post.media && post.media.length > 0 && (() => {
              if (mediaCount === 1) {
                return (
                  <div
                    className="overflow-hidden rounded-2xl cursor-zoom-in relative"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewIndex(0); setPreviewOpen(true); }}
                  >
                    <MediaContent item={post.media[0]} />
                  </div>
                );
              }
              if (mediaCount === 3) {
                return (
                  <div className="grid grid-cols-2 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl max-h-[380px]">
                    <div
                      className="row-span-2 relative overflow-hidden bg-surface cursor-zoom-in"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewIndex(0); setPreviewOpen(true); }}
                    >
                      <MediaContent item={post.media[0]} />
                    </div>
                    <div
                      className="relative overflow-hidden bg-surface cursor-zoom-in aspect-square"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewIndex(1); setPreviewOpen(true); }}
                    >
                      <MediaContent item={post.media[1]} />
                    </div>
                    <div
                      className="relative overflow-hidden bg-surface cursor-zoom-in aspect-square"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setPreviewIndex(2); setPreviewOpen(true); }}
                    >
                      <MediaContent item={post.media[2]} />
                    </div>
                  </div>
                );
              }
              return (
                <div className={`grid gap-1.5 overflow-hidden rounded-2xl grid-cols-2 max-h-[380px]`}>
                  {post.media.slice(0, 4).map((item, index) => {
                    const showOverlay = mediaCount > 4 && index === 3;
                    return (
                      <MediaItem key={index} item={item} index={index} onClick={(i) => { setPreviewIndex(i); setPreviewOpen(true); }} overCount={showOverlay ? mediaCount - 4 : 0} />
                    );
                  })}
                </div>
              );
            })()}

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLike();
                  }}
                  disabled={voting}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-3 transition-all ${
                    liked
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium tabular-nums min-w-[1rem]">
                    {likeCount > 0 ? likeCount : ""}
                  </span>
                </button>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDislike();
                  }}
                  disabled={voting}
                  className={`flex h-9 items-center gap-1.5 rounded-full px-3 transition-all ${
                    disliked
                      ? "bg-red-500/10 text-red-500"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <ThumbsDown size={16} fill={disliked ? "currentColor" : "none"} />
                  <span className="text-sm font-medium tabular-nums text-muted min-w-[1rem]">
                    {dislikeCount > 0 ? dislikeCount : ""}
                  </span>
                </button>

                <button className="flex h-9 items-center gap-1.5 rounded-full px-3 text-muted transition-all hover:bg-surface hover:text-foreground">
                  <MessageCircle size={16} />
                  <span className="text-sm font-medium tabular-nums min-w-[1rem]">
                    {post.comments > 0 ? post.comments : ""}
                  </span>
                </button>

                <button className="flex h-9 items-center gap-1.5 rounded-full px-3 text-muted transition-all hover:bg-surface hover:text-foreground">
                  <Repeat size={16} />
                  <span className="text-sm font-medium tabular-nums min-w-[1rem]">
                    {post.reposts > 0 ? post.reposts : ""}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSaved(!saved);
                  }}
                  className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                    saved
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
                </button>
                <button
                  onClick={handleShare}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground"
                >
                  <Share2 size={16} />
                </button>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMenuOpen(!menuOpen);
                    }}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                  {menuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute bottom-full right-0 mb-2 w-48 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-150 z-50 py-1"
                    >
                      <button
                        onClick={async (e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          try {
                            await navigator.clipboard.writeText(getPostUrl());
                            showToast("Link copied", "success");
                          } catch {
                            showToast("Failed to copy", "error");
                          }
                          setMenuOpen(false);
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface text-left"
                      >
                        <Copy size={16} className="text-muted" />
                        Copy Link
                      </button>
                      <a
                        href={`/post/${post.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
                      >
                        <ExternalLink size={16} className="text-muted" />
                        Open in new tab
                      </a>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setMenuOpen(false);
                          showToast("Reported — we will review it shortly", "info");
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface text-left"
                      >
                        <Flag size={16} className="text-muted" />
                        Report
                      </button>
                      {isOwnPost && (
                        <>
                          <div className="mx-3 my-1 h-px bg-border" />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setMenuOpen(false);
                              setShowDeleteConfirm(true);
                            }}
                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5 text-left"
                          >
                            <Trash2 size={16} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </article>
      </Link>

      {previewOpen && (
        <ImagePreviewModal
          post={post}
          startIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteConfirm(false)} />
          <div className="relative z-10 w-full max-w-sm rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-border">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h2 className="text-xl font-bold">Delete Post?</h2>
              <p className="mt-2 text-sm text-muted">
                This action cannot be undone.
              </p>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-full bg-surface px-4 py-3 text-sm font-bold transition-colors hover:bg-border"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 rounded-full bg-red-500 px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

type MediaItemType = { type: "image" | "video"; url: string };

function MediaContent({ item }: { item: MediaItemType }) {
  if (item.type === "video") {
    return (
      <>
        <video
          src={item.url}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="none"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30 transition-transform group-hover/card:scale-110">
            <Play size={20} fill="white" className="ml-0.5 text-white" />
          </div>
        </div>
      </>
    );
  }
  return (
    <img
      src={item.url}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover transition-transform duration-700 group-hover/card:scale-105"
    />
  );
}

function MediaItem({
  item,
  index,
  onClick,
  overCount,
}: {
  item: MediaItemType;
  index: number;
  onClick: (index: number) => void;
  overCount?: number;
}) {
  return (
    <div
      className="relative overflow-hidden bg-surface cursor-zoom-in aspect-square"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick(index);
      }}
    >
      <MediaContent item={item} />
      {overCount && overCount > 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white backdrop-blur-[2px]">
          +{overCount}
        </div>
      )}
    </div>
  );
}

export default memo(PostCard);
