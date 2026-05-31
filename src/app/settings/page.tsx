"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  LogOut,
  Trash2,
  ChevronRight,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

function SettingsRow({
  icon: Icon,
  label,
  description,
  onClick,
  right,
  danger,
}: {
  icon: typeof User;
  label: string;
  description?: string;
  onClick?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-4 px-4 py-3.5 text-left transition-colors hover:bg-surface ${
        danger ? "text-red-500 hover:bg-red-500/5" : ""
      }`}
    >
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
        danger ? "bg-red-500/10" : "bg-surface"
      }`}>
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold">{label}</p>
        {description && (
          <p className="text-xs text-muted">{description}</p>
        )}
      </div>
      {right || <ChevronRight size={16} className="text-muted shrink-0" />}
    </button>
  );
}

function Switch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
        checked ? "bg-accent" : "bg-border"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

type Section = "notifications" | "privacy" | "appearance";

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  if (activeSection === "notifications") {
    return (
      <div className="flex flex-col gap-4">
        <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <button
            onClick={() => setActiveSection(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Notifications</h1>
        </div>

        <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">
              Push Notifications
            </p>
          </div>
          <SettingsRow
            icon={Bell}
            label="Push notifications"
            description="Receive push notifications on your device"
            right={
              <Switch checked={pushEnabled} onChange={setPushEnabled} />
            }
          />
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">
              Email Notifications
            </p>
          </div>
          <SettingsRow
            icon={Bell}
            label="Email notifications"
            description="Receive email notifications"
            right={
              <Switch checked={emailEnabled} onChange={setEmailEnabled} />
            }
          />
        </div>
      </div>
    );
  }

  if (activeSection === "privacy") {
    return (
      <div className="flex flex-col gap-4">
        <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <button
            onClick={() => setActiveSection(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Privacy &amp; Security</h1>
        </div>

        <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">
              Account
            </p>
          </div>
          <SettingsRow
            icon={Shield}
            label="Change password"
            description="Update your account password"
          />
          <SettingsRow
            icon={Shield}
            label="Two-factor authentication"
            description="Add an extra layer of security"
          />
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">
              Data &amp; Privacy
            </p>
          </div>
          <SettingsRow
            icon={Globe}
            label="Data download"
            description="Request a copy of your data"
          />
          <SettingsRow
            icon={Trash2}
            label="Delete account"
            description="Permanently delete your account and data"
            danger
          />
        </div>
      </div>
    );
  }

  if (activeSection === "appearance") {
    return (
      <div className="flex flex-col gap-4">
        <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
          <button
            onClick={() => setActiveSection(null)}
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-lg font-bold">Appearance</h1>
        </div>

        <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-bold text-muted uppercase tracking-wide">
              Theme
            </p>
          </div>
          <SettingsRow
            icon={Palette}
            label="Dark mode"
            description="Use dark color scheme"
            right={
              <Switch checked={darkMode} onChange={setDarkMode} />
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      <div className="sticky top-0 z-10 -mx-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <Link
          href="/"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold">Settings</h1>
          <p className="text-xs text-muted hidden sm:block">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Account info */}
      <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div
          className="h-16 w-full bg-gradient-to-br from-accent/30 to-accent-2/30"
          style={
            user?.headerImageUrl
              ? { backgroundImage: `url(${user.headerImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
              : undefined
          }
        />
        <div className="flex items-center gap-4 px-4 py-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-sm font-bold text-white overflow-hidden ring-2 ring-card">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              user?.displayName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "?"
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold">{user?.displayName || "You"}</p>
            <p className="text-xs text-muted">@{user?.username || "username"}</p>
          </div>
          <Link
            href="/settings/edit-profile"
            className="rounded-full bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:bg-border"
          >
            Edit Profile
          </Link>
        </div>
      </div>

      {/* Preferences */}
      <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">
            Preferences
          </p>
        </div>
        <SettingsRow
          icon={Bell}
          label="Notifications"
          description="Push and email notification settings"
          onClick={() => setActiveSection("notifications")}
        />
        <SettingsRow
          icon={Shield}
          label="Privacy &amp; Security"
          description="Password, data, and account security"
          onClick={() => setActiveSection("privacy")}
        />
        <SettingsRow
          icon={Palette}
          label="Appearance"
          description="Theme and display preferences"
          onClick={() => setActiveSection("appearance")}
        />
      </div>

      {/* Danger zone */}
      <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border">
        <div className="border-b border-border px-4 py-3">
          <p className="text-xs font-bold text-muted uppercase tracking-wide">
            Session
          </p>
        </div>
        <SettingsRow
          icon={LogOut}
          label="Sign Out"
          description="Log out of your account"
          danger
          onClick={() => setShowLogoutConfirm(true)}
          right={
            loggingOut ? (
              <Loader2 size={16} className="animate-spin" />
            ) : undefined
          }
        />
      </div>

      {/* Logout confirmation modal */}
      {showLogoutConfirm && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setShowLogoutConfirm(false)}
          />
          <div className="fixed inset-x-4 top-1/2 z-50 mx-auto max-w-sm -translate-y-1/2 rounded-3xl bg-card p-6 shadow-2xl ring-1 ring-border animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle size={20} className="text-red-500" />
              </div>
              <h2 className="text-lg font-bold">Sign Out</h2>
            </div>
            <p className="text-sm text-muted">
              Are you sure you want to sign out of your account?
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 rounded-full bg-surface px-4 py-2.5 text-sm font-bold transition-colors hover:bg-border"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  setLoggingOut(true);
                  logout();
                }}
                className="flex-1 rounded-full bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-80"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
