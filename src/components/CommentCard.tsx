"use client";

import { useState } from "react";
import { ThumbsUp, ThumbsDown, MessageCircle, Send, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { createComment, voteComment, type ApiComment } from "@/lib/api";
import MentionTextarea from "@/components/MentionTextarea";

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

interface CommentCardProps {
  comment: ApiComment;
  onReply?: (reply: ApiComment) => void;
  depth?: number;
}

export default function CommentCard({ comment, onReply, depth = 0 }: CommentCardProps) {
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(comment.userVote === "LIKE");
  const [disliked, setDisliked] = useState(comment.userVote === "DISLIKE");
  const [likeCount, setLikeCount] = useState(comment.likeCount);
  const [dislikeCount, setDislikeCount] = useState(comment.dislikeCount);
  const [voting, setVoting] = useState(false);
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyPosting, setReplyPosting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [localReplies, setLocalReplies] = useState<ApiComment[]>(comment.replies || []);

  const isLastLevel = depth >= 1;

  const handleLike = async () => {
    if (voting) return;
    setVoting(true);
    const was = liked;
    setLiked(!was);
    setLikeCount((p) => (was ? p - 1 : p + 1));
    if (disliked) { setDisliked(false); setDislikeCount((p) => p - 1); }
    try { await voteComment(comment.id, "LIKE"); } catch {
      setLiked(was); setLikeCount(comment.likeCount); setDisliked(disliked); setDislikeCount(comment.dislikeCount);
    } finally { setVoting(false); }
  };

  const handleDislike = async () => {
    if (voting) return;
    setVoting(true);
    const was = disliked;
    setDisliked(!was);
    setDislikeCount((p) => (was ? p - 1 : p + 1));
    if (liked) { setLiked(false); setLikeCount((p) => p - 1); }
    try { await voteComment(comment.id, "DISLIKE"); } catch {
      setDisliked(was); setDislikeCount(comment.dislikeCount); setLiked(liked); setLikeCount(comment.likeCount);
    } finally { setVoting(false); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !isAuthenticated) return;
    setReplyPosting(true);
    try {
      const newReply = await createComment({
        content: replyText.trim(),
        postId: comment.postId,
        parentCommentId: comment.id,
      });
      setLocalReplies((prev) => [newReply, ...prev]);
      setReplyText("");
      setReplyOpen(false);
      onReply?.(newReply);
    } catch {
      // ignore
    } finally {
      setReplyPosting(false);
    }
  };

  return (
    <div className="flex gap-3 py-3">
      <div className="flex shrink-0 flex-col items-center">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white overflow-hidden shadow-sm">
          {comment.author.avatarUrl ? (
            <img src={comment.author.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
          ) : (
            getAvatarText(comment.author.displayName)
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold">{comment.author.displayName}</span>
          <span className="text-xs text-muted">@{comment.author.username}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground/90">{comment.content}</p>

        <div className="mt-1.5 flex items-center gap-0.5">
          <button onClick={handleLike} disabled={voting} className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-all ${liked ? "bg-accent/10 text-accent" : "text-muted hover:bg-surface"}`}>
            <ThumbsUp size={14} fill={liked ? "currentColor" : "none"} />
            {likeCount > 0 && <span>{likeCount}</span>}
          </button>
          <button onClick={handleDislike} disabled={voting} className={`flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium transition-all ${disliked ? "bg-red-500/10 text-red-500" : "text-muted hover:bg-surface"}`}>
            <ThumbsDown size={14} fill={disliked ? "currentColor" : "none"} />
            {dislikeCount > 0 && <span>{dislikeCount}</span>}
          </button>
          {!isLastLevel && (
            <button
              onClick={() => setReplyOpen(!replyOpen)}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-muted transition-all hover:bg-surface hover:text-foreground"
            >
              <MessageCircle size={14} />
              Reply
            </button>
          )}
          {comment.replyCount > 0 && (
            <button
              onClick={() => setShowReplies(!showReplies)}
              className="flex h-8 items-center gap-1 rounded-full px-2.5 text-xs font-medium text-accent transition-all hover:bg-accent/10"
            >
              {comment.replyCount + localReplies.length - (comment.replies?.length || 0)} replies
            </button>
          )}
        </div>

        {/* Reply composer */}
        {!isLastLevel && replyOpen && (
          <div className="mt-2 flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[10px] font-bold text-white overflow-hidden">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" /> : "YO"}
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="rounded-xl bg-surface ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/30">
                <MentionTextarea
                  value={replyText}
                  onChange={(val) => setReplyText(val)}
                  placeholder="Write a reply..."
                  rows={2}
                  autoFocus
                  className="p-2.5 placeholder:text-muted/50"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button onClick={() => setReplyOpen(false)} className="rounded-full px-4 py-1.5 text-xs font-medium text-muted transition-all hover:bg-surface">
                  Cancel
                </button>
                <button
                  onClick={handleReply}
                  disabled={!replyText.trim() || replyPosting}
                  className="flex h-8 items-center gap-1.5 rounded-full bg-foreground px-4 text-xs font-bold text-background transition-opacity hover:opacity-80 disabled:opacity-30"
                >
                  {replyPosting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                  Reply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nested replies — only show at depth 0 */}
        {!isLastLevel && showReplies && localReplies.length > 0 && (
          <div className="mt-2 flex flex-col divide-y divide-border/30 border-l-2 border-border/30 pl-3">
            {localReplies.map((reply) => (
              <CommentCard key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
