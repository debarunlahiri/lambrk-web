"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import AuthProvider from "@/contexts/AuthContext";
import { useAuth } from "@/contexts/AuthContext";
import WebSocketProvider from "@/contexts/WebSocketContext";
import { ToastProvider } from "@/contexts/ToastContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

const protectedRoutes = [
  "/bookmarks",
  "/compose",
  "/create-community",
  "/files",
  "/messages",
  "/notifications",
  "/profile",
  "/settings",
];

function AuthRouteHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading || isAuthenticated) return;

    router.refresh();
    if (protectedRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
      router.replace("/");
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  useEffect(() => {
    function handleLogout() {
      router.refresh();
    }

    window.addEventListener("lambrk:logout", handleLogout);
    return () => window.removeEventListener("lambrk:logout", handleLogout);
  }, [router]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLoopMix = pathname === "/loopmix";

  return (
    <AuthProvider>
      <WebSocketProvider>
        <ToastProvider>
          <AuthRouteHandler />

          {/* Sidebar on desktop */}
          <Sidebar />

          {/* Top nav — hidden on mobile loopmix via CSS */}
          <TopNav />

          {/* Main content — shifts right on desktop for sidebar */}
          <main className={`flex-1 ${isAuthPage ? "" : "md:ml-[72px] lg:ml-64"}`}>
            <div className={`mx-auto w-full max-w-3xl ${isLoopMix ? "" : "px-4 pb-24 pt-4 md:pt-6"}`}>
              {children}
            </div>
          </main>

          <BottomNav />
        </ToastProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
