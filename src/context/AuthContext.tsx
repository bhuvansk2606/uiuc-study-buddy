'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  name: string
  netId: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (name: string, netId: string, phoneNumber: string) => Promise<void>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/session')
        if (response.ok) {
          const data = await response.json()
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to check session:', error)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const signIn = async (name: string, netId: string, phoneNumber: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, netId, phoneNumber }),
      })

      if (response.ok) {
        setUser({ name, netId })
        router.push('/courses')
      } else {
        throw new Error('Failed to sign in')
      }
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = () => {
    setUser(null)
    router.push('/auth')
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
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