"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallback?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
  variant?: "text" | "icon";
}

export default function BackButton({
  fallback = "/",
  label = "Back",
  showLabel = false,
  className = "",
  variant = "icon",
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 2) {
      router.back();
    } else {
      router.push(fallback);
    }
  };

  if (variant === "icon") {
    return (
      <button
        onClick={handleClick}
        className={`flex h-10 w-10 items-center justify-center rounded-full text-foreground transition-all hover:bg-surface active:scale-90 ${className}`}
        aria-label="Go back"
      >
        <ArrowLeft size={20} />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground active:scale-95 ${className}`}
    >
      <ArrowLeft size={16} />
      {showLabel && label && <span>{label}</span>}
    </button>
  );
}
