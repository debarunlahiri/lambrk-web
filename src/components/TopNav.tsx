"use client";

import { useSyncExternalStore, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Search, PenLine, User, Settings, LogOut, ChevronRight, Bell } from "lucide-react";
import { useWebSocket } from "@/contexts/WebSocketContext";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const links = [
  { name: "Feed", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Hot", href: "/hot" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const isClient = useIsClient();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [buttonRect, setButtonRect] = useState<DOMRect | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const { unreadCount } = useWebSocket();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        buttonRef.current !== target &&
        !buttonRef.current?.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "YO";

  const dropdownPortal = dropdownOpen && (
    createPortal(
      <div
        ref={dropdownRef}
        className="fixed z-[100] w-64 overflow-hidden rounded-2xl bg-card shadow-2xl ring-1 ring-border animate-in fade-in slide-in-from-top-2 duration-150"
        style={{
          top: (buttonRect?.bottom ?? 0) + 4,
          right: (typeof window !== 'undefined' ? window.innerWidth : 0) - (buttonRect?.right ?? 0),
        }}
      >
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" className="h-full w-full rounded-full object-cover" />
            ) : (
              avatarText
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{user?.displayName}</p>
            <p className="truncate text-xs text-muted">@{user?.username}</p>
          </div>
        </div>

        <div className="py-1">
          <Link
            href="/profile"
            onClick={() => setDropdownOpen(false)}
            className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface"
          >
            <User size={18} className="text-muted" />
            <span className="flex-1">View Profile</span>
            <ChevronRight size={14} className="text-muted" />
          </Link>
          <Link
            href="/settings"
            onClick={() => setDropdownOpen(false)}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-surface"
          >
            <Settings size={18} className="text-muted" />
            <span>Settings</span>
          </Link>
        </div>

        <div className="border-t border-border py-1">
          <button
            onClick={() => {
              setDropdownOpen(false);
              setShowLogoutConfirm(true);
            }}
            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors hover:bg-red-500/5"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>,
      document.body
    )
  );

  return (
    <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-black tracking-tight">
          <span className="gradient-text">lambrk</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-surface p-1 md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/search"
            className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <Search size={20} />
          </Link>

          {isClient && isAuthenticated ? (
            <>
              <Link
                href="/notifications"
                className="relative flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white tabular-nums">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/compose"
                className="flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-80"
              >
                <PenLine size={18} />
                <span className="hidden md:inline">Create</span>
              </Link>

              <button
                ref={buttonRef}
                onClick={() => {
                  if (buttonRef.current) {
                    setButtonRect(buttonRef.current.getBoundingClientRect());
                  }
                  setDropdownOpen(!dropdownOpen);
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white transition-transform hover:scale-105"
              >
                {avatarText}
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-foreground"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-80"
              >
                <User size={18} />
                <span className="hidden md:inline">Join</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {dropdownPortal}

      {showLogoutConfirm && (
        createPortal(
          <>
            <div
              className="fixed inset-0 z-[200] bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
              onClick={() => setShowLogoutConfirm(false)}
            />
            <div className="fixed inset-x-4 top-1/2 z-[200] mx-auto max-w-sm -translate-y-1/2 rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-border animate-in zoom-in-95 fade-in duration-200">
              <h2 className="text-lg font-bold">Sign Out</h2>
              <p className="mt-2 text-sm text-muted">
                Are you sure you want to sign out of your account?
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 rounded-full bg-surface px-4 py-2.5 text-sm font-bold transition-colors hover:bg-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowLogoutConfirm(false);
                    logout();
                  }}
                  className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
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
