"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Users, X } from "lucide-react";
import {
  listUserFollowers,
  listUserFollowing,
  listUserFriends,
  type UserProfile,
} from "@/lib/api";

export type SocialListKind = "followers" | "following" | "friends";

const titles: Record<SocialListKind, string> = {
  followers: "Followers",
  following: "Following",
  friends: "Friends",
};

function getInitials(user: UserProfile) {
  return (
    user.displayName
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??"
  );
}

export default function SocialListDialog({
  open,
  kind,
  userId,
  username,
  canView,
  onClose,
}: {
  open: boolean;
  kind: SocialListKind;
  userId: string;
  username: string;
  canView: boolean;
  onClose: () => void;
}) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !canView) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError("");
      }
    });

    const loader =
      kind === "followers"
        ? listUserFollowers
        : kind === "following"
          ? listUserFollowing
          : listUserFriends;

    loader(userId, 0, 50)
      .then((page) => {
        if (!cancelled) setUsers(page.content);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [canView, kind, open, userId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <button
        className="absolute inset-0"
        onClick={onClose}
        aria-label="Close social list"
      />
      <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-2xl ring-1 ring-border">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-lg font-black">{titles[kind]}</h2>
            <p className="text-xs text-muted">@{username}</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>

        {!canView ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted">
            <Users size={40} className="opacity-30" />
            <p className="text-sm font-bold text-foreground">This list is private</p>
            <p className="text-xs">The user controls who can view this list.</p>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center py-16 text-muted">
            <Loader2 size={24} className="mr-2 animate-spin" />
            <span className="text-sm">Loading...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted">
            <Users size={40} className="opacity-30" />
            <p className="text-sm font-bold text-foreground">Could not load list</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center text-muted">
            <Users size={40} className="opacity-30" />
            <p className="text-sm font-bold text-foreground">No users to show</p>
            <p className="text-xs">This list is empty or not visible to you.</p>
          </div>
        ) : (
          <div className="overflow-y-auto p-2">
            {users.map((user) => (
              <Link
                key={user.id}
                href={`/user/${user.username}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-2xl px-3 py-3 transition-colors hover:bg-surface"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    getInitials(user)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-bold">{user.displayName}</p>
                    {user.isVerified && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[8px] font-bold text-white">
                        ✓
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted">@{user.username}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
