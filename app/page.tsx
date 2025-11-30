'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Icon component for features
const FeatureIcon = ({ type }: { type: string }) => {
  const iconClass = "w-4 h-4"
  
  switch (type) {
    case '8K 60fps':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    case 'Dolby Vision':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    case 'Dolby Atmos':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      )
    case 'RAW':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    case 'HDR':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    case 'Fast Streaming':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    case 'AI Powered':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      )
    case 'Multi-Device':
      return (
        <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      )
    default:
      return null
  }
}

export default function Home() {
  const pathname = usePathname()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(true)
  const [showPlayPauseButton, setShowPlayPauseButton] = useState(false)

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    // If not on home page, let Link handle navigation
  }

  useEffect(() => {
    setIsLoaded(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    
    // Ensure video plays on mobile
    const video = document.querySelector('video[data-main-video]') as HTMLVideoElement
    if (video) {
      video.play().then(() => {
        setIsVideoPlaying(true)
      }).catch(() => {
        // Autoplay failed, which is fine - browser will handle it
      })
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const toggleVideoPlayPause = () => {
    const video = document.querySelector('video[data-main-video]') as HTMLVideoElement
    if (video) {
      if (isVideoPlaying) {
        video.pause()
        setIsVideoPlaying(false)
      } else {
        video.play().then(() => setIsVideoPlaying(true))
      }
    }
    // Hide button after interaction on mobile
    setTimeout(() => {
      setShowPlayPauseButton(false)
    }, 2000)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  return (
    <main className="min-h-screen bg-dark-bg relative overflow-hidden">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-20"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            minWidth: '100%',
            minHeight: '100%',
            width: 'auto',
            height: 'auto',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <source src="/video/1536315-hd_1920_1080_30fps.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-dark-bg/70" />
      </div>

      {/* Animated Background Gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 100, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            left: '10%',
            top: '10%',
          }}
        />
        <motion.div
          className="absolute w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 0],
            y: [0, -80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          style={{
            right: '10%',
            bottom: '10%',
          }}
        />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="max-w-6xl mx-auto text-center"
        >
          {/* Logo */}
          <motion.div
            variants={itemVariants}
            className="mb-12 mt-8 sm:mt-12 md:mt-16"
          >
            <motion.div
              className="inline-block"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
                Lambrk
              </div>
            </motion.div>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            variants={itemVariants}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-white"
            style={{
              transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
            }}
          >
            The Future of Streaming
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={itemVariants}
            className="text-xl sm:text-2xl md:text-3xl text-gray-300 mb-6 font-light"
            style={{
              transform: `translate(${mousePosition.x * 0.015}px, ${mousePosition.y * 0.015}px)`,
            }}
          >
            Next-Generation Video Platform
          </motion.p>

          {/* Description */}
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Experience entertainment reimagined. Stream in stunning 8K 60fps with Dolby Vision, Dolby Atmos, RAW quality, and HDR support. AI-powered recommendations and seamless playback across all devices. The future of video streaming is here.
          </motion.p>

          {/* Features */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-3 mb-14 max-w-5xl mx-auto"
          >
            {[
              { text: '8K 60fps', highlight: true },
              { text: 'Dolby Vision', highlight: true },
              { text: 'Dolby Atmos', highlight: true },
              { text: 'RAW', highlight: true },
              { text: 'HDR', highlight: true },
              { text: 'Fast Streaming', highlight: false },
              { text: 'AI Powered', highlight: false },
              { text: 'Multi-Device', highlight: false },
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                className={`px-4 py-2.5 rounded-xl backdrop-blur-sm border transition-all flex items-center gap-2 ${
                  feature.highlight
                    ? 'bg-blue-500/20 border-blue-500/60 shadow-md shadow-blue-500/20'
                    : 'bg-dark-surface/80 border-gray-700/50'
                }`}
                whileHover={{ 
                  scale: 1.06, 
                  borderColor: '#3b82f6', 
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.35)',
                  y: -2
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.08, type: "spring", stiffness: 100 }}
              >
                <span className={`${
                  feature.highlight ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  <FeatureIcon type={feature.text} />
                </span>
                <span className={`text-sm font-medium ${
                  feature.highlight ? 'text-white' : 'text-gray-300'
                }`}>
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* Video Section */}
          <motion.div
            variants={itemVariants}
            className="mb-14 relative"
            style={{
              transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
            }}
          >
            <div 
              className="relative w-full max-w-5xl mx-auto aspect-video rounded-2xl overflow-hidden border border-gray-700/50 shadow-2xl group"
              onMouseEnter={() => setShowPlayPauseButton(true)}
              onMouseLeave={() => setShowPlayPauseButton(false)}
              onTouchStart={() => setShowPlayPauseButton(true)}
            >
              <video
                data-main-video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setIsVideoPlaying(true)}
                onPause={() => setIsVideoPlaying(false)}
              >
                <source src="/video/7644958-uhd_4096_2160_24fps.mp4" type="video/mp4" />
              </video>
              
              {/* Play/Pause Button Overlay */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: showPlayPauseButton ? 1 : 0 }}
                transition={{ duration: 0.2 }}
                onClick={toggleVideoPlayPause}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  toggleVideoPlayPause()
                }}
              >
                <motion.button
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-blue-500/90 backdrop-blur-sm flex items-center justify-center shadow-2xl hover:bg-blue-600 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isVideoPlaying ? (
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-10 h-10 sm:w-12 sm:h-12 text-white ml-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Floating Particles */}
          <div className="fixed inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => {
              const randomX = Math.random() * 100
              const randomY = Math.random() * 100
              const randomDuration = Math.random() * 3 + 2
              const randomDelay = Math.random() * 2
              
              return (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-blue-500 rounded-full"
                  initial={{
                    x: `${randomX}%`,
                    y: `${randomY}%`,
                    opacity: 0,
                  }}
                  animate={{
                    y: `${randomY - 10}%`,
                    opacity: [0, 1, 0],
                  }}
                  transition={{
                    duration: randomDuration,
                    repeat: Infinity,
                    delay: randomDelay,
                  }}
                />
              )
            })}
          </div>
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center pb-4 sm:pb-6 px-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.3, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            {[
              { 
                name: 'Home', 
                href: '/',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                ),
                onClick: handleHomeClick
              },
              { 
                name: 'Aria', 
                href: 'https://aria.lambrk.com',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                external: true
              },
              { 
                name: 'Downloads', 
                href: '/downloads',
                icon: (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                )
              },
            ].map((item, index) => (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.5 }}
                whileHover={{ 
                  scale: 1.05, 
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.25)',
                }}
                whileTap={{ scale: 0.97 }}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-dark-surface/90 backdrop-blur-md border border-gray-700/60 rounded-xl text-gray-300 hover:text-white hover:border-blue-500/60 transition-all shadow-lg"
                  >
                    <span className="text-blue-400 flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{item.name}</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={item.onClick}
                    className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-dark-surface/90 backdrop-blur-md border border-gray-700/60 rounded-xl text-gray-300 hover:text-white hover:border-blue-500/60 transition-all shadow-lg"
                  >
                    <span className="text-blue-400 flex-shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-xs sm:text-sm font-medium whitespace-nowrap">{item.name}</span>
                  </Link>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}

