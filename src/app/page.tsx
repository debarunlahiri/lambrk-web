import Feed from "@/components/Feed";

export default function Home() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-black tracking-tight">
          Your <span className="gradient-text">Feed</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          See what the world is sharing today
        </p>
      </div>
      <Feed />
    </div>
  );
}
