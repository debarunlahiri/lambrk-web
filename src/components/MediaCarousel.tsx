"use client";

import { useState, useRef, useCallback, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import CustomVideoPlayer from "./CustomVideoPlayer";

export interface CarouselMedia {
  type: "image" | "video";
  url: string;
}

interface MediaCarouselProps {
  media: CarouselMedia[];
  onOpenPreview?: (index: number) => void;
}

export default function MediaCarousel({ media, onOpenPreview }: MediaCarouselProps) {
  const [current, setCurrent] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef(0);

  const count = media.length;
  const isSingle = count === 1;

  const scrollTo = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, count - 1));
    setCurrent(clamped);
    const track = trackRef.current;
    if (!track) return;
    const itemWidth = track.offsetWidth;
    track.scrollTo({ left: clamped * itemWidth, behavior: "smooth" });
  }, [count]);

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollTo(current - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    scrollTo(current + 1);
  };

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) scrollTo(current + 1);
      else scrollTo(current - 1);
    }
  };

  const handleScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    const itemWidth = track.offsetWidth;
    const newIndex = Math.round(track.scrollLeft / itemWidth);
    if (newIndex !== current) setCurrent(newIndex);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/40 select-none">
      {/* Track */}
      <div
        ref={trackRef}
        className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onScroll={handleScroll}
      >
        {media.map((item, index) => (
          <div
            key={index}
            className="snap-start shrink-0 w-full flex items-center justify-center max-h-[420px] sm:max-h-[500px]"
            onClick={(e) => {
              if (item.type === "image" && onOpenPreview) {
                e.preventDefault();
                e.stopPropagation();
                onOpenPreview(index);
              }
            }}
          >
            {item.type === "video" ? (
              <CustomVideoPlayer src={item.url} className="h-full w-full" />
            ) : (
              <img
                src={item.url}
                alt=""
                loading="lazy"
                className="max-h-[420px] sm:max-h-[500px] max-w-full object-contain"
              />
            )}
          </div>
        ))}
      </div>

      {/* Counter */}
      {count > 1 && (
        <div className="absolute top-3 right-3 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-sm">
          {current + 1}/{count}
        </div>
      )}

      {/* Prev/Next arrows */}
      {!isSingle && current > 0 && (
        <button
          onClick={handlePrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity hover:bg-black/60"
        >
          <ChevronLeft size={18} />
        </button>
      )}
      {!isSingle && current < count - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-opacity hover:bg-black/60"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Dots */}
      {count > 1 && (
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
          {media.map((_, i) => (
            <button
              key={i}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                scrollTo(i);
              }}
              className={`h-1.5 rounded-full transition-all ${
                i === current ? "w-4 bg-white" : "w-1.5 bg-white/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
