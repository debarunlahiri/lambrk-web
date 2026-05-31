"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  createCommunity,
  listCategories,
  uploadFile,
  ApiError,
  type Category,
} from "@/lib/api";
import BackButton from "@/components/BackButton";
import {
  Loader2,
  Globe,
  Lock,
  Users,
  AlertTriangle,
  Check,
  Hash,
  Camera,
  Info,
  Eye,
  Save,
  Sparkles,
  Shield,
  Bell,
} from "lucide-react";

type Visibility = "public" | "restricted" | "private";

const visibilityOptions = [
  {
    value: "public" as const,
    icon: Globe,
    label: "Public",
    desc: "Anyone can view, post, and comment",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    value: "restricted" as const,
    icon: Shield,
    label: "Restricted",
    desc: "Anyone can view, only approved users can post",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    value: "private" as const,
    icon: Lock,
    label: "Private",
    desc: "Only approved users can view and post",
    color: "text-red-500",
    bg: "bg-red-500/10",
  },
];

export default function CreateCommunityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { show: showToast, update: updateToast } = useToast();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sidebarText, setSidebarText] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");

  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const iconInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    listCategories(0, 50)
      .then((data) => setCategories(data.content))
      .catch(() => {})
      .finally(() => setCatLoading(false));
  }, []);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [authLoading, isAuthenticated, router]);

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIcon(true);
    try {
      const uploaded = await uploadFile({
        file,
        type: "COMMUNITY_ICON",
        fileName: file.name,
        description: "Community icon",
        isPublic: true,
        isNSFW: false,
      });
      setIconUrl(uploaded.fileUrl);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Icon upload failed", "error");
    } finally {
      setUploadingIcon(false);
      if (iconInputRef.current) iconInputRef.current.value = "";
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingBanner(true);
    try {
      const uploaded = await uploadFile({
        file,
        type: "COMMUNITY_BANNER",
        fileName: file.name,
        description: "Community banner",
        isPublic: true,
        isNSFW: false,
      });
      setBannerUrl(uploaded.fileUrl);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Banner upload failed", "error");
    } finally {
      setUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = "";
    }
  };

  const toggleCategory = (id: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !title.trim()) return;

    setSubmitting(true);
    setError("");
    setFieldErrors({});

    const toastId = showToast("Creating community...", "loading");

    try {
      const community = await createCommunity({
        name: name.trim(),
        title: title.trim(),
        description: description.trim(),
        sidebarText: sidebarText.trim(),
        isPublic: visibility === "public",
        isRestricted: visibility === "restricted",
        isOver18,
        categoryIds: selectedCategoryIds,
        iconImageUrl: iconUrl || undefined,
        headerImageUrl: bannerUrl || undefined,
      });
      updateToast(toastId, "Community created!", "success");
      router.push(`/community/${community.name}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        updateToast(toastId, err.message, "error");
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else if (err instanceof Error) {
        updateToast(toastId, err.message, "error");
        setError(err.message);
      } else {
        updateToast(toastId, "Failed to create community", "error");
        setError("Failed to create community. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = name.trim().length >= 3 && title.trim().length >= 1;
  const nameSlug = name.trim().toLowerCase().replace(/\s+/g, "-");
  const nameCharsLeft = 30 - name.length;
  const descCharsLeft = 500 - description.length;
  const iconInitials = title.trim()
    ? title
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "r/";

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.replace("/login");
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={32} className="animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl pb-8">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-background/85 px-4 py-3 backdrop-blur-2xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center gap-3">
          <BackButton fallback="/explore" />
          <div>
            <h1 className="text-lg font-bold">Create Community</h1>
            <p className="hidden sm:block text-xs text-muted">
              Start a new community for your topic
            </p>
          </div>
        </div>
        <button
          type="submit"
          form="create-community-form"
          disabled={!isFormValid || submitting}
          className="flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-bold text-background transition-all hover:opacity-80 disabled:opacity-30 shadow-lg shadow-foreground/10"
        >
          {submitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden sm:inline">Creating...</span>
            </>
          ) : (
            <>
              <Save size={16} />
              <span className="hidden sm:inline">Create</span>
            </>
          )}
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-8 lg:flex-row lg:gap-6">
        {/* Form */}
        <div className="flex-1">
          <form id="create-community-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Banner + Icon Section */}
            <div className="relative -mx-4 overflow-hidden md:-mx-0 md:rounded-3xl">
              <div
                className="relative aspect-[3/1] w-full bg-gradient-to-br from-accent/30 via-accent-2/20 to-accent/10"
                style={
                  bannerUrl
                    ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              >
                <button
                  type="button"
                  onClick={() => bannerInputRef.current?.click()}
                  disabled={uploadingBanner}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all hover:bg-black/25"
                >
                  <div
                    className="flex items-center gap-2 rounded-full bg-black/40 px-4 py-2 text-xs font-bold text-white backdrop-blur-sm opacity-0 transition-opacity hover:opacity-100"
                    style={{ opacity: uploadingBanner ? 1 : undefined }}
                  >
                    {uploadingBanner ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Camera size={14} />
                    )}
                    {bannerUrl ? "Change Banner" : "Add Banner"}
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

              {/* Icon overlay */}
              <div className="absolute -bottom-9 left-6 z-10">
                <div className="relative">
                  <div className="flex h-[72px] w-[72px] items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-xl font-black text-white shadow-xl ring-[3px] ring-background overflow-hidden">
                    {iconUrl ? (
                      <img src={iconUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <span>{iconInitials}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => iconInputRef.current?.click()}
                    disabled={uploadingIcon}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background shadow-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {uploadingIcon ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  </button>
                  <input
                    ref={iconInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleIconUpload}
                  />
                </div>
              </div>
            </div>

            {/* Spacer for icon overlap */}
            <div className="h-6" />

            {/* Name + Title */}
            <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
              <div className="flex items-center gap-2">
                <Info size={18} className="text-accent" />
                <h2 className="text-sm font-bold text-muted uppercase tracking-wide">Identity</h2>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Name</label>
                <div className="flex items-center rounded-2xl bg-surface ring-1 ring-border transition-all focus-within:ring-2 focus-within:ring-accent/40">
                  <span className="pl-4 text-sm font-semibold text-muted">r/</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))}
                    placeholder="community-name"
                    maxLength={30}
                    className="flex-1 bg-transparent px-2 py-3.5 text-sm outline-none placeholder:text-muted/50"
                  />
                  {name && (
                    <span className={`pr-4 text-xs tabular-nums ${nameCharsLeft <= 5 ? "text-red-500" : "text-muted"}`}>
                      {nameCharsLeft}
                    </span>
                  )}
                </div>
                {nameSlug && (
                  <p className="text-xs text-muted">
                    <span className="text-accent">/r/{nameSlug}</span>
                  </p>
                )}
                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="A catchy title for your community"
                  maxLength={100}
                  className="rounded-2xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border placeholder:text-muted/50 transition-all focus:ring-2 focus:ring-accent/40"
                />
                {fieldErrors.title && <p className="text-xs text-red-500">{fieldErrors.title}</p>}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this community about? Describe it to attract members..."
                  maxLength={500}
                  rows={4}
                  className="w-full resize-none rounded-2xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border placeholder:text-muted/50 transition-all focus:ring-2 focus:ring-accent/40"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted">Markdown supported</p>
                  <p className={`text-xs tabular-nums ${descCharsLeft <= 50 ? "text-red-500" : "text-muted"}`}>
                    {descCharsLeft}
                  </p>
                </div>
              </div>
            </div>

            {/* Visibility */}
            <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-accent" />
                <h2 className="text-sm font-bold text-muted uppercase tracking-wide">Visibility</h2>
              </div>

              <div className="flex flex-col gap-2">
                {visibilityOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setVisibility(opt.value)}
                    className={`group flex items-center gap-4 rounded-2xl px-4 py-3.5 text-left transition-all ${
                      visibility === opt.value
                        ? "bg-accent/10 ring-2 ring-accent/40 shadow-sm"
                        : "bg-surface ring-1 ring-border hover:bg-surface/80"
                    }`}
                  >
                    <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${visibility === opt.value ? "bg-accent text-white shadow-lg" : `${opt.bg} ${opt.color}`}`}>
                      <opt.icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{opt.label}</p>
                      <p className="text-xs text-muted">{opt.desc}</p>
                    </div>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all ${
                      visibility === opt.value ? "border-accent bg-accent" : "border-border"
                    }`}>
                      {visibility === opt.value && <Check size={14} className="text-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Rules / Sidebar */}
            <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-accent" />
                <h2 className="text-sm font-bold text-muted uppercase tracking-wide">Rules &amp; Sidebar</h2>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold">Sidebar Text</label>
                <textarea
                  value={sidebarText}
                  onChange={(e) => setSidebarText(e.target.value)}
                  placeholder="Community rules and sidebar content..."
                  maxLength={2000}
                  rows={5}
                  className="w-full resize-none rounded-2xl bg-surface px-4 py-3.5 text-sm outline-none ring-1 ring-border placeholder:text-muted/50 transition-all focus:ring-2 focus:ring-accent/40"
                />
                <p className="text-xs text-muted">{sidebarText.length}/2000 &middot; Markdown supported</p>
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-accent" />
                <h2 className="text-sm font-bold text-muted uppercase tracking-wide">Categories</h2>
              </div>

              {catLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 size={20} className="animate-spin text-muted" />
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryIds.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => toggleCategory(cat.id)}
                        className={`flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all active:scale-95 ${
                          isSelected
                            ? "bg-foreground text-background shadow-lg shadow-foreground/10"
                            : "bg-surface text-muted hover:bg-border hover:text-foreground"
                        }`}
                      >
                        {isSelected && <Check size={14} />}
                        {cat.name}
                      </button>
                    );
                  })}
                  {categories.length === 0 && !catLoading && (
                    <p className="py-2 text-sm text-muted">No categories available</p>
                  )}
                </div>
              )}
            </div>

            {/* NSFW + 18+ */}
            <div className="flex flex-col gap-4 rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={18} className={isOver18 ? "text-red-500" : "text-muted"} />
                    <h2 className="text-sm font-bold text-muted uppercase tracking-wide">18+ Content</h2>
                  </div>
                  <p className="mt-1.5 text-xs text-muted">This community contains adult themes and content</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOver18(!isOver18)}
                  className={`relative flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
                    isOver18 ? "bg-red-500" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                      isOver18 ? "translate-x-7" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 px-4 py-3.5 text-sm text-red-500">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Live Preview */}
        <div className="lg:w-72 lg:flex-shrink-0">
          <div className="lg:sticky lg:top-[88px]">
            <div className="mb-3 flex items-center gap-2">
              <Eye size={16} className="text-accent" />
              <p className="text-xs font-bold text-muted uppercase tracking-wide">Preview</p>
            </div>
            <div className="overflow-hidden rounded-3xl bg-card shadow-lg ring-1 ring-border">
              {/* Preview Banner */}
              <div
                className="aspect-[3/1] w-full bg-gradient-to-br from-accent/30 via-accent-2/20 to-accent/10"
                style={
                  bannerUrl
                    ? { backgroundImage: `url(${bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }
                    : undefined
                }
              />
              {/* Preview Info */}
              <div className="-mt-8 px-4 pb-5">
                <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent-2 text-lg font-black text-white shadow-lg ring-[3px] ring-card overflow-hidden">
                  {iconUrl ? (
                    <img src={iconUrl} alt="" loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    iconInitials
                  )}
                </div>
                <p className="text-lg font-black truncate">{title.trim() || "My Community"}</p>
                <p className="text-xs text-accent">r/{nameSlug || "community"}</p>
                {description.trim() && (
                  <p className="mt-2 text-xs text-muted line-clamp-3">{description.trim()}</p>
                )}
                {!description.trim() && (
                  <p className="mt-2 text-xs text-muted/50 italic">
                    Your community description will appear here
                  </p>
                )}
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    <span>1 member</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} />
                    <span>{visibility.charAt(0).toUpperCase() + visibility.slice(1)}</span>
                  </span>
                </div>
                {selectedCategoryIds.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {selectedCategoryIds.map((catId) => {
                      const cat = categories.find((c) => c.id === catId);
                      return cat ? (
                        <span
                          key={cat.id}
                          className="rounded-full bg-surface px-2.5 py-0.5 text-[10px] font-semibold"
                          style={cat.color ? { color: cat.color } : undefined}
                        >
                          {cat.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {isOver18 && (
                  <div className="mt-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-bold text-red-500">
                      <AlertTriangle size={10} />
                      18+
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
