"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Flame,
  Globe,
  Loader2,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserByUsername,
  listUserPosts,
  followUser,
  unfollowUser,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  cancelFriendRequest,
  removeFriend,
  listIncomingFriendRequests,
  listOutgoingFriendRequests,
  type UserProfile,
} from "@/lib/api";
import { mapFeedPost, type Post } from "@/lib/data";
import PostCard from "@/components/PostCard";
import { useToast } from "@/contexts/ToastContext";

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
  });
}

const tabs = ["Posts", "Media"];
type FriendRequestDirection = "incoming" | "outgoing" | null;

export default function UserProfilePage() {
  const params = useParams();
  const username = params.username as string;
  const { user: currentUser, isAuthenticated } = useAuth();
  const { show: showToast } = useToast();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Posts");
  const [following, setFollowing] = useState(false);
  const [friendStatus, setFriendStatus] = useState("NONE");
  const [friendRequestDirection, setFriendRequestDirection] = useState<FriendRequestDirection>(null);
  const [counts, setCounts] = useState({
    followers: 0,
    following: 0,
    friends: 0,
  });
  const [followLoading, setFollowLoading] = useState(false);
  const [friendLoading, setFriendLoading] = useState(false);

  const isOwnProfile = currentUser?.username === username;
  const isFriend = friendStatus === "ACCEPTED";
  const isFriendPending = friendStatus === "PENDING";
  const requestFromProfile = isFriendPending && friendRequestDirection === "incoming";
  const requestToProfile = isFriendPending && friendRequestDirection === "outgoing";
  const canViewFollowerCount = profile?.canViewFollowerCount ?? true;
  const canViewFollowingCount = profile?.canViewFollowingCount ?? true;
  const canViewFollowerList = profile?.canViewFollowerList ?? true;
  const canViewFollowingList = profile?.canViewFollowingList ?? true;
  const canShowFollowButton = profile?.canShowFollowButton ?? true;
  const canShowAddFriendButton = profile?.canShowAddFriendButton ?? true;
  const canShowMessageButton = profile?.messageButtonEnabled ?? true;
  const avatarText = profile?.displayName
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true);
        setError("");
      }
    });

    getUserByUsername(username)
      .then(async (data) => {
        if (cancelled) return;
        setProfile(data);
        setFollowing(data.followedByCurrentUser ?? false);
        const nextFriendStatus = (data.friendshipStatus ?? (data.friend ? "ACCEPTED" : "NONE")).toUpperCase();
        setFriendStatus(nextFriendStatus);
        setFriendRequestDirection(null);
        setCounts({
          followers: data.followerCount ?? 0,
          following: data.followingCount ?? 0,
          friends: data.friendCount ?? 0,
        });

        if (isAuthenticated && nextFriendStatus === "PENDING") {
          const [incoming, outgoing] = await Promise.all([
            listIncomingFriendRequests(0, 50).catch(() => null),
            listOutgoingFriendRequests(0, 50).catch(() => null),
          ]);
          if (cancelled) return;
          const hasIncoming = incoming?.content.some((request) => request.requester.id === data.id);
          const hasOutgoing = outgoing?.content.some((request) => request.addressee.id === data.id);
          setFriendRequestDirection(hasIncoming ? "incoming" : hasOutgoing ? "outgoing" : null);
        }

        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "User not found");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, username]);

  useEffect(() => {
    if (!profile) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setPostsLoading(true);
    });

    listUserPosts(profile.id, 0, 30)
      .then((data) => {
        if (cancelled) return;
        setPosts(data.content.map(mapFeedPost));
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile]);

  const requireAuth = (action: string) => {
    if (isAuthenticated) return true;
    showToast(`Log in to ${action}`, "info");
    return false;
  };

  const handleFollow = async () => {
    if (!profile || !requireAuth(following ? "unfollow users" : "follow users")) return;
    if (followLoading) return;

    const next = !following;
    setFollowing(next);
    setCounts((current) => ({
      ...current,
      followers: Math.max(0, current.followers + (next ? 1 : -1)),
    }));
    setFollowLoading(true);

    try {
      if (next) {
        await followUser(profile.id);
      } else {
        await unfollowUser(profile.id);
      }
      showToast(next ? "Following user" : "Unfollowed user", "success");
    } catch (err: unknown) {
      setFollowing(!next);
      setCounts((current) => ({
        ...current,
        followers: Math.max(0, current.followers + (next ? -1 : 1)),
      }));
      showToast(err instanceof Error ? err.message : "Failed to update follow", "error");
    } finally {
      setFollowLoading(false);
    }
  };

  const handleFriendAction = async (action: "send" | "accept" | "decline" | "cancel" | "remove") => {
    if (!profile || !requireAuth("manage friends")) return;
    if (friendLoading) return;

    const previous = friendStatus;
    const previousDirection = friendRequestDirection;
    setFriendLoading(true);

    try {
      if (action === "remove") {
        setFriendStatus("NONE");
        setFriendRequestDirection(null);
        setCounts((current) => ({ ...current, friends: Math.max(0, current.friends - 1) }));
        await removeFriend(profile.id);
        showToast("Friend removed", "success");
      } else if (action === "accept") {
        setFriendStatus("ACCEPTED");
        setFriendRequestDirection(null);
        setCounts((current) => ({ ...current, friends: current.friends + 1 }));
        await acceptFriendRequest(profile.id);
        showToast("Friend request accepted", "success");
      } else if (action === "decline") {
        setFriendStatus("NONE");
        setFriendRequestDirection(null);
        await declineFriendRequest(profile.id);
        showToast("Friend request declined", "success");
      } else if (action === "cancel") {
        setFriendStatus("NONE");
        setFriendRequestDirection(null);
        await cancelFriendRequest(profile.id);
        showToast("Friend request cancelled", "success");
      } else {
        setFriendStatus("PENDING");
        setFriendRequestDirection("outgoing");
        await sendFriendRequest(profile.id);
        showToast("Friend request sent", "success");
      }
    } catch (err: unknown) {
      setFriendStatus(previous);
      setFriendRequestDirection(previousDirection);
      showToast(err instanceof Error ? err.message : "Failed to send friend request", "error");
    } finally {
      setFriendLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-6 pb-8">
        <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 px-2 py-3 backdrop-blur-xl">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="h-5 w-32 animate-pulse rounded-full bg-surface" />
        </div>
        <div className="animate-pulse space-y-6">
          <div className="aspect-[3/1] rounded-3xl bg-surface" />
          <div className="flex items-center gap-4 px-2">
            <div className="h-20 w-20 shrink-0 rounded-full bg-surface" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-48 rounded-full bg-surface" />
              <div className="h-4 w-32 rounded-full bg-surface" />
              <div className="h-4 w-3/4 rounded-full bg-surface" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <MessageCircle size={48} className="mb-4 opacity-30" />
        <p className="text-xl font-bold">User not found</p>
        <p className="mt-1 text-sm">{error || "This user does not exist."}</p>
        <Link href="/search" className="mt-4 text-accent hover:underline">
          Search users
        </Link>
      </div>
    );
  }

  const mediaPosts = posts.filter((p) => p.media && p.media.length > 0);

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold truncate">
            {profile.displayName}
          </h1>
        </div>
        {isOwnProfile && (
          <Link
            href="/profile"
            className="rounded-full bg-surface px-4 py-2 text-sm font-bold transition-colors hover:bg-border"
          >
            My Profile
          </Link>
        )}
      </div>

      {/* Banner & Avatar */}
      <div className="relative -mx-4 md:-mx-0">
        <div
          className="aspect-[3/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-accent-2/20"
          style={
            profile.headerImageUrl
              ? { backgroundImage: `url(${profile.headerImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        >
          {!profile.headerImageUrl && (
            <div className="flex h-full w-full items-center justify-center">
              <Globe size={32} className="text-muted/20" />
            </div>
          )}
        </div>
        <div className="absolute -bottom-10 left-6 z-10">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl font-black text-white shadow-lg ring-4 ring-background overflow-hidden">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              avatarText
            )}
          </div>
        </div>
      </div>

      {/* Profile info */}
      <div className="mt-8 px-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black">{profile.displayName}</h1>
              {profile.isVerified && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white">
                  ✓
                </span>
              )}
            </div>
            <p className="text-sm text-muted">@{profile.username}</p>
          </div>
          {!isOwnProfile && (
            <div className="flex flex-wrap justify-end gap-2">
              {(canShowFollowButton || following) && (
                <button
                  onClick={handleFollow}
                  disabled={followLoading}
                  className={`flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-all disabled:opacity-60 ${
                    following
                      ? "bg-surface text-foreground ring-1 ring-border hover:bg-border"
                      : "bg-foreground text-background hover:opacity-80"
                  }`}
                >
                  {followLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                  {following ? "Unfollow" : "Follow"}
                </button>
              )}
              {requestFromProfile ? (
                <>
                  <button
                    onClick={() => handleFriendAction("accept")}
                    disabled={friendLoading}
                    className="flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-bold text-white transition-all hover:opacity-80 disabled:opacity-60"
                  >
                    {friendLoading ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                    Accept
                  </button>
                  <button
                    onClick={() => handleFriendAction("decline")}
                    disabled={friendLoading}
                    className="flex h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-sm font-bold text-foreground ring-1 ring-border transition-all hover:bg-border disabled:opacity-60"
                  >
                    Decline
                  </button>
                </>
              ) : (canShowAddFriendButton || isFriend || isFriendPending) ? (
                <button
                  onClick={() => handleFriendAction(isFriend ? "remove" : requestToProfile ? "cancel" : "send")}
                  disabled={friendLoading}
                  className="flex h-10 items-center gap-1.5 rounded-full bg-surface px-4 text-sm font-bold text-foreground ring-1 ring-border transition-all hover:bg-border disabled:opacity-60"
                >
                  {friendLoading ? <Loader2 size={16} className="animate-spin" /> : isFriend ? <UserCheck size={16} /> : <UserPlus size={16} />}
                  {isFriend ? "Friends" : requestToProfile ? "Cancel request" : isFriendPending ? "Pending" : "Add Friend"}
                </button>
              ) : null}
              {isFriend && canShowMessageButton && (
                <Link
                  href={`/messages?user=${encodeURIComponent(profile.username)}`}
                  className="flex h-10 items-center gap-1.5 rounded-full bg-accent px-4 text-sm font-bold text-white transition-all hover:opacity-80"
                >
                  <MessageCircle size={16} />
                  Message
                </Link>
              )}
            </div>
          )}
        </div>

        {profile.bio && (
          <p className="mt-3 text-[15px] leading-relaxed">{profile.bio}</p>
        )}

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {profile.location && (
            <span className="flex items-center gap-1">
              <MapPin size={15} />
              {profile.location}
            </span>
          )}
          {profile.website && (
            <a
              href={profile.website.startsWith("http") ? profile.website : `https://${profile.website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-accent hover:underline"
            >
              <Globe size={15} />
              {profile.website.replace(/^https?:\/\//, "")}
            </a>
          )}
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          {profile.karma !== undefined && (
            <span className="flex items-center gap-1">
              <Flame size={15} />
              {profile.karma} karma
            </span>
          )}
          <span className="flex items-center gap-1">
            <Calendar size={15} />
            Joined {formatDate(profile.createdAt)}
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <span className="flex items-center gap-1">
            <strong className="text-foreground">{posts.length}</strong>
            <span className="text-muted">Posts</span>
          </span>
          <Link
            href={`/user/${encodeURIComponent(profile.username)}/social?tab=followers`}
            className={`flex items-center gap-1 transition-colors ${
              canViewFollowerList ? "hover:text-accent" : "pointer-events-none cursor-not-allowed opacity-60"
            }`}
            aria-disabled={!canViewFollowerList}
          >
            <strong className="text-foreground">{canViewFollowerCount ? counts.followers : "—"}</strong>
            <span className="text-muted">Followers</span>
          </Link>
          <Link
            href={`/user/${encodeURIComponent(profile.username)}/social?tab=following`}
            className={`flex items-center gap-1 transition-colors ${
              canViewFollowingList ? "hover:text-accent" : "pointer-events-none cursor-not-allowed opacity-60"
            }`}
            aria-disabled={!canViewFollowingList}
          >
            <strong className="text-foreground">{canViewFollowingCount ? counts.following : "—"}</strong>
            <span className="text-muted">Following</span>
          </Link>
          <Link
            href={`/user/${encodeURIComponent(profile.username)}/social?tab=friends`}
            className="flex items-center gap-1 transition-colors hover:text-accent"
          >
            <strong className="text-foreground">{counts.friends}</strong>
            <span className="text-muted">Friends</span>
          </Link>
          <span className="flex items-center gap-1">
            <strong className="text-foreground">{mediaPosts.length}</strong>
            <span className="text-muted">Media</span>
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-2xl bg-surface p-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition-all ${
              activeTab === tab
                ? "bg-card text-foreground shadow-sm"
                : "text-muted hover:text-foreground"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts */}
      {postsLoading && (
        <div className="flex items-center justify-center py-16 text-muted">
          <Loader2 size={32} className="animate-spin" />
        </div>
      )}

      {!postsLoading && activeTab === "Posts" && (
        <>
          {posts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <MessageCircle size={40} className="mb-3 opacity-40" />
              <p className="text-lg font-bold">No posts yet</p>
              <p className="text-sm">@{profile.username} has not posted anything</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}

      {!postsLoading && activeTab === "Media" && (
        <>
          {mediaPosts.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
              <ImageIcon size={40} className="mb-3 opacity-40" />
              <p className="text-lg font-bold">No media yet</p>
              <p className="text-sm">@{profile.username} has not shared any media</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {mediaPosts.flatMap((p) =>
                (p.media || []).map((m, i) => (
                  <div
                    key={`${p.id}-${i}`}
                    className="aspect-square overflow-hidden rounded-2xl ring-1 ring-border"
                  >
                    {m.type === "video" ? (
                      <video
                        src={m.url}
                        className="h-full w-full object-cover"
                        muted
                        loop
                        playsInline
                        preload="none"
                      />
                    ) : (
                      <img
                        src={m.url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
