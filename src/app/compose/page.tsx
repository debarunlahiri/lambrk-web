"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowLeft, Image as ImageIcon, Film, X } from "lucide-react";
import Link from "next/link";

export default function ComposePage() {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{ type: "image" | "video"; url: string }[]>([]);

  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "YO";

  const addMockMedia = (type: "image" | "video") => {
    if (type === "image") {
      const images = [
        "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80",
        "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=80",
      ];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setMedia([...media, { type, url: randomImage }]);
    } else {
      setMedia([...media, { type, url: "https://www.w3schools.com/html/mov_bbb.mp4" }]);
    }
  };

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center gap-4 bg-background/80 px-2 py-3 backdrop-blur-xl">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Create Post</h1>
        <button
          disabled={!content.trim() && media.length === 0}
          className="ml-auto rounded-full bg-foreground px-5 py-2 text-sm font-bold text-background transition-opacity hover:opacity-80 disabled:opacity-30"
        >
          Publish
        </button>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white">
          {avatarText}
        </div>
        <div className="flex flex-1 flex-col gap-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className="w-full resize-none bg-transparent text-2xl font-light placeholder:text-muted/50 outline-none"
            rows={6}
            autoFocus
          />

          {media.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {media.map((item, index) => (
                <div
                  key={index}
                  className="relative h-28 w-28 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border"
                >
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => setMedia(media.filter((_, i) => i !== index))}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 border-t border-border pt-4">
            <button
              onClick={() => addMockMedia("image")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10"
            >
              <ImageIcon size={20} />
            </button>
            <button
              onClick={() => addMockMedia("video")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10"
            >
              <Film size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
