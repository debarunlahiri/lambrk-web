"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Repeat,
  Share2,
  Bookmark,
  Send,
  Loader2,
} from "lucide-react";
import { mockPosts } from "@/lib/data";
import { listCommentsForPost, createComment, type ApiComment } from "@/lib/api";

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

function CommentCard({ comment }: { comment: ApiComment }) {
  return (
    <div className="flex gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white">
        {comment.author.avatarUrl ? (
          <img
            src={comment.author.avatarUrl}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          getAvatarText(comment.author.displayName)
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{comment.author.displayName}</span>
          <span className="text-xs text-muted">@{comment.author.username}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm leading-relaxed">{comment.content}</p>
        <div className="mt-1 flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
              <ThumbsUp size={14} />
            </button>
            <span className="text-xs text-muted">{comment.likeCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
              <ThumbsDown size={14} />
            </button>
            <span className="text-xs text-muted">{comment.dislikeCount}</span>
          </div>
          {comment.replyCount > 0 && (
            <span className="text-xs text-muted">{comment.replyCount} replies</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PostDetail({ params }: PostDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const { id: postId } = use(params);
  const post = mockPosts.find((p) => p.id === postId);

  const numericPostId = parseInt(postId, 10);

  const avatarText = user?.displayName
    ? getAvatarText(user.displayName)
    : "YO";

  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post?.likes ?? 0);
  const [dislikeCount, setDislikeCount] = useState(post?.dislikes ?? 0);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<ApiComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentsError, setCommentsError] = useState("");
  const [totalComments, setTotalComments] = useState(0);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (isNaN(numericPostId)) return;
    let cancelled = false;
    listCommentsForPost(numericPostId)
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
  }, [numericPostId]);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setLiked(true);
      setLikeCount((prev) => prev + 1);
      if (disliked) {
        setDisliked(false);
        setDislikeCount((prev) => prev - 1);
      }
    }
  };

  const handleDislike = () => {
    if (disliked) {
      setDisliked(false);
      setDislikeCount((prev) => prev - 1);
    } else {
      setDisliked(true);
      setDislikeCount((prev) => prev + 1);
      if (liked) {
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      }
    }
  };

  const handleComment = async () => {
    if (!commentText.trim() || !isAuthenticated || isNaN(numericPostId)) return;
    setPosting(true);
    try {
      const newComment = await createComment({
        content: commentText.trim(),
        postId: numericPostId,
        parentCommentId: null,
      });
      setComments((prev) => [newComment, ...prev]);
      setTotalComments((prev) => prev + 1);
      setCommentText("");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to post comment";
      setCommentsError(message);
    } finally {
      setPosting(false);
    }
  };

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <p className="text-xl font-bold">Post not found</p>
        <Link href="/" className="mt-2 text-accent hover:underline">
          Back to feed
        </Link>
      </div>
    );
  }

  const mediaCount = post.media?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 px-2 py-3 backdrop-blur-xl">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Post</h1>
      </div>

      <div className="flex flex-col gap-4 overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div className="flex flex-col gap-3 px-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white">
                {post.author.avatar}
              </div>
              <div>
                <p className="text-sm font-bold">{post.author.name}</p>
                <p className="text-xs text-muted">{post.author.handle}</p>
              </div>
            </div>
            <span className="text-xs text-muted">{post.timestamp}</span>
          </div>

          <p className="text-lg leading-relaxed">{post.content}</p>

          {post.media && post.media.length > 0 && (
            <div className={`grid gap-1 overflow-hidden rounded-2xl ${mediaCount === 1 ? 'grid-cols-1' : 'grid-cols-2'} max-h-[360px]`}>
              {post.media.map((item, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden ${mediaCount === 3 && index === 0 ? 'row-span-2' : ''}`}
                >
                  {item.type === "video" ? (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                      controls
                    />
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between border-t border-border pt-3">
            <div className="flex items-center gap-1">
              <button
                onClick={handleLike}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  liked
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-bold tabular-nums">
                {likeCount}
              </span>

              <button
                onClick={handleDislike}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  disliked
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <ThumbsDown size={20} fill={disliked ? "currentColor" : "none"} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-bold tabular-nums text-muted">
                {dislikeCount}
              </span>

              <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <MessageCircle size={20} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-bold tabular-nums text-muted">
                {totalComments}
              </span>

              <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <Repeat size={20} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-bold tabular-nums text-muted">
                {post.reposts}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSaved(!saved)}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-all ${
                  saved
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <Bookmark size={20} fill={saved ? "currentColor" : "none"} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <Share2 size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-bold">
          Comments <span className="text-muted">({totalComments})</span>
        </h2>

        {isAuthenticated && (
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full resize-none rounded-2xl bg-card p-3 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/60 focus:ring-2 focus:ring-accent/30"
                rows={2}
              />
              <div className="flex justify-end">
                <button
                  onClick={handleComment}
                  disabled={!commentText.trim() || posting}
                  className="flex h-9 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-80 disabled:opacity-30"
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

        {commentsError && (
          <div className="rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {commentsError}
          </div>
        )}

        {commentsLoading && (
          <div className="flex items-center justify-center py-12 text-muted">
            <Loader2 size={28} className="animate-spin" />
          </div>
        )}

        {!commentsLoading && !commentsError && comments.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
            <MessageCircle size={32} className="mb-3 opacity-40" />
            <p className="text-sm font-bold">No comments yet</p>
            <p className="text-xs">Be the first to share your thoughts</p>
          </div>
        )}

        {!commentsLoading && (
          <div className="flex flex-col gap-3">
            {comments.map((comment) => (
              <CommentCard key={comment.id} comment={comment} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
