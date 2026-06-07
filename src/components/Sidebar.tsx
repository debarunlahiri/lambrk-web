"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import {
  Home,
  Bell,
  User,
  MessageCircle,
  LogIn,
  PenLine,
  TrendingUp,
  Bookmark,
} from "lucide-react";
import LoopMixIcon from "./LoopMixIcon";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  authOnly?: boolean;
  guestOnly?: boolean;
  badge?: number;
}

const HIDDEN_PATHS = ["/login", "/register"];

export default function Sidebar() {
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();
  const { unreadCount, unreadMessageCount } = useWebSocket();

  // Hide sidebar on auth pages
  if (HIDDEN_PATHS.includes(pathname)) return null;

  const items: NavItem[] = [
    { name: "Home", href: "/", icon: Home },
    { name: "LoopMix", href: "/loopmix", icon: LoopMixIcon },
    { name: "Hot", href: "/hot", icon: TrendingUp, guestOnly: true },
    { name: "Bookmarks", href: "/bookmarks", icon: Bookmark, authOnly: true },
    { name: "Notifications", href: "/notifications", icon: Bell, authOnly: true, badge: unreadCount },
    { name: "Messages", href: "/messages", icon: MessageCircle, authOnly: true, badge: unreadMessageCount },
    { name: "Profile", href: "/profile", icon: User, authOnly: true },
    { name: "Sign In", href: "/login", icon: LogIn, guestOnly: true },
  ];

  const visibleItems = items.filter((item) => {
    if (item.authOnly && !isAuthenticated) return false;
    if (item.guestOnly && isAuthenticated) return false;
    return true;
  });

  return (
    <aside className="hidden md:flex fixed left-0 top-0 bottom-0 z-40 w-[72px] lg:w-64 flex-col border-r border-white/10 bg-black/80 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center lg:justify-start lg:px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/lambrk.png" alt="Lambrk" className="h-8 w-8 rounded-lg" />
          <span className="hidden lg:block text-xl font-black tracking-tight text-white">
            Lambrk
          </span>
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col gap-1 p-3 overflow-y-auto scrollbar-hide">
        {visibleItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 rounded-2xl px-3 py-3 transition-all ${
                isActive
                  ? "bg-white/10 text-white font-bold"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <div className="relative flex h-7 w-7 items-center justify-center shrink-0">
                <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-black leading-none text-white ring-2 ring-black">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>
              <span className="hidden lg:block text-[15px]">{item.name}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="ml-auto hidden text-sm tabular-nums text-white/50 lg:block">
                  {item.badge > 99 ? "99+" : item.badge} new
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Create button at bottom */}
      <div className="p-3">
        <Link
          href="/compose"
          className="flex h-12 w-12 lg:w-full items-center justify-center rounded-full lg:rounded-2xl transition-all active:scale-95 bg-white text-black hover:bg-white/90"
        >
          <PenLine size={20} strokeWidth={2.5} className="lg:hidden" />
          <span className="hidden lg:flex items-center gap-2 text-sm font-bold">
            <PenLine size={18} strokeWidth={2.5} />
            Create Post
          </span>
        </Link>
      </div>
    </aside>
  );
}
