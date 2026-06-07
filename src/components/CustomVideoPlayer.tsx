"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import {
  registerVideoPlayer,
  unregisterVideoPlayer,
  requestVideoPlay,
  notifyVideoStopped,
} from "@/lib/video-controller";

interface CustomVideoPlayerProps {
  src: string;
  className?: string;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function CustomVideoPlayer({ src, className = "" }: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const playingRef = useRef(false);
  const playerIdRef = useRef(`vp-${Math.random().toString(36).slice(2, 9)}`);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [buffered, setBuffered] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showCenterBtn, setShowCenterBtn] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Keep ref in sync with state for timer callbacks
  useEffect(() => {
    playingRef.current = playing;
  }, [playing]);

  // Attach video listeners — use src as dep, access ref inside
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTime = () => setCurrentTime(video.currentTime);
    const onDur = () => {
      if (video.duration && !isNaN(video.duration) && video.duration !== Infinity) {
        setDuration(video.duration);
      }
    };
    const onMeta = () => {
      if (video.duration && !isNaN(video.duration) && video.duration !== Infinity) {
        setDuration(video.duration);
      }
    };
    const onProg = () => {
      if (video.buffered.length > 0) {
        setBuffered(video.buffered.end(video.buffered.length - 1));
      }
    };
    const onEnd = () => {
      setPlaying(false);
      setShowCenterBtn(true);
    };

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("durationchange", onDur);
    video.addEventListener("loadedmetadata", onMeta);
    video.addEventListener("progress", onProg);
    video.addEventListener("ended", onEnd);

    // Read immediately in case metadata already loaded
    onMeta();
    onDur();

    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("durationchange", onDur);
      video.removeEventListener("loadedmetadata", onMeta);
      video.removeEventListener("progress", onProg);
      video.removeEventListener("ended", onEnd);
    };
  }, [src]);

  // Register with global video controller so only one plays at a time
  useEffect(() => {
    const id = playerIdRef.current;
    const pauseFn = () => {
      const v = videoRef.current;
      if (v && !v.paused) {
        v.pause();
        setPlaying(false);
        setShowCenterBtn(true);
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
      notifyVideoStopped(id);
    };
    registerVideoPlayer(id, pauseFn);
    return () => unregisterVideoPlayer(id);
  }, []);

  const seekTo = useCallback((clientX: number) => {
    const bar = progressRef.current;
    const v = videoRef.current;
    if (!bar || !v) return;
    const dur = v.duration;
    if (!dur || isNaN(dur) || dur <= 0) return;

    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const t = pct * dur;
    v.currentTime = t;
    setCurrentTime(t);
  }, []);

  const startHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setShowControls(false);
      if (playingRef.current) setShowCenterBtn(false);
    }, 2500);
  }, []);

  const showAll = useCallback(() => {
    setShowControls(true);
    setShowCenterBtn(true);
    startHideTimer();
  }, [startHideTimer]);

  const togglePlay = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      const v = videoRef.current;
      if (!v) return;
      if (v.paused) {
        requestVideoPlay(playerIdRef.current);
        v.play().then(() => {
          setPlaying(true);
          setShowCenterBtn(true);
          startHideTimer();
        }).catch(() => {});
      } else {
        v.pause();
        notifyVideoStopped(playerIdRef.current);
        setPlaying(false);
        setShowCenterBtn(true);
        setShowControls(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      }
    },
    [startHideTimer]
  );

  const toggleMute = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const v = videoRef.current;
      if (!v) return;
      v.muted = !muted;
      setMuted(!muted);
    },
    [muted]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseFloat(e.target.value);
      const v = videoRef.current;
      if (!v) return;
      v.volume = val;
      setVolume(val);
      if (val === 0) {
        setMuted(true);
        v.muted = true;
      } else if (muted) {
        setMuted(false);
        v.muted = false;
      }
    },
    [muted]
  );

  const toggleFullscreen = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const c = containerRef.current;
      if (!c) return;
      if (!document.fullscreenElement) {
        c.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    },
    []
  );

  // Track fullscreen change
  useEffect(() => {
    const handler = () => {
      setShowControls(true);
      setShowCenterBtn(true);
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  // Initial show, then fade
  useEffect(() => {
    startHideTimer();
  }, [startHideTimer]);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferedWidth = duration > 0 ? (buffered / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative group cursor-pointer ${className}`}
      onMouseMove={showAll}
      onMouseLeave={() => {
        if (playingRef.current) {
          startHideTimer();
        }
      }}
      onTouchStart={showAll}
    >
      <video
        ref={videoRef}
        src={src}
        className="h-full w-full object-contain"
        playsInline
        preload="metadata"
        loop
        muted={muted}
        onClick={(e) => e.stopPropagation()}
      />

      {/* Center play/pause button */}
      {showCenterBtn && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:scale-110 active:scale-95">
            {playing ? (
              <Pause size={28} className="text-white" />
            ) : (
              <Play size={28} className="text-white fill-white ml-0.5" />
            )}
          </div>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-10 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress / seek — tall, fat hit area, blocks carousel scroll */}
        <div
          ref={progressRef}
          className="relative mb-2 w-full cursor-pointer select-none"
          style={{ touchAction: "none" }}
          onClick={(e) => {
            e.stopPropagation();
            seekTo(e.clientX);
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging(true);
            seekTo(e.clientX);
          }}
          onMouseMove={(e) => {
            if (isDragging) {
              e.stopPropagation();
              seekTo(e.clientX);
            }
          }}
          onMouseUp={() => setIsDragging(false)}
          onMouseLeave={() => setIsDragging(false)}
          onTouchStart={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsDragging(true);
            seekTo(e.touches[0].clientX);
          }}
          onTouchMove={(e) => {
            if (isDragging) {
              e.stopPropagation();
              e.preventDefault();
              seekTo(e.touches[0].clientX);
            }
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            setIsDragging(false);
          }}
        >
          {/* Tall track container — the whole thing is clickable */}
          <div className="flex items-center h-5 w-full">
            {/* Background track */}
            <div className="absolute inset-x-0 h-1 rounded-full bg-white/20" />
            {/* Buffered */}
            <div
              className="absolute left-0 h-1 rounded-full bg-white/30"
              style={{ width: `${bufferedWidth}%` }}
            />
            {/* Progress fill */}
            <div
              className="absolute left-0 h-1 rounded-full bg-accent"
              style={{ width: `${progress}%` }}
            />
            {/* Thumb */}
            <div
              className="absolute h-3 w-3 rounded-full bg-accent ring-[2.5px] ring-white shadow-md"
              style={{ left: `${progress}%`, transform: "translateX(-50%)" }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="fill-white" />}
            </button>

            {/* Time */}
            <span className="text-[11px] font-medium text-white/90 tabular-nums">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
              >
                {muted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                className="h-1 w-14 cursor-pointer appearance-none rounded-full bg-white/30 accent-accent [&::-webkit-slider-thumb]:h-2.5 [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
              />
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
            >
              <Maximize size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
