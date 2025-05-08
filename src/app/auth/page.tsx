'use client'

import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'

export default function AuthPage() {
  const { signIn } = useAuth()
  const [name, setName] = useState('')
  const [netId, setNetId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await signIn(name, netId, phoneNumber)
    } catch (error) {
      setError('Failed to sign in. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#13294B]">
            Sign in to UIUC Study Buddy
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your information to get started
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#E84A27] focus:border-[#E84A27] focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="netId" className="sr-only">
                UIUC NetID
              </label>
              <input
                id="netId"
                name="netId"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#E84A27] focus:border-[#E84A27] focus:z-10 sm:text-sm"
                placeholder="UIUC NetID"
                value={netId}
                onChange={(e) => setNetId(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="phoneNumber" className="sr-only">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="tel"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#E84A27] focus:border-[#E84A27] focus:z-10 sm:text-sm"
                placeholder="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#E84A27] hover:bg-[#D73D1C] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 