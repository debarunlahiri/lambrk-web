'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  isLoggedIn: boolean
  name?: string
  username?: string
  email?: string
  profileImage?: string
}

interface AuthContextType {
  user: User
  login: (userData: Omit<User, 'isLoggedIn'>) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>({ isLoggedIn: false })

  useEffect(() => {
    const storedUser = localStorage.getItem('lambrk_user')
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser({ ...userData, isLoggedIn: true })
      } catch (e) {
        localStorage.removeItem('lambrk_user')
      }
    }
  }, [])

  const login = (userData: Omit<User, 'isLoggedIn'>) => {
    const newUser = { ...userData, isLoggedIn: true }
    setUser(newUser)
    localStorage.setItem('lambrk_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setUser({ isLoggedIn: false })
    localStorage.removeItem('lambrk_user')
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

