"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Globe,
  Lock,
  Users,
  AlertTriangle,
  Check,
  Hash,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createCommunity,
  listCategories,
  ApiError,
  type Category,
} from "@/lib/api";

type Visibility = "public" | "restricted" | "private";

export default function CreateCommunityPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sidebarText, setSidebarText] = useState("");
  const [isOver18, setIsOver18] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [categories, setCategories] = useState<Category[]>([]);
  const [catLoading, setCatLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

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
      });
      router.push(`/community/${community.name}`);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to create community. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const isFormValid = name.trim().length >= 3 && title.trim().length >= 1;
  const nameSlug = name.trim().toLowerCase().replace(/\s+/g, "-");

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 size={32} className="animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-xl">
      <div className="sticky top-0 z-10 -mx-4 mb-4 flex items-center gap-3 bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:mb-6 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <Link
          href="/explore"
          className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Create Community</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Basic info */}
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Globe size={18} className="text-muted" />
            <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
              Basic Info
            </h2>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium">Community Name</label>
            <div className="flex items-center rounded-2xl bg-surface ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/40 transition-all">
              <span className="pl-4 text-sm text-muted">r/</span>
              <input
                type="text"
                value={name}
                onChange={(e) =>
                  setName(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ""))
                }
                placeholder="community-name"
                maxLength={30}
                className="flex-1 bg-transparent px-2 py-3 text-sm outline-none"
              />
            </div>
            {nameSlug && (
              <p className="text-xs text-muted">
                Your community will be at{" "}
                <span className="text-accent">/r/{nameSlug}</span>
              </p>
            )}
            {fieldErrors.name && (
              <p className="text-xs text-red-500">{fieldErrors.name}</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="A catchy title for your community"
              maxLength={100}
              className="rounded-2xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-accent/40 transition-all"
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-500">{fieldErrors.title}</p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this community about?"
              maxLength={500}
              rows={3}
              className="w-full resize-none rounded-2xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-accent/40 transition-all placeholder:text-muted/50"
            />
            <p className="text-xs text-muted">
              {description.length}/500 characters
            </p>
          </div>
        </div>

        {/* Rules / Sidebar */}
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Hash size={18} className="text-muted" />
            <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
              Rules &amp; Sidebar
            </h2>
          </div>

          <div className="mt-4 flex flex-col gap-1">
            <label className="text-sm font-medium">Sidebar Text (Rules)</label>
            <textarea
              value={sidebarText}
              onChange={(e) => setSidebarText(e.target.value)}
              placeholder="Community rules and sidebar content..."
              maxLength={2000}
              rows={4}
              className="w-full resize-none rounded-2xl bg-surface px-4 py-3 text-sm outline-none ring-1 ring-border focus:ring-2 focus:ring-accent/40 transition-all placeholder:text-muted/50"
            />
            <p className="text-xs text-muted">Markdown supported</p>
          </div>
        </div>

        {/* Visibility */}
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Users size={18} className="text-muted" />
            <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
              Visibility
            </h2>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {(
              [
                {
                  value: "public" as const,
                  icon: Globe,
                  label: "Public",
                  desc: "Anyone can view, post, and comment",
                },
                {
                  value: "restricted" as const,
                  icon: Lock,
                  label: "Restricted",
                  desc: "Anyone can view, only approved users can post",
                },
                {
                  value: "private" as const,
                  icon: Lock,
                  label: "Private",
                  desc: "Only approved users can view and post",
                },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setVisibility(opt.value)}
                className={`flex items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all ${
                  visibility === opt.value
                    ? "bg-accent/10 ring-2 ring-accent/40"
                    : "bg-surface ring-1 ring-border hover:bg-surface/80"
                }`}
              >
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    visibility === opt.value
                      ? "bg-accent text-white"
                      : "bg-card text-muted"
                  }`}
                >
                  <opt.icon size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold">{opt.label}</p>
                  <p className="text-xs text-muted">{opt.desc}</p>
                </div>
                {visibility === opt.value && (
                  <Check size={20} className="text-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* NSFW toggle */}
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-muted" />
                <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
                  18+ Content
                </h2>
              </div>
              <p className="mt-1 text-xs text-muted">
                Mark this community as containing adult content
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOver18(!isOver18)}
              className={`relative flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                isOver18 ? "bg-red-500" : "bg-border"
              }`}
            >
              <span
                className={`absolute h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                  isOver18 ? "translate-x-6" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-3xl bg-card p-5 shadow-sm ring-1 ring-border md:p-6">
          <div className="mb-1 flex items-center gap-2">
            <Hash size={18} className="text-muted" />
            <h2 className="text-sm font-bold text-muted uppercase tracking-wide">
              Categories
            </h2>
          </div>

          {catLoading ? (
            <div className="flex items-center justify-center py-6 text-muted">
              <Loader2 size={20} className="animate-spin" />
            </div>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-all active:scale-95 ${
                      isSelected
                        ? "bg-foreground text-background"
                        : "bg-surface text-muted hover:text-foreground hover:bg-surface/80"
                    }`}
                    style={
                      isSelected && cat.color
                        ? { backgroundColor: cat.color, color: "#fff" }
                        : cat.color && !isSelected
                          ? { color: cat.color }
                          : undefined
                    }
                  >
                    {cat.name}
                  </button>
                );
              })}
              {categories.length === 0 && !catLoading && (
                <p className="text-xs text-muted py-2">No categories available</p>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 border-t border-border pt-4">
          <Link
            href="/explore"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-muted transition-colors hover:text-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!isFormValid || submitting}
            className="flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-sm font-bold text-background transition-all hover:opacity-80 active:scale-95 disabled:opacity-30 disabled:active:scale-100"
          >
            {submitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Creating...
              </>
            ) : (
              <>Create Community</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
