'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../contexts/AuthContext'

interface HeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const { user, logout } = useAuth()
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.location.pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
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
  )
}

