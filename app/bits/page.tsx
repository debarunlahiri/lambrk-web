'use client'

import { useEffect, useState, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'

interface Bit {
  id: number
  title: string
  channel: string
  views: string
  time: string
  video: string
  likes: number
  comments: number
  channelAvatar: string | null
}

export default function BitsPage() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const bits: Bit[] = [
    {
      id: 1,
      title: 'Quick Tech Tip: Keyboard Shortcuts',
      channel: 'TechTips',
      views: '2.3M',
      time: '3 hours ago',
      video: '/video/1536315-hd_1920_1080_30fps.mp4',
      likes: 125000,
      comments: 3200,
      channelAvatar: null,
    },
    {
      id: 2,
      title: 'Amazing Nature Moment',
      channel: 'NatureLovers',
      views: '5.1M',
      time: '1 day ago',
      video: '/video/7644958-uhd_4096_2160_24fps.mp4',
      likes: 890000,
      comments: 12000,
      channelAvatar: null,
    },
    {
      id: 3,
      title: 'Cooking Hack You Need to Know',
      channel: 'ChefDaily',
      views: '1.8M',
      time: '2 days ago',
      video: '/video/1536315-hd_1920_1080_30fps.mp4',
      likes: 45000,
      comments: 2100,
      channelAvatar: null,
    },
    {
      id: 4,
      title: 'Workout Motivation',
      channel: 'FitnessPro',
      views: '3.7M',
      time: '4 days ago',
      video: '/video/7644958-uhd_4096_2160_24fps.mp4',
      likes: 234000,
      comments: 5600,
      channelAvatar: null,
    },
    {
      id: 5,
      title: 'Funny Pet Moments',
      channel: 'PetVideos',
      views: '6.2M',
      time: '1 week ago',
      video: '/video/1536315-hd_1920_1080_30fps.mp4',
      likes: 567000,
      comments: 8900,
      channelAvatar: null,
    },
  ]

  const sidebarItems = [
    { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/', requiresAuth: false },
    { name: 'Bits', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', href: '/bits', requiresAuth: false, active: true },
    { name: 'Trending', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', href: '#', requiresAuth: false },
    ...(user.isLoggedIn ? [
      { name: 'Subscriptions', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', href: '#', requiresAuth: true },
      { name: 'Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', href: '#', requiresAuth: true },
      { name: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '#', requiresAuth: true },
      { name: 'Your videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', href: '#', requiresAuth: true },
      { name: 'Watch later', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '#', requiresAuth: true },
      { name: 'Liked videos', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', href: '#', requiresAuth: true },
    ] : []),
  ]

  useEffect(() => {
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('bits-container')
      if (!container) return

      const scrollPosition = container.scrollTop
      const containerHeight = container.clientHeight
      const videoHeight = containerHeight
      const newIndex = Math.round(scrollPosition / videoHeight)

      if (newIndex !== currentVideoIndex && newIndex >= 0 && newIndex < bits.length) {
        videoRefs.current[currentVideoIndex]?.pause()
        setCurrentVideoIndex(newIndex)
        const video = videoRefs.current[newIndex]
        if (video) {
          video.currentTime = 0
          video.play().catch(() => {})
        }
      }
    }

    const container = document.getElementById('bits-container')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [currentVideoIndex, bits.length])

  useEffect(() => {
    const video = videoRefs.current[currentVideoIndex]
    if (video) {
      video.currentTime = 0
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, user interaction required
        })
      }
    }
  }, [currentVideoIndex])

  useEffect(() => {
    // Play first video on mount
    const firstVideo = videoRefs.current[0]
    if (firstVideo) {
      const playPromise = firstVideo.play()
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented
        })
      }
    }
  }, [])

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

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
                href={item.href}
                onClick={item.name === 'Home' ? handleHomeClick : undefined}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  item.active || pathname === item.href
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

        {/* Main Content - Bits Feed */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div
            id="bits-container"
            className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bits.map((bit, index) => (
              <div
                key={bit.id}
                className="h-[calc(100vh-3.5rem)] snap-start flex items-center justify-center relative"
              >
                <div className="w-full max-w-md h-full flex flex-col relative">
                  {/* Video */}
                  <div className="relative flex-1 bg-black rounded-lg overflow-hidden">
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el
                      }}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      src={bit.video}
                    />
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold flex-shrink-0">
                          {bit.channel.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm truncate">{bit.title}</h3>
                          <p className="text-gray-300 text-xs">{bit.channel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="absolute right-4 bottom-20 flex flex-col items-center gap-4">
                      <button className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs font-medium">{bit.likes > 1000 ? `${(bit.likes / 1000).toFixed(1)}K` : bit.likes}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs font-medium">{bit.comments > 1000 ? `${(bit.comments / 1000).toFixed(1)}K` : bit.comments}</span>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342c8.288 0 12.316-6.864 12.316-12.316 0-.19 0-.38-.007-.57A8.875 8.875 0 0020 3.292c-.783.348-1.624.583-2.506.69a4.314 4.314 0 001.89-2.38 8.645 8.645 0 01-2.74 1.045 4.303 4.303 0 00-7.331 3.92 12.21 12.21 0 01-8.86-4.49 4.302 4.302 0 001.332 5.746 4.273 4.273 0 01-1.946-.538v.054a4.31 4.31 0 003.45 4.22 4.3 4.3 0 01-1.943.074 4.31 4.31 0 004.027 2.987 8.636 8.636 0 01-5.35 1.841c-.346 0-.688-.02-1.024-.06a12.188 12.188 0 006.6 1.93c7.918 0 12.24-6.562 12.24-12.24 0-.186-.004-.372-.012-.558A8.75 8.75 0 0020 5.26z" />
                          </svg>
                        </div>
                      </button>

                      <button className="flex flex-col items-center gap-1">
                        <div className="w-12 h-12 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
              name: 'Bits', 
              href: '/bits',
              icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
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
                    pathname === item.href ? 'text-blue-400' : 'text-gray-400'
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

