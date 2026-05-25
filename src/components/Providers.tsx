"use client";

import AuthProvider from "@/contexts/AuthContext";
import WebSocketProvider from "@/contexts/WebSocketContext";
import TopNav from "@/components/TopNav";
import BottomNav from "@/components/BottomNav";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <WebSocketProvider>
        <TopNav />
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-4 md:pt-6">
          {children}
        </main>
        <BottomNav />
      </WebSocketProvider>
    </AuthProvider>
  );
}
