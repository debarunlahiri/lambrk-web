"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Home, Search, Flame, User, LogIn } from "lucide-react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

const navItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "Search", href: "/search", icon: Search },
  { name: "Hot", href: "/hot", icon: Flame },
  { name: "Profile", href: "/profile", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const isClient = useIsClient();

  return (
    <nav className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-1 rounded-full bg-card/80 px-2 py-2 shadow-xl shadow-black/5 backdrop-blur-xl ring-1 ring-border md:hidden">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-all ${
              isActive
                ? "bg-foreground text-background shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
          </Link>
        );
      })}
      {isClient && !isAuthenticated && (
        <Link
          href="/login"
          className="flex h-11 w-11 items-center justify-center rounded-full text-muted transition-all hover:text-foreground"
        >
          <LogIn size={20} />
        </Link>
      )}
    </nav>
  );
}
