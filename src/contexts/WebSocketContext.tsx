"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";
import { Client } from "@stomp/stompjs";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUnreadNotificationCount,
  type NotificationResponse,
  type ChatMessageResponse,
} from "@/lib/api";

export type WsNotification = NotificationResponse;

// ─── Chat WebSocket payload ───
export type WsChatEventType =
  | "MESSAGE_SENT"
  | "READ_RECEIPT"
  | "TYPING"
  | "MESSAGE_DELETED";

export interface WsChatPayload {
  eventType: WsChatEventType;
  message: ChatMessageResponse | null;
  messageId: string | null;
  conversationId: string | null;
  actorUsername: string | null;
  timestamp: string;
}

// ─── Typing indicators ───
export interface TypingIndicator {
  conversationId: string;
  actorUsername: string;
  timestamp: number;
}

interface WebSocketContextValue {
  isConnected: boolean;
  unreadCount: number;
  notifications: WsNotification[];
  refreshUnreadCount: () => Promise<void>;
  subscribeToPost: (postId: number) => void;
  unsubscribeFromPost: (postId: number) => void;
  // Chat
  chatMessages: WsChatPayload[];          // raw ws chat events (last 200)
  typingIndicators: TypingIndicator[];    // currently-active typing
  unreadMessageCount: number;
  setUnreadMessageCount: Dispatch<SetStateAction<number>>;
  setActiveChatConversationId: (conversationId: string | null) => void;
  subscribeToConversation: (conversationId: string) => void;
  unsubscribeFromConversation: (conversationId: string) => void;
  sendChatMessage: (payload: {
    recipientUsername: string;
    content: string;
    messageType?: string;
  }) => void;
  sendReadReceipt: (messageId: string) => void;
  sendTyping: (conversationId: string) => void;
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

// Keep only the last N chat events to avoid unbounded growth
const MAX_CHAT_EVENTS = 200;
// Typing indicator TTL in ms
const TYPING_TTL = 4000;

export default function WebSocketProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<WsNotification[]>([]);
  const [chatMessages, setChatMessages] = useState<WsChatPayload[]>([]);
  const [typingIndicators, setTypingIndicators] = useState<TypingIndicator[]>([]);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const activeChatConversationIdRef = useRef<string | null>(null);

  // Track subscribed conversation typing topics
  const typingSubsRef = useRef<Map<string, { unsubscribe: () => void }>>(new Map());

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

  // ─── Chat helpers ───

  const subscribeToConversation = useCallback((conversationId: string) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    if (typingSubsRef.current.has(conversationId)) return;

    const sub = client.subscribe(
      `/topic/chat/typing/${conversationId}`,
      (msg) => {
        try {
          const payload: WsChatPayload = JSON.parse(msg.body);
          if (payload.eventType === "TYPING" && payload.actorUsername) {
            setTypingIndicators((prev) => {
              const filtered = prev.filter(
                (t) => t.conversationId !== conversationId || t.actorUsername !== payload.actorUsername
              );
              return [
                ...filtered,
                {
                  conversationId,
                  actorUsername: payload.actorUsername!,
                  timestamp: Date.now(),
                },
              ];
            });
            // Auto-clear after TTL
            setTimeout(() => {
              setTypingIndicators((prev) =>
                prev.filter(
                  (t) =>
                    !(
                      t.conversationId === conversationId &&
                      t.actorUsername === payload.actorUsername &&
                      Date.now() - t.timestamp >= TYPING_TTL
                    )
                )
              );
            }, TYPING_TTL);
          }
        } catch {
          // ignore
        }
      }
    );

    typingSubsRef.current.set(conversationId, sub);
  }, []);

  const unsubscribeFromConversation = useCallback((conversationId: string) => {
    const sub = typingSubsRef.current.get(conversationId);
    if (sub) {
      sub.unsubscribe();
      typingSubsRef.current.delete(conversationId);
    }
  }, []);

  const setActiveChatConversationId = useCallback((conversationId: string | null) => {
    activeChatConversationIdRef.current = conversationId;
  }, []);

  const sendChatMessage = useCallback(
    (payload: { recipientUsername: string; content: string; messageType?: string }) => {
      const client = clientRef.current;
      if (!client || !client.connected) return;
      client.publish({
        destination: "/app/chat.send",
        body: JSON.stringify({
          recipientUsername: payload.recipientUsername,
          content: payload.content,
          messageType: payload.messageType ?? "TEXT",
        }),
      });
    },
    []
  );

  const sendReadReceipt = useCallback((messageId: string) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({ destination: "/app/chat.read", body: messageId });
  }, []);

  const sendTyping = useCallback((conversationId: string) => {
    const client = clientRef.current;
    if (!client || !client.connected) return;
    client.publish({ destination: "/app/chat.typing", body: conversationId });
  }, []);

  // ─── Initial counts ───

  useEffect(() => {
    if (!isAuthenticated) return;
    queueMicrotask(() => {
      void refreshUnreadCount();
    });
  }, [isAuthenticated, refreshUnreadCount]);

  // ─── STOMP connection ───

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

      // Unread count for notifications
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

      // ─── Chat messages queue ───
      client.subscribe("/user/queue/messages", (msg) => {
        try {
          const payload: WsChatPayload = JSON.parse(msg.body);
          setChatMessages((prev) => {
            const next = [payload, ...prev];
            return next.length > MAX_CHAT_EVENTS ? next.slice(0, MAX_CHAT_EVENTS) : next;
          });

          if (payload.eventType === "MESSAGE_SENT" && payload.message) {
            setTypingIndicators((prev) =>
              prev.filter(
                (t) =>
                  t.conversationId !== payload.conversationId ||
                  t.actorUsername !== payload.message?.senderUsername
              )
            );
          }

          // Increment unread badge for incoming messages (not from self)
          if (
            payload.eventType === "MESSAGE_SENT" &&
            payload.message &&
            payload.actorUsername !== user.username &&
            (
              payload.conversationId !== activeChatConversationIdRef.current ||
              (typeof document !== "undefined" && document.visibilityState !== "visible")
            )
          ) {
            setUnreadMessageCount((n) => n + 1);
          }
        } catch {
          // ignore malformed frames
        }
      });

      // Chat error queue
      client.subscribe("/user/queue/errors", (msg) => {
        console.error("[WS] Chat error:", msg.body);
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
    const typingSubs = typingSubsRef.current;

    return () => {
      client.deactivate();
      clientRef.current = null;
      setIsConnected(false);
      typingSubs.clear();
    };
  }, [isAuthenticated, user]);

  // Clear state on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queueMicrotask(() => {
        setNotifications([]);
        setUnreadCount(0);
        setChatMessages([]);
        setTypingIndicators([]);
        setUnreadMessageCount(0);
        activeChatConversationIdRef.current = null;
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
      chatMessages,
      typingIndicators,
      unreadMessageCount,
      setUnreadMessageCount,
      setActiveChatConversationId,
      subscribeToConversation,
      unsubscribeFromConversation,
      sendChatMessage,
      sendReadReceipt,
      sendTyping,
    }),
    [
      isConnected,
      unreadCount,
      notifications,
      refreshUnreadCount,
      subscribeToPost,
      unsubscribeFromPost,
      chatMessages,
      typingIndicators,
      unreadMessageCount,
      setActiveChatConversationId,
      subscribeToConversation,
      unsubscribeFromConversation,
      sendChatMessage,
      sendReadReceipt,
      sendTyping,
    ]
  );

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}
