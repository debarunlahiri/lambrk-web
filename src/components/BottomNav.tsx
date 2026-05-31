"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { Home, Search, Flame, User, LogIn, Bell, PenLine } from "lucide-react";

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

interface NavItem {
  name: string;
  href: string;
  icon: typeof Home;
  badge?: number;
}

export default function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useWebSocket();
  const isClient = useIsClient();

  if (!isClient) return null;

  // Build nav items based on auth state
  const leftItems: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/search", icon: Search },
  ];

  const rightItems: NavItem[] = isAuthenticated
    ? [
        { name: "Alerts", href: "/notifications", icon: Bell, badge: unreadCount },
        { name: "Profile", href: "/profile", icon: User },
      ]
    : [
        { name: "Hot", href: "/hot", icon: Flame },
        { name: "Sign In", href: "/login", icon: LogIn },
      ];

  const isCreatePage = pathname === "/compose";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Background bar */}
      <div className="border-t border-border/60 bg-background/90 backdrop-blur-2xl pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2">
          {/* Left items */}
          {leftItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 min-w-[4rem] transition-all ${
                  isActive
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[10px] font-medium ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Center Create button */}
          <div className="relative -mt-6 flex flex-col items-center">
            <Link
              href="/compose"
              className={`flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all active:scale-90 ${
                isCreatePage
                  ? "bg-accent text-white shadow-accent/30"
                  : "bg-gradient-to-br from-accent to-accent-2 text-white shadow-accent/25 hover:shadow-accent/40 hover:scale-105"
              }`}
            >
              <PenLine size={24} strokeWidth={2.5} />
            </Link>
            <span className={`mt-1 text-[10px] font-medium ${isCreatePage ? "text-accent opacity-100" : "text-muted opacity-70"}`}>
              Create
            </span>
          </div>

          {/* Right items */}
          {rightItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1.5 min-w-[4rem] transition-all ${
                  isActive
                    ? "text-accent"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -right-1.5 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isActive ? "opacity-100" : "opacity-70"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
