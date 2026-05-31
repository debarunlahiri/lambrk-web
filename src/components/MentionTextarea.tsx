"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { searchActiveUsers, type UserProfile } from "@/lib/api";
import { AtSign, Loader2 } from "lucide-react";

interface MentionTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
}

export default function MentionTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
  className = "",
  autoFocus,
}: MentionTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionStart, setMentionStart] = useState(0);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const mentionTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const findMentionContext = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return null;
    const cursor = el.selectionStart;
    const text = el.value;

    // Find the nearest @ before cursor
    let atIndex = -1;
    for (let i = cursor - 1; i >= 0; i--) {
      if (text[i] === "@") {
        atIndex = i;
        break;
      }
      if (text[i] === " " || text[i] === "\n") break;
    }

    if (atIndex === -1) return null;
    const query = text.slice(atIndex + 1, cursor);
    return { atIndex, query };
  }, []);

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;

    onChange(el.value);

    const ctx = findMentionContext();
    if (!ctx) {
      setShowMentions(false);
      return;
    }

    setMentionStart(ctx.atIndex);
    setMentionQuery(ctx.query);
    setMentionIndex(0);
    setShowMentions(true);
    setUsersLoading(true);

    if (mentionTimeout.current) clearTimeout(mentionTimeout.current);
    mentionTimeout.current = setTimeout(async () => {
      try {
        const result = await searchActiveUsers(ctx.query, 0, 8);
        setUsers(result.content);
      } catch {
        setUsers([]);
      } finally {
        setUsersLoading(false);
      }
    }, 200);
  };

  const insertMention = (username: string) => {
    const el = textareaRef.current;
    if (!el) return;

    const before = value.slice(0, mentionStart);
    const after = value.slice(el.selectionStart);
    const newValue = `${before}@${username} ${after}`;
    onChange(newValue);
    setShowMentions(false);

    // Focus and place cursor after inserted mention
    requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      const pos = mentionStart + username.length + 2; // +2 for @ and space
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(pos, pos);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setMentionIndex((i) => Math.min(i + 1, users.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setMentionIndex((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (users[mentionIndex]) {
          insertMention(users[mentionIndex].username);
        }
        break;
      case "Escape":
        setShowMentions(false);
        break;
    }
  };

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        textareaRef.current &&
        !textareaRef.current.contains(target) &&
        !(target as HTMLElement).closest("[data-mention-dropdown]")
      ) {
        setShowMentions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        autoFocus={autoFocus}
        className={`w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted/50 ${className}`}
      />

      {showMentions && (
        <div
          data-mention-dropdown
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-2xl bg-card shadow-xl ring-1 ring-border"
        >
          {usersLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 size={16} className="animate-spin text-muted" />
            </div>
          ) : users.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted">
              No users found
            </div>
          ) : (
            <div className="py-1">
              {users.map((user, i) => {
                const initials = user.displayName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isActive = i === mentionIndex;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => insertMention(user.username)}
                    onMouseEnter={() => setMentionIndex(i)}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors ${
                      isActive ? "bg-surface" : "hover:bg-surface"
                    }`}
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-[10px] font-bold text-white overflow-hidden">
                      {user.avatarUrl ? (
                        <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{user.displayName}</p>
                      <p className="truncate text-xs text-muted">@{user.username}</p>
                    </div>
                    {isActive && <AtSign size={14} className="text-accent" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
