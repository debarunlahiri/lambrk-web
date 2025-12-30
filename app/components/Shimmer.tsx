'use client'

interface ShimmerProps {
  className?: string
}

export function Shimmer({ className = '' }: ShimmerProps) {
  return (
    <div className={`shimmer rounded ${className}`} />
  )
}

// Video Card Skeleton
export function VideoCardSkeleton() {
  return (
    <div className="cursor-pointer">
      <div className="relative group">
        {/* Thumbnail */}
        <div className="relative w-full aspect-video shimmer rounded-lg overflow-hidden mb-2" />
        
        {/* Video Info */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
          
          {/* Title and Metadata */}
          <div className="flex-1 min-w-0">
            <div className="h-4 shimmer rounded w-full mb-2" />
            <div className="h-3 shimmer rounded w-3/4 mb-1" />
            <div className="h-3 shimmer rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Bit Card Skeleton (vertical video)
export function BitCardSkeleton() {
  return (
    <div className="cursor-pointer">
      <div className="relative group">
        {/* Thumbnail */}
        <div className="relative w-full aspect-[4/5] shimmer rounded-lg overflow-hidden mb-2" />
        
        {/* Video Info */}
        <div className="flex gap-3">
          {/* Channel Avatar */}
          <div className="w-10 h-10 rounded-full shimmer flex-shrink-0" />
          
          {/* Title and Metadata */}
          <div className="flex-1 min-w-0">
            <div className="h-4 shimmer rounded w-full mb-2" />
            <div className="h-3 shimmer rounded w-3/4 mb-1" />
            <div className="h-3 shimmer rounded w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Post Card Skeleton
export function PostCardSkeleton() {
  return (
    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
      {/* Author Info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full shimmer flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="h-3 shimmer rounded w-24 mb-1" />
          <div className="h-2 shimmer rounded w-16" />
        </div>
      </div>

      {/* Post Image */}
      <div className="relative w-full aspect-video shimmer rounded-lg overflow-hidden mb-2" />

      {/* Post Title */}
      <div className="h-4 shimmer rounded w-3/4 mb-2" />

      {/* Post Content */}
      <div className="h-3 shimmer rounded w-full mb-1" />
      <div className="h-3 shimmer rounded w-5/6 mb-3" />

      {/* Post Actions */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-700">
        <div className="h-4 shimmer rounded w-12" />
        <div className="h-4 shimmer rounded w-12" />
        <div className="h-4 shimmer rounded w-12" />
        <div className="h-4 shimmer rounded w-12" />
      </div>
    </div>
  )
}

// Skeleton grid wrapper for loading states
export function SkeletonGrid({ 
  count = 4, 
  type = 'video' 
}: { 
  count?: number
  type?: 'video' | 'bit' | 'post' 
}) {
  const SkeletonComponent = type === 'video' 
    ? VideoCardSkeleton 
    : type === 'bit' 
      ? BitCardSkeleton 
      : PostCardSkeleton

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </>
  )
}
