"use client";

import { Bell, Loader2, MessageCircle, ThumbsUp, UserPlus, Hash } from "lucide-react";
import { useWebSocket, type WsNotification } from "@/contexts/WebSocketContext";

function getNotificationIcon(type?: string) {
  switch (type?.toLowerCase()) {
    case "comment":
    case "reply":
      return <MessageCircle size={18} className="text-accent" />;
    case "like":
    case "vote":
      return <ThumbsUp size={18} className="text-accent-2" />;
    case "follow":
      return <UserPlus size={18} className="text-green-500" />;
    default:
      return <Bell size={18} className="text-muted" />;
  }
}

function formatNotificationTime(dateStr?: string) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function NotificationCard({ notif }: { notif: WsNotification }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
        {getNotificationIcon(notif.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm truncate">
          {notif.message || notif.body || "New notification"}
        </p>
        <p className="text-xs text-muted">
          {formatNotificationTime(notif.createdAt)}
        </p>
      </div>
      {notif.isRead === false && (
        <div className="h-2 w-2 rounded-full bg-accent shrink-0" />
      )}
    </div>
  );
}

export default function NotificationsPage() {
  const { isConnected, notifications } = useWebSocket();

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">
          <span className="gradient-text">Notifications</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isConnected
            ? "Real-time updates are active"
            : "Connecting to real-time updates..."}
        </p>
      </div>

      {!isConnected && (
        <div className="flex items-center justify-center rounded-3xl bg-card py-6 text-muted ring-1 ring-border">
          <Loader2 size={20} className="animate-spin mr-2" />
          <span className="text-sm">Connecting...</span>
        </div>
      )}

      {isConnected && notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
          <Bell size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-bold">All caught up</p>
          <p className="text-sm">No new notifications</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((notif, i) => (
            <NotificationCard key={notif.id || i} notif={notif} />
          ))}
        </div>
      )}
    </div>
  );
}
