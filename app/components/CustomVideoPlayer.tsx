'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

interface QualityOption {
  label: string
  value: string
  src: string
}

interface CustomVideoPlayerProps {
  src: string
  qualities?: QualityOption[]
  onTimeUpdate?: (time: number) => void
  initialTime?: number
}

export default function CustomVideoPlayer({
  src,
  qualities = [],
  onTimeUpdate,
  initialTime = 0,
}: CustomVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const volumeSliderRef = useRef<HTMLDivElement>(null)
  const volumeSliderTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const volumeInteractionRef = useRef(false)
  const previousSrcRef = useRef<string>('')
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState(qualities.length > 0 ? qualities[0] : null)
  const [isDragging, setIsDragging] = useState(false)
  const [isVolumeDragging, setIsVolumeDragging] = useState(false)
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null)

  // Update selectedQuality when qualities change
  useEffect(() => {
    if (qualities.length > 0 && !selectedQuality) {
      setSelectedQuality(qualities[0])
    }
  }, [qualities, selectedQuality])

  // Ensure video loads when src changes
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const currentSrc = selectedQuality?.src || src
    if (currentSrc && currentSrc !== previousSrcRef.current) {
      previousSrcRef.current = currentSrc
      // Small delay to ensure React has updated the src attribute
      const timer = setTimeout(() => {
        if (video && video.src) {
          video.load()
        }
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [src, selectedQuality])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      if (initialTime > 0) {
        video.currentTime = initialTime
      }
    }

    const handleTimeUpdate = () => {
      if (!isDragging) {
        setCurrentTime(video.currentTime)
        onTimeUpdate?.(video.currentTime)
      }
    }

    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)

    // Load video metadata
    if (video.readyState >= 1) {
      handleLoadedMetadata()
    } else {
      video.load()
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
    }
  }, [initialTime, onTimeUpdate, isDragging, selectedQuality, src])

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.volume = volume
      video.muted = isMuted
    }
  }, [volume, isMuted])

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
    }
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const togglePlay = async () => {
    const video = videoRef.current
    if (!video) return

    if (isPlaying) {
      video.pause()
    } else {
      try {
        await video.play()
      } catch (error) {
        console.error('Error playing video:', error)
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current
    const progressBar = progressBarRef.current
    if (!video || !progressBar) return

    const rect = progressBar.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    video.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleProgressClick(e)
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && progressBarRef.current && videoRef.current) {
        const rect = progressBarRef.current.getBoundingClientRect()
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
        const newTime = percent * duration
        videoRef.current.currentTime = newTime
        setCurrentTime(newTime)
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, duration])

  const resetVolumeSliderTimeout = useCallback(() => {
    if (volumeSliderTimeoutRef.current) {
      clearTimeout(volumeSliderTimeoutRef.current)
    }
    setShowVolumeSlider(true)
    volumeSliderTimeoutRef.current = setTimeout(() => {
      if (!isVolumeDragging) {
        setShowVolumeSlider(false)
      }
    }, 5000)
  }, [isVolumeDragging])

  const handleVolumeClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || e.detail === 0) return
    e.preventDefault()
    e.stopPropagation()
    volumeInteractionRef.current = true
    resetVolumeSliderTimeout()
    const volumeSlider = volumeSliderRef.current
    if (!volumeSlider) return

    const rect = volumeSlider.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newVolume = Math.max(0, Math.min(1, percent))
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
    setTimeout(() => {
      volumeInteractionRef.current = false
    }, 100)
  }

  const handleVolumeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    volumeInteractionRef.current = true
    resetVolumeSliderTimeout()
    setIsVolumeDragging(true)
    const volumeSlider = volumeSliderRef.current
    if (!volumeSlider) return

    const rect = volumeSlider.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newVolume = Math.max(0, Math.min(1, percent))
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  useEffect(() => {
    if (!isVolumeDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVolumeDragging || !volumeSliderRef.current) return
      
      const rect = volumeSliderRef.current.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      const newVolume = Math.max(0, Math.min(1, percent))
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
      resetVolumeSliderTimeout()
    }

    const handleMouseUp = () => {
      setIsVolumeDragging(false)
      resetVolumeSliderTimeout()
      setTimeout(() => {
        volumeInteractionRef.current = false
      }, 100)
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: false })
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isVolumeDragging, resetVolumeSliderTimeout])

  useEffect(() => {
    return () => {
      if (volumeSliderTimeoutRef.current) {
        clearTimeout(volumeSliderTimeoutRef.current)
      }
    }
  }, [])

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false)
      setVolume(volume || 0.5)
    } else {
      setIsMuted(true)
    }
  }

  const toggleFullscreen = () => {
    const container = containerRef.current
    if (!container) return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleQualityChange = async (quality: QualityOption) => {
    setSelectedQuality(quality)
    const video = videoRef.current
    if (video) {
      const currentTime = video.currentTime
      const wasPlaying = isPlaying
      video.src = quality.src
      video.load()
      
      video.addEventListener('loadedmetadata', () => {
        video.currentTime = currentTime
        if (wasPlaying) {
          video.play().catch(console.error)
        }
      }, { once: true })
    }
    setShowQualityMenu(false)
  }

  const resetControlsTimeout = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
    }
    setShowControls(true)
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false)
      }
    }, 3000)
    setControlsTimeout(timeout)
  }

  useEffect(() => {
    if (isPlaying) {
      resetControlsTimeout()
    } else {
      setShowControls(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying])

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0

  const getQualityIcon = (label: string) => {
    if (label.includes('4K') || label.includes('2160p')) {
      return (
        <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-white/20 text-white border border-white/30">
          4K
        </span>
      )
    }
    if (label.includes('2K') || label.includes('1440p')) {
      return (
        <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-white/20 text-white border border-white/30">
          2K
        </span>
      )
    }
    if (label.includes('1080p') || label.includes('720p')) {
      return (
        <span className="inline-flex items-center px-1 py-0.5 rounded text-[9px] font-medium bg-white/20 text-white border border-white/30">
          HD
        </span>
      )
    }
    return null
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }}
    >
      <video
        ref={videoRef}
        className="w-full h-full"
        src={selectedQuality?.src || src}
        onClick={togglePlay}
        preload="auto"
        playsInline
      />

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Top Controls */}
        <div className="absolute top-0 left-0 right-0 p-4">
          {/* Add any top controls here if needed */}
        </div>

        {/* Center Play Button */}
        <button
          onClick={togglePlay}
          className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-black/50 rounded-full flex items-center justify-center transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {isPlaying ? (
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Bottom Controls */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-black/70 p-3 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress Bar */}
          <div
            ref={progressBarRef}
            className="w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/progress"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
          >
            <div
              className="h-full bg-red-600 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="w-3 h-3 bg-red-600 rounded-full -mt-1 float-right opacity-0 group-hover/progress:opacity-100 transition-opacity" />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Volume */}
              <div
                className="relative flex items-center gap-2"
                onMouseEnter={resetVolumeSliderTimeout}
                onMouseMove={resetVolumeSliderTimeout}
              >
                <button
                  onClick={toggleMute}
                  className="text-white hover:text-gray-300 transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38.31 2.63.95 3.69 1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                    </svg>
                  ) : volume < 0.5 ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                    </svg>
                  )}
                </button>

                {/* Volume Slider - Horizontal */}
                {showVolumeSlider && (
                  <div
                    className="volume-slider-container flex items-center"
                    onMouseEnter={resetVolumeSliderTimeout}
                    onMouseMove={resetVolumeSliderTimeout}
                  >
                    <div
                      ref={volumeSliderRef}
                      className="w-24 h-1 bg-white/20 rounded-full cursor-pointer relative select-none group/volume"
                      onClick={handleVolumeClick}
                      onMouseDown={handleVolumeMouseDown}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <div
                        className="absolute left-0 top-0 h-full bg-white rounded-full pointer-events-none"
                        style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
                      />
                      {/* Volume Knob */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full border-2 border-gray-800 shadow-lg pointer-events-none opacity-0 group-hover/volume:opacity-100 transition-opacity"
                        style={{ left: `${(isMuted ? 0 : volume) * 100}%`, marginLeft: '-6px' }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Time Display */}
              <span className="text-white text-sm font-medium">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality Selector */}
              {qualities.length > 0 && (
                <div className="relative">
                  <button
                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                    className="text-white hover:text-gray-300 transition-colors text-sm px-2 py-1 flex items-center gap-1.5"
                  >
                    <span>{selectedQuality?.label || 'Auto'}</span>
                    {selectedQuality && getQualityIcon(selectedQuality.label)}
                  </button>
                  {showQualityMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowQualityMenu(false)}
                      />
                      <div className="absolute bottom-full right-0 mb-2 w-40 bg-black/90 rounded overflow-hidden z-20">
                        {qualities.map((quality) => (
                          <button
                            key={quality.value}
                            onClick={() => handleQualityChange(quality)}
                            className={`w-full text-left px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center justify-between ${
                              selectedQuality?.value === quality.value ? 'bg-white/20' : ''
                            }`}
                          >
                            <span>{quality.label}</span>
                            {getQualityIcon(quality.label)}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Settings */}
              <button className="text-white hover:text-gray-300 transition-colors">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
                </svg>
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-white hover:text-gray-300 transition-colors"
              >
                {isFullscreen ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

