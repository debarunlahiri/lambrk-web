"use client";

import { useState, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Image as ImageIcon, Film, X, Sparkles, Upload } from "lucide-react";

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
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [dragReorderIndex, setDragReorderIndex] = useState<number | null>(null);
  const [dragOverReorderIndex, setDragOverReorderIndex] = useState<number | null>(null);
  const dropCounterRef = useRef(0);

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

  const processFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const existingHasVideoOrGif = media.some(
      (m) => m.type === "video" || m.file.type === "image/gif"
    );

    const newMedia: PendingMedia[] = [];

    for (const file of Array.from(files)) {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isGif = file.type === "image/gif";

      if (!isImage && !isVideo) continue;

      if ((isVideo || isGif) && (existingHasVideoOrGif || newMedia.some((m) => m.type === "video" || m.file.type === "image/gif"))) {
        continue; // only one video/gif allowed
      }

      const type = isVideo ? "video" : "image";
      const previewUrl = URL.createObjectURL(file);
      newMedia.push({ type, file, previewUrl });
    }

    if (newMedia.length > 0) {
      setMedia((prev) => [...prev, ...newMedia]);
    }
  }, [media]);

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

  // ── External file drop ──
  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCounterRef.current += 1;
    if (e.dataTransfer.types.includes("Files")) {
      setIsDraggingOver(true);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCounterRef.current -= 1;
    if (dropCounterRef.current === 0) {
      setIsDraggingOver(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dropCounterRef.current = 0;
    setIsDraggingOver(false);
    processFiles(e.dataTransfer.files);
  };

  // ── Reorder ──
  const handleReorderDragStart = (index: number) => {
    setDragReorderIndex(index);
  };

  const handleReorderDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragReorderIndex === null || dragReorderIndex === index) return;
    setDragOverReorderIndex(index);
  };

  const handleReorderDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (dragReorderIndex === null || dragReorderIndex === index) {
      setDragReorderIndex(null);
      setDragOverReorderIndex(null);
      return;
    }
    setMedia((prev) => {
      const newArr = [...prev];
      const [moved] = newArr.splice(dragReorderIndex, 1);
      newArr.splice(index, 0, moved);
      return newArr;
    });
    setDragReorderIndex(null);
    setDragOverReorderIndex(null);
  };

  const handleReorderDragEnd = () => {
    setDragReorderIndex(null);
    setDragOverReorderIndex(null);
  };

  return (
    <div
      className="relative mb-6 overflow-hidden rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border"
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drop overlay */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 rounded-3xl bg-accent/10 backdrop-blur-sm ring-2 ring-dashed ring-accent transition-all">
          <Upload size={40} className="text-accent" />
          <p className="text-lg font-bold text-accent">Drop files here</p>
        </div>
      )}

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
                  draggable
                  onDragStart={() => handleReorderDragStart(index)}
                  onDragOver={(e) => handleReorderDragOver(e, index)}
                  onDrop={(e) => handleReorderDrop(e, index)}
                  onDragEnd={handleReorderDragEnd}
                  className={`relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl ring-2 cursor-move transition-all ${
                    dragOverReorderIndex === index ? "ring-accent scale-105" : "ring-border"
                  } ${dragReorderIndex === index ? "opacity-40" : "opacity-100"}`}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      removeMedia(index);
                    }}
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
