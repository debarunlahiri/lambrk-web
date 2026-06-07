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

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on click/touch outside
  useEffect(() => {
    if (!dropdownOpen) return;
    function handleOutside(e: PointerEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("pointerdown", handleOutside);
    return () => document.removeEventListener("pointerdown", handleOutside);
  }, [dropdownOpen]);
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
      <div ref={dropdownRef} className="absolute right-0 top-full z-[100] mt-2 w-72 overflow-hidden rounded-3xl bg-black/90 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
        <Link
          href="/profile"
          onClick={() => setDropdownOpen(false)}
          className="flex items-center gap-3 border-b border-white/10 px-5 py-4 transition-colors hover:bg-white/10"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden shadow-md">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              avatarText
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-white">{user?.displayName}</p>
            <p className="truncate text-xs text-white/60">@{user?.username}</p>
          </div>
        </Link>

        <div className="py-1.5">
          <Link
            href="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <User size={18} className="text-white/50" />
            <span className="flex-1">Profile</span>
          </Link>
          <Link
            href="/compose"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <PenLine size={18} className="text-white/50" />
            <span className="flex-1">Create Post</span>
          </Link>
          <Link
            href="/notifications"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <span className="relative">
              <Bell size={18} className="text-white/50" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </span>
            <span className="flex-1">Notifications</span>
            {unreadCount > 0 && (
              <span className="text-xs tabular-nums text-white/50">{unreadCount} new</span>
            )}
          </Link>
        </div>

        <div className="border-t border-white/10 py-1.5">
          <Link
            href="/settings"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-5 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10"
          >
            <Settings size={18} className="text-white/50" />
            <span>Settings</span>
          </Link>
          <button
            onClick={() => {
              setDropdownOpen(false);
              setShowLogoutConfirm(true);
            }}
            className="flex w-full items-center gap-3 px-5 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    ) : null;

  return (
    <header id="top-nav" className="sticky top-0 z-40 w-full border-b border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="flex w-full items-center justify-between gap-4 px-4 py-2.5">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 w-[180px]">
          <img src="/lambrk.png" alt="Lambrk" className="h-8 w-8 rounded-lg" />
          <span className="text-xl font-black tracking-tight hidden sm:block text-white">
            Lambrk
          </span>
        </Link>

        {/* Center: Search bar */}
        <form onSubmit={handleSearch} className="flex-1 flex justify-center max-w-3xl">
          <div className={`relative flex w-full items-center rounded-full bg-white/10 ring-1 transition-all ${searchFocused ? "ring-2 ring-white/30 bg-white/15" : "ring-white/10 hover:ring-white/20"}`}>
            <Search size={16} className="absolute left-3 text-white/60 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              placeholder="Search..."
              className="flex-1 bg-transparent py-2 pl-9 pr-8 text-sm outline-none text-white placeholder:text-white/40"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  searchInputRef.current?.focus();
                }}
                className="absolute right-2 flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white/70 hover:bg-white/30 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </form>

        {/* Right: User pill */}
        <div className="flex items-center justify-end gap-1.5 shrink-0 w-[180px]">
          {isClient && isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-1.5 rounded-full pr-2 pl-1 py-1 text-sm font-semibold transition-all text-white ${
                  dropdownOpen ? "bg-white/10 ring-1 ring-white/20" : "hover:bg-white/10"
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
                <ChevronDown size={14} className={`hidden sm:block text-white/60 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              <Dropdown />
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-bold text-white/70 transition-colors hover:text-white hover:bg-white/10"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-white px-4 py-2 text-sm font-bold text-black shadow-sm shadow-white/10 transition-all hover:opacity-80"
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
          onTouchStart={() => setDropdownOpen(false)}
        />
      )}

      {showLogoutConfirm && (
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div className="fixed inset-x-4 top-1/2 z-[200] mx-auto max-w-sm -translate-y-1/2 rounded-3xl bg-black/90 p-6 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl animate-in zoom-in-95 fade-in duration-200">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-500/10">
                  <LogOut size={24} className="text-red-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Sign Out</h2>
                <p className="mt-2 text-sm text-white/60">
                  Are you sure you want to sign out of your account?
                </p>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
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
