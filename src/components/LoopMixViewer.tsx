"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import LoopMixItem from "./LoopMixItem";
import type { Post } from "@/lib/data";

interface LoopMixViewerProps {
  posts: Post[];
}

export default function LoopMixViewer({ posts }: LoopMixViewerProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToIndex = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, posts.length - 1));
    const el = itemRefs.current[clamped];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [posts.length]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        }
        if (best) {
          const idx = Number(best.target.getAttribute("data-index"));
          if (!isNaN(idx)) {
            setActiveIndex(idx);
          }
        }
      },
      {
        root: container,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
      }
    );

    itemRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [posts]);

  // Keyboard navigation (up/down arrows)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        scrollToIndex(activeIndex + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        scrollToIndex(activeIndex - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeIndex, scrollToIndex]);

  const setItemRef = useCallback((index: number) => (el: HTMLDivElement | null) => {
    itemRefs.current[index] = el;
  }, []);

  if (posts.length === 0) {
    return (
      <div className="flex h-[100dvh] w-full flex-col items-center justify-center gap-3 bg-background">
        <p className="text-lg font-bold text-muted">No media yet</p>
        <p className="text-sm text-muted/70">Check back later for new content</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        className="h-[100dvh] w-full overflow-y-auto snap-y snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {posts.map((post, index) => (
          <div
            key={post.id}
            ref={setItemRef(index)}
            data-index={index}
            className="snap-start"
          >
            <LoopMixItem post={post} isActive={activeIndex === index} />
          </div>
        ))}
      </div>

      {/* Desktop up/down arrows */}
      <div className="hidden md:flex fixed right-6 lg:right-8 top-1/3 z-50 flex-col gap-3">
        <button
          onClick={() => scrollToIndex(activeIndex - 1)}
          disabled={activeIndex === 0}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 disabled:opacity-0 shadow-lg ring-1 ring-white/10"
        >
          <ChevronUp size={22} />
        </button>
        <button
          onClick={() => scrollToIndex(activeIndex + 1)}
          disabled={activeIndex === posts.length - 1}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 disabled:opacity-0 shadow-lg ring-1 ring-white/10"
        >
          <ChevronDown size={22} />
        </button>
      </div>
    </div>
  );
}
