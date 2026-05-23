"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Users, Shield, Hash, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getCommunityByName, subscribeToCommunity, unsubscribeFromCommunity, type Community } from "@/lib/api";

export default function CommunityPage() {
  const params = useParams();
  const communityName = params.name as string;
  const { isAuthenticated } = useAuth();

  const [community, setCommunity] = useState<Community | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    if (!communityName) return;
    let cancelled = false;
    getCommunityByName(communityName)
      .then((data) => {
        if (cancelled) return;
        setCommunity(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load community");
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [communityName]);

  const handleSubscribe = async () => {
    if (!community || !isAuthenticated) return;
    setSubscribing(true);
    try {
      if (community.isUserSubscribed) {
        await unsubscribeFromCommunity(community.id);
        setCommunity({ ...community, isUserSubscribed: false, memberCount: community.memberCount - 1 });
      } else {
        await subscribeToCommunity(community.id);
        setCommunity({ ...community, isUserSubscribed: true, memberCount: community.memberCount + 1 });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Action failed");
    } finally {
      setSubscribing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (error || !community) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-muted">
        <Hash size={40} className="mb-3 opacity-40" />
        <p className="text-lg font-bold">Community not found</p>
        <p className="text-sm">{error || "This community does not exist."}</p>
        <Link href="/explore" className="mt-4 text-accent hover:underline">
          Explore communities
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="sticky top-0 z-10 flex items-center gap-3 bg-background/80 px-2 py-3 backdrop-blur-xl">
        <Link
          href="/explore"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-surface"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold truncate">r/{community.name}</h1>
      </div>

      {community.headerImageUrl && (
        <div className="aspect-[3/1] w-full overflow-hidden rounded-3xl">
          <img
            src={community.headerImageUrl}
            alt={community.title}
            className="h-full w-full object-cover"
          />
        </div>
      )}

      <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-lg font-bold text-white overflow-hidden">
              {community.iconImageUrl ? (
                <img src={community.iconImageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                community.name.slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <h2 className="text-xl font-black">{community.title}</h2>
              <p className="text-sm text-muted">r/{community.name}</p>
            </div>
          </div>
          {isAuthenticated && (
            <button
              onClick={handleSubscribe}
              disabled={subscribing}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${
                community.isUserSubscribed
                  ? "bg-surface text-foreground hover:bg-border"
                  : "bg-foreground text-background hover:opacity-80"
              }`}
            >
              {subscribing ? "..." : community.isUserSubscribed ? "Joined" : "Join"}
            </button>
          )}
        </div>

        <p className="text-[15px] leading-relaxed">{community.description}</p>

        {community.sidebarText && (
          <div className="rounded-2xl bg-surface p-4 text-sm text-muted">
            <p className="mb-1 font-bold text-foreground">Rules</p>
            {community.sidebarText}
          </div>
        )}

        <div className="flex flex-wrap gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <Users size={15} />
            {community.memberCount} members
          </span>
          <span className="flex items-center gap-1">
            <Shield size={15} />
            {community.isPublic ? "Public" : "Private"}
          </span>
          {community.isOver18 && (
            <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-bold text-red-500">
              18+
            </span>
          )}
        </div>

        {community.categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {community.categories.map((cat) => (
              <span
                key={cat.id}
                className="rounded-full bg-surface px-3 py-1 text-xs font-medium"
                style={{ color: cat.color || "inherit" }}
              >
                {cat.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
        <Hash size={32} className="mb-3 opacity-40" />
        <p className="text-sm font-bold">Posts coming soon</p>
        <p className="text-xs">Community feed will be available here</p>
      </div>
    </div>
  );
}
