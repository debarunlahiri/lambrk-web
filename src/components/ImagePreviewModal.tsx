"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Bookmark,
  Share2,
  Send,
  Loader2,
  Clock,
  Play,
  Maximize2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getPost, listCommentsForPost, createComment, votePost, voteComment, bookmarkPost, unbookmarkPost, type ApiComment } from "@/lib/api";
import CommentCard from "@/components/CommentCard";
import MentionTextarea from "@/components/MentionTextarea";
import type { Post } from "@/lib/data";

interface ImagePreviewModalProps {
  post: Post;
  startIndex?: number;
  onClose: () => void;
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



export default function ImagePreviewModal({ post, startIndex = 0, onClose }: ImagePreviewModalProps) {
  const { user, isAuthenticated } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [fullPost, setFullPost] = useState(post);
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);
  const [liked, setLiked] = useState(post.userVote === "LIKE");
  const [disliked, setDisliked] = useState(post.userVote === "DISLIKE");
  const [saved, setSaved] = useState(post.isBookmarked ?? false);
  const [bookmarking, setBookmarking] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes);
  const [voting, setVoting] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const media = post.media || [];
  const currentMedia = media[currentIndex];

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && media.length > 1) setCurrentIndex((i) => Math.min(i + 1, media.length - 1));
      if (e.key === "ArrowLeft" && media.length > 1) setCurrentIndex((i) => Math.max(i - 1, 0));
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, media.length]);

  useEffect(() => {
    // Lock body scroll
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    if (!post.id.startsWith("pending-")) {
      getPost(post.id).then((p) => {
        setFullPost((prev) => ({
          ...prev,
          likes: p.likeCount,
          dislikes: p.dislikeCount,
          userVote: p.userVote,
          isBookmarked: p.userSaved ?? false,
        }));
        setLikeCount(p.likeCount);
        setDislikeCount(p.dislikeCount);
        setLiked(p.userVote === "LIKE");
        setDisliked(p.userVote === "DISLIKE");
        setSaved(p.userSaved ?? false);
      }).catch(() => {});
    }
  }, [post.id]);

  useEffect(() => {
    if (!post.id.startsWith("pending-")) {
      listCommentsForPost(post.id)
        .then((data) => { setComments(data.content); setCommentsLoading(false); })
        .catch(() => setCommentsLoading(false));
    } else {
      setCommentsLoading(false);
    }
  }, [post.id]);

  const handleLike = async () => {
    if (voting || post.id.startsWith("pending-")) return;
    setVoting(true);
    const wasLiked = liked;
    const wasDisliked = disliked;
    if (wasLiked) { setLiked(false); setLikeCount((p) => p - 1); }
    else { setLiked(true); setLikeCount((p) => p + 1); if (wasDisliked) { setDisliked(false); setDislikeCount((p) => p - 1); } }
    try { await votePost(post.id, "LIKE"); } catch {
      setLiked(wasLiked); setDisliked(wasDisliked); setLikeCount(post.likes); setDislikeCount(post.dislikes);
    } finally { setVoting(false); }
  };

  const handleDislike = async () => {
    if (voting || post.id.startsWith("pending-")) return;
    setVoting(true);
    const wasLiked = liked;
    const wasDisliked = disliked;
    if (wasDisliked) { setDisliked(false); setDislikeCount((p) => p - 1); }
    else { setDisliked(true); setDislikeCount((p) => p + 1); if (wasLiked) { setLiked(false); setLikeCount((p) => p - 1); } }
    try { await votePost(post.id, "DISLIKE"); } catch {
      setLiked(wasLiked); setDisliked(wasDisliked); setLikeCount(post.likes); setDislikeCount(post.dislikes);
    } finally { setVoting(false); }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !isAuthenticated || post.id.startsWith("pending-")) return;
    setPosting(true);
    try {
      const newComment = await createComment({ content: commentText.trim(), postId: post.id, parentCommentId: null });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
    } catch {} finally { setPosting(false); }
  };

  const avatarText = fullPost.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return createPortal(
    <div className="fixed inset-0 z-[150] flex flex-col md:flex-row bg-black/95 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute left-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/10 hover:scale-105"
      >
        <X size={20} />
      </button>

      {/* Image counter */}
      {media.length > 1 && (
        <div className="absolute left-1/2 top-4 z-10 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {currentIndex + 1} / {media.length}
        </div>
      )}

      {/* Image side */}
      <div className="relative flex flex-1 items-center justify-center bg-black md:flex-[1.5]">
        {currentMedia?.type === "video" ? (
          <video src={currentMedia.url} className="max-h-[60vh] max-w-full object-contain md:max-h-full" controls autoPlay preload="none" />
        ) : (
          <img src={currentMedia?.url} alt="" loading="lazy" className="max-h-[60vh] max-w-full object-contain md:max-h-full" />
        )}

        {/* Navigation arrows */}
        {media.length > 1 && (
          <>
            <button
              onClick={() => setCurrentIndex((i) => Math.max(i - 1, 0))}
              disabled={currentIndex === 0}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-0"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={() => setCurrentIndex((i) => Math.min(i + 1, media.length - 1))}
              disabled={currentIndex === media.length - 1}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-md transition-all hover:bg-white/10 disabled:opacity-0 md:right-auto md:left-[calc(100%-3rem)]"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Thumbnail strip on mobile */}
        {media.length > 1 && (
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 md:hidden">
            {media.map((m, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all ${i === currentIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details side */}
      <div className="flex w-full flex-col bg-background md:w-[400px] md:max-w-[400px] lg:w-[450px] lg:max-w-[450px]">
        {/* Mobile toggle between image and details */}
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3 md:hidden">
          <button onClick={() => setShowComments(!showComments)} className="text-sm font-bold text-foreground">
            {showComments ? "Back to image" : "Details & Comments"}
          </button>
          <ChevronRight size={16} className={`text-muted transition-transform ${showComments ? "rotate-90" : ""}`} />
        </div>

        <div className={`flex flex-1 flex-col overflow-hidden ${showComments ? "block" : "hidden md:flex"}`}>
          {/* Scrollable content */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {/* Author */}
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden shadow-sm">
                {fullPost.author.avatarUrl ? (
                  <img src={fullPost.author.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                ) : avatarText}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{fullPost.author.name}</p>
                <p className="text-xs text-muted">{fullPost.author.handle}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1 text-xs text-muted">
                  <Clock size={12} />
                  <span>{fullPost.timestamp}</span>
                </div>
                {saved && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-1 text-[11px] font-bold text-accent">
                    <Bookmark size={12} fill="currentColor" />
                    Bookmarked
                  </span>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="px-5 py-4">
              <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{fullPost.content}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between border-y border-border/50 px-5 py-3">
              <div className="flex items-center gap-0.5">
                <button onClick={handleLike} className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all ${liked ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface"}`}>
                  <ThumbsUp size={16} fill={liked ? "currentColor" : "none"} />
                  {likeCount > 0 && <span className="tabular-nums">{likeCount}</span>}
                </button>
                <button onClick={handleDislike} className={`flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium transition-all ${disliked ? "bg-red-500/10 text-red-500" : "text-muted hover:bg-surface"}`}>
                  <ThumbsDown size={16} fill={disliked ? "currentColor" : "none"} />
                  {dislikeCount > 0 && <span className="tabular-nums text-muted">{dislikeCount}</span>}
                </button>
                <button className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-all hover:bg-surface">
                  <MessageCircle size={16} />
                  {fullPost.comments > 0 && <span className="tabular-nums">{fullPost.comments}</span>}
                </button>
                <button className="flex h-9 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-muted transition-all hover:bg-surface">
                  <Share2 size={16} />
                </button>
              </div>
              <button
                onClick={async () => {
                  if (bookmarking || post.id.startsWith("pending-")) return;
                  const next = !saved;
                  setSaved(next);
                  setBookmarking(true);
                  try {
                    if (next) {
                      await bookmarkPost(post.id);
                    } else {
                      await unbookmarkPost(post.id);
                    }
                  } catch {
                    setSaved(!next);
                  } finally {
                    setBookmarking(false);
                  }
                }}
                disabled={bookmarking}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${saved ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface"} ${bookmarking ? "opacity-60" : ""}`}
              >
                <Bookmark size={16} fill={saved ? "currentColor" : "none"} />
              </button>
            </div>

            {/* Comment composer */}
            {isAuthenticated && (
              <div className="flex gap-3 border-b border-border/50 px-5 py-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[10px] font-bold text-white overflow-hidden">
                  {user?.avatarUrl ? <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : "YO"}
                </div>
                <div className="flex flex-1 flex-col gap-2">
                  <div className="rounded-xl bg-surface ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/30">
                    <MentionTextarea
                      value={commentText}
                      onChange={(val) => setCommentText(val)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="p-2.5 placeholder:text-muted/50"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={handleComment}
                      disabled={!commentText.trim() || posting}
                      className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-bold text-background transition-opacity hover:opacity-80 disabled:opacity-30"
                    >
                      {posting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Comments */}
            <div className="flex flex-col divide-y divide-border/40 px-5">
              {commentsLoading ? (
                <div className="flex items-center justify-center py-8 text-muted">
                  <Loader2 size={20} className="animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-muted">
                  <MessageCircle size={24} className="text-accent/50" />
                  <p className="text-sm font-medium">No comments yet</p>
                  <p className="text-xs">Be the first to share your thoughts</p>
                </div>
              ) : (
                comments.map((c) => <CommentCard key={c.id} comment={c} />)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
