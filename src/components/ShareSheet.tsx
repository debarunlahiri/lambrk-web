"use client";

import { useEffect, useRef } from "react";
import {
  X,
  Link as LinkIcon,
  MessageCircle,
  Send,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Check,
} from "lucide-react";

interface ShareSheetProps {
  url: string;
  title?: string;
  onClose: () => void;
}

const platforms = [
  {
    name: "WhatsApp",
    icon: MessageCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    getUrl: (u: string, t?: string) =>
      `https://wa.me/?text=${encodeURIComponent((t ? t + " " : "") + u)}`,
  },
  {
    name: "Telegram",
    icon: Send,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
    getUrl: (u: string, t?: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t || "")}`,
  },
  {
    name: "Facebook",
    icon: Facebook,
    color: "text-blue-600",
    bg: "bg-blue-600/10",
    getUrl: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(u)}`,
  },
  {
    name: "X",
    icon: Twitter,
    color: "text-foreground",
    bg: "bg-surface",
    getUrl: (u: string, t?: string) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(t || "")}`,
  },
  {
    name: "LinkedIn",
    icon: Linkedin,
    color: "text-blue-700",
    bg: "bg-blue-700/10",
    getUrl: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(u)}`,
  },
  {
    name: "Email",
    icon: Mail,
    color: "text-muted",
    bg: "bg-surface",
    getUrl: (u: string, t?: string) =>
      `mailto:?subject=${encodeURIComponent(t || "Check this out")}&body=${encodeURIComponent(u)}`,
  },
];

export default function ShareSheet({ url, title, onClose }: ShareSheetProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      if (inputRef.current) {
        inputRef.current.select();
      }
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center px-0 sm:px-4">
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full sm:w-96 rounded-t-3xl sm:rounded-3xl bg-card p-0 shadow-2xl ring-1 ring-border animate-in slide-in-from-bottom-8 fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-bold">Share</h3>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface"
          >
            <X size={18} />
          </button>
        </div>

        {/* Platform grid */}
        <div className="grid grid-cols-4 gap-3 p-5">
          {platforms.map((p) => {
            const Icon = p.icon;
            return (
              <a
                key={p.name}
                href={p.getUrl(url, title)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onClose}
                className="flex flex-col items-center gap-2 rounded-2xl p-3 transition-colors hover:bg-surface"
              >
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${p.bg} ${p.color}`}>
                  <Icon size={22} />
                </div>
                <span className="text-xs font-medium">{p.name}</span>
              </a>
            );
          })}
        </div>

        {/* Copy link row */}
        <div className="px-5 pb-5">
          <div className="flex items-center gap-2 rounded-2xl bg-surface p-2 ring-1 ring-border">
            <LinkIcon size={16} className="ml-3 text-muted shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={url}
              readOnly
              className="flex-1 bg-transparent text-sm text-muted outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className="flex h-9 items-center gap-1.5 rounded-xl bg-foreground px-3 text-xs font-bold text-background transition-opacity hover:opacity-80 shrink-0"
            >
              <Check size={14} />
              Copy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
