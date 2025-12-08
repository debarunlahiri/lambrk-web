'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

interface ValidationErrors {
  username?: string
  email?: string
  password?: string
}

export default function SignupPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({})

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters'
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters'
    }
    if (username.length > 30) {
      return 'Username must be 30 characters or less'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return 'Username can only contain letters, numbers, and underscores'
    }
    return null
  }

  const checkUsernameUniqueness = async (username: string): Promise<boolean> => {
    try {
      const existingUsers = localStorage.getItem('lambrk_users')
      if (existingUsers) {
        const users = JSON.parse(existingUsers)
        return !users.some((user: any) => user.username?.toLowerCase() === username.toLowerCase())
      }
      return true
    } catch {
      return true
    }
  }

  const checkEmailUniqueness = async (email: string): Promise<boolean> => {
    try {
      const existingUsers = localStorage.getItem('lambrk_users')
      if (existingUsers) {
        const users = JSON.parse(existingUsers)
        return !users.some((user: any) => user.email?.toLowerCase() === email.toLowerCase())
      }
      return true
    } catch {
      return true
    }
  }

  const handleUsernameChange = async (value: string) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_]/g, '')
    setUsername(cleaned)
    setError('')
    
    const errors = { ...validationErrors }
    if (cleaned.length > 0) {
      const validationError = validateUsername(cleaned)
      if (validationError) {
        errors.username = validationError
      } else {
        const isUnique = await checkUsernameUniqueness(cleaned)
        if (!isUnique) {
          errors.username = 'Username is already taken'
        } else {
          delete errors.username
        }
      }
    } else {
      delete errors.username
    }
    setValidationErrors(errors)
  }

  const handleEmailChange = async (value: string) => {
    setEmail(value)
    setError('')
    
    const errors = { ...validationErrors }
    if (value.length > 0) {
      if (!validateEmail(value)) {
        errors.email = 'Please enter a valid email address'
      } else {
        const isUnique = await checkEmailUniqueness(value)
        if (!isUnique) {
          errors.email = 'Email is already registered'
        } else {
          delete errors.email
        }
      }
    } else {
      delete errors.email
    }
    setValidationErrors(errors)
  }

  const handlePasswordChange = (value: string) => {
    setPassword(value)
    setError('')
    
    const errors = { ...validationErrors }
    if (value.length > 0) {
      const validationError = validatePassword(value)
      if (validationError) {
        errors.password = validationError
      } else {
        delete errors.password
      }
    } else {
      delete errors.password
    }
    setValidationErrors(errors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (!name || !username || !email || !password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    const errors: ValidationErrors = {}

    const usernameError = validateUsername(username)
    if (usernameError) {
      errors.username = usernameError
    } else {
      const isUsernameUnique = await checkUsernameUniqueness(username)
      if (!isUsernameUnique) {
        errors.username = 'Username is already taken'
      }
    }

    if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address'
    } else {
      const isEmailUnique = await checkEmailUniqueness(email)
      if (!isEmailUnique) {
        errors.email = 'Email is already registered'
      }
    }

    const passwordError = validatePassword(password)
    if (passwordError) {
      errors.password = passwordError
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setError('Please fix the errors below')
      setLoading(false)
      return
    }

    try {
      const existingUsers = localStorage.getItem('lambrk_users')
      const users = existingUsers ? JSON.parse(existingUsers) : []
      users.push({ username: username.toLowerCase(), email: email.toLowerCase() })
      localStorage.setItem('lambrk_users', JSON.stringify(users))

      await new Promise(resolve => setTimeout(resolve, 1000))
      login({
        name: name,
        username: username,
        email: email,
      })
      router.push('/')
    } catch (err) {
      setError('Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      login({
        name: 'Google User',
        username: 'googleuser',
        email: 'user@gmail.com',
        profileImage: 'https://via.placeholder.com/150',
      })
      router.push('/')
    } catch (err) {
      setError('Google sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-dark-bg flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block mb-4">
            <h1 className="text-3xl font-bold text-white">Lambrk</h1>
          </Link>
          <h2 className="text-2xl font-semibold text-white mb-2">Create an account</h2>
          <p className="text-gray-400">Join Lambrk to get started</p>
        </div>

        <div className="bg-gray-900 rounded-lg border border-gray-800 p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-900/50 border border-red-700 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  setError('')
                }}
                placeholder="Enter your full name"
                className="w-full bg-gray-800 border border-gray-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">@</span>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  placeholder="username"
                  className={`w-full bg-gray-800 border ${
                    validationErrors.username ? 'border-red-600' : 'border-gray-700'
                  } text-white px-4 py-3 pl-8 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`}
                  required
                  disabled={loading}
                  pattern="[a-zA-Z0-9_]+"
                  minLength={3}
                  maxLength={30}
                />
              </div>
              {validationErrors.username ? (
                <p className="text-xs text-red-400 mt-1">{validationErrors.username}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">3-30 characters, alphanumeric and underscores only</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Enter your email"
                className={`w-full bg-gray-800 border ${
                  validationErrors.email ? 'border-red-600' : 'border-gray-700'
                } text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors`}
                required
                disabled={loading}
              />
              {validationErrors.email && (
                <p className="text-xs text-red-400 mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="Create a password"
                  className={`w-full bg-gray-800 border ${
                    validationErrors.password ? 'border-red-600' : 'border-gray-700'
                  } text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors pr-12`}
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  disabled={loading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.password ? (
                <p className="text-xs text-red-400 mt-1">{validationErrors.password}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Minimum 8 characters with uppercase, lowercase, and number</p>
              )}
            </div>

            <div className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                id="terms"
                className="w-4 h-4 mt-0.5 text-blue-600 bg-gray-800 border-gray-700 rounded focus:ring-blue-500"
                required
                disabled={loading}
              />
              <label htmlFor="terms" className="text-gray-400">
                I agree to the{' '}
                <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="#" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="mt-6 w-full flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 disabled:bg-gray-800 disabled:cursor-not-allowed border border-gray-700 text-white font-medium py-3 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>{loading ? 'Signing up...' : 'Continue with Google'}</span>
            </button>
          </div>

          <div className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

