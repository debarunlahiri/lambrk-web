"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUnreadNotificationCount,
  type NotificationResponse,
} from "@/lib/api";

export type WsNotification = NotificationResponse;

interface WebSocketContextValue {
  isConnected: boolean;
  unreadCount: number;
  notifications: WsNotification[];
  refreshUnreadCount: () => Promise<void>;
  subscribeToPost: (postId: number) => void;
  unsubscribeFromPost: (postId: number) => void;
}

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

export function useWebSocket() {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error("useWebSocket must be used within WebSocketProvider");
  return ctx;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:9500/ws";

function normalizeNotification(data: unknown): WsNotification {
  if (typeof data === "object" && data !== null) {
    const raw = data as Partial<NotificationResponse> & { body?: string };
    return {
      id: raw.id ?? `ws-${Date.now()}`,
      type: raw.type ?? "SYSTEM_ANNOUNCEMENT",
      recipientId: raw.recipientId ?? "",
      title: raw.title ?? "New notification",
      message: raw.message ?? raw.body ?? "New notification",
      relatedPostId: raw.relatedPostId ?? null,
      relatedPostTitle: raw.relatedPostTitle ?? null,
      relatedCommentId: raw.relatedCommentId ?? null,
      relatedCommentPreview: raw.relatedCommentPreview ?? null,
      relatedUserId: raw.relatedUserId ?? null,
      relatedUsername: raw.relatedUsername ?? null,
      actionUrl: raw.actionUrl ?? null,
      actionText: raw.actionText ?? null,
      isRead: raw.isRead ?? false,
      createdAt: raw.createdAt ?? new Date().toISOString(),
      readAt: raw.readAt ?? null,
    };
  }

  return {
    id: `ws-${Date.now()}`,
    type: "SYSTEM_ANNOUNCEMENT",
    recipientId: "",
    title: "New notification",
    message: String(data || "New notification"),
    relatedPostId: null,
    relatedPostTitle: null,
    relatedCommentId: null,
    relatedCommentPreview: null,
    relatedUserId: null,
    relatedUsername: null,
    actionUrl: null,
    actionText: null,
    isRead: false,
    createdAt: new Date().toISOString(),
    readAt: null,
  };
}

export default function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);

  const refreshUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      // The live unread-count queue remains the fallback when the REST count is unavailable.
    }
  }, [isAuthenticated]);

  const subscribeToPost = useCallback((postId: number) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({
      destination: `/app/subscribe/posts/${postId}`,
      body: String(postId),
    });
  }, []);

  const unsubscribeFromPost = useCallback((postId: number) => {
    const client = clientRef.current;
    if (!client) return;
    client.unsubscribe(`/user/queue/post/${postId}/subscribed`);
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    queueMicrotask(() => {
      void refreshUnreadCount();
    });
  }, [isAuthenticated, refreshUnreadCount]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const token = typeof window !== "undefined"
      ? localStorage.getItem("lambrk_access_token")
      : null;

    if (!token) return;

    const client = new Client({
      brokerURL: WS_URL,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 30000,
      heartbeatOutgoing: 30000,
    });

    client.onConnect = () => {
      setIsConnected(true);

      // Confirm connection
      client.publish({ destination: "/app/connect" });

      // Subscribe to connected queue
      client.subscribe("/user/queue/connected", (msg) => {
        console.log("[WS] Connected:", msg.body);
      });

      // Subscribe to notifications
      client.publish({ destination: "/app/subscribe/notifications" });

      client.subscribe("/user/queue/notifications", (msg) => {
        try {
          const data = JSON.parse(msg.body);
          if (Array.isArray(data)) {
            const normalized = data.map(normalizeNotification);
            setNotifications(normalized);
            setUnreadCount(normalized.filter((item) => !item.isRead).length);
          } else {
            const normalized = normalizeNotification(data);
            setNotifications((prev) => [normalized, ...prev]);
            if (!normalized.isRead) setUnreadCount((count) => count + 1);
          }
        } catch {
          const normalized = normalizeNotification(msg.body);
          setNotifications((prev) => [normalized, ...prev]);
          setUnreadCount((count) => count + 1);
        }
      });

      // Unread count
      client.subscribe("/user/queue/notifications/unread-count", (msg) => {
        const count = parseInt(msg.body, 10);
        if (!isNaN(count)) {
          setUnreadCount(count);
        }
      });

      // Karma updates
      client.subscribe("/user/queue/karma", (msg) => {
        console.log("[WS] Karma update:", msg.body);
      });

      // Vote updates
      client.subscribe("/user/queue/votes", (msg) => {
        console.log("[WS] Vote update:", msg.body);
      });
    };

    client.onDisconnect = () => {
      setIsConnected(false);
    };

    client.onStompError = (frame) => {
      console.error("[WS] STOMP error:", frame.headers["message"], frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
    };
  }, [isAuthenticated, user]);

  // Clear state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queueMicrotask(() => {
        setNotifications([]);
        setUnreadCount(0);
      });
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      isConnected,
      unreadCount,
      notifications,
      refreshUnreadCount,
      subscribeToPost,
      unsubscribeFromPost,
    }),
    [isConnected, unreadCount, notifications, refreshUnreadCount, subscribeToPost, unsubscribeFromPost]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
