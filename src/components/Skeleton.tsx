"use client";

export function SkeletonPulse({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-surface ${className}`} />
  );
}

export function PostSkeleton() {
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-sm ring-1 ring-border p-4">
      <div className="flex items-center gap-2 mb-3">
        <SkeletonPulse className="h-9 w-9 rounded-full" />
        <div className="flex flex-col gap-1.5 flex-1">
          <SkeletonPulse className="h-4 w-24 rounded-full" />
          <SkeletonPulse className="h-3 w-16 rounded-full" />
        </div>
      </div>
      <SkeletonPulse className="h-4 w-3/4 rounded-full mb-2" />
      <SkeletonPulse className="h-4 w-1/2 rounded-full mb-3" />
      <SkeletonPulse className="aspect-video rounded-2xl mb-3" />
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-8 w-20 rounded-full" />
        <SkeletonPulse className="h-8 w-20 rounded-full" />
        <SkeletonPulse className="h-8 w-20 rounded-full" />
      </div>
    </div>
  );
}

export function PostSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostSkeleton key={i} />
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-6 pb-8">
      <SkeletonPulse className="aspect-[3/1] w-full rounded-3xl" />
      <div className="px-2 space-y-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <SkeletonPulse className="h-7 w-48 rounded-full" />
            <SkeletonPulse className="h-4 w-32 rounded-full" />
          </div>
          <SkeletonPulse className="h-10 w-28 rounded-full" />
        </div>
        <SkeletonPulse className="h-4 w-3/4 rounded-full" />
        <div className="flex gap-4">
          <SkeletonPulse className="h-4 w-24 rounded-full" />
          <SkeletonPulse className="h-4 w-32 rounded-full" />
        </div>
        <div className="flex gap-5">
          <SkeletonPulse className="h-4 w-20 rounded-full" />
          <SkeletonPulse className="h-4 w-20 rounded-full" />
        </div>
      </div>
      <div className="flex gap-1 rounded-2xl bg-surface p-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-9 flex-1 rounded-xl" />
        ))}
      </div>
      <PostSkeletonList count={2} />
    </div>
  );
}

export function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <SkeletonPulse className="h-12 w-12 rounded-full shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <SkeletonPulse className="h-4 w-32 rounded-full" />
        <SkeletonPulse className="h-3 w-24 rounded-full" />
      </div>
    </div>
  );
}

export function CommunityCardSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-sm ring-1 ring-border">
      <SkeletonPulse className="h-12 w-12 rounded-2xl shrink-0" />
      <div className="flex flex-col gap-1.5 flex-1">
        <SkeletonPulse className="h-4 w-32 rounded-full" />
        <SkeletonPulse className="h-3 w-40 rounded-full" />
      </div>
    </div>
  );
}

export function SearchSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-1 rounded-full bg-surface p-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonPulse key={i} className="h-9 flex-1 rounded-full" />
        ))}
      </div>
      <PostSkeletonList count={3} />
      <div className="flex flex-col gap-3">
        <UserCardSkeleton />
        <UserCardSkeleton />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <SkeletonPulse key={i} className="h-16 rounded-2xl" />
      ))}
    </div>
  );
}

export function FileGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonPulse key={i} className="aspect-square rounded-2xl" />
      ))}
    </div>
  );
}
