"use client";

import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFile, ApiError } from "@/lib/api";
import { Image as ImageIcon, Film, X, Sparkles, Loader2 } from "lucide-react";

interface CreatePostProps {
  onPost: (content: string, media: { type: "image" | "video"; url: string }[]) => void;
}

export default function CreatePost({ onPost }: CreatePostProps) {
  const { user } = useAuth();
  const [content, setContent] = useState("");
  const [media, setMedia] = useState<{ type: "image" | "video"; url: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
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
    setMedia([]);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !pendingType) return;
    setUploading(true);
    setUploadError("");
    try {
      const apiType = pendingType === "image" ? "POST_IMAGE" : "POST_VIDEO";
      const uploaded = await uploadFile({
        file,
        type: apiType,
        fileName: file.name,
        description: "Post media",
        isPublic: true,
        isNSFW: false,
      });
      setMedia([...media, { type: pendingType, url: uploaded.fileUrl }]);
    } catch (err: unknown) {
      let message = "Upload failed. Please try again.";
      if (err instanceof ApiError) {
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      setUploadError(message);
    } finally {
      setUploading(false);
      setPendingType(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerUpload = (type: "image" | "video") => {
    setPendingType(type);
    fileInputRef.current?.click();
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

          {uploadError && (
            <div className="rounded-2xl bg-red-500/10 px-3 py-2 text-xs text-red-500">
              {uploadError}
            </div>
          )}

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
                disabled={uploading}
                className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
                title="Add image"
              >
                {uploading && pendingType === "image" ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <ImageIcon size={20} />
                )}
              </button>
              <button
                onClick={() => triggerUpload("video")}
                disabled={uploading}
                className="flex h-10 w-10 items-center justify-center rounded-full text-accent transition-colors hover:bg-accent/10 disabled:opacity-50"
                title="Add video"
              >
                {uploading && pendingType === "video" ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Film size={20} />
                )}
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full text-accent-2 transition-colors hover:bg-accent-2/10">
                <Sparkles size={20} />
              </button>
            </div>
            <button
              onClick={handleSubmit}
              disabled={(!content.trim() && media.length === 0) || uploading}
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
