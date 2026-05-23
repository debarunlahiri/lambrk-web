"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { MapPin, Link as LinkIcon, Calendar, Users, Flame } from "lucide-react";
import { mockPosts } from "@/lib/data";
import PostCard from "@/components/PostCard";

const tabs = ["Posts", "Media", "Likes"];

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("Posts");
  const userPosts = mockPosts.filter((p) => p.author.handle === "@arivera");

  const avatarText = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "YO";

  const displayName = user?.displayName || "You";
  const username = user?.username || "you";
  const bio = user?.bio || "Building digital experiences. Capturing moments through a lens. Coffee first, code second.";

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="relative overflow-hidden rounded-3xl">
        <div className="aspect-[3/1] w-full overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80"
            alt="Banner"
            className="h-full w-full object-cover"
          />
        </div>
        <div className="absolute -bottom-10 left-6">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-accent to-accent-2 text-2xl font-black text-white shadow-lg ring-4 ring-background">
            {avatarText}
          </div>
        </div>
      </div>

      <div className="mt-8 px-2">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">{displayName}</h1>
            <p className="text-sm text-muted">@{username}</p>
          </div>
          <button className="rounded-full bg-surface px-5 py-2 text-sm font-bold transition-colors hover:bg-border">
            Edit Profile
          </button>
        </div>

        <p className="mt-3 text-[15px] leading-relaxed">
          {bio}
        </p>

        <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <MapPin size={15} />
            San Francisco, CA
          </span>
          <span className="flex items-center gap-1">
            <LinkIcon size={15} />
            <a href="#" className="text-accent hover:underline">
              lambrk.app/you
            </a>
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={15} />
            Joined March 2024
          </span>
        </div>

        <div className="mt-4 flex gap-5 text-sm">
          <span className="flex items-center gap-1">
            <strong className="text-foreground">1,203</strong>
            <span className="text-muted">Followers</span>
          </span>
          <span className="flex items-center gap-1">
            <strong className="text-foreground">142</strong>
            <span className="text-muted">Following</span>
          </span>
          <span className="flex items-center gap-1">
            <Users size={15} className="text-accent" />
            <span className="text-muted">42 posts</span>
          </span>
        </div>
      </div>

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

      <div className="flex flex-col gap-4">
        {activeTab === "Posts" && userPosts.length > 0 ? (
          userPosts.map((post) => <PostCard key={post.id} post={post} />)
        ) : activeTab === "Media" ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {userPosts
              .filter((p) => p.media)
              .flatMap((p) => p.media!)
              .map((m, i) => (
                <div
                  key={i}
                  className="aspect-square overflow-hidden rounded-2xl ring-1 ring-border"
                >
                  <img
                    src={m.url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
            <Flame size={40} className="mb-3 opacity-40" />
            <p className="text-lg font-bold">Nothing here yet</p>
            <p className="text-sm">Content will appear here soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
