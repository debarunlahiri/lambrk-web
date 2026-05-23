import { Mail } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="gradient-text">Messages</span>
      </h1>
      <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
        <Mail size={48} className="mb-4 opacity-30" />
        <p className="text-lg font-bold">No messages yet</p>
        <p className="text-sm">Start a conversation with someone</p>
      </div>
    </div>
  );
}
