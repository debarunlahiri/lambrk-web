"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import PostCard from "./PostCard";
import CreatePost from "./CreatePost";
import { mockPosts, type Post } from "@/lib/data";

export default function Feed() {
  const { user, isAuthenticated } = useAuth();
  const [posts, setPosts] = useState<Post[]>(mockPosts);

  const handleNewPost = (
    content: string,
    media: { type: "image" | "video"; url: string }[]
  ) => {
    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        name: user?.displayName || "You",
        handle: user?.username ? `@${user.username}` : "@you",
        avatar: user?.displayName
          ? user.displayName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "YO",
      },
      content,
      media: media.length > 0 ? media : undefined,
      likes: 0,
      dislikes: 0,
      comments: 0,
      reposts: 0,
      timestamp: "now",
    };
    setPosts([newPost, ...posts]);
  };

  return (
    <div className="flex flex-col gap-4">
      {isAuthenticated && <CreatePost onPost={handleNewPost} />}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
