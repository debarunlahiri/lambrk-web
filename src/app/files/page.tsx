"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Film,
  Upload,
  Download,
  Trash2,
  Loader2,
  Search,
  X,
  ExternalLink,
  HardDrive,
  FileImage,
  FileVideo,
  UserCircle,
  AlertTriangle,
  Info,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  listUserFiles,
  listFilesByType,
  uploadFile,
  deleteFile,
  getFileStats,
  searchFiles,
  ApiError,
  type ApiFile,
  type FileStats,
} from "@/lib/api";

type FileFilter = "all" | "POST_IMAGE" | "POST_VIDEO" | "AVATAR";

const filters: { key: FileFilter; label: string; icon: typeof ImageIcon }[] = [
  { key: "all", label: "All", icon: ImageIcon },
  { key: "POST_IMAGE", label: "Images", icon: FileImage },
  { key: "POST_VIDEO", label: "Videos", icon: FileVideo },
  { key: "AVATAR", label: "Avatars", icon: UserCircle },
];

function formatSize(bytes: number): string {
  if (bytes >= 1_000_000_000) return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function FilesPage() {
  const { isAuthenticated } = useAuth();
  const [files, setFiles] = useState<ApiFile[]>([]);
  const [stats, setStats] = useState<FileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FileFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ApiFile[]>([]);
  const [searchActive, setSearchActive] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<ApiFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const fetchFiles = () => {
    setLoading(true);
    setError("");
    let promise;
    if (filter === "all") {
      promise = listUserFiles(0, 50);
    } else {
      promise = listFilesByType(filter, 0, 50);
    }
    promise
      .then((data) => setFiles(data.content))
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load files")
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getFileStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) return;
    fetchFiles();
  }, [filter]);

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSearchActive(false);
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchActive(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchFiles(query.trim(), 50);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
    setSearchResults([]);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError("");
    try {
      const mimeType = file.type;
      const isVideo = mimeType.startsWith("video/");
      const type = isVideo ? "POST_VIDEO" : mimeType.startsWith("image/") ? "POST_IMAGE" : "POST_IMAGE";
      const uploaded = await uploadFile({
        file,
        type,
        fileName: file.name,
        isPublic: true,
        isNSFW: false,
      });
      setFiles((prev) => [uploaded, ...prev]);
      if (stats) {
        setStats({
          ...stats,
          totalFiles: stats.totalFiles + 1,
          totalSize: stats.totalSize + (uploaded.fileSize || 0),
          imageCount: stats.imageCount + (isVideo ? 0 : 1),
          videoCount: stats.videoCount + (isVideo ? 1 : 0),
        });
      }
    } catch (err: unknown) {
      setUploadError(
        err instanceof Error ? err.message : "Upload failed"
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (fileId: number) => {
    setDeleting(fileId);
    try {
      await deleteFile(fileId);
      setFiles((prev) => prev.filter((f) => f.fileId !== fileId));
      setSearchResults((prev) => prev.filter((f) => f.fileId !== fileId));
      if (selectedFile?.fileId === fileId) setSelectedFile(null);
      if (stats) {
        const deleted = files.find((f) => f.fileId === fileId);
        setStats({
          ...stats,
          totalFiles: stats.totalFiles - 1,
          totalSize: stats.totalSize - (deleted?.fileSize || 0),
        });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete file");
    } finally {
      setDeleting(null);
    }
  };

  const displayedFiles = searchActive ? searchResults : files;

  return (
    <div className="flex flex-col gap-6 pb-8">
      {/* Header */}
      <div className="sticky top-0 z-10 -mx-4 flex items-center justify-between bg-background/80 px-4 py-3 backdrop-blur-xl md:-mx-0 md:bg-transparent md:px-0 md:backdrop-blur-none">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex h-10 w-10 items-center justify-center rounded-full transition-all hover:bg-surface active:scale-95"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-lg font-bold">Files</h1>
            <p className="text-xs text-muted hidden sm:block">
              Manage your uploaded media
            </p>
          </div>
        </div>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-bold text-background transition-all hover:opacity-80 active:scale-95 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          <span className="hidden sm:inline">Upload</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
            <p className="text-xs text-muted">Files</p>
            <p className="text-lg font-black tabular-nums">{stats.totalFiles}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
            <p className="text-xs text-muted">Size</p>
            <p className="text-lg font-black tabular-nums">{formatSize(stats.totalSize)}</p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
            <p className="text-xs text-muted">Images</p>
            <p className="text-lg font-black tabular-nums">
              <span className="text-accent">{stats.imageCount}</span>
            </p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border">
            <p className="text-xs text-muted">Videos</p>
            <p className="text-lg font-black tabular-nums">
              <span className="text-accent-2">{stats.videoCount}</span>
            </p>
          </div>
          <div className="rounded-2xl bg-card p-3 shadow-sm ring-1 ring-border col-span-2 sm:col-span-1">
            <p className="text-xs text-muted">Avatars</p>
            <p className="text-lg font-black tabular-nums">{stats.avatarCount}</p>
          </div>
        </div>
      )}

      {statsLoading && (
        <div className="flex gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 flex-1 animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-2xl bg-card px-3 py-2 shadow-sm ring-1 ring-border focus-within:ring-2 focus-within:ring-accent/40 transition-all flex-1 max-w-sm">
          <Search size={16} className="text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search files..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted/60"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-surface text-muted hover:bg-border hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        <div className="flex gap-1 rounded-full bg-surface p-1">
          {filters.map((f) => {
            const Icon = f.icon;
            const isActive = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => {
                  setFilter(f.key);
                  setSearchActive(false);
                  setSearchQuery("");
                  setSearchResults([]);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted hover:text-foreground"
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={handleUpload}
      />

      {/* Upload error */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-500 animate-in fade-in slide-in-from-top-1">
          <AlertTriangle size={16} />
          {uploadError}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <AlertTriangle size={32} className="opacity-40" />
          <p className="text-sm font-bold">Failed to load files</p>
          <p className="text-xs">{error}</p>
          <button
            onClick={() => fetchFiles()}
            className="mt-2 rounded-full bg-surface px-4 py-1.5 text-xs font-medium transition-colors hover:bg-border"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && !searchActive && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="aspect-square animate-pulse rounded-2xl bg-surface"
            />
          ))}
        </div>
      )}

      {/* Search loading */}
      {searchActive && searchLoading && (
        <div className="flex items-center justify-center py-12 text-muted">
          <Loader2 size={28} className="animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && !searchActive && files.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-16 text-muted ring-1 ring-border">
          <ImageIcon size={40} className="opacity-30" />
          <p className="text-lg font-bold">No files yet</p>
          <p className="text-sm">Upload images or videos to get started</p>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="mt-3 flex items-center gap-2 rounded-full bg-foreground px-4 py-2 text-sm font-bold text-background transition-opacity hover:opacity-80"
          >
            <Upload size={16} />
            Upload
          </button>
        </div>
      )}

      {/* Search empty */}
      {searchActive && !searchLoading && searchResults.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-3xl bg-card py-12 text-muted ring-1 ring-border">
          <Search size={32} className="opacity-40" />
          <p className="text-sm font-bold">No results</p>
          <p className="text-xs">Try a different search term</p>
        </div>
      )}

      {/* File grid */}
      {!loading && displayedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {displayedFiles.map((file) => {
            const isVideo = file.mimeType?.startsWith("video/");
            return (
              <div
                key={file.fileId}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl bg-surface shadow-sm ring-1 ring-border transition-all hover:shadow-md"
                onClick={() => setSelectedFile(file)}
              >
                {isVideo ? (
                  <video
                    src={file.fileUrl}
                    className="h-full w-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={file.fileUrl}
                    alt={file.altText || file.originalFileName}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex flex-col justify-between bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex justify-end p-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(file.fileId);
                      }}
                      disabled={deleting === file.fileId}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-all hover:bg-red-600 active:scale-90 disabled:opacity-50"
                    >
                      {deleting === file.fileId ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                    </button>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs text-white/90">
                      {file.originalFileName}
                    </p>
                    <p className="text-[10px] text-white/60">
                      {formatSize(file.fileSize || 0)}
                    </p>
                  </div>
                </div>

                {/* Type badge */}
                <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                  {isVideo ? <Film size={10} /> : <ImageIcon size={10} />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail modal */}
      {selectedFile && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm animate-in fade-in duration-150"
            onClick={() => setSelectedFile(null)}
          />
          <div className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-lg rounded-3xl bg-card shadow-2xl ring-1 ring-border animate-in slide-in-from-bottom-4 fade-in duration-200 sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:slide-in-from-bottom-0 sm:zoom-in-95">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold">File Details</h2>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-surface transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Preview */}
              <div className="mb-4 aspect-video w-full overflow-hidden rounded-2xl bg-surface">
                {selectedFile.mimeType?.startsWith("video/") ? (
                  <video
                    src={selectedFile.fileUrl}
                    className="h-full w-full object-cover"
                    controls
                  />
                ) : (
                  <img
                    src={selectedFile.fileUrl}
                    alt={selectedFile.originalFileName}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>

              {/* Metadata */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Name</span>
                  <span className="font-medium truncate ml-4">{selectedFile.originalFileName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Type</span>
                  <span className="font-medium">{selectedFile.type || selectedFile.mimeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Size</span>
                  <span className="font-medium">{formatSize(selectedFile.fileSize || 0)}</span>
                </div>
                {selectedFile.description && (
                  <div className="flex justify-between">
                    <span className="text-muted">Description</span>
                    <span className="font-medium truncate ml-4">{selectedFile.description}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted">Uploaded</span>
                  <span className="font-medium">{formatDate(selectedFile.uploadedAt)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Public</span>
                  <span className="font-medium">{selectedFile.isPublic ? "Yes" : "No"}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex gap-2">
                <a
                  href={selectedFile.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-border"
                >
                  <ExternalLink size={16} />
                  Open
                </a>
                <a
                  href={selectedFile.fileUrl}
                  download
                  className="flex flex-1 items-center justify-center gap-2 rounded-full bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-border"
                >
                  <Download size={16} />
                  Download
                </a>
                <button
                  onClick={() => {
                    const id = selectedFile.fileId;
                    setSelectedFile(null);
                    handleDelete(id);
                  }}
                  disabled={deleting === selectedFile.fileId}
                  className="flex items-center justify-center gap-2 rounded-full bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/20 disabled:opacity-50"
                >
                  {deleting === selectedFile.fileId ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
