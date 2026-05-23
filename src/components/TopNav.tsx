"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Search, PenLine, LogOut, User } from "lucide-react";

const links = [
  { name: "Feed", href: "/" },
  { name: "Explore", href: "/explore" },
  { name: "Hot", href: "/hot" },
];

export default function TopNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "YO";

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
          <button className="flex h-10 w-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground">
            <Search size={20} />
          </button>

          {isAuthenticated ? (
            <>
              <Link
                href="/compose"
                className="flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-bold text-background transition-opacity hover:opacity-80"
              >
                <PenLine size={18} />
                <span className="hidden md:inline">Create</span>
              </Link>
              <Link
                href="/profile"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white"
                title={user?.displayName}
              >
                {avatarText}
              </Link>
              <button
                onClick={logout}
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
                title="Log out"
              >
                <LogOut size={18} />
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
    </header>
  );
}
