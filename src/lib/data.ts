import type { FeedPost } from "@/lib/api";

export interface Post {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
    avatarUrl?: string | null;
  };
  content: string;
  media?: {
    type: "image" | "video";
    url: string;
  }[];
  likes: number;
  dislikes: number;
  comments: number;
  reposts: number;
  timestamp: string;
}

export type { FeedPost } from "@/lib/api";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export function mapFeedPost(post: FeedPost): Post {
  const initials = post.author.displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "??";

  return {
    id: post.id,
    author: {
      name: post.author.displayName,
      handle: `@${post.author.username}`,
      avatar: initials,
      avatarUrl: post.author.avatarUrl,
    },
    content: post.content,
    media: post.files?.map((f) => ({
      type: f.mimeType.startsWith("video/") ? "video" : "image",
      url: f.fileUrl,
    })) || undefined,
    likes: post.likeCount,
    dislikes: post.dislikeCount,
    comments: post.commentCount,
    reposts: post.repostCount ?? 0,
    timestamp: formatTimeAgo(post.createdAt),
  };
}

export interface Comment {
  id: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  content: string;
  likes: number;
  timestamp: string;
}

export const mockComments: Record<string, Comment[]> = {
  "1": [
    {
      id: "c1",
      author: { name: "Sarah Chen", handle: "@schen_dev", avatar: "SC" },
      content: "This looks amazing! Love the animations.",
      likes: 12,
      timestamp: "1h",
    },
    {
      id: "c2",
      author: { name: "David Kim", handle: "@dkim", avatar: "DK" },
      content: "Great work Alex, the transitions are so smooth.",
      likes: 8,
      timestamp: "30m",
    },
  ],
  "2": [
    {
      id: "c3",
      author: { name: "Emily Watson", handle: "@ewatson", avatar: "EW" },
      content: "Stunning shots! Where was this taken?",
      likes: 24,
      timestamp: "2h",
    },
  ],
  "4": [
    {
      id: "c4",
      author: { name: "Marcus Johnson", handle: "@mj_tech", avatar: "MJ" },
      content: "Could not agree more. Types changed how I approach problems.",
      likes: 45,
      timestamp: "3h",
    },
    {
      id: "c5",
      author: { name: "Alex Rivera", handle: "@arivera", avatar: "AR" },
      content: "This is the best take I have seen all week.",
      likes: 32,
      timestamp: "1h",
    },
    {
      id: "c6",
      author: { name: "David Kim", handle: "@dkim", avatar: "DK" },
      content: "My team switched to TS last year and productivity went up 30%.",
      likes: 67,
      timestamp: "45m",
    },
  ],
};

export const mockPosts: Post[] = [
  {
    id: "1",
    author: {
      name: "Alex Rivera",
      handle: "@arivera",
      avatar: "AR",
    },
    content:
      "Just launched my new portfolio website! Check it out and let me know what you think. Really proud of how the animations turned out using Framer Motion.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
      },
    ],
    likes: 142,
    dislikes: 3,
    comments: 23,
    reposts: 12,
    timestamp: "2h",
  },
  {
    id: "2",
    author: {
      name: "Sarah Chen",
      handle: "@schen_dev",
      avatar: "SC",
    },
    content:
      "The sunset today was absolutely incredible. Nature never fails to amaze me.",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&q=80",
      },
    ],
    likes: 892,
    dislikes: 12,
    comments: 45,
    reposts: 78,
    timestamp: "4h",
  },
  {
    id: "3",
    author: {
      name: "Marcus Johnson",
      handle: "@mj_tech",
      avatar: "MJ",
    },
    content:
      "Quick demo of the new feature we're working on. What do you all think?",
    media: [
      {
        type: "video",
        url: "https://www.w3schools.com/html/mov_bbb.mp4",
      },
    ],
    likes: 334,
    dislikes: 8,
    comments: 56,
    reposts: 89,
    timestamp: "5h",
  },
  {
    id: "4",
    author: {
      name: "Emily Watson",
      handle: "@ewatson",
      avatar: "EW",
    },
    content:
      "Hot take: TypeScript makes you a better developer not because of the types, but because it forces you to think about your data structures before you start coding.",
    likes: 2103,
    dislikes: 45,
    comments: 312,
    reposts: 567,
    timestamp: "8h",
  },
  {
    id: "5",
    author: {
      name: "David Kim",
      handle: "@dkim",
      avatar: "DK",
    },
    content:
      "My setup for the hackathon this weekend. Let's build something amazing!",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80",
      },
    ],
    likes: 567,
    dislikes: 5,
    comments: 89,
    reposts: 34,
    timestamp: "12h",
  },
];
