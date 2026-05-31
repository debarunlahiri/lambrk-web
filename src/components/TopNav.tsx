"use client";

import { useSyncExternalStore, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Search, PenLine, User, Settings, LogOut, Bell, ChevronDown, X } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { useRouter } from "next/navigation";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export default function TopNav() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const isClient = useIsClient();
  const { unreadCount } = useWebSocket();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchFocused, setSearchFocused] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const Dropdown = () =>
    dropdownOpen ? (
      <div className="absolute right-0 top-full z-[100] mt-2 w-72 overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-150">
        <Link
          href="/profile"
          onClick={() => setDropdownOpen(false)}
          className="flex items-center gap-3 border-b border-border px-5 py-4 transition-colors hover:bg-surface"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden shadow-md">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              avatarText
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user?.displayName}</p>
            <p className="truncate text-xs text-muted">@{user?.username}</p>
          </div>
        </Link>

        <div className="py-1.5">
          <Link
            href="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            <User size={18} className="text-muted" />
            <span className="flex-1">Profile</span>
          </Link>
          <Link
            href="/compose"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            <PenLine size={18} className="text-muted" />
            <span className="flex-1">Create Post</span>
          </Link>
          <Link
            href="/notifications"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            <span className="relative">
              <Bell size={18} className="text-muted" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            <span className="flex-1">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs tabular-nums text-muted">{unreadCount} new</span>
            )}
          </Link>
        </div>

        <div className="border-t border-border py-1.5">
          <Link
            href="/settings"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium transition-colors hover:bg-surface"
          >
            <Settings size={18} className="text-muted" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              setDropdownOpen(false);
              setShowLogoutConfirm(true);
            }}
            className="flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-500/5"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    ) : null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/50 bg-background/85 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <img src="/lambrk.png" alt="Lambrk" className="h-8 w-8 rounded-lg object-cover shadow-md shadow-accent/20" />
          <span className="text-lg font-black tracking-tight hidden sm:block">
            <span className="gradient-text">lambrk</span>
          </span>
        </Link>

        {/* Center: Search bar */}
        <form onSubmit={handleSearch} className="flex-1 mx-auto max-w-md">
          <div className={`relative flex items-center rounded-full bg-surface ring-1 transition-all ${searchFocused ? "ring-2 ring-accent/40 bg-card" : "ring-border hover:ring-accent/20"}`}>
            <Search size={16} className="absolute left-3 text-muted shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search..."
              className="flex-1 bg-transparent py-2 pl-9 pr-8 text-sm outline-none placeholder:text-muted/50"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full bg-border/50 text-muted hover:bg-border hover:text-foreground transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </form>

        {/* Right: User pill */}
        <div className="flex items-center gap-1.5 shrink-0">
          {isClient && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 rounded-full pr-2 pl-1 py-1 text-sm font-semibold transition-all ${
                  dropdownOpen ? "bg-surface ring-1 ring-border" : "hover:bg-surface"
                }`}
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[10px] font-bold text-white overflow-hidden shadow-sm">
                  {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    avatarText
                  )}
                </div>
                <span className="hidden sm:inline max-w-[80px] truncate">{user?.displayName}</span>
                <ChevronDown size={14} className={`hidden sm:block text-muted transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <Dropdown />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-foreground hover:bg-surface"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background shadow-sm shadow-foreground/10 transition-all hover:opacity-80"
              >
                Join
              </Link>
            </>
          )}
        </div>
      </div>

      {dropdownOpen && (
        <div
          className="fixed inset-0 z-[99]"
          onClick={() => setDropdownOpen(false)}
        />
      )}

      {showLogoutConfirm && (
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div className="fixed inset-x-4 top-1/2 z-[200] mx-auto max-w-sm -translate-y-1/2 rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-border animate-in zoom-in-95 fade-in duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                  <LogOut size={24} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold">Sign Out</h2>
                <p className="mt-2 text-sm text-muted">
                  Are you sure you want to sign out of your account?
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-full bg-surface px-4 py-3 text-sm font-bold transition-colors hover:bg-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="flex-1 rounded-full bg-red-500 px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-80"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </>,
          document.body
        )
      )}
    </header>
  );
}
