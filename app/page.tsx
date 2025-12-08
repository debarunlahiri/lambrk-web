'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useAuth } from './contexts/AuthContext'

export default function Home() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [isLoaded, setIsLoaded] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    setIsLoaded(true)
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const videos = [
    {
      id: 1,
      title: 'The Future of Streaming - 8K 60fps Experience',
      channel: 'Lambrk Official',
      views: '1.2M views',
      time: '2 days ago',
      thumbnail: '/video/7644958-uhd_4096_2160_24fps.mp4',
      duration: '12:34',
      channelAvatar: null,
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
    },
  ]

  const sidebarItems = [
    { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', active: true, requiresAuth: false },
    { name: 'Trending', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', requiresAuth: false },
    ...(user.isLoggedIn ? [
      { name: 'Subscriptions', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', requiresAuth: true },
      { name: 'Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', requiresAuth: true },
      { name: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', requiresAuth: true },
      { name: 'Your videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', requiresAuth: true },
      { name: 'Watch later', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', requiresAuth: true },
      { name: 'Liked videos', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', requiresAuth: true },
    ] : []),
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
            <div className="relative">
              {!user.isLoggedIn ? (
                <Link href="/login">
                  <button className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-colors">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border border-gray-600 flex items-center justify-center p-1 sm:p-1.5">
                      <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </button>
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setAccountMenuOpen(!accountMenuOpen)}
                    className="p-1 sm:p-2 hover:bg-gray-800 rounded-full transition-colors"
                  >
                    {user.profileImage ? (
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
                  {accountMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setAccountMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-56 bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700">
                        <div className="p-2">
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-white font-semibold text-sm">{user.name || 'User'}</p>
                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                          </div>
                          <Link
                            href="#"
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            Your channel
                          </Link>
                          <Link
                            href="#"
                            className="block px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                            onClick={() => setAccountMenuOpen(false)}
                          >
                            Settings
                          </Link>
                          <div className="border-t border-gray-700 my-2" />
                          <button
                            onClick={() => {
                              logout()
                              setAccountMenuOpen(false)
                            }}
                            className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
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
                    className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-colors ${
                      pathname === item.href
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
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
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div className="p-4 lg:p-6">
            {/* Video Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {videos.map((video) => (
          <Link
                  key={video.id}
                  href={`/watch?v=${video.id}`}
                >
          <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
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
        </div>
      </div>

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-bg border-t border-gray-800 lg:hidden">
        <div className="flex items-center justify-around px-2 py-2">
            {[
              { 
                name: 'Home', 
                href: '/',
              icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
                onClick: handleHomeClick
              },
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
                  className="flex flex-col items-center gap-1 px-4 py-2 text-gray-400"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-xs">{item.name}</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={item.onClick}
                  className={`flex flex-col items-center gap-1 px-4 py-2 ${
                    item.name === 'Home' && pathname === '/' ? 'text-blue-400' : 'text-gray-400'
                  }`}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                  </svg>
                  <span className="text-xs">{item.name}</span>
                  </Link>
                )}
            </div>
            ))}
          </div>
      </div>
    </main>
  )
}
