'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SidebarContextType {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Set initial state based on window width
    const handleResize = () => {
      setSidebarOpen(window.innerWidth >= 1024)
    }
    
    // Only run on initial mount
    if (!isInitialized) {
      handleResize()
      setIsInitialized(true)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [isInitialized])

  return (
    <SidebarContext.Provider value={{ sidebarOpen, setSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
