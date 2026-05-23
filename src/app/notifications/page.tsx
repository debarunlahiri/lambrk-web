import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black tracking-tight">
        <span className="gradient-text">Notifications</span>
      </h1>
      <div className="flex flex-col items-center justify-center rounded-3xl bg-card py-20 text-muted ring-1 ring-border">
        <Bell size={48} className="mb-4 opacity-30" />
        <p className="text-lg font-bold">All caught up</p>
        <p className="text-sm">No new notifications</p>
      </div>
    </div>
  );
}
