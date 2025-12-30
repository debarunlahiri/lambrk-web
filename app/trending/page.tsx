'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import BottomNavigation from '../components/BottomNavigation'
import { TRENDING_VIDEOS, TRENDING_BITS, TRENDING_POSTS, shuffleArray } from '../constants/content'
import { useSidebar } from '../contexts/SidebarContext'

export default function TrendingPage() {
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const [trendingVideos, setTrendingVideos] = useState(TRENDING_VIDEOS)
  const [trendingBits, setTrendingBits] = useState(TRENDING_BITS)
  const [trendingPosts, setTrendingPosts] = useState(TRENDING_POSTS)

  useEffect(() => {
    // Shuffle on client-side only to prevent hydration mismatch
    setTrendingVideos(shuffleArray(TRENDING_VIDEOS))
    setTrendingBits(shuffleArray(TRENDING_BITS))
    setTrendingPosts(shuffleArray(TRENDING_POSTS))
  }, [])

  return (
    <main className="min-h-screen bg-dark-bg">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex pt-14">
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div className="p-4 lg:p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Trending Now</h1>
            
            <div className="space-y-8">
              {/* Trending Videos Section */}
              <div>
                <h2 className="text-xl font-semibold text-white mb-4">Trending Videos</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trendingVideos.map((video, index) => (
                    <Link
                      key={video.id}
                      href={`/watch?v=${video.id}`}
                    >
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="cursor-pointer"
                      >
                        <div className="relative group">
                          {/* Thumbnail */}
                          <div className="relative w-full aspect-video bg-gray-800 rounded-lg overflow-hidden mb-2">
                            <video
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              onMouseEnter={(e) => {
                                const target = e.target as HTMLVideoElement
                                target.play()
                              }}
                              onMouseLeave={(e) => {
                                const target = e.target as HTMLVideoElement
                                target.pause()
                                target.currentTime = 0
                              }}
                            >
                              <source src={video.thumbnail} type="video/mp4" />
                            </video>
                            {/* Duration Badge */}
                            <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded">
                              {video.duration}
                            </div>
                            {/* Trending Badge */}
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              Trending
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex gap-3">
                            {/* Channel Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                              {video.channel.charAt(0)}
                            </div>

                            {/* Title and Metadata */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                                {video.title}
                              </h3>
                              <p className="text-xs text-gray-400">{video.channel}</p>
                              <p className="text-xs text-gray-400">
                                {video.views} • {video.time}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Bits Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Trending Bitz</h2>
                  <Link href="/bits" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                    <span>View All</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trendingBits.map((bit, index) => (
                    <Link key={bit.id} href={`/bits?bit=${bit.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="cursor-pointer"
                      >
                        <div className="relative group">
                          {/* Thumbnail */}
                          <div className="relative w-full aspect-[4/5] bg-gray-800 rounded-lg overflow-hidden mb-2">
                            <video
                              className="w-full h-full object-cover"
                              muted
                              loop
                              playsInline
                              onMouseEnter={(e) => {
                                const target = e.target as HTMLVideoElement
                                target.play()
                              }}
                              onMouseLeave={(e) => {
                                const target = e.target as HTMLVideoElement
                                target.pause()
                                target.currentTime = 0
                              }}
                            >
                              <source src={bit.video} type="video/mp4" />
                            </video>
                            {/* Trending Badge */}
                            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              Trending
                            </div>
                          </div>

                          {/* Video Info */}
                          <div className="flex gap-3">
                            {/* Channel Avatar */}
                            <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                              {bit.channel.charAt(0)}
                            </div>

                            {/* Title and Metadata */}
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-medium text-white line-clamp-2 mb-1 group-hover:text-blue-400 transition-colors">
                                {bit.title}
                              </h3>
                              <p className="text-xs text-gray-400">{bit.channel}</p>
                              <p className="text-xs text-gray-400">
                                {bit.views} views • {bit.time}
                              </p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-gray-500">
                                  {bit.likes > 1000 ? `${(bit.likes / 1000).toFixed(1)}K` : bit.likes} likes
                                </span>
                                <span className="text-xs text-gray-500">
                                  {bit.comments > 1000 ? `${(bit.comments / 1000).toFixed(1)}K` : bit.comments} comments
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Trending Posts Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Trending Posts</h2>
                  <Link href="/posts" className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium">
                    <span>View All</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {trendingPosts.map((post, index) => (
                    <Link key={post.id} href={`/posts/detail?post=${post.id}`}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className={`bg-gray-800 rounded-lg p-4 border border-gray-700 cursor-pointer hover:border-gray-600 transition-colors ${!post.image ? 'self-start' : ''}`}
                      >
                        {/* Author Info */}
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-semibold text-xs">
                            {post.author.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-semibold text-xs truncate">{post.author}</h4>
                            <p className="text-gray-400 text-xs">{post.time}</p>
                          </div>
                          {/* Trending Badge */}
                          <div className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-semibold flex items-center gap-1">
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                        </div>

                        {/* Post Image */}
                        {post.image && (
                          <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden mb-2">
                            <img
                              src={post.image}
                              alt={post.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        {/* Post Title */}
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">{post.title}</h3>

                        {/* Post Content */}
                        <p className="text-gray-300 text-xs mb-3 leading-relaxed line-clamp-3">{post.content}</p>

                        {/* Post Actions */}
                        <div className="flex items-center gap-4 pt-2 border-t border-gray-700">
                          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            <span className="text-xs">{post.likes > 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                            </svg>
                            <span className="text-xs">{post.dislikes > 1000 ? `${(post.dislikes / 1000).toFixed(1)}K` : post.dislikes}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <span className="text-xs">{post.comments > 1000 ? `${(post.comments / 1000).toFixed(1)}K` : post.comments}</span>
                          </button>
                          <button className="flex items-center gap-1 text-gray-400 hover:text-blue-400 transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                            </svg>
                            <span className="text-xs">{post.shares > 1000 ? `${(post.shares / 1000).toFixed(1)}K` : post.shares}</span>
                          </button>
                        </div>
                      </motion.div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for bottom navigation on mobile */}
      <div className="h-16 lg:hidden" />
      <BottomNavigation />
    </main>
  )
}

