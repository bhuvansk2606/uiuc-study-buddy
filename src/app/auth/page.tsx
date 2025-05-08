'use client'

import { signIn } from 'next-auth/react'

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#13294B]">
            Sign in to UIUSync
          </h2>
        </div>
        <div className="mt-8 flex flex-col items-center">
          <button
            onClick={() => signIn('azure-ad')}
            className="rounded-md bg-[#E84A27] px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#D73D1C]"
          >
            Sign in with Illinois
          </button>
        </div>
      </div>
    </div>
  )
} 