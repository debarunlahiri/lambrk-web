"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCurrentUser,
  updateUserProfile,
  uploadFile,
  type UserProfile,
  ApiError,
} from "@/lib/api";
import BackButton from "@/components/BackButton";
import { Loader2, Camera, Save, AlertCircle, User, Type, MapPin, Globe, AtSign } from "lucide-react";

export default function EditProfilePage() {
  const router = useRouter();
  const { user: authUser } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [website, setWebsite] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getCurrentUser()
      .then((data) => {
        setProfile(data);
        setDisplayName(data.displayName);
        setBio(data.bio || "");
        setLocation(data.location || "");
        setWebsite(data.website || "");
        setAvatarUrl(data.avatarUrl);
        setHeaderImageUrl(data.headerImageUrl);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load profile");
        setLoading(false);
      });
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    try {
      const uploaded = await uploadFile({
        file,
        type: "PROFILE_IMAGE",
        fileName: file.name,
        description: "User avatar",
        isPublic: true,
        isNSFW: false,
      });
      setAvatarUrl(uploaded.fileUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Avatar upload failed");
    } finally {
      setUploadingAvatar(false);
      if (avatarInputRef.current) avatarInputRef.current.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const uploaded = await uploadFile({
        file,
        type: "COVER_IMAGE",
        fileName: file.name,
        description: "User banner",
        isPublic: true,
        isNSFW: false,
      });
      setHeaderImageUrl(uploaded.fileUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Banner upload failed");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!displayName.trim()) {
      setError("Display name is required");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const updated = await updateUserProfile({
        displayName: displayName.trim(),
        bio: bio.trim() || null,
        location: location.trim() || null,
        website: website.trim() || null,
        avatarUrl,
        headerImageUrl,
      });
      setProfile(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const message =
        err instanceof ApiError ? err.message : err instanceof Error ? err.message : "Failed to save profile";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const avatarText = (displayName || profile?.displayName || "YO")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-background/85 px-4 py-3 backdrop-blur-2xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center gap-3">
          <BackButton fallback="/profile" />
          <h1 className="text-lg font-bold">Edit Profile</h1>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background transition-all hover:opacity-80 disabled:opacity-50 shadow-lg shadow-foreground/10"
        >
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save
        </button>
      </div>

      {/* Success / Error */}
      {success && (
        <div className="flex items-center gap-2 rounded-2xl bg-green-500/10 px-4 py-3 text-sm text-green-500 animate-in fade-in slide-in-from-top-2">
          Profile updated successfully
        </div>
      )}
      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Banner + Avatar */}
      <div className="relative -mx-4 md:-mx-0">
        {/* Banner */}
        <div
          className="relative aspect-[3/1] w-full overflow-hidden rounded-3xl bg-gradient-to-br from-accent/20 to-accent-2/20"
          style={headerImageUrl ? { backgroundImage: `url(${headerImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          {!headerImageUrl && (
            <div className="flex h-full w-full items-center justify-center">
              <Globe size={32} className="text-muted/20" />
            </div>
          )}
          <button
            onClick={() => bannerInputRef.current?.click()}
            disabled={uploadingBanner}
            className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all hover:bg-black/30"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white opacity-0 transition-opacity hover:scale-105 group-hover:opacity-100"
                 style={{ opacity: uploadingBanner ? 1 : undefined }}>
              {uploadingBanner ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Camera size={18} />
              )}
            </div>
          </button>
          <input
            ref={bannerInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleBannerUpload}
          />
        </div>

        {/* Avatar overlaid */}
        <div className="absolute -bottom-10 left-6 z-10">
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-accent to-accent-2 text-2xl font-black text-white shadow-xl ring-4 ring-background overflow-hidden">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
              ) : (
                avatarText
              )}
            </div>
            <button
              onClick={() => avatarInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {uploadingAvatar ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
            </button>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
          </div>
        </div>
      </div>

      {/* Spacer for avatar overlap */}
      <div className="h-8" />

      {/* Form */}
      <div className="flex flex-col gap-5 px-1">
        {/* Display Name */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Type size={16} className="text-muted" />
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Your display name"
            className="w-full rounded-2xl bg-card py-3.5 px-4 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-accent/30 hover:ring-accent/20"
          />
        </div>

        {/* Username (read-only) */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <AtSign size={16} className="text-muted" />
            Username
          </label>
          <input
            type="text"
            value={profile?.username || ""}
            disabled
            className="w-full rounded-2xl bg-surface py-3.5 px-4 text-sm text-muted ring-1 ring-border outline-none cursor-not-allowed"
          />
          <p className="text-xs text-muted">Username cannot be changed</p>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <User size={16} className="text-muted" />
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
            className="w-full resize-none rounded-2xl bg-card py-3.5 px-4 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-accent/30 hover:ring-accent/20"
          />
          <p className="text-xs text-muted text-right">{bio.length}/500</p>
        </div>

        {/* Location */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <MapPin size={16} className="text-muted" />
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="City, Country"
            className="w-full rounded-2xl bg-card py-3.5 px-4 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-accent/30 hover:ring-accent/20"
          />
        </div>

        {/* Website */}
        <div className="flex flex-col gap-2">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <Globe size={16} className="text-muted" />
            Website
          </label>
          <input
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full rounded-2xl bg-card py-3.5 px-4 text-sm ring-1 ring-border outline-none transition-all placeholder:text-muted/50 focus:ring-2 focus:ring-accent/30 hover:ring-accent/20"
          />
        </div>
      </div>
    </div>
  );
}
