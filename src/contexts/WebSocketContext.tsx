"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/contexts/AuthContext";

export interface WsNotification {
  id?: number;
  type?: string;
  message?: string;
  body?: string;
  createdAt?: string;
  isRead?: boolean;
}

interface WebSocketContextValue {
  isConnected: boolean;
  unreadCount: number;
  notifications: WsNotification[];
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

export default function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);

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
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
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
            setNotifications(data);
          } else {
            setNotifications((prev) => [data, ...prev]);
          }
        } catch {
          // plain text notification
          setNotifications((prev) => [
            { message: msg.body, createdAt: new Date().toISOString() },
            ...prev,
          ]);
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
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        unreadCount,
        notifications,
        subscribeToPost,
        unsubscribeFromPost,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
