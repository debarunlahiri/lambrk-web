'use client'

import { useEffect, useState, useRef } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import BottomNavigation from '../components/BottomNavigation'
import { BITS, type Bit, shuffleArray } from '../constants/content'

export default function BitsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const [bitInteractions, setBitInteractions] = useState<Record<number, { liked: boolean; disliked: boolean }>>({})

  const [bits, setBits] = useState(() => shuffleArray(BITS))

  const handleLike = (bitId: number) => {
    setBits(prevBits => prevBits.map(bit => {
      if (bit.id === bitId) {
        const interaction = bitInteractions[bitId]
        if (interaction?.liked) {
          return { ...bit, likes: bit.likes - 1 }
        } else {
          const newLikes = interaction?.disliked ? bit.likes + 2 : bit.likes + 1
          const newDislikes = interaction?.disliked ? bit.dislikes - 1 : bit.dislikes
          setBitInteractions(prev => ({
            ...prev,
            [bitId]: { liked: true, disliked: false }
          }))
          return { ...bit, likes: newLikes, dislikes: newDislikes }
        }
      }
      return bit
    }))
    setBitInteractions(prev => ({
      ...prev,
      [bitId]: {
        liked: !prev[bitId]?.liked,
        disliked: false
      }
    }))
  }

  const handleDislike = (bitId: number) => {
    setBits(prevBits => prevBits.map(bit => {
      if (bit.id === bitId) {
        const interaction = bitInteractions[bitId]
        if (interaction?.disliked) {
          return { ...bit, dislikes: bit.dislikes - 1 }
        } else {
          const newDislikes = interaction?.liked ? bit.dislikes + 2 : bit.dislikes + 1
          const newLikes = interaction?.liked ? bit.likes - 1 : bit.likes
          setBitInteractions(prev => ({
            ...prev,
            [bitId]: { liked: false, disliked: true }
          }))
          return { ...bit, likes: newLikes, dislikes: newDislikes }
        }
      }
      return bit
    }))
    setBitInteractions(prev => ({
      ...prev,
      [bitId]: {
        liked: false,
        disliked: !prev[bitId]?.disliked
      }
    }))
  }

  const handleShare = async (bit: Bit) => {
    const url = `${window.location.origin}/bits?bit=${bit.id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: bit.title,
          text: `Check out this Bitz: ${bit.title}`,
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
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const container = document.getElementById('bitz-container')
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

    const container = document.getElementById('bitz-container')
    if (container) {
      container.addEventListener('scroll', handleScroll)
      return () => container.removeEventListener('scroll', handleScroll)
    }
  }, [currentVideoIndex, bits.length])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle arrow keys if not typing in an input/textarea
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      const container = document.getElementById('bitz-container')
      if (!container) return

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        
        let newIndex: number
        if (e.key === 'ArrowDown') {
          // Move to next video
          newIndex = Math.min(currentVideoIndex + 1, bits.length - 1)
        } else {
          // Move to previous video
          newIndex = Math.max(currentVideoIndex - 1, 0)
        }

        if (newIndex !== currentVideoIndex) {
          // Pause current video
          videoRefs.current[currentVideoIndex]?.pause()
          
          // Scroll to the new video
          const containerHeight = container.clientHeight
          const scrollPosition = newIndex * containerHeight
          
          container.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          })

          // Update index and play new video
          setCurrentVideoIndex(newIndex)
          const video = videoRefs.current[newIndex]
          if (video) {
            video.currentTime = 0
            video.play().catch(() => {})
          }
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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

  return (
    <main className="min-h-screen bg-dark-bg">
      <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex pt-14">
        <Sidebar sidebarOpen={sidebarOpen} />

        {/* Main Content - Bitz Feed */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-0' : 'lg:ml-0'}`}>
          <div
            id="bitz-container"
            className="h-[calc(100vh-3.5rem)] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {bits.map((bit, index) => (
              <div
                key={bit.id}
                className="h-[calc(100vh-3.5rem)] snap-start flex items-center justify-center relative"
              >
                <div className="w-full max-w-sm sm:max-w-md 2xl:max-w-lg 4xl:max-w-xl flex flex-col relative">
                  {/* Video */}
                  <div className="relative w-full aspect-[9/16] bg-black rounded-lg overflow-hidden">
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el
                      }}
                      className="w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      preload="auto"
                      src={bit.video}
                    />
                    
                    {/* Video Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 2xl:p-6 4xl:p-8 bg-gradient-to-t from-black/80 to-transparent">
                      <div className="flex items-center gap-3 2xl:gap-4 4xl:gap-6 mb-2 2xl:mb-3 4xl:mb-4">
                        <div className="w-10 h-10 2xl:w-14 2xl:h-14 4xl:w-20 4xl:h-20 rounded-full bg-gray-700 flex items-center justify-center text-white font-semibold flex-shrink-0 text-sm 2xl:text-lg 4xl:text-xl">
                          {bit.channel.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-semibold text-sm 2xl:text-base 4xl:text-lg truncate">{bit.title}</h3>
                          <p className="text-gray-300 text-xs 2xl:text-sm 4xl:text-base">{bit.channel}</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side Actions */}
                    <div className="absolute right-4 2xl:right-6 4xl:right-8 bottom-20 2xl:bottom-24 4xl:bottom-28 flex flex-col items-center gap-4 2xl:gap-5 4xl:gap-6">
                      {/* Like Button - Thumbs Up */}
                      <button 
                        onClick={() => handleLike(bit.id)}
                        className="flex flex-col items-center gap-1 2xl:gap-1.5 4xl:gap-2"
                      >
                        <div className={`w-12 h-12 2xl:w-16 2xl:h-16 4xl:w-20 4xl:h-20 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors ${bitInteractions[bit.id]?.liked ? 'bg-blue-500/50' : ''}`}>
                          <svg className={`w-6 h-6 2xl:w-8 2xl:h-8 4xl:w-10 4xl:h-10 ${bitInteractions[bit.id]?.liked ? 'text-blue-400 fill-blue-400' : 'text-white'}`} fill={bitInteractions[bit.id]?.liked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                          </svg>
                        </div>
                        <span className="text-white text-xs 2xl:text-sm 4xl:text-base font-medium">{bit.likes > 1000 ? `${(bit.likes / 1000).toFixed(1)}K` : bit.likes}</span>
                      </button>

                      {/* Dislike Button - Thumbs Down */}
                      <button 
                        onClick={() => handleDislike(bit.id)}
                        className="flex flex-col items-center gap-1 2xl:gap-1.5 4xl:gap-2"
                      >
                        <div className={`w-12 h-12 2xl:w-16 2xl:h-16 4xl:w-20 4xl:h-20 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors ${bitInteractions[bit.id]?.disliked ? 'bg-red-500/50' : ''}`}>
                          <svg className={`w-6 h-6 2xl:w-8 2xl:h-8 4xl:w-10 4xl:h-10 ${bitInteractions[bit.id]?.disliked ? 'text-red-400 fill-red-400' : 'text-white'}`} fill={bitInteractions[bit.id]?.disliked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                          </svg>
                        </div>
                        <span className="text-white text-xs 2xl:text-sm 4xl:text-base font-medium">{bit.dislikes > 1000 ? `${(bit.dislikes / 1000).toFixed(1)}K` : bit.dislikes}</span>
                      </button>

                      {/* Comments Button */}
                      <button className="flex flex-col items-center gap-1 2xl:gap-1.5 4xl:gap-2">
                        <div className="w-12 h-12 2xl:w-16 2xl:h-16 4xl:w-20 4xl:h-20 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 2xl:w-8 2xl:h-8 4xl:w-10 4xl:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </div>
                        <span className="text-white text-xs 2xl:text-sm 4xl:text-base font-medium">{bit.comments > 1000 ? `${(bit.comments / 1000).toFixed(1)}K` : bit.comments}</span>
                      </button>

                      {/* Share Button */}
                      <button 
                        onClick={() => handleShare(bit)}
                        className="flex flex-col items-center gap-1 2xl:gap-1.5 4xl:gap-2"
                      >
                        <div className="w-12 h-12 2xl:w-16 2xl:h-16 4xl:w-20 4xl:h-20 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 2xl:w-8 2xl:h-8 4xl:w-10 4xl:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                          </svg>
                        </div>
                      </button>

                      {/* Save Button */}
                      <button className="flex flex-col items-center gap-1 2xl:gap-1.5 4xl:gap-2">
                        <div className="w-12 h-12 2xl:w-16 2xl:h-16 4xl:w-20 4xl:h-20 rounded-full bg-gray-800/50 backdrop-blur-sm flex items-center justify-center hover:bg-gray-700/50 transition-colors">
                          <svg className="w-6 h-6 2xl:w-8 2xl:h-8 4xl:w-10 4xl:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      <BottomNavigation />
    </main>
  )
}

