"use client";

import { useState, useEffect, use, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Repeat,
  Share2,
  Bookmark,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Send,
  Loader2,
  AlertCircle,
  Clock,
} from "lucide-react";
import {
  listCommentsForPost,
  createComment,
  getPost,
  votePost,
  voteComment,
  type ApiComment,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import BackButton from "@/components/BackButton";
import ImagePreviewModal from "@/components/ImagePreviewModal";
import CommentCard from "@/components/CommentCard";
import MentionTextarea from "@/components/MentionTextarea";
import { PostSkeleton, SkeletonPulse } from "@/components/Skeleton";

interface PostDetailProps {
  params: Promise<{ id: string }>;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

function getAvatarText(displayName: string): string {
  return displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}



export default function PostDetail({ params }: PostDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const { show: showToast } = useToast();
  const { id: postId } = use(params);

  const avatarText = user?.displayName ? getAvatarText(user.displayName) : "YO";

  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postError, setPostError] = useState("");

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return `${window.location.origin}/post/${postId}`;
  };

  const handleShare = async () => {
    const url = getPostUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: post?.content.substring(0, 60), url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast("Link copied to clipboard", "success");
      } catch {
        showToast("Failed to copy link", "error");
      }
    }
  };

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [totalComments, setTotalComments] = useState(0);
  const [posting, setPosting] = useState(false);
  const [composerFocused, setComposerFocused] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!postId) {
      setPostError("Invalid post ID");
      setPostLoading(false);
      return;
    }
    let cancelled = false;
    setPostLoading(true);
    setPostError("");

    getPost(postId)
      .then((data) => {
        if (cancelled) return;
        const mapped = mapFeedPost(data);
        setPost(mapped);
        setLikeCount(mapped.likes);
        setDislikeCount(mapped.dislikes);
        setLiked(mapped.userVote === "LIKE");
        setDisliked(mapped.userVote === "DISLIKE");
        setPostLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setPostError(err instanceof Error ? err.message : "Failed to load post");
        setPostLoading(false);
      });

    return () => { cancelled = true; };
  }, [postId]);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;
    listCommentsForPost(postId)
      .then((data) => {
        if (cancelled) return;
        setComments(data.content);
        setTotalComments(data.totalElements);
        setCommentsLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setCommentsError(err instanceof Error ? err.message : "Failed to load comments");
        setCommentsLoading(false);
      });
    return () => { cancelled = true; };
  }, [postId]);

  const handleLike = async () => {
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
      await votePost(postId, "LIKE");
    } catch {
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      const current = post?.likes ?? 0;
      setLikeCount(current);
      const currentDislike = post?.dislikes ?? 0;
      setDislikeCount(currentDislike);
    }
  };

  const handleDislike = async () => {
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
      await votePost(postId, "DISLIKE");
    } catch {
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      setLikeCount(post?.likes ?? 0);
      setDislikeCount(post?.dislikes ?? 0);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !isAuthenticated || !postId) return;
    setPosting(true);
    try {
      const newComment = await createComment({
        content: commentText.trim(),
        postId: postId,
        parentCommentId: null,
      });
      setComments((prev) => [newComment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setCommentText("");
      setComposerFocused(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post comment";
      setCommentsError(message);
    } finally {
      setPosting(false);
    }
  };

  if (postLoading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/85 px-2 py-3 backdrop-blur-2xl">
          <BackButton fallback="/" />
          <div className="h-5 w-20 animate-pulse rounded-full bg-surface" />
        </div>
        <PostSkeleton />
        <div className="flex flex-col gap-3">
          <SkeletonPulse className="h-8 w-32 rounded-full" />
          <div className="flex gap-3">
            <SkeletonPulse className="h-10 w-10 rounded-full shrink-0" />
            <SkeletonPulse className="h-24 flex-1 rounded-2xl" />
          </div>
      </div>

      {previewOpen && post && (
        <ImagePreviewModal
          post={post}
          startIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}

  if (postError || !post) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10">
          <AlertCircle size={28} className="text-red-500/70" />
        </div>
        <p className="text-xl font-bold text-foreground">Post not found</p>
        <p className="text-sm">{postError || "This post could not be loaded."}</p>
        <Link href="/" className="mt-2 text-accent hover:underline underline-offset-4 font-medium">
          Back to feed
        </Link>
      </div>
    );
  }

  const mediaCount = post.media?.length ?? 0;

  return (
    <div className="flex flex-col gap-0 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-background/85 px-4 py-3 backdrop-blur-2xl md:-mx-0 md:px-0">
        <div className="flex items-center gap-1">
          <BackButton fallback="/" variant="icon" />
          <h1 className="text-base font-bold">Post</h1>
        </div>
      </div>

      {/* Post Card */}
      <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          {/* Author */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden shadow-sm">
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
            <div className="flex items-center gap-1 text-xs text-muted">
              <Clock size={12} />
              <span>{post.timestamp}</span>
            </div>
          </div>

          {/* Content */}
          <p className="text-[17px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
            {post.content}
          </p>

          {/* Media */}
          {post.media && post.media.length > 0 && (
            mediaCount === 1 ? (
              <div
                className="overflow-hidden rounded-2xl cursor-zoom-in relative"
                onClick={() => { setPreviewIndex(0); setPreviewOpen(true); }}
              >
                {post.media[0].type === "video" ? (
                  <video src={post.media[0].url} className="w-full h-auto max-h-[400px] object-cover" controls preload="none" />
                ) : (
                  <img src={post.media[0].url} alt="" loading="lazy" className="w-full h-auto max-h-[400px] object-cover" />
                )}
              </div>
            ) : mediaCount === 3 ? (
              <div className="grid grid-cols-2 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl max-h-[400px]">
                <div
                  className="row-span-2 relative overflow-hidden bg-surface cursor-zoom-in"
                  onClick={() => { setPreviewIndex(0); setPreviewOpen(true); }}
                >
                  {post.media[0].type === "video" ? (
                    <video src={post.media[0].url} className="h-full w-full object-cover" controls preload="none" />
                  ) : (
                    <img src={post.media[0].url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div
                  className="relative overflow-hidden bg-surface cursor-zoom-in aspect-square"
                  onClick={() => { setPreviewIndex(1); setPreviewOpen(true); }}
                >
                  {post.media[1].type === "video" ? (
                    <video src={post.media[1].url} className="h-full w-full object-cover" controls preload="none" />
                  ) : (
                    <img src={post.media[1].url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
                <div
                  className="relative overflow-hidden bg-surface cursor-zoom-in aspect-square"
                  onClick={() => { setPreviewIndex(2); setPreviewOpen(true); }}
                >
                  {post.media[2].type === "video" ? (
                    <video src={post.media[2].url} className="h-full w-full object-cover" controls preload="none" />
                  ) : (
                    <img src={post.media[2].url} alt="" loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5 overflow-hidden rounded-2xl max-h-[400px]">
                {post.media.slice(0, 4).map((item, index) => {
                  const showOverlay = mediaCount > 4 && index === 3;
                  return (
                    <div
                      key={index}
                      className="relative overflow-hidden bg-surface cursor-zoom-in aspect-square"
                      onClick={() => { setPreviewIndex(index); setPreviewOpen(true); }}
                    >
                      {item.type === "video" ? (
                        <video src={item.url} className="h-full w-full object-cover" controls preload="none" />
                      ) : (
                        <img src={item.url} alt="" loading="lazy" className="h-full w-full object-cover" />
                      )}
                      {showOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white backdrop-blur-[2px]">
                          +{mediaCount - 4}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between border-t border-border/60 pt-4">
            <div className="flex items-center gap-0.5">
              <button
                onClick={handleLike}
                className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all ${
                  liked
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <ThumbsUp size={18} fill={liked ? "currentColor" : "none"} />
                {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
              </button>

              <button
                onClick={handleDislike}
                className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all ${
                  disliked
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <ThumbsDown size={18} fill={disliked ? "currentColor" : "none"} />
                {dislikeCount > 0 && <span className="tabular-nums text-muted">{dislikeCount}</span>}
              </button>

              <button className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-all hover:bg-surface hover:text-foreground">
                <MessageCircle size={18} />
                {totalComments > 0 && <span className="tabular-nums">{totalComments}</span>}
              </button>

              <button className="flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-all hover:bg-surface hover:text-foreground">
                <Repeat size={18} />
                {post.reposts > 0 && <span className="tabular-nums">{post.reposts}</span>}
              </button>
            </div>

            <div className="flex items-center gap-0.5">
              <button
                onClick={() => setSaved(!saved)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  saved
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
              </button>
              <button
                onClick={handleShare}
                className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground"
              >
                <Share2 size={18} />
              </button>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground"
                >
                  <MoreHorizontal size={18} />
                </button>
                {menuOpen && (
                  <div
                    ref={menuRef}
                    className="absolute bottom-full right-0 mb-2 w-44 overflow-hidden rounded-2xl bg-card shadow-xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-150 z-50"
                  >
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(getPostUrl());
                          showToast("Link copied", "success");
                        } catch {
                          showToast("Failed to copy", "error");
                        }
                        setMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
                    >
                      <Copy size={16} className="text-muted" />
                      Copy Link
                    </button>
                    <a
                      href={getPostUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
                    >
                      <ExternalLink size={16} className="text-muted" />
                      Open
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 flex flex-col gap-0">
        <div className="flex items-center gap-2 px-1 mb-4">
          <MessageCircle size={18} className="text-accent" />
          <h2 className="text-base font-bold">
            Comments
            <span className="ml-1.5 text-sm font-medium text-muted">{totalComments}</span>
          </h2>
        </div>

        {/* Comment Composer */}
        {isAuthenticated && (
          <div className="flex gap-3 mb-2 px-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white overflow-hidden shadow-sm">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className={`rounded-2xl bg-card ring-1 p-3.5 transition-all ${
                composerFocused ? "ring-2 ring-accent/30 shadow-sm" : "ring-border"
              }`}>
                <MentionTextarea
                  value={commentText}
                  onChange={(val) => setCommentText(val)}
                  placeholder="Add a comment..."
                  rows={composerFocused ? 3 : 1}
                  className="placeholder:text-muted/50"
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || posting}
                  className={`flex h-10 items-center gap-2 rounded-full px-5 text-sm font-bold text-background transition-all ${
                    commentText.trim()
                      ? "bg-foreground hover:opacity-80 shadow-lg shadow-foreground/10"
                      : "bg-muted opacity-50"
                  }`}
                >
                  {posting ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Send size={14} />
                  )}
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {commentsError && (
          <div className="mx-1 my-2 flex items-start gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in">
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{commentsError}</span>
          </div>
        )}

        {/* Loading */}
        {commentsLoading && (
          <div className="flex flex-col gap-0 py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 py-3">
                <SkeletonPulse className="h-9 w-9 rounded-full shrink-0" />
                <div className="flex flex-1 flex-col gap-2">
                  <SkeletonPulse className="h-4 w-32 rounded-full" />
                  <SkeletonPulse className="h-3 w-3/4 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!commentsLoading && !commentsError && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-14 text-muted ring-1 ring-border my-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/10">
              <MessageCircle size={24} className="text-accent" />
            </div>
            <p className="text-base font-bold text-foreground">No comments yet</p>
            <p className="text-sm">Be the first to share your thoughts</p>
          </div>
        )}

        {/* Comments List */}
        {!commentsLoading && comments.length > 0 && (
          <div className="flex flex-col divide-y divide-border/50">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>

      {previewOpen && post && (
        <ImagePreviewModal
          post={post}
          startIndex={previewIndex}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </div>
  );
}
