'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface Course {
  id: string
  code: string
  name: string
  semester: string
}

interface User {
  id: string
  name: string
  netId: string
}

interface Match {
  id: string
  course: Course
  user: User
  status: 'pending' | 'accepted' | 'rejected'
}

export default function MatchesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchCourses()
      fetchMatches()
    }
  }, [user])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.courses)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches)
      }
    } catch (error) {
      console.error('Failed to fetch matches:', error)
    }
  }

  const handleMatchResponse = async (matchId: string, status: 'accepted' | 'rejected') => {
    try {
      const response = await fetch('/api/matches', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matchId, status }),
      })

      if (response.ok) {
        fetchMatches()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to update match status')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E84A27]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[#13294B] mb-8">Study Partners</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold text-[#13294B] mb-4">My Courses</h2>
        {courses.length === 0 ? (
          <p className="text-gray-500">No courses added yet.</p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-[#13294B]">{course.code}</h3>
                  <p className="text-gray-600">{course.name}</p>
                  <p className="text-sm text-gray-500">{course.semester}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-[#13294B] mb-4">My Matches</h2>
        {matches.length === 0 ? (
          <p className="text-gray-500">No matches yet.</p>
        ) : (
          <div className="space-y-4">
            {matches.map((match) => (
              <div
                key={match.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div>
                  <h3 className="font-medium text-[#13294B]">
                    {match.course.code} - {match.course.name}
                  </h3>
                  <p className="text-gray-600">
                    Study Partner: {match.user.name} ({match.user.netId})
                  </p>
                  <p className="text-sm text-gray-500">
                    Status: {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                  </p>
                </div>
                {match.status === 'pending' && (
                  <div className="space-x-2">
                    <button
                      onClick={() => handleMatchResponse(match.id, 'accepted')}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleMatchResponse(match.id, 'rejected')}
                      className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 