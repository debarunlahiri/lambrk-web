'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../contexts/AuthContext'

interface SidebarItem {
  name: string
  icon: string
  href: string
  requiresAuth?: boolean
  active?: boolean
  external?: boolean
}

interface SidebarProps {
  sidebarOpen: boolean
}

export default function Sidebar({ sidebarOpen }: SidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const sidebarItems: SidebarItem[] = [
    { name: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', href: '/', requiresAuth: false },
    { name: 'Bitz', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', href: '/bits', requiresAuth: false },
    { name: 'Posts', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z', href: '/posts', requiresAuth: false },
    { name: 'Trending', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6', href: '/trending', requiresAuth: false },
    ...(user.isLoggedIn ? [
      { name: 'Subscriptions', icon: 'M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z', href: '#', requiresAuth: true },
      { name: 'Library', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10', href: '#', requiresAuth: true },
      { name: 'History', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '#', requiresAuth: true },
      { name: 'Your videos', icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z', href: '#', requiresAuth: true },
      { name: 'Watch later', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z', href: '#', requiresAuth: true },
      { name: 'Liked videos', icon: 'M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5', href: '#', requiresAuth: true },
    ] : []),
  ]

  const bottomItems = [
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
  ]

  return (
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
        {bottomItems.map((item) => (
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
  )
}

