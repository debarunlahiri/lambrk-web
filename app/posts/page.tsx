'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import BottomNavigation from '../components/BottomNavigation'
import { POSTS, type Post, shuffleArray } from '../constants/content'
import { useSidebar } from '../contexts/SidebarContext'

export default function PostsPage() {
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const [postInteractions, setPostInteractions] = useState<Record<number, { liked: boolean; disliked: boolean }>>({})

  const [posts, setPosts] = useState(POSTS)

  const handleLike = (postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const interaction = postInteractions[postId]
        if (interaction?.liked) {
          return { ...post, likes: post.likes - 1 }
        } else {
          const newLikes = interaction?.disliked ? post.likes + 2 : post.likes + 1
          const newDislikes = interaction?.disliked ? post.dislikes - 1 : post.dislikes
          setPostInteractions(prev => ({
            ...prev,
            [postId]: { liked: true, disliked: false }
          }))
          return { ...post, likes: newLikes, dislikes: newDislikes }
        }
      }
      return post
    }))
    setPostInteractions(prev => ({
      ...prev,
      [postId]: {
        liked: !prev[postId]?.liked,
        disliked: false
      }
    }))
  }

  const handleDislike = (postId: number) => {
    setPosts(prevPosts => prevPosts.map(post => {
      if (post.id === postId) {
        const interaction = postInteractions[postId]
        if (interaction?.disliked) {
          return { ...post, dislikes: post.dislikes - 1 }
        } else {
          const newDislikes = interaction?.liked ? post.dislikes + 2 : post.dislikes + 1
          const newLikes = interaction?.liked ? post.likes - 1 : post.likes
          setPostInteractions(prev => ({
            ...prev,
            [postId]: { liked: false, disliked: true }
          }))
          return { ...post, likes: newLikes, dislikes: newDislikes }
        }
      }
      return post
    }))
    setPostInteractions(prev => ({
      ...prev,
      [postId]: {
        liked: false,
        disliked: !prev[postId]?.disliked
      }
    }))
  }

  const handleShare = async (post: Post, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    const url = `${window.location.origin}/posts/detail?post=${post.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.content,
          url: url,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(url)
    }
  }

  useEffect(() => {
    // Shuffle on client-side only to prevent hydration mismatch
    setPosts(shuffleArray(POSTS))
  }, [])

  return (
    <main className="min-h-screen bg-dark-bg">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex pt-14">
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content - Posts Feed */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div className="p-4 lg:p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Posts</h1>
            
            <div className="max-w-2xl mx-auto space-y-6">
              {posts.map((post, index) => (
                <Link
                  key={post.id}
                  href={`/posts/detail?post=${post.id}`}
                  className="block"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-gray-800 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors cursor-pointer"
                  >
                  {/* Author Info */}
                  <div className="p-4 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-semibold">
                        {post.author.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-semibold text-sm">{post.author}</h4>
                        <p className="text-gray-400 text-xs">{post.time}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <h3 className="text-white font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">{post.content}</p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="px-4 pb-3">
                      <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-4 py-3 border-t border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        {/* Like Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLike(post.id)
                          }}
                          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <svg 
                            className={`w-5 h-5 ${postInteractions[post.id]?.liked ? 'text-blue-400 fill-blue-400' : ''}`} 
                            fill={postInteractions[post.id]?.liked ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span className="text-sm font-medium">
                            {post.likes > 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
                          </span>
                        </button>

                        {/* Dislike Button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDislike(post.id)
                          }}
                          className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <svg 
                            className={`w-5 h-5 ${postInteractions[post.id]?.disliked ? 'text-red-400 fill-red-400' : ''}`} 
                            fill={postInteractions[post.id]?.disliked ? 'currentColor' : 'none'} 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                          <span className="text-sm font-medium">
                            {post.dislikes > 1000 ? `${(post.dislikes / 1000).toFixed(1)}K` : post.dislikes}
                          </span>
                        </button>

                        {/* Comments Button */}
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            window.location.href = `/posts/detail?post=${post.id}`
                          }}
                          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          <span className="text-sm font-medium">
                            {post.comments > 1000 ? `${(post.comments / 1000).toFixed(1)}K` : post.comments}
                          </span>
                        </button>

                        {/* Share Button */}
                        <button 
                          onClick={(e) => handleShare(post, e)}
                          className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                          <span className="text-sm font-medium">
                            {post.shares > 1000 ? `${(post.shares / 1000).toFixed(1)}K` : post.shares}
                          </span>
                        </button>
                      </div>

                      {/* Save Button */}
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  </motion.div>
                </Link>
              ))}
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

