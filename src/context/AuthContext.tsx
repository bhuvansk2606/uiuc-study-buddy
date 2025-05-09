'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

interface User {
  name: string
  email: string
  id: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    console.log('AuthContext - Session status:', status)
    console.log('AuthContext - Session data:', session)

    if (status === 'loading') {
      setLoading(true)
    } else if (session?.user) {
      // Extract user data from session
      const userData = {
        name: session.user.name || '',
        email: session.user.email || '',
        id: (session.user as any).id || ''
      }
      console.log('AuthContext - Setting user data:', userData)
      setUser(userData)
      setLoading(false)
    } else {
      console.log('AuthContext - No session, clearing user')
      setUser(null)
      setLoading(false)
    }
  }, [session, status])

  const signOut = async () => {
    try {
      await router.push('/')
      setUser(null)
    } catch (error) {
      console.error('Error during sign out:', error)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
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