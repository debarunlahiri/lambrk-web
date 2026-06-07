"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Loader2, Users } from "lucide-react";
import BackButton from "@/components/BackButton";
import {
  getUserByUsername,
  listUserFollowers,
  listUserFollowing,
  listUserFriends,
  type UserProfile,
} from "@/lib/api";

type SocialTab = "followers" | "following" | "friends";

const socialTabs: { key: SocialTab; label: string }[] = [
  { key: "followers", label: "Followers" },
  { key: "following", label: "Following" },
  { key: "friends", label: "Friends" },
];

function getInitials(user: UserProfile) {
  return (
    user.displayName
      ?.split(/[\s._-]+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "??"
  );
}

function getCount(profile: UserProfile | null, tab: SocialTab) {
  if (!profile) return 0;
  if (tab === "followers") return profile.followerCount ?? 0;
  if (tab === "following") return profile.followingCount ?? 0;
  return profile.friendCount ?? 0;
}

function canViewTab(profile: UserProfile | null, tab: SocialTab) {
  if (!profile) return false;
  if (tab === "followers") return profile.canViewFollowerList ?? true;
  if (tab === "following") return profile.canViewFollowingList ?? true;
  return true;
}

function UserSocialPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const username = params.username as string;
  const requestedTab = searchParams.get("tab") as SocialTab | null;
  const activeTab: SocialTab =
    requestedTab && socialTabs.some((tab) => tab.key === requestedTab)
      ? requestedTab
      : "followers";

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");

  const canView = canViewTab(profile, activeTab);
  const fallback = useMemo(() => `/user/${encodeURIComponent(username)}`, [username]);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setProfileLoading(true);
        setError("");
      }
    });

    getUserByUsername(username)
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "User not found");
      })
      .finally(() => {
        if (!cancelled) setProfileLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    if (!profile || !canView) {
      queueMicrotask(() => setUsers([]));
      return;
    }

    let cancelled = false;
    const loader =
      activeTab === "followers"
        ? listUserFollowers
        : activeTab === "following"
          ? listUserFollowing
          : listUserFriends;

    queueMicrotask(() => {
      if (!cancelled) {
        setUsersLoading(true);
        setError("");
      }
    });

    loader(profile.id, 0, 50)
      .then((page) => {
        if (!cancelled) setUsers(page.content);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load users");
      })
      .finally(() => {
        if (!cancelled) setUsersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTab, canView, profile]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col border-x border-border/70 min-h-[calc(100vh-4rem)]">
      <div className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 px-4 py-3">
          <BackButton fallback={fallback} />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-black">
              {profile?.displayName || username}
            </h1>
            <p className="truncate text-xs text-muted">@{username}</p>
          </div>
        </div>

        <div className="grid grid-cols-3">
          {socialTabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/user/${encodeURIComponent(username)}/social?tab=${tab.key}`}
                className={`relative flex min-h-12 items-center justify-center gap-1 px-2 text-sm font-bold transition-colors ${
                  active ? "text-foreground" : "text-muted hover:bg-surface/70 hover:text-foreground"
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-muted">{getCount(profile, tab.key)}</span>
                {active && (
                  <span className="absolute bottom-0 h-1 w-14 rounded-full bg-accent" />
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {profileLoading || usersLoading ? (
        <div className="flex flex-1 items-center justify-center py-20 text-muted">
          <Loader2 size={24} className="mr-2 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      ) : error ? (
        <EmptyState title="Could not load list" body={error} />
      ) : !canView ? (
        <EmptyState title="This list is private" body="The user controls who can view this list." />
      ) : users.length === 0 ? (
        <EmptyState title="No users to show" body="This list is empty or not visible to you." />
      ) : (
        <div className="divide-y divide-border/70">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/user/${user.username}`}
              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface/70"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-accent to-accent-2 text-xs font-bold text-white shadow-sm">
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
  );
}

export default function UserSocialPage() {
  return (
    <Suspense fallback={null}>
      <UserSocialPageContent />
    </Suspense>
  );
}

function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-20 text-center text-muted">
      <Users size={42} className="opacity-30" />
      <p className="text-sm font-bold text-foreground">{title}</p>
      <p className="max-w-xs text-xs">{body}</p>
    </div>
  );
}
