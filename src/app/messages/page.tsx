"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  Suspense,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWebSocket } from "@/contexts/WebSocketContext";
import {
  getConversations,
  getMessages,
  openConversation,
  deleteMessage,
  getUnreadMessageCount,
  type ConversationResponse,
  type ChatMessageResponse,
} from "@/lib/api";
import {
  MessageCircle,
  Search,
  Send,
  Trash2,
  Check,
  CheckCheck,
  MoreVertical,
  ChevronLeft,
  X,
} from "lucide-react";

// ─── helpers ───

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();

  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  const dayDiff = Math.floor(diff / 86_400_000);
  if (dayDiff === 1) return "Yesterday";
  if (dayDiff < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getInitials(name: string) {
  return name
    .split(/[\s._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

// ─── Avatar ───

function Avatar({ username, avatarUrl, size = "md" }: { username: string; avatarUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const sz = size === "sm" ? "h-8 w-8 text-[10px]" : size === "lg" ? "h-12 w-12 text-sm" : "h-10 w-10 text-xs";
  return (
    <div className={`${sz} relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 font-bold text-white shadow-sm ring-2 ring-background`}>
      {avatarUrl ? (
        <img src={avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
      ) : (
        getInitials(username)
      )}
    </div>
  );
}

// ─── Conversation item ───

function ConversationItem({
  conv,
  isActive,
  onClick,
}: {
  conv: ConversationResponse;
  isActive: boolean;
  onClick: () => void;
}) {
  const isOwn = conv.lastMessageSenderId !== null && conv.lastMessage !== null
    ? conv.lastMessageSenderId === conv.otherParticipantId
      ? false
      : true
    : false;

  return (
    <button
      id={`conv-${conv.conversationId}`}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all ${
        isActive
          ? "bg-accent/15 ring-1 ring-accent/30"
          : "hover:bg-white/5"
      }`}
    >
      <div className="relative">
        <Avatar username={conv.otherParticipantUsername} />
        {conv.unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[9px] font-black text-white ring-2 ring-black">
            {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-1">
          <p className={`truncate text-sm font-semibold ${isActive ? "text-white" : "text-white/90"}`}>
            {conv.otherParticipantUsername}
          </p>
          {conv.lastMessageAt && (
            <span className="shrink-0 text-[10px] text-white/40">
              {formatTime(conv.lastMessageAt)}
            </span>
          )}
        </div>
        {conv.lastMessage && (
          <p className={`truncate text-xs ${conv.unreadCount > 0 ? "font-semibold text-white/80" : "text-white/40"}`}>
            {!isOwn && conv.lastMessage}
            {isOwn && `You: ${conv.lastMessage}`}
          </p>
        )}
        {!conv.lastMessage && (
          <p className="text-xs text-white/25 italic">No messages yet</p>
        )}
      </div>
    </button>
  );
}

// ─── Message bubble ───

function MessageBubble({
  msg,
  isOwn,
  showAvatar,
  onDelete,
}: {
  msg: ChatMessageResponse;
  isOwn: boolean;
  showAvatar: boolean;
  onDelete?: (id: string) => void;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  if (msg.isDeleted) {
    return (
      <div className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
        <span className="rounded-2xl bg-white/5 px-4 py-2 text-xs italic text-white/30 ring-1 ring-white/10">
          Message deleted
        </span>
      </div>
    );
  }

  return (
    <div className={`group flex items-start gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
      {/* Avatar spacer / avatar */}
      <div className="h-8 w-8 shrink-0">
        {!isOwn && showAvatar && (
          <Avatar username={msg.senderUsername} avatarUrl={msg.senderAvatarUrl} size="sm" />
        )}
      </div>

      {/* Bubble */}
      <div className={`relative max-w-[72%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-1`}>
        <div
          className={`relative rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isOwn
              ? "rounded-tr-sm bg-accent text-white"
              : "rounded-tl-sm bg-white/10 text-white/90"
          }`}
        >
          {msg.content}

          {/* Context menu button */}
          {isOwn && onDelete && (
            <button
              id={`msg-menu-${msg.id}`}
              onClick={() => setShowMenu((v) => !v)}
              className="absolute -left-8 top-1/2 -translate-y-1/2 hidden h-7 w-7 items-center justify-center rounded-full bg-white/10 text-white/50 opacity-0 transition-opacity group-hover:flex group-hover:opacity-100 hover:bg-white/20 hover:text-white"
            >
              <MoreVertical size={14} />
            </button>
          )}

          {/* Dropdown menu */}
          {showMenu && (
            <div
              ref={menuRef}
              className="absolute bottom-full left-0 mb-1 z-50 w-40 overflow-hidden rounded-2xl bg-black/90 shadow-2xl ring-1 ring-white/10 backdrop-blur-xl"
            >
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete?.(msg.id);
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 transition-colors hover:bg-red-500/10"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </div>
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div className={`flex items-center gap-1 px-1 ${isOwn ? "flex-row-reverse" : ""}`}>
          <span className="text-[10px] text-white/30">{formatTime(msg.createdAt)}</span>
          {isOwn && (
            msg.isRead
              ? <CheckCheck size={11} className="text-accent/70" />
              : <Check size={11} className="text-white/30" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Typing indicator ───

function TypingDots({ username }: { username: string }) {
  return (
    <div className="flex items-end gap-2">
      <div className="w-8 shrink-0" />
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/10 px-4 py-3">
          <span className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white/40 animate-bounce"
                style={{ animationDelay: `${i * 150}ms` }}
              />
            ))}
          </span>
        </div>
        <span className="px-1 text-[10px] text-white/30">{username} is typing…</span>
      </div>
    </div>
  );
}

// ─── Main Messages Page ───

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const {
    chatMessages: wsChatMessages,
    typingIndicators,
    setUnreadMessageCount,
    setActiveChatConversationId,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendChatMessage,
    sendReadReceipt,
    sendTyping,
    isConnected,
  } = useWebSocket();

  // Conversations list
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [convsLoading, setConvsLoading] = useState(true);
  const [convSearch, setConvSearch] = useState("");
  const [openingUsername, setOpeningUsername] = useState<string | null>(null);

  // Active conversation
  const [activeConv, setActiveConv] = useState<ConversationResponse | null>(null);

  // Messages in the active conversation
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  // Compose
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);

  // Mobile — whether the chat pane is shown
  const [showChat, setShowChat] = useState(false);
  const openedUrlUserRef = useRef<string | null>(null);

  // ─── Load conversations ───

  const loadConversations = useCallback(async () => {
    try {
      const data = await getConversations(0, 50);
      setConversations(data.content);
    } catch {
      // silently fail
    } finally {
      setConvsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadConversations();

      // Fetch real unread message count and update global badge
      getUnreadMessageCount()
        .then((n) => setUnreadMessageCount(n))
        .catch(() => {});
    }
  }, [isAuthenticated, loadConversations, setUnreadMessageCount]);

  useEffect(() => {
    setActiveChatConversationId(activeConv?.conversationId ?? null);
    return () => setActiveChatConversationId(null);
  }, [activeConv?.conversationId, setActiveChatConversationId]);

  // ─── Load messages for active conversation ───

  const loadMessages = useCallback(
    async (conv: ConversationResponse, pageNum = 0, append = false) => {
      setMsgsLoading(true);
      try {
        const data = await getMessages(conv.conversationId, pageNum, 30);
        // API returns newest first — reverse so oldest is at top
        const reversed = [...data.content].reverse();
        setMessages((prev) => (append ? [...reversed, ...prev] : reversed));
        setHasMore(!data.last);
        setPage(pageNum);
      } catch {
        // silently fail
      } finally {
        setMsgsLoading(false);
      }
    },
    []
  );

  // ─── Activate conversation ───

  const activateConversation = useCallback(
    (conv: ConversationResponse) => {
      if (activeConv?.conversationId === conv.conversationId) return;

      // Unsubscribe from previous
      if (activeConv) unsubscribeFromConversation(activeConv.conversationId);

      setActiveConv(conv);
      setMessages([]);
      setPage(0);
      setShowChat(true);
      void loadMessages(conv, 0, false);
      subscribeToConversation(conv.conversationId);

      if (conv.unreadCount > 0) {
        setUnreadMessageCount((count) => Math.max(0, count - conv.unreadCount));
      }

      // Clear unread locally
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conv.conversationId ? { ...c, unreadCount: 0 } : c
        )
      );
    },
    [activeConv, loadMessages, setUnreadMessageCount, subscribeToConversation, unsubscribeFromConversation]
  );

  // ─── Open conversation from profile/search link ───

  const targetUsername = searchParams.get("user")?.trim() || "";

  useEffect(() => {
    if (!isAuthenticated || convsLoading || !targetUsername) return;
    if (targetUsername === user?.username) return;
    if (openedUrlUserRef.current === targetUsername) return;

    const existing = conversations.find(
      (c) => c.otherParticipantUsername.toLowerCase() === targetUsername.toLowerCase()
    );

    if (existing) {
      openedUrlUserRef.current = targetUsername;
      queueMicrotask(() => activateConversation(existing));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setOpeningUsername(targetUsername);
    });

    openConversation(targetUsername)
      .then((conv) => {
        if (cancelled) return;
        openedUrlUserRef.current = targetUsername;
        setConversations((prev) => {
          const exists = prev.some((c) => c.conversationId === conv.conversationId);
          return exists
            ? prev.map((c) => (c.conversationId === conv.conversationId ? conv : c))
            : [conv, ...prev];
        });
        activateConversation(conv);
      })
      .catch(() => {
        if (!cancelled) openedUrlUserRef.current = null;
      })
      .finally(() => {
        if (!cancelled) setOpeningUsername(null);
      });

    return () => {
      cancelled = true;
    };
  }, [
    activateConversation,
    conversations,
    convsLoading,
    isAuthenticated,
    targetUsername,
    user?.username,
  ]);

  // ─── Scroll to bottom ───

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? "smooth" : "instant" });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom(false);
    }
  }, [activeConv?.conversationId, messages.length, scrollToBottom]);

  // ─── Handle incoming WebSocket chat events ───

  const latestWsMessage = wsChatMessages[0];

  useEffect(() => {
    if (!latestWsMessage || !activeConv) return;

    const { eventType, message, messageId, conversationId } = latestWsMessage;

    if (conversationId !== activeConv.conversationId) {
      // Update conversation list for other convs
      if (eventType === "MESSAGE_SENT" && message) {
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === conversationId
              ? {
                  ...c,
                  lastMessage: message.content ?? c.lastMessage,
                  lastMessageAt: message.createdAt,
                  lastMessageSenderId: message.senderId,
                  unreadCount: c.unreadCount + 1,
                }
              : c
          ).sort((a, b) =>
            new Date(b.lastMessageAt ?? b.createdAt).getTime() -
            new Date(a.lastMessageAt ?? a.createdAt).getTime()
          )
        );
      }
      return;
    }

    if (eventType === "MESSAGE_SENT" && message) {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });
      // Update conversation preview
      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId
            ? {
                ...c,
                lastMessage: message.content,
                lastMessageAt: message.createdAt,
                lastMessageSenderId: message.senderId,
              }
            : c
        )
      );
      // Auto-send read receipt if I am the recipient
      if (message.recipientUsername === user?.username) {
        sendReadReceipt(message.id);
      }
      scrollToBottom();
    } else if (eventType === "READ_RECEIPT" && messageId) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, isRead: true, readAt: latestWsMessage.timestamp } : m
        )
      );
    } else if (eventType === "MESSAGE_DELETED" && message) {
      setMessages((prev) =>
        prev.map((m) => (m.id === message.id ? message : m))
      );
    }
  }, [latestWsMessage, activeConv, user?.username, sendReadReceipt, scrollToBottom]);

  // ─── Send message ───

  const handleSend = useCallback(async () => {
    if (!text.trim() || !activeConv || sending) return;
    const content = text.trim();
    setText("");
    setSending(true);

    // Optimistic bubble
    const optimistic: ChatMessageResponse = {
      id: `opt-${Date.now()}`,
      conversationId: activeConv.conversationId,
      senderId: user?.id ?? "",
      senderUsername: user?.username ?? "",
      senderAvatarUrl: user?.avatarUrl ?? null,
      recipientId: activeConv.otherParticipantId,
      recipientUsername: activeConv.otherParticipantUsername,
      content,
      messageType: "TEXT",
      attachmentUrl: null,
      attachmentType: null,
      isRead: false,
      readAt: null,
      isDeleted: false,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimistic]);
    scrollToBottom();

    try {
      if (isConnected) {
        sendChatMessage({
          recipientUsername: activeConv.otherParticipantUsername,
          content,
          messageType: "TEXT",
        });
        // Real message will arrive via WS and replace optimistic
      } else {
        // Fallback to REST
        const { sendMessage } = await import("@/lib/api");
        const real = await sendMessage({
          recipientUsername: activeConv.otherParticipantUsername,
          content,
          messageType: "TEXT",
        });
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? real : m))
        );
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === activeConv.conversationId
            ? { ...c, lastMessage: content, lastMessageAt: new Date().toISOString() }
            : c
        )
      );
    } catch {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  }, [text, activeConv, sending, user, isConnected, sendChatMessage, scrollToBottom]);

  // ─── Delete message ───

  const handleDelete = useCallback(async (msgId: string) => {
    try {
      const updated = await deleteMessage(msgId);
      setMessages((prev) => prev.map((m) => (m.id === msgId ? updated : m)));
    } catch {
      // ignore
    }
  }, []);

  // ─── Typing ───

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleInput = (value: string) => {
    setText(value);
    if (!activeConv || !isConnected) return;
    sendTyping(activeConv.conversationId);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      typingTimeoutRef.current = null;
    }, 3000);
  };

  // ─── Key handler ───

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  // ─── Load more (scroll up) ───

  const handleScroll = useCallback(() => {
    const el = messagesScrollRef.current;
    if (!el || !hasMore || msgsLoading || !activeConv) return;
    if (el.scrollTop < 80) {
      void loadMessages(activeConv, page + 1, true);
    }
  }, [hasMore, msgsLoading, activeConv, page, loadMessages]);

  // ─── Filtered conversations ───

  const filtered = conversations.filter((c) =>
    c.otherParticipantUsername.toLowerCase().includes(convSearch.toLowerCase())
  );

  // ─── Typing indicator for active conv ───

  const activeTyping = activeConv
    ? typingIndicators.filter(
        (t) =>
          t.conversationId === activeConv.conversationId &&
          t.actorUsername !== user?.username
      )
    : [];

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
        <MessageCircle size={48} className="mb-4 opacity-30" />
        <p className="text-lg font-bold">Sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-3xl bg-black/60 ring-1 ring-white/10 backdrop-blur-xl">
      {/* ─── Conversations sidebar ─── */}
      <div
        className={`flex w-full flex-col border-r border-white/10 md:w-80 lg:w-96 ${
          showChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-4">
          <h1 className="text-lg font-black tracking-tight text-white">Messages</h1>
        </div>

        {/* Search */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 ring-1 ring-white/10">
            <Search size={15} className="text-white/30 shrink-0" />
            <input
              id="conv-search"
              type="text"
              placeholder="Search conversations…"
              value={convSearch}
              onChange={(e) => setConvSearch(e.target.value)}
              className="flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-white/25"
            />
            {convSearch && (
              <button onClick={() => setConvSearch("")} className="text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-hide">
          {convsLoading ? (
            <div className="flex flex-col gap-2 p-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-2xl p-3 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-white/10" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 rounded-full bg-white/10" />
                    <div className="h-2.5 w-1/2 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              {openingUsername ? (
                <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
              ) : (
                <MessageCircle size={36} className="mb-3 text-white/15" />
              )}
              <p className="text-sm font-semibold text-white/30">
                {openingUsername
                  ? `Opening @${openingUsername}`
                  : convSearch
                    ? "No conversations found"
                    : "No conversations yet"}
              </p>
              <p className="mt-1 text-xs text-white/20">
                Go to a user&apos;s profile and tap Message to start chatting
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {filtered.map((conv) => (
                <ConversationItem
                  key={conv.conversationId}
                  conv={conv}
                  isActive={activeConv?.conversationId === conv.conversationId}
                  onClick={() => activateConversation(conv)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ─── Chat pane ─── */}
      <div
        className={`flex flex-1 flex-col ${
          showChat ? "flex" : "hidden md:flex"
        }`}
      >
        {!activeConv ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
              <MessageCircle size={36} className="text-white/20" />
            </div>
            <div>
              <p className="text-base font-semibold text-white/40">Select a conversation</p>
              <p className="mt-1 text-sm text-white/20">Choose from the left to start chatting</p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5">
              {/* Back button — mobile only */}
              <button
                id="chat-back-btn"
                onClick={() => setShowChat(false)}
                className="md:hidden flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20"
              >
                <ChevronLeft size={18} />
              </button>

              <Avatar
                username={activeConv.otherParticipantUsername}
                size="md"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-white">
                  {activeConv.otherParticipantUsername}
                </p>
                <p className="text-xs text-white/30">
                  {activeTyping.length > 0 ? (
                    <span className="text-accent/80 animate-pulse">typing…</span>
                  ) : (
                    <span>@{activeConv.otherParticipantUsername}</span>
                  )}
                </p>
              </div>
            </div>

            {/* Messages area */}
            <div
              id="messages-scroll"
              ref={messagesScrollRef}
              onScroll={handleScroll}
              className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4 scrollbar-hide"
            >
              {/* Load more indicator */}
              {msgsLoading && page > 0 && (
                <div className="flex justify-center py-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                </div>
              )}

              {/* Skeleton while loading first page */}
              {msgsLoading && page === 0 ? (
                <>
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className={`flex ${i % 3 === 0 ? "justify-end" : "justify-start"} animate-pulse`}
                    >
                      <div
                        className={`h-8 rounded-2xl bg-white/10 ${
                          i % 3 === 0 ? "w-40" : "w-56"
                        }`}
                      />
                    </div>
                  ))}
                </>
              ) : (
                messages.map((msg, idx) => {
                  const isOwn = msg.senderUsername === user?.username;
                  const showAvatar =
                    idx === 0 ||
                    messages[idx - 1]?.senderUsername !== msg.senderUsername;
                  return (
                    <MessageBubble
                      key={msg.id}
                      msg={msg}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      onDelete={isOwn ? handleDelete : undefined}
                    />
                  );
                })
              )}

              {/* Typing indicators */}
              {activeTyping.map((t) => (
                <TypingDots key={`${t.conversationId}-${t.actorUsername}`} username={t.actorUsername} />
              ))}

              <div ref={bottomRef} />
            </div>

            {/* Compose bar */}
            <div className="border-t border-white/10 px-4 py-3">
              <form
                id="chat-compose-form"
                onSubmit={(e: FormEvent) => { e.preventDefault(); void handleSend(); }}
                className="flex items-end gap-2"
              >
                <div className="flex-1 overflow-hidden rounded-2xl bg-white/5 ring-1 ring-white/10 focus-within:ring-accent/50 transition-all">
                  <textarea
                    id="chat-input"
                    ref={inputRef}
                    rows={1}
                    value={text}
                    onChange={(e) => handleInput(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Write a message…"
                    className="block w-full resize-none bg-transparent px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 max-h-36"
                    style={{
                      height: "auto",
                      minHeight: "44px",
                    }}
                    onInput={(e) => {
                      const el = e.currentTarget;
                      el.style.height = "auto";
                      el.style.height = `${Math.min(el.scrollHeight, 144)}px`;
                    }}
                  />
                </div>
                <button
                  id="chat-send-btn"
                  type="submit"
                  disabled={!text.trim() || sending}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-all hover:opacity-90 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={null}>
      <MessagesPageContent />
    </Suspense>
  );
}
