"use client";

import { usePathname } from "next/navigation";
import AuthProvider from "@/contexts/AuthContext";
import WebSocketProvider from "@/contexts/WebSocketContext";
import { ToastProvider } from "@/contexts/ToastContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const isLoopMix = pathname === "/loopmix";

  return (
    <AuthProvider>
      <WebSocketProvider>
        <ToastProvider>
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
