import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="gradient-text">Bookmarks</span>
      </h1>
      <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
        <Bookmark size={48} className="mb-4 opacity-30" />
        <p className="text-lg font-bold">Nothing saved yet</p>
        <p className="text-sm">Posts you bookmark will appear here</p>
      </div>
    </div>
  );
}
