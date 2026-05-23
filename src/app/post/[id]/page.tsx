import { mockPosts } from "@/lib/data";
import PostDetail from "./PostDetail";

export function generateStaticParams() {
  return mockPosts.map((post) => ({
    id: post.id,
  }));
}

export default function PostPage({ params }: { params: Promise<{ id: string }> }) {
  return <PostDetail params={params} />;
}
