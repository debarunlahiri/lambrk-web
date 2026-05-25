"use client";

import { useState } from "react";
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
} from "lucide-react";
import type { Post } from "@/lib/data";
import { votePost } from "@/lib/api";

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes);
  const [voting, setVoting] = useState(false);

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
    <Link href={`/post/${post.id}`} className="block">
      <article className="group relative overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border transition-all hover:shadow-md">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white overflow-hidden">
                {post.author.avatarUrl ? (
                  <img src={post.author.avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  post.author.avatar
                )}
              </div>
              <div>
                <p className="text-sm font-bold">{post.author.name}</p>
                <p className="text-xs text-muted">{post.author.handle}</p>
              </div>
            </div>
            <span className="text-xs text-muted">{post.timestamp}</span>
          </div>

          <p className="text-[15px] leading-relaxed text-foreground/90">
            {post.content}
          </p>

          {post.media && post.media.length > 0 && (
            <div className={`grid gap-1 overflow-hidden rounded-2xl ${mediaCount === 1 ? 'grid-cols-1' : 'grid-cols-2'} max-h-[300px]`}>
              {post.media.slice(0, 4).map((item, index) => (
                <div
                  key={index}
                  className={`relative overflow-hidden ${mediaCount === 3 && index === 0 ? 'row-span-2' : ''}`}
                >
                  {item.type === "video" ? (
                    <>
                      <video
                        src={item.url}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30 transition-transform group-hover:scale-110">
                          <Play size={18} fill="white" className="ml-0.5 text-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                  {mediaCount > 4 && index === 3 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                      +{mediaCount - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleLike();
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  liked
                    ? "bg-accent/10 text-accent"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <ThumbsUp size={18} fill={liked ? "currentColor" : "none"} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-medium tabular-nums">
                {likeCount}
              </span>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleDislike();
                }}
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  disliked
                    ? "bg-red-500/10 text-red-500"
                    : "text-muted hover:bg-surface hover:text-foreground"
                }`}
              >
                <ThumbsDown size={18} fill={disliked ? "currentColor" : "none"} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-medium tabular-nums text-muted">
                {dislikeCount}
              </span>

              <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <MessageCircle size={18} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-medium tabular-nums text-muted">
                {post.comments}
              </span>

              <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <Repeat size={18} />
              </button>
              <span className="min-w-[1.5rem] text-sm font-medium tabular-nums text-muted">
                {post.reposts}
              </span>
            </div>

            <div className="flex items-center gap-1">
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
                <Bookmark size={18} fill={saved ? "currentColor" : "none"} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <Share2 size={18} />
              </button>
              <button className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-all hover:bg-surface hover:text-foreground">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}
