'use client'

import { useEffect, useState, useRef, Suspense } from 'react'
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

interface Playlist {
  id: number
  name: string
  isPublic: boolean
  videoCount: number
  isWatchLater?: boolean
}

function WatchContent() {
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
  const [shareMenuOpen, setShareMenuOpen] = useState(false)
  const [linkCopied, setLinkCopied] = useState(false)
  const [timestampCopied, setTimestampCopied] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [playlistMenuOpen, setPlaylistMenuOpen] = useState(false)
  const [playlists, setPlaylists] = useState<Playlist[]>([
    { id: 1, name: 'My Favorites', isPublic: false, videoCount: 12 },
    { id: 2, name: 'Tech Videos', isPublic: true, videoCount: 8 },
    { id: 3, name: 'Tutorials', isPublic: false, videoCount: 15 },
  ])
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')
  const [newPlaylistIsPublic, setNewPlaylistIsPublic] = useState(false)
  const [playlistError, setPlaylistError] = useState('')
  const [playlistSuccess, setPlaylistSuccess] = useState(false)
  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: 'John Doe',
      text: 'Great video! Really enjoyed the content. Keep up the good work!',
      likes: 245,
      dislikes: 12,
      time: '2 hours ago',
      userLiked: false,
      userDisliked: false,
    },
    {
      id: 2,
      author: 'Jane Smith',
      text: 'This is exactly what I was looking for. Thanks for sharing!',
      likes: 189,
      dislikes: 5,
      time: '5 hours ago',
      userLiked: false,
      userDisliked: false,
    },
    {
      id: 3,
      author: 'Tech Enthusiast',
      text: 'Amazing quality and production value. The 8K resolution looks incredible!',
      likes: 312,
      dislikes: 8,
      time: '1 day ago',
      userLiked: true,
      userDisliked: false,
    },
  ])
  const [newComment, setNewComment] = useState('')

  useEffect(() => {
    setIsLoaded(true)
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])


  useEffect(() => {
    if (!shareMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.share-menu-container')) {
        setShareMenuOpen(false)
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 0)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [shareMenuOpen])

  useEffect(() => {
    if (!playlistMenuOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.playlist-menu-container')) {
        setPlaylistMenuOpen(false)
        setShowCreatePlaylist(false)
        setNewPlaylistName('')
        setNewPlaylistIsPublic(false)
        setPlaylistError('')
        setPlaylistSuccess(false)
      }
    }

    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside)
    }, 100)

    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [playlistMenuOpen])

  const sortedPlaylists = () => {
    const watchLater = playlists.find(p => p.isWatchLater)
    const others = playlists.filter(p => !p.isWatchLater)
    return watchLater ? [watchLater, ...others] : others
  }

  const handleSaveToPlaylist = (playlistId: number) => {
    setPlaylists(playlists.map(p => 
      p.id === playlistId 
        ? { ...p, videoCount: p.videoCount + 1 }
        : p
    ))
    setPlaylistMenuOpen(false)
  }

  const handleSaveToWatchLater = () => {
    const watchLater = playlists.find(p => p.isWatchLater)
    if (watchLater) {
      handleSaveToPlaylist(watchLater.id)
    } else {
      const maxId = playlists.length > 0 ? Math.max(...playlists.map(p => p.id)) : 0
      const newWatchLater: Playlist = {
        id: maxId + 1,
        name: 'Watch later',
        isPublic: false,
        videoCount: 1,
        isWatchLater: true,
      }
      setPlaylists([newWatchLater, ...playlists])
      setPlaylistMenuOpen(false)
    }
  }

  const handleCreatePlaylist = () => {
    const trimmedName = newPlaylistName.trim()
    setPlaylistError('')
    
    if (!trimmedName) {
      setPlaylistError('Playlist name cannot be empty')
      return
    }

    if (trimmedName.length > 100) {
      setPlaylistError('Playlist name must be 100 characters or less')
      return
    }

    const nameExists = playlists.some(
      p => p.name.toLowerCase() === trimmedName.toLowerCase()
    )
    
    if (nameExists) {
      setPlaylistError('A playlist with this name already exists')
      return
    }

    const maxId = playlists.length > 0 ? Math.max(...playlists.map(p => p.id)) : 0
    const newPlaylist: Playlist = {
      id: maxId + 1,
      name: trimmedName,
      isPublic: newPlaylistIsPublic,
      videoCount: 1,
    }
    
    setPlaylists(prevPlaylists => [...prevPlaylists, newPlaylist])
    setPlaylistSuccess(true)
    
    setTimeout(() => {
      setNewPlaylistName('')
      setNewPlaylistIsPublic(false)
      setShowCreatePlaylist(false)
      setPlaylistMenuOpen(false)
      setPlaylistError('')
      setPlaylistSuccess(false)
    }, 1500)
  }

  const handleCancelCreatePlaylist = () => {
    setShowCreatePlaylist(false)
    setNewPlaylistName('')
    setNewPlaylistIsPublic(false)
    setPlaylistError('')
    setPlaylistSuccess(false)
  }

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

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)

    const timestamp = searchParams.get('t')
    if (timestamp) {
      const time = parseInt(timestamp, 10)
      if (!isNaN(time) && time > 0) {
        video.currentTime = time
      }
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
    }
  }, [searchParams, currentVideo.id])

  const getVideoUrl = (includeTimestamp?: boolean) => {
    if (typeof window !== 'undefined') {
      let url = `${window.location.origin}/watch?v=${currentVideo.id}`
      if (includeTimestamp && currentTime > 0) {
        const seconds = Math.floor(currentTime)
        url += `&t=${seconds}`
      }
      return url
    }
    return ''
  }

  const copyToClipboard = async () => {
    const url = getVideoUrl()
    try {
      await navigator.clipboard.writeText(url)
      setLinkCopied(true)
      setShareMenuOpen(false)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const copyToClipboardWithTimestamp = async () => {
    const url = getVideoUrl(true)
    try {
      await navigator.clipboard.writeText(url)
      setTimestampCopied(true)
      setShareMenuOpen(false)
      setTimeout(() => setTimestampCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const shareViaNative = async () => {
    const url = getVideoUrl()
    const shareData = {
      title: currentVideo.title,
      text: `Check out this video: ${currentVideo.title}`,
      url: url,
    }

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        const canShare = typeof navigator.canShare === 'function' ? navigator.canShare(shareData) : true
        if (canShare) {
          await navigator.share(shareData)
          setShareMenuOpen(false)
        } else {
          copyToClipboard()
        }
      } else {
        copyToClipboard()
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Error sharing:', err)
        copyToClipboard()
      }
    }
  }

  const shareToTwitter = () => {
    const url = getVideoUrl()
    const text = encodeURIComponent(`Check out this video: ${currentVideo.title}`)
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, '_blank')
    setShareMenuOpen(false)
  }

  const shareToFacebook = () => {
    const url = getVideoUrl()
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
    setShareMenuOpen(false)
  }

  const shareToReddit = () => {
    const url = getVideoUrl()
    const title = encodeURIComponent(currentVideo.title)
    window.open(`https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${title}`, '_blank')
    setShareMenuOpen(false)
  }

  const shareViaEmail = () => {
    const url = getVideoUrl()
    const subject = encodeURIComponent(`Check out this video: ${currentVideo.title}`)
    const body = encodeURIComponent(`I thought you might like this video:\n\n${currentVideo.title}\n${url}`)
    window.location.href = `mailto:?subject=${subject}&body=${body}`
    setShareMenuOpen(false)
  }

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
                    ref={videoRef}
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
                      <div className="relative share-menu-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setShareMenuOpen(!shareMenuOpen)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                          </svg>
                          <span className="text-sm">Share</span>
                        </button>

                        {/* Share Menu Dropdown */}
                        {shareMenuOpen && (
                          <div 
                            className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                              <div className="p-2">
                                {/* Native Share (if available) */}
                                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
                                  <button
                                    onClick={shareViaNative}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                                    </svg>
                                    <span className="text-sm">Share via...</span>
                                  </button>
                                )}

                                {/* Copy Link */}
                                <button
                                  onClick={copyToClipboard}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm">{linkCopied ? 'Link copied!' : 'Copy link'}</span>
                                </button>

                                {/* Copy Link with Timestamp */}
                                <button
                                  onClick={copyToClipboardWithTimestamp}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <span className="text-sm">
                                    {timestampCopied ? 'Link with timestamp copied!' : currentTime > 0 ? `Copy link at ${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}` : 'Copy link at current time'}
                                  </span>
                                </button>

                                <div className="border-t border-gray-700 my-2" />

                                {/* Social Media Options */}
                                <button
                                  onClick={shareToTwitter}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                  </svg>
                                  <span className="text-sm">Share to Twitter</span>
                                </button>

                                <button
                                  onClick={shareToFacebook}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                  </svg>
                                  <span className="text-sm">Share to Facebook</span>
                                </button>

                                <button
                                  onClick={shareToReddit}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.963-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
                                  </svg>
                                  <span className="text-sm">Share to Reddit</span>
                                </button>

                                <button
                                  onClick={shareViaEmail}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm">Share via Email</span>
                                </button>
                              </div>
                            </div>
                        )}
                      </div>
                      <div className="relative playlist-menu-container">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setPlaylistMenuOpen(!playlistMenuOpen)
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          <span className="text-sm">Save to playlist</span>
                        </button>

                        {/* Playlist Menu Dropdown */}
                        {playlistMenuOpen && (
                          <div 
                            className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl z-20 border border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="p-2 max-h-96 overflow-y-auto">
                              {/* Watch Later - Always at top */}
                              <button
                                onClick={handleSaveToWatchLater}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium">Watch later</span>
                              </button>

                              <div className="border-t border-gray-700 my-2" />

                              {/* Existing Playlists */}
                              {sortedPlaylists().filter(p => !p.isWatchLater).map((playlist) => (
                                <button
                                  key={playlist.id}
                                  onClick={() => handleSaveToPlaylist(playlist.id)}
                                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    </svg>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm font-medium truncate">{playlist.name}</div>
                                      <div className="text-xs text-gray-400">
                                        {playlist.videoCount} {playlist.videoCount === 1 ? 'video' : 'videos'} • {playlist.isPublic ? 'Public' : 'Private'}
                                      </div>
                                    </div>
                                  </div>
                                  {playlist.isPublic && (
                                    <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  )}
                                </button>
                              ))}

                              <div className="border-t border-gray-700 my-2" />

                              {/* Create New Playlist */}
                              {!showCreatePlaylist ? (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setShowCreatePlaylist(true)
                                    setPlaylistError('')
                                    setPlaylistSuccess(false)
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-700 text-white transition-colors text-left"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  <span className="text-sm">Create new playlist</span>
                                </button>
                              ) : (
                                <div className="px-4 py-3 space-y-3">
                                  {playlistSuccess ? (
                                    <div className="flex items-center gap-2 text-green-400 text-sm py-2">
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                      <span>Playlist created and video added!</span>
                                    </div>
                                  ) : (
                                    <>
                                      <div>
                                        <input
                                          type="text"
                                          value={newPlaylistName}
                                          onChange={(e) => {
                                            setNewPlaylistName(e.target.value)
                                            setPlaylistError('')
                                          }}
                                          placeholder="Playlist name"
                                          maxLength={100}
                                          className={`w-full bg-gray-700 border ${
                                            playlistError ? 'border-red-500' : 'border-gray-600'
                                          } text-white px-3 py-2 rounded-lg focus:outline-none focus:border-blue-500 text-sm`}
                                          autoFocus
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                              handleCreatePlaylist()
                                            } else if (e.key === 'Escape') {
                                              handleCancelCreatePlaylist()
                                            }
                                          }}
                                        />
                                        {playlistError && (
                                          <p className="text-red-400 text-xs mt-1">{playlistError}</p>
                                        )}
                                        <p className="text-gray-500 text-xs mt-1">
                                          {newPlaylistName.length}/100 characters
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          id="playlist-public"
                                          checked={newPlaylistIsPublic}
                                          onChange={(e) => setNewPlaylistIsPublic(e.target.checked)}
                                          className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                                        />
                                        <label htmlFor="playlist-public" className="text-sm text-gray-300 cursor-pointer">
                                          Make playlist public
                                        </label>
                                      </div>
                                      <div className="flex gap-2">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleCreatePlaylist()
                                          }}
                                          disabled={!newPlaylistName.trim() || playlistSuccess}
                                          className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg text-white font-semibold text-sm transition-colors"
                                        >
                                          Create
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation()
                                            handleCancelCreatePlaylist()
                                          }}
                                          disabled={playlistSuccess}
                                          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed rounded-lg text-white text-sm transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
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

                  {/* Comments Section */}
                  <div className="mt-6">
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
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b border-gray-700 text-white placeholder-gray-500 pb-2 focus:outline-none focus:border-white resize-none"
                            rows={1}
                            onInput={(e) => {
                              const target = e.target as HTMLTextAreaElement
                              target.style.height = 'auto'
                              target.style.height = `${target.scrollHeight}px`
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
                              onClick={() => {
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
                              }}
                              disabled={!newComment.trim()}
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
                                  onClick={() => {
                                    setComments(comments.map(c => {
                                      if (c.id !== comment.id) return c
                                      
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
                                  }}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                                    comment.userLiked
                                      ? 'text-blue-500 hover:text-blue-400'
                                      : 'text-gray-400 hover:text-white'
                                  }`}
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
                                  onClick={() => {
                                    setComments(comments.map(c => {
                                      if (c.id !== comment.id) return c
                                      
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
                                  }}
                                  className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                                    comment.userDisliked
                                      ? 'text-red-500 hover:text-red-400'
                                      : 'text-gray-400 hover:text-white'
                                  }`}
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

export default function WatchPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </main>
    }>
      <WatchContent />
    </Suspense>
  )
}
