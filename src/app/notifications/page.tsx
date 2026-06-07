"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Bell,
  CheckCheck,
  Filter,
  Hash,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldAlert,
  ThumbsUp,
  Trash2,
  UserPlus,
  X,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import {
  deleteAllNotifications,
  deleteNotification,
  listNotifications,
  listNotificationsByType,
  listUnreadNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type NotificationResponse,
  type NotificationType,
} from "@/lib/api";
import LoginRequiredDialog from "@/components/LoginRequiredDialog";

type NotificationFilter = "all" | "unread" | NotificationType;

const filters: { key: NotificationFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "COMMENT_REPLY", label: "Replies" },
  { key: "POST_LIKE", label: "Likes" },
  { key: "USER_FOLLOW", label: "Follows" },
  { key: "FRIEND_REQUEST", label: "Friends" },
  { key: "SYSTEM_ANNOUNCEMENT", label: "System" },
];

function getNotificationIcon(type?: string) {
  switch (type) {
    case "COMMENT_REPLY":
    case "COMMENT_MENTION":
    case "POST_MENTION":
      return <MessageCircle size={18} className="text-accent" />;
    case "POST_LIKE":
    case "COMMENT_LIKE":
      return <ThumbsUp size={18} className="text-accent-2" />;
    case "USER_FOLLOW":
    case "FRIEND_REQUEST":
    case "FRIEND_REQUEST_ACCEPTED":
      return <UserPlus size={18} className="text-green-500" />;
    case "COMMUNITY_INVITE":
      return <Hash size={18} className="text-accent" />;
    case "MODERATOR_ACTION":
    case "CONTENT_MODERATION":
      return <ShieldAlert size={18} className="text-orange-500" />;
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

function normalizeActionUrl(url: string | null) {
  if (!url) return null;
  return url
    .replace(/^\/posts\//, "/post/")
    .replace(/^\/users\//, "/user/");
}

function NotificationCard({
  notif,
  busy,
  onRead,
  onDelete,
}: {
  notif: NotificationResponse;
  busy: boolean;
  onRead: (notification: NotificationResponse) => void;
  onDelete: (notification: NotificationResponse) => void;
}) {
  const actionUrl = normalizeActionUrl(notif.actionUrl);
  const title = notif.title || "New notification";
  const preview =
    notif.relatedCommentPreview || notif.relatedPostTitle || notif.relatedUsername;

  const content = (
    <>
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface">
        {getNotificationIcon(notif.type)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-bold">{title}</p>
          {!notif.isRead && <span className="h-2 w-2 rounded-full bg-accent" />}
        </div>
        <p className="mt-0.5 line-clamp-2 text-sm text-muted">
          {notif.message || preview || "Open notification details"}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
          <span>{formatNotificationTime(notif.createdAt)}</span>
          <span>{notif.type.replaceAll("_", " ").toLowerCase()}</span>
          {notif.actionText && <span>{notif.actionText}</span>}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border transition-all hover:shadow-md ${
        notif.isRead ? "" : "ring-accent/20"
      }`}
    >
      {actionUrl ? (
        <Link href={actionUrl} className="flex min-w-0 flex-1 items-start gap-3">
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-start gap-3">{content}</div>
      )}
      <div className="flex shrink-0 items-center gap-1">
        {!notif.isRead && (
          <button
            onClick={() => onRead(notif)}
            disabled={busy}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
            title="Mark read"
          >
            <CheckCheck size={16} />
          </button>
        )}
        <button
          onClick={() => onDelete(notif)}
          disabled={busy}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
          title="Delete"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { isAuthenticated } = useAuth();
  const {
    isConnected,
    notifications: liveNotifications,
    refreshUnreadCount,
  } = useWebSocket();
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [items, setItems] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  const unreadCount = useMemo(
    () => items.filter((item) => !item.isRead).length,
    [items]
  );

  const loadNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const page =
        filter === "all"
          ? await listNotifications()
          : filter === "unread"
            ? await listUnreadNotifications()
            : await listNotificationsByType(filter);
      const now = new Date().toISOString();
      const hasUnread = page.content.some((item) => !item.isRead);
      setItems(
        page.content.map((item) =>
          item.isRead ? item : { ...item, isRead: true, readAt: item.readAt ?? now }
        )
      );
      if (hasUnread) {
        await markAllNotificationsRead();
        await refreshUnreadCount();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load notifications");
    } finally {
      setLoading(false);
    }
  }, [filter, isAuthenticated, refreshUnreadCount]);

  useEffect(() => {
    queueMicrotask(() => {
      void loadNotifications();
    });
  }, [loadNotifications]);

  useEffect(() => {
    if (filter !== "all" && filter !== "unread") return;
    queueMicrotask(() => {
      setItems((current) => {
        const byId = new Map(current.map((item) => [item.id, item]));
        for (const item of liveNotifications) {
          if (item.id) byId.set(item.id, item);
        }
        const next = Array.from(byId.values());
        if (filter === "unread") return next.filter((item) => !item.isRead);
        return next.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
    });
  }, [filter, liveNotifications]);

  const requireAuth = () => {
    if (isAuthenticated) return true;
    setLoginOpen(true);
    return false;
  };

  const withBusyId = async (id: string, action: () => Promise<void>) => {
    setBusyIds((current) => new Set(current).add(id));
    try {
      await action();
    } finally {
      setBusyIds((current) => {
        const next = new Set(current);
        next.delete(id);
        return next;
      });
    }
  };

  const handleRead = (notification: NotificationResponse) => {
    if (!requireAuth() || notification.isRead) return;
    const previous = items;
    setItems((current) =>
      current.map((item) =>
        item.id === notification.id
          ? { ...item, isRead: true, readAt: new Date().toISOString() }
          : item
      )
    );
    void withBusyId(notification.id, async () => {
      try {
        await markNotificationRead(notification.id);
        await refreshUnreadCount();
      } catch (err) {
        setItems(previous);
        setError(err instanceof Error ? err.message : "Failed to mark notification read");
      }
    });
  };

  const handleDelete = (notification: NotificationResponse) => {
    if (!requireAuth()) return;
    const previous = items;
    setItems((current) => current.filter((item) => item.id !== notification.id));
    void withBusyId(notification.id, async () => {
      try {
        await deleteNotification(notification.id);
        await refreshUnreadCount();
      } catch (err) {
        setItems(previous);
        setError(err instanceof Error ? err.message : "Failed to delete notification");
      }
    });
  };

  const handleMarkAllRead = async () => {
    if (!requireAuth() || unreadCount === 0 || bulkBusy) return;
    const previous = items;
    setBulkBusy(true);
    setItems((current) =>
      current.map((item) => ({ ...item, isRead: true, readAt: item.readAt ?? new Date().toISOString() }))
    );
    try {
      await markAllNotificationsRead();
      await refreshUnreadCount();
    } catch (err: unknown) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Failed to mark all read");
    } finally {
      setBulkBusy(false);
    }
  };

  const handleClearAll = async () => {
    if (!requireAuth() || items.length === 0 || bulkBusy) return;
    const previous = items;
    setBulkBusy(true);
    setItems([]);
    try {
      await deleteAllNotifications();
      await refreshUnreadCount();
    } catch (err: unknown) {
      setItems(previous);
      setError(err instanceof Error ? err.message : "Failed to clear notifications");
    } finally {
      setBulkBusy(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="gradient-text">Notifications</span>
          </h1>
          <p className="mt-1 text-sm text-muted">Log in to see your notification inbox</p>
        </div>
        <div className="flex flex-col items-center justify-center gap-3 rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
          <Bell size={48} className="opacity-30" />
          <p className="text-lg font-bold text-foreground">Login required</p>
          <button
            onClick={() => setLoginOpen(true)}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm font-bold text-background transition-all hover:opacity-80"
          >
            Log in
          </button>
        </div>
        <LoginRequiredDialog
          open={loginOpen}
          onClose={() => setLoginOpen(false)}
          action="view notifications"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">
            <span className="gradient-text">Notifications</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {isConnected ? "Real-time updates are active" : "Showing saved notifications"}
            {unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={loadNotifications}
            disabled={loading || bulkBusy}
            className="flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-bold ring-1 ring-border transition-all hover:bg-border disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || bulkBusy}
            className="flex h-10 items-center gap-2 rounded-full bg-surface px-4 text-sm font-bold ring-1 ring-border transition-all hover:bg-border disabled:opacity-50"
          >
            <CheckCheck size={16} />
            Mark read
          </button>
          <button
            onClick={handleClearAll}
            disabled={items.length === 0 || bulkBusy}
            className="flex h-10 items-center gap-2 rounded-full bg-red-500/10 px-4 text-sm font-bold text-red-500 transition-all hover:bg-red-500/15 disabled:opacity-50"
          >
            <Trash2 size={16} />
            Clear
          </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((item) => {
          const active = filter === item.key;
          return (
            <button
              key={item.key}
              onClick={() => setFilter(item.key)}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-all ${
                active
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted ring-1 ring-border hover:text-foreground"
              }`}
            >
              {item.key === "all" && <Filter size={14} />}
              {item.label}
            </button>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <span>{error}</span>
          <button onClick={() => setError("")} className="font-bold">
            Dismiss
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <Loader2 size={24} className="mr-2 animate-spin" />
          <span className="text-sm">Loading notifications...</span>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
          <Bell size={48} className="mb-4 opacity-30" />
          <p className="text-lg font-bold text-foreground">All caught up</p>
          <p className="text-sm">No notifications in this view</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((notif) => (
            <NotificationCard
              key={notif.id}
              notif={notif}
              busy={busyIds.has(notif.id)}
              onRead={handleRead}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
