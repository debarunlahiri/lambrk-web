"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Film, X, Sparkles } from "lucide-react";

interface CreatePostProps {
  onPost: (content: string, media: { type: "image" | "video"; url: string }[]) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
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

  const handleSubmit = () => {
    if (!content.trim() && media.length === 0) return;
    onPost(content, media);
    setContent("");
    setMedia([]);
  };

  const addMockMedia = (type: "image" | "video") => {
    if (type === "image") {
      const images = [
        "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&q=80",
        "https://images.unsplash.com/photo-1682687982501-1e58ab814714?w=800&q=80",
        "https://images.unsplash.com/photo-1682687221038-404670f01d03?w=800&q=80",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      ];
      const randomImage = images[Math.floor(Math.random() * images.length)];
      setMedia([...media, { type, url: randomImage }]);
    } else {
      setMedia([...media, { type, url: "https://www.w3schools.com/html/mov_bbb.mp4" }]);
    }
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  return (
    <div className="mb-6 overflow-hidden rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white">
          {avatarText}
        </div>
        <div className="flex flex-1 flex-col gap-3">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something inspiring..."
            className="w-full resize-none bg-transparent text-lg placeholder:text-muted/60 outline-none"
            rows={2}
          />

          {media.length > 0 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {media.map((item, index) => (
                <div
                  key={index}
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-1 ring-border"
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
                    onClick={() => removeMedia(index)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => addMockMedia("image")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10"
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
              <button
                onClick={() => addMockMedia("video")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10"
                title="Add video"
              >
                <Film size={20} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-accent-2 transition-colors hover:bg-accent-2/10">
                <Sparkles size={20} />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={!content.trim() && media.length === 0}
              className="rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-opacity hover:opacity-80 disabled:opacity-30"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
