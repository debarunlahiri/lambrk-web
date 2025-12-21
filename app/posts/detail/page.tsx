'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '../../components/Header'
import Sidebar from '../../components/Sidebar'
import BottomNavigation from '../../components/BottomNavigation'
import { useAuth } from '../../contexts/AuthContext'
import { POSTS, type Post } from '../../constants/content'

interface Comment {
  id: number
  author: string
  authorAvatar?: string
  text: string
  likes: number
  dislikes: number
  time: string
  userLiked?: boolean
  userDisliked?: boolean
  replies?: Comment[]
}

function PostDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const postId = searchParams.get('post')
  const { user } = useAuth()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [postInteractions, setPostInteractions] = useState<{ liked: boolean; disliked: boolean }>({ liked: false, disliked: false })
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'John Doe',
      text: 'Great post! Really enjoyed reading this. Keep up the good work!',
      likes: 45,
      dislikes: 2,
      time: '2 hours ago',
      userLiked: false,
      userDisliked: false,
    },
    {
      id: 2,
      author: 'Jane Smith',
      text: 'This is exactly what I was looking for. Thanks for sharing such valuable information!',
      likes: 32,
      dislikes: 1,
      time: '5 hours ago',
      userLiked: false,
      userDisliked: false,
    },
    {
      id: 3,
      author: 'Tech Enthusiast',
      text: 'Amazing insights! The details you provided are very helpful. Looking forward to more posts like this.',
      likes: 28,
      dislikes: 0,
      time: '1 day ago',
      userLiked: false,
      userDisliked: false,
    },
  ])

  const [posts] = useState<Post[]>(POSTS)

  const currentPost = posts.find(p => p.id === Number(postId)) || posts[0]

  const handleLike = () => {
    if (postInteractions.liked) {
      setPostInteractions({ liked: false, disliked: false })
    } else {
      setPostInteractions({ liked: true, disliked: false })
    }
  }

  const handleDislike = () => {
    if (postInteractions.disliked) {
      setPostInteractions({ liked: false, disliked: false })
    } else {
      setPostInteractions({ liked: false, disliked: true })
    }
  }

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/detail?post=${currentPost.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentPost.title,
          text: currentPost.content,
          url: url,
        })
      } catch (err) {
        // User cancelled or error occurred
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  const handleCommentSubmit = () => {
    if (!user.isLoggedIn) {
      router.push('/login')
      return
    }
    if (newComment.trim()) {
      const comment: Comment = {
        id: comments.length + 1,
        author: user.isLoggedIn && user.name ? user.name : 'Anonymous',
        text: newComment.trim(),
        likes: 0,
        dislikes: 0,
        time: 'just now',
        userLiked: false,
        userDisliked: false,
      }
      setComments([comment, ...comments])
      setNewComment('')
    }
  }

  const handleCommentLike = (commentId: number) => {
    if (!user.isLoggedIn) {
      router.push('/login')
      return
    }
    setComments(comments.map(c => {
      if (c.id !== commentId) return c
      
      if (c.userLiked) {
        return {
          ...c,
          likes: c.likes - 1,
          userLiked: false
        }
      } else {
        const wasDisliked = c.userDisliked
        return {
          ...c,
          likes: c.likes + 1,
          dislikes: wasDisliked ? c.dislikes - 1 : c.dislikes,
          userLiked: true,
          userDisliked: false
        }
      }
    }))
  }

  const handleCommentDislike = (commentId: number) => {
    if (!user.isLoggedIn) {
      router.push('/login')
      return
    }
    setComments(comments.map(c => {
      if (c.id !== commentId) return c
      
      if (c.userDisliked) {
        return {
          ...c,
          dislikes: c.dislikes - 1,
          userDisliked: false
        }
      } else {
        const wasLiked = c.userLiked
        return {
          ...c,
          dislikes: c.dislikes + 1,
          likes: wasLiked ? c.likes - 1 : c.likes,
          userDisliked: true,
          userLiked: false
        }
      }
    }))
  }

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <main className="min-h-screen bg-dark-bg">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex pt-14">
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div className="p-4 lg:p-6">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <Link 
                href="/posts"
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span>Back to Posts</span>
              </Link>

              {/* Post Content */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
                {/* Author Info */}
                <div className="p-4 pb-3 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-white font-semibold text-lg">
                      {currentPost.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-semibold text-base">{currentPost.author}</h4>
                      <p className="text-gray-400 text-sm">{currentPost.time}</p>
                    </div>
                  </div>
                </div>

                {/* Post Title and Content */}
                <div className="p-4 pb-3">
                  <h1 className="text-2xl font-bold text-white mb-4">{currentPost.title}</h1>
                  <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line mb-4">{currentPost.content}</p>
                </div>

                {/* Post Image */}
                {currentPost.image && (
                  <div className="px-4 pb-3">
                    <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden">
                      <img
                        src={currentPost.image}
                        alt={currentPost.title}
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
                        onClick={handleLike}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg 
                          className={`w-6 h-6 ${postInteractions.liked ? 'text-blue-400 fill-blue-400' : ''}`} 
                          fill={postInteractions.liked ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span className="text-base font-medium">
                          {currentPost.likes > 1000 ? `${(currentPost.likes / 1000).toFixed(1)}K` : currentPost.likes}
                        </span>
                      </button>

                      {/* Dislike Button */}
                      <button 
                        onClick={handleDislike}
                        className="flex items-center gap-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <svg 
                          className={`w-6 h-6 ${postInteractions.disliked ? 'text-red-400 fill-red-400' : ''}`} 
                          fill={postInteractions.disliked ? 'currentColor' : 'none'} 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                        </svg>
                        <span className="text-base font-medium">
                          {currentPost.dislikes > 1000 ? `${(currentPost.dislikes / 1000).toFixed(1)}K` : currentPost.dislikes}
                        </span>
                      </button>

                      {/* Share Button */}
                      <button 
                        onClick={handleShare}
                        className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                        </svg>
                        <span className="text-base font-medium">
                          {currentPost.shares > 1000 ? `${(currentPost.shares / 1000).toFixed(1)}K` : currentPost.shares}
                        </span>
                      </button>
                    </div>

                    {/* Save Button */}
                    <button className="text-gray-400 hover:text-blue-400 transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* View Insights Section */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-3 mb-6">
                <h2 className="text-sm font-semibold text-white mb-3">View Insights</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-0.5">
                      {currentPost.views && currentPost.views > 1000 ? `${(currentPost.views / 1000).toFixed(1)}K` : currentPost.views || 0}
                    </div>
                    <div className="text-xs text-gray-400">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-0.5">
                      {currentPost.likes > 1000 ? `${(currentPost.likes / 1000).toFixed(1)}K` : currentPost.likes}
                    </div>
                    <div className="text-xs text-gray-400">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-0.5">
                      {currentPost.comments > 1000 ? `${(currentPost.comments / 1000).toFixed(1)}K` : currentPost.comments}
                    </div>
                    <div className="text-xs text-gray-400">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-white mb-0.5">
                      {currentPost.shares > 1000 ? `${(currentPost.shares / 1000).toFixed(1)}K` : currentPost.shares}
                    </div>
                    <div className="text-xs text-gray-400">Shares</div>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-xs text-gray-400">
                    <span className="text-white font-medium">Engagement Rate:</span> {currentPost.views ? ((currentPost.likes + currentPost.comments + currentPost.shares) / currentPost.views * 100).toFixed(2) : '0.00'}%
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-white mb-6">
                    {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                  </h2>
                  
                  {/* Add Comment Form */}
                  <div className="flex gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {user.isLoggedIn && user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={user.isLoggedIn ? "Add a comment..." : "Sign in to comment"}
                        className="w-full bg-transparent border-b border-gray-700 text-white placeholder-gray-500 pb-2 focus:outline-none focus:border-white resize-none disabled:cursor-not-allowed"
                        rows={1}
                        disabled={!user.isLoggedIn}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement
                          target.style.height = 'auto'
                          target.style.height = `${target.scrollHeight}px`
                        }}
                        onFocus={() => {
                          if (!user.isLoggedIn) {
                            router.push('/login')
                          }
                        }}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <button
                          onClick={() => setNewComment('')}
                          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCommentSubmit}
                          disabled={!newComment.trim() || !user.isLoggedIn}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-full text-white font-semibold text-sm transition-colors"
                        >
                          Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                        {comment.author.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="mb-1">
                          <span className="text-white font-semibold text-sm mr-2">
                            {comment.author}
                          </span>
                          <span className="text-gray-400 text-sm">{comment.time}</span>
                        </div>
                        <p className="text-white text-sm mb-2">{comment.text}</p>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleCommentLike(comment.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                                comment.userLiked
                                  ? 'text-blue-500 hover:text-blue-400'
                                  : 'text-gray-400 hover:text-white'
                              } ${!user.isLoggedIn ? 'opacity-60' : ''}`}
                            >
                              <svg 
                                className="w-5 h-5" 
                                fill={comment.userLiked ? 'currentColor' : 'none'} 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              <span className="text-sm">{comment.likes}</span>
                            </button>
                            <button
                              onClick={() => handleCommentDislike(comment.id)}
                              className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                                comment.userDisliked
                                  ? 'text-red-500 hover:text-red-400'
                                  : 'text-gray-400 hover:text-white'
                              } ${!user.isLoggedIn ? 'opacity-60' : ''}`}
                            >
                              <svg 
                                className="w-5 h-5 rotate-180" 
                                fill={comment.userDisliked ? 'currentColor' : 'none'} 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                              </svg>
                              <span className="text-sm">{comment.dislikes}</span>
                            </button>
                          </div>
                          <button className="text-gray-400 hover:text-white text-sm transition-colors">
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </main>
  )
}

export default function PostDetailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-dark-bg flex items-center justify-center text-white">Loading...</div>}>
      <PostDetailContent />
    </Suspense>
  )
}

