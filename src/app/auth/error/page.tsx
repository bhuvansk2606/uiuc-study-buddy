'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#13294B]">
            Authentication Error
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {error === 'AccessDenied' 
              ? 'Only @illinois.edu email addresses are allowed to sign in.'
              : 'An error occurred during sign in.'}
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <Link
            href="/"
            className="rounded-md bg-[#E84A27] px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-[#D73D1C]"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
} 