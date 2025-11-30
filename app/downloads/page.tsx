'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DownloadsPage() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.6, -0.05, 0.01, 0.99],
      },
    },
  }

  // Download items
  const downloadItems = [
    { 
      id: 1, 
      title: 'STT Models', 
      size: 'Download', 
      date: new Date().toLocaleDateString(), 
      type: 'file',
      downloadUrl: 'https://lam-brk.s3.ap-south-1.amazonaws.com/stt-models.zip'
    },
  ]

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

      {/* Grid Pattern Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 sm:px-6 lg:px-8 pb-24 sm:pb-28">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isLoaded ? "visible" : "hidden"}
          className="max-w-6xl mx-auto w-full pt-8 sm:pt-12 md:pt-16"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
              Downloads
            </h1>
            <p className="text-gray-400 text-lg">
              Manage your downloaded content
            </p>
          </motion.div>

          {/* Downloads List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {downloadItems.map((item, index) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="bg-dark-surface/80 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all"
                whileHover={{ scale: 1.01, boxShadow: '0 8px 25px rgba(59, 130, 246, 0.15)' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-white text-lg font-semibold mb-2">{item.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{item.size}</span>
                      <span>{item.date}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex gap-2">
                    {item.type === 'file' && item.downloadUrl && (
                      <motion.a
                        href={item.downloadUrl}
                        download
                        className="px-4 py-2 bg-blue-500 rounded-lg text-white text-sm font-medium hover:bg-blue-600 transition-colors inline-block"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Download
                      </motion.a>
                    )}
                    {item.type === 'video' && (
                      <>
                        <motion.button
                          className="px-4 py-2 bg-blue-500 rounded-lg text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Play
                        </motion.button>
                        {item.downloadUrl && (
                          <motion.a
                            href={item.downloadUrl}
                            download
                            className="px-4 py-2 bg-dark-surface border border-gray-700 rounded-lg text-gray-300 text-sm font-medium hover:border-blue-500/50 hover:text-blue-400 transition-colors inline-block"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Download
                          </motion.a>
                        )}
                      </>
                    )}
                    {item.type === 'image' && (
                      <motion.button
                        className="px-4 py-2 bg-blue-500 rounded-lg text-white text-sm font-medium hover:bg-blue-600 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State (if no downloads) */}
          {downloadItems.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="text-center py-20"
            >
              <svg
                className="w-24 h-24 mx-auto text-gray-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              <h3 className="text-xl text-gray-400 mb-2">No downloads yet</h3>
              <p className="text-gray-500">Your downloaded content will appear here</p>
            </motion.div>
          )}
        </motion.div>

        {/* Bottom Navigation */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-20 flex justify-center items-center pb-4 sm:pb-6 px-4"
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
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
                onClick: (e: React.MouseEvent<HTMLAnchorElement>) => {
                  e.preventDefault()
                  window.location.href = '/'
                }
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
                transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
              >
                {item.external ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-dark-surface/90 backdrop-blur-md border border-gray-700/60 rounded-xl text-gray-300 hover:text-white hover:border-blue-500/60 text-sm font-medium whitespace-nowrap transition-all shadow-lg"
                  >
                    <span className="text-blue-400 flex-shrink-0">
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
                  </a>
                ) : (
                  <Link
                    href={item.href}
                    onClick={item.onClick}
                    className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-5 py-2.5 sm:py-3 bg-dark-surface/90 backdrop-blur-md border rounded-xl text-sm font-medium whitespace-nowrap transition-all shadow-lg ${
                      item.name === 'Downloads'
                        ? 'border-blue-500/60 text-white'
                        : 'border-gray-700/60 text-gray-300 hover:text-white hover:border-blue-500/60'
                    }`}
                  >
                    <span className={`flex-shrink-0 ${
                      item.name === 'Downloads' ? 'text-blue-400' : 'text-blue-400'
                    }`}>
                      {item.icon}
                    </span>
                    <span>{item.name}</span>
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

