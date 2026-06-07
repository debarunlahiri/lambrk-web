"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Volume2,
  VolumeX,
  Play,
  Pause,
} from "lucide-react";
import type { Post } from "@/lib/data";
import { votePost } from "@/lib/api";
import {
  registerVideoPlayer,
  unregisterVideoPlayer,
  requestVideoPlay,
  notifyVideoStopped,
} from "@/lib/video-controller";

interface LoopMixItemProps {
  post: Post;
  isActive: boolean;
}

export default function LoopMixItem({ post, isActive }: LoopMixItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [liked, setLiked] = useState(post.userVote === "LIKE");
  const [disliked, setDisliked] = useState(post.userVote === "DISLIKE");
  const [likeCount, setLikeCount] = useState(post.likes);
  const [dislikeCount, setDislikeCount] = useState(post.dislikes);
  const [voting, setVoting] = useState(false);
  const [muted, setMuted] = useState(false);
  const [paused, setPaused] = useState(false);
  const [showCenterBtn, setShowCenterBtn] = useState(false);
  const centerBtnTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const playerIdRef = useRef(`lm-${post.id}-${Math.random().toString(36).slice(2, 7)}`);

  const media = post.media?.[0];
  const isVideo = media?.type === "video";

  // Register with global video controller
  useEffect(() => {
    const id = playerIdRef.current;
    const pauseFn = () => {
      const v = videoRef.current;
      if (v && !v.paused) {
        v.pause();
        setPaused(true);
        notifyVideoStopped(id);
      }
    };
    registerVideoPlayer(id, pauseFn);
    return () => unregisterVideoPlayer(id);
  }, []);

  // Play/pause based on visibility
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;

    if (isActive) {
      requestVideoPlay(playerIdRef.current);
      v.play().then(() => setPaused(false)).catch(() => {});
    } else {
      v.pause();
      v.currentTime = 0;
      setPaused(true);
      notifyVideoStopped(playerIdRef.current);
    }
  }, [isActive, isVideo]);

  const showCenterButton = useCallback(() => {
    setShowCenterBtn(true);
    if (centerBtnTimerRef.current) clearTimeout(centerBtnTimerRef.current);
    centerBtnTimerRef.current = setTimeout(() => setShowCenterBtn(false), 600);
  }, []);

  const togglePlayPause = useCallback(() => {
    const v = videoRef.current;
    if (!v || !isVideo) return;
    if (v.paused) {
      requestVideoPlay(playerIdRef.current);
      v.play().then(() => setPaused(false)).catch(() => {});
    } else {
      v.pause();
      setPaused(true);
      notifyVideoStopped(playerIdRef.current);
    }
    showCenterButton();
  }, [isVideo, showCenterButton]);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const handleLike = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (voting || post.id.startsWith("pending-")) return;
    setVoting(true);
    const wasLiked = liked;
    const wasDisliked = disliked;

    if (wasLiked) {
      setLiked(false);
      setLikeCount((p) => p - 1);
    } else {
      setLiked(true);
      setLikeCount((p) => p + 1);
      if (wasDisliked) {
        setDisliked(false);
        setDislikeCount((p) => p - 1);
      }
    }

    try {
      await votePost(post.id, "LIKE");
    } catch {
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      setLikeCount(post.likes);
      setDislikeCount(post.dislikes);
    } finally {
      setVoting(false);
    }
  }, [voting, liked, disliked, post.id, post.likes, post.dislikes]);

  const handleDislike = useCallback(async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (voting || post.id.startsWith("pending-")) return;
    setVoting(true);
    const wasLiked = liked;
    const wasDisliked = disliked;

    if (wasDisliked) {
      setDisliked(false);
      setDislikeCount((p) => p - 1);
    } else {
      setDisliked(true);
      setDislikeCount((p) => p + 1);
      if (wasLiked) {
        setLiked(false);
        setLikeCount((p) => p - 1);
      }
    }

    try {
      await votePost(post.id, "DISLIKE");
    } catch {
      setLiked(wasLiked);
      setDisliked(wasDisliked);
      setLikeCount(post.likes);
      setDislikeCount(post.dislikes);
    } finally {
      setVoting(false);
    }
  }, [voting, liked, disliked, post.id, post.likes, post.dislikes]);

  useEffect(() => {
    return () => {
      if (centerBtnTimerRef.current) clearTimeout(centerBtnTimerRef.current);
    };
  }, []);

  const avatarText = post.author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative h-[100dvh] w-full snap-start snap-always overflow-hidden bg-black">
      {/* Media fills the entire viewport on all screens */}
      <div
        className="absolute inset-0 overflow-hidden"
        onClick={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest("button") || target.closest("a")) return;
          togglePlayPause();
        }}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={media?.url}
            className="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
            loop
            playsInline
            preload="metadata"
          />
        ) : media ? (
          <img
            src={media.url}
            alt=""
            loading="lazy"
            className="absolute top-1/2 left-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-surface">
            <span className="text-muted text-sm">No media</span>
          </div>
        )}
      </div>

      {/* Center play/pause button */}
      {isVideo && showCenterBtn && (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            {paused ? (
              <Play size={32} className="text-white fill-white ml-1" />
            ) : (
              <Pause size={32} className="text-white" />
            )}
          </div>
        </div>
      )}

      {/* Mute toggle (video only) */}
      {isVideo && (
        <button
          onClick={toggleMute}
          className="absolute top-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      )}

      {/* Right-side action buttons */}
      <div className="absolute right-3 bottom-28 z-20 flex flex-col items-center gap-4">
        {/* Like */}
        <button
          onClick={handleLike}
          disabled={voting}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            liked ? "text-accent" : "text-white"
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-90 ${
            liked ? "bg-accent/20" : ""
          }`}>
            <ThumbsUp size={20} fill={liked ? "currentColor" : "none"} />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">
            {likeCount > 0 ? likeCount : ""}
          </span>
        </button>

        {/* Dislike */}
        <button
          onClick={handleDislike}
          disabled={voting}
          className={`flex flex-col items-center gap-0.5 transition-colors ${
            disliked ? "text-red-500" : "text-white"
          }`}
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-90 ${
            disliked ? "bg-red-500/20" : ""
          }`}>
            <ThumbsDown size={20} fill={disliked ? "currentColor" : "none"} />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">
            {dislikeCount > 0 ? dislikeCount : ""}
          </span>
        </button>

        {/* Comments */}
        <Link
          href={`/post/${post.id}`}
          className="flex flex-col items-center gap-0.5 text-white"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <MessageCircle size={22} />
          </div>
          <span className="text-[11px] font-bold drop-shadow-md">
            {post.comments > 0 ? post.comments : ""}
          </span>
        </Link>

        {/* Share */}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="flex flex-col items-center gap-0.5 text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-transform active:scale-90">
            <Share2 size={20} />
          </div>
        </button>

        {/* More */}
        <button
          onClick={(e) => e.stopPropagation()}
          className="flex flex-col items-center gap-0.5 text-white"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm">
            <MoreHorizontal size={20} />
          </div>
        </button>
      </div>

      {/* Bottom gradient + info */}
      <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black via-black/70 via-30% to-transparent px-5 pb-20 pt-14">
        {/* Author row */}
        <div className="flex items-center gap-3 mb-3">
          <Link
            href={`/user/${post.author.handle.replace("@", "")}`}
            onClick={(e) => e.stopPropagation()}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden ring-2 ring-white/20"
          >
            {post.author.avatarUrl ? (
              <img src={post.author.avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              avatarText
            )}
          </Link>

          <div className="flex flex-col min-w-0">
            <Link
              href={`/user/${post.author.handle.replace("@", "")}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[15px] font-bold text-white leading-tight truncate"
            >
              {post.author.name}
            </Link>
            <span className="text-[13px] text-white/70">{post.author.handle}</span>
          </div>
        </div>

        {/* Caption */}
        {post.content && (
          <p className="text-[15px] text-white/90 leading-relaxed line-clamp-3 mb-3 pr-14">
            {post.content}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center gap-2 text-[13px] text-white/50">
          <span>{post.timestamp}</span>
          {post.reposts > 0 && (
            <>
              <span className="text-white/30">·</span>
              <span>{post.reposts} shares</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
