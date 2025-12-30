'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNavigation() {
  const pathname = usePathname()

  const handleHomeClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const navItems = [
    { 
      name: 'Home', 
      href: '/',
      icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
      onClick: handleHomeClick
    },
    { 
      name: 'Bitz', 
      href: '/bits',
      icon: 'M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
    },
    { 
      name: 'Posts', 
      href: '/posts',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
    },
    { 
      name: 'Trending', 
      href: '/trending',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-dark-bg border-t border-gray-800 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
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
        ))}
      </div>
    </div>
  )
}

