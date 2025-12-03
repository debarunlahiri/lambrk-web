'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

interface User {
  isLoggedIn: boolean
  name?: string
  email?: string
  profileImage?: string
}

interface Video {
  id: number
  title: string
  channel: string
  views: string
  time: string
  thumbnail: string
  duration: string
  channelAvatar: string | null
  description?: string
}

export default function WatchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const videoId = searchParams.get('v')
  
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [user, setUser] = useState<User>({ isLoggedIn: false })
  const [isPlaying, setIsPlaying] = useState(false)
  const [likes, setLikes] = useState(12400)
  const [dislikes, setDislikes] = useState(320)
  const [userLike, setUserLike] = useState<'liked' | 'disliked' | null>(null)

  useEffect(() => {
    setIsLoaded(true)
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    router.push('/')
  }

  const videos: Video[] = [
    {
      id: 1,
      title: 'The Future of Streaming - 8K 60fps Experience',
      channel: 'Lambrk Official',
      views: '1.2M views',
      time: '2 days ago',
      thumbnail: '/video/7644958-uhd_4096_2160_24fps.mp4',
      duration: '12:34',
      channelAvatar: null,
      description: 'Experience the future of streaming with ultra-high definition 8K resolution at 60 frames per second. Discover how cutting-edge technology delivers an unparalleled viewing experience with crystal-clear visuals and smooth motion.',
    },
    {
      id: 2,
      title: 'Dolby Vision & Atmos - Premium Audio Visual Experience',
      channel: 'Lambrk Tech',
      views: '856K views',
      time: '5 days ago',
      thumbnail: '/video/1536315-hd_1920_1080_30fps.mp4',
      duration: '8:45',
      channelAvatar: null,
      description: 'Immerse yourself in the ultimate audio-visual experience with Dolby Vision HDR and Dolby Atmos surround sound. Learn how these technologies transform your viewing experience.',
    },
    {
      id: 3,
      title: 'AI-Powered Recommendations Explained',
      channel: 'Lambrk AI',
      views: '432K views',
      time: '1 week ago',
      thumbnail: '/video/7644958-uhd_4096_2160_24fps.mp4',
      duration: '15:22',
      channelAvatar: null,
      description: 'Discover how artificial intelligence powers our recommendation system to help you find content you will love.',
    },
    {
      id: 4,
      title: 'Multi-Device Streaming Setup Guide',
      channel: 'Lambrk Official',
      views: '234K views',
      time: '2 weeks ago',
      thumbnail: '/video/1536315-hd_1920_1080_30fps.mp4',
      duration: '6:18',
      channelAvatar: null,
      description: 'Learn how to seamlessly stream across all your devices with our comprehensive setup guide.',
    },
    {
      id: 5,
      title: 'RAW Quality Streaming - What You Need to Know',
      channel: 'Lambrk Tech',
      views: '189K views',
      time: '3 weeks ago',
      thumbnail: '/video/7644958-uhd_4096_2160_24fps.mp4',
      duration: '10:55',
      channelAvatar: null,
      description: 'Understand RAW quality streaming and how it delivers the most authentic viewing experience possible.',
    },
    {
      id: 6,
      title: 'HDR Support and Color Accuracy',
      channel: 'Lambrk Official',
      views: '156K views',
      time: '1 month ago',
      thumbnail: '/video/1536315-hd_1920_1080_30fps.mp4',
      duration: '9:30',
      channelAvatar: null,
      description: 'Explore High Dynamic Range (HDR) technology and its impact on color accuracy and visual fidelity.',
    },
    {
      id: 7,
      title: 'Fast Streaming Technology Deep Dive',
      channel: 'Lambrk Tech',
      views: '98K views',
      time: '1 month ago',
      thumbnail: '/video/7644958-uhd_4096_2160_24fps.mp4',
      duration: '14:12',
      channelAvatar: null,
      description: 'Dive deep into our fast streaming technology and learn how we minimize buffering and maximize quality.',
    },
    {
      id: 8,
      title: 'Getting Started with Lambrk Platform',
      channel: 'Lambrk Official',
      views: '67K views',
      time: '2 months ago',
      thumbnail: '/video/1536315-hd_1920_1080_30fps.mp4',
      duration: '7:45',
      channelAvatar: null,
      description: 'A comprehensive guide to getting started with the Lambrk streaming platform.',
    },
  ]

  const currentVideo = videos.find(v => v.id === Number(videoId)) || videos[0]
  const relatedVideos = videos.filter(v => v.id !== currentVideo.id).slice(0, 4)

  const sidebarItems = [
    { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: false },
    { name: 'Trending', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { name: 'Subscriptions', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z' },
    { name: 'Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { name: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Your videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z' },
    { name: 'Watch later', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Liked videos', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
  ]

  return (
    <main className="min-h-screen bg-dark-bg">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg border-b border-gray-800 px-2 sm:px-4 h-14">
        <div className="h-full grid grid-cols-[auto_1fr_auto] items-center gap-2 sm:gap-4 w-full">
          {/* Left Section: Hamburger Menu and Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-800 rounded-full transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <Link href="/" onClick={handleHomeClick} className="flex items-center gap-2">
              <div className="text-base sm:text-xl font-bold text-white whitespace-nowrap">Lambrk</div>
            </Link>
          </div>

          {/* Middle Section: Search Bar */}
          <div className="flex justify-center items-center w-full">
            <div className="flex items-center w-full max-w-2xl">
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-dark-surface border border-gray-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-l-full focus:outline-none focus:border-blue-500 text-sm sm:text-base"
              />
              <button className="bg-gray-700 border border-l-0 border-gray-700 px-4 sm:px-6 py-1.5 sm:py-2 rounded-r-full hover:bg-gray-600 transition-colors flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Right Section: Notification and Account */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button className="p-2 hover:bg-gray-800 rounded-full transition-colors">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-colors">
              {!user.isLoggedIn ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-600 flex items-center justify-center p-1 sm:p-1.5">
                  <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              ) : user.profileImage ? (
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden bg-gray-700 border border-gray-600">
                  <Image
                    src={user.profileImage}
                    alt={user.name || 'Profile'}
                    width={28}
                    height={28}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-6 h-6 sm:w-7 sm:h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm border border-blue-400">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed lg:sticky top-14 left-0 h-[calc(100vh-3.5rem)] bg-dark-bg border-r border-gray-800 overflow-y-auto transition-all duration-300 z-40 flex flex-col ${
            sidebarOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'
          }`}
        >
          {/* Main Navigation */}
          <nav className="p-2 flex-1">
            {sidebarItems.map((item, index) => (
              <Link
                key={index}
                href={item.name === 'Home' ? '/' : '#'}
                onClick={item.name === 'Home' ? handleHomeClick : undefined}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  item.active
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                </svg>
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </Link>
            ))}
          </nav>

          {/* Bottom Section: Aria and Downloads */}
          <div className="p-2 border-t border-gray-800">
            {[
              { 
                name: 'Aria', 
                href: 'https://aria.lambrk.com',
                icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
                external: true
              },
              { 
                name: 'Downloads', 
                href: '/downloads',
                icon: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4'
              },
            ].map((item) => (
              <div key={item.name}>
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-colors text-gray-300 hover:bg-gray-800 hover:text-white"
                  >
                    <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                    {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 transition-all duration-300">
          <div className="p-4 lg:p-6 max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
              {/* Video Player Section */}
              <div className="flex-1">
                {/* Video Player */}
                <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden mb-4">
                  <video
                    className="w-full h-full"
                    controls
                    autoPlay={isPlaying}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  >
                    <source src={currentVideo.thumbnail} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>

                {/* Video Info */}
                <div className="mb-4">
                  <h1 className="text-xl lg:text-2xl font-semibold text-white mb-3">
                    {currentVideo.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{currentVideo.views}</span>
                      <span>•</span>
                      <span>{currentVideo.time}</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-full overflow-hidden border border-gray-700">
                        <button
                          onClick={() => {
                            if (userLike === 'liked') {
                              setUserLike(null)
                              setLikes(likes - 1)
                            } else {
                              if (userLike === 'disliked') {
                                setDislikes(dislikes - 1)
                              }
                              setUserLike('liked')
                              setLikes(likes + (userLike === 'disliked' ? 2 : 1))
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                            userLike === 'liked'
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }`}
                        >
                          <svg className="w-5 h-5" fill={userLike === 'liked' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span className="text-sm">{likes.toLocaleString()}</span>
                        </button>
                        <div className="w-px h-6 bg-gray-700"></div>
                        <button
                          onClick={() => {
                            if (userLike === 'disliked') {
                              setUserLike(null)
                              setDislikes(dislikes - 1)
                            } else {
                              if (userLike === 'liked') {
                                setLikes(likes - 1)
                              }
                              setUserLike('disliked')
                              setDislikes(dislikes + (userLike === 'liked' ? 2 : 1))
                            }
                          }}
                          className={`flex items-center gap-2 px-4 py-2 transition-colors ${
                            userLike === 'disliked'
                              ? 'bg-red-600 hover:bg-red-700 text-white'
                              : 'bg-gray-800 hover:bg-gray-700 text-white'
                          }`}
                        >
                          <svg className="w-5 h-5 rotate-180" fill={userLike === 'disliked' ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                          <span className="text-sm">{dislikes.toLocaleString()}</span>
                        </button>
                      </div>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                        </svg>
                        <span className="text-sm">Share</span>
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span className="text-sm">Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Channel Info */}
                  <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                      {currentVideo.channel.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{currentVideo.channel}</h3>
                      <p className="text-sm text-gray-400">1.5M subscribers</p>
                    </div>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-full text-white font-semibold text-sm transition-colors">
                      Subscribe
                    </button>
                  </div>

                  {/* Description */}
                  {currentVideo.description && (
                    <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                      <p className="text-white text-sm whitespace-pre-line">
                        {currentVideo.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Related Videos Sidebar */}
              <div className="w-full lg:w-80 flex-shrink-0">
                <h2 className="text-lg font-semibold text-white mb-4">Up next</h2>
                <div className="space-y-3">
                  {relatedVideos.map((video) => (
                    <Link
                      key={video.id}
                      href={`/watch?v=${video.id}`}
                      className="flex gap-3 cursor-pointer group"
                    >
                      <div className="relative w-40 h-24 flex-shrink-0 bg-gray-800 rounded-lg overflow-hidden">
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
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                          {video.duration}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white line-clamp-2 group-hover:text-blue-400 transition-colors mb-1">
                          {video.title}
                        </h3>
                        <p className="text-xs text-gray-400">{video.channel}</p>
                        <p className="text-xs text-gray-400">
                          {video.views} • {video.time}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

