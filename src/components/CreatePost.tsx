"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Film, X, Sparkles } from "lucide-react";

interface PendingMedia {
  type: "image" | "video";
  file: File;
  previewUrl: string;
}

interface CreatePostProps {
  onPost: (content: string, media: PendingMedia[]) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<PendingMedia[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingType, setPendingType] = useState<"image" | "video" | null>(null);

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
    media.forEach((m) => URL.revokeObjectURL(m.previewUrl));
    setMedia([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;

    const isGif = file.type === "image/gif";
    if ((pendingType === "video" || isGif) && media.some((m) => m.type === "video" || m.file.type === "image/gif")) return;

    const previewUrl = URL.createObjectURL(file);
    setMedia((prev) => [...prev, { type: pendingType, file, previewUrl }]);
    setPendingType(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const triggerUpload = (type: "image" | "video") => {
    if (type === "video" && hasSingleOnly) return;
    setPendingType(type);
    fileInputRef.current?.click();
  };

  const hasSingleOnly = media.some((m) => m.type === "video" || m.file.type === "image/gif");

  const removeMedia = (index: number) => {
    setMedia((prev) => {
      const item = prev[index];
      if (item) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
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
                      src={item.previewUrl}
                      alt={item.file.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.previewUrl}
                      className="h-full w-full object-cover"
                      preload="none"
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
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
              <button
                onClick={() => triggerUpload("image")}
                className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10"
                title="Add image"
              >
                <ImageIcon size={20} />
              </button>
              <button
                onClick={() => triggerUpload("video")}
                disabled={hasSingleOnly}
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  hasSingleOnly
                    ? "text-muted/40 cursor-not-allowed"
                    : "text-accent hover:bg-accent/10"
                }`}
                title={hasSingleOnly ? "Only one video or GIF allowed" : "Add video"}
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
