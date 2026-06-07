"use client";

import { useEffect, useRef } from "react";
import { X, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  action?: string;
}

export default function LoginRequiredDialog({ open, onClose, action = "do that" }: LoginRequiredDialogProps) {
  const router = useRouter();
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="mx-4 w-full max-w-sm overflow-hidden rounded-3xl bg-black/90 backdrop-blur-xl border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-5 pt-5">
          <h3 className="text-lg font-bold text-white">Login Required</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          <p className="text-sm leading-relaxed text-white/70">
            You need to be logged in to <span className="font-semibold text-white">{action}</span>. 
            Join the community to engage with posts and creators.
          </p>
        </div>

        <div className="flex items-center gap-3 px-5 pb-5">
          <button
            onClick={() => router.push("/login")}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-bold text-white transition-all hover:brightness-110 active:scale-95"
          >
            <LogIn size={16} />
            Log In
          </button>
          <button
            onClick={() => router.push("/register")}
            className="flex flex-1 items-center justify-center rounded-full bg-white/10 py-2.5 text-sm font-bold text-white transition-all hover:bg-white/20 active:scale-95"
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}
