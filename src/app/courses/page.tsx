'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import CourseSearch from '@/components/CourseSearch'

interface Course {
  id: string
  code: string
  name: string
  subject: string
}

interface StudyPartner {
  id: string
  name: string
  netId?: string
  email: string
}

interface Match {
  id: string
  course: Course
  user: StudyPartner
  status: 'pending' | 'accepted' | 'rejected'
}

export default function CoursesPage() {
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [studyPartners, setStudyPartners] = useState<Record<string, StudyPartner[]>>({})
  const [showPartnersFor, setShowPartnersFor] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] = useState<Record<string, string>>({})
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    fetchCourses()
    fetchCurrentUser()
    fetchMatches()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setCurrentUserEmail(data.user?.email || null)
      }
    } catch {}
  }

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error('Failed to fetch courses')
      }
      const data = await response.json()
      setCourses(data.courses)
    } catch (error) {
      setError('Failed to load courses')
    } finally {
      setIsLoading(false)
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
      // ignore
    }
  }

  const handleCourseSelect = async (course: { code: string; name: string; subject: string }) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to add course')
      }

      // Refresh the courses list
      fetchCourses()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to add course')
    }
  }

  const handleRemoveCourse = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to remove course')
      }

      // Refresh the courses list
      fetchCourses()
    } catch (error) {
      setError('Failed to remove course')
    }
  }

  const handleFindPartners = async (courseId: string) => {
    try {
      const response = await fetch(`/api/courses/${courseId}/users`)
      if (!response.ok) {
        throw new Error('Failed to fetch study partners')
      }
      const data = await response.json()
      setStudyPartners((prev) => ({ ...prev, [courseId]: data.users }))
      setShowPartnersFor(courseId)
    } catch (error) {
      setError('Failed to fetch study partners')
    }
  }

  const handleRequest = async (courseId: string, targetEmail: string) => {
    setRequestStatus((prev) => ({ ...prev, [targetEmail]: 'pending' }))
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, targetEmail })
      })
      if (!response.ok) {
        const data = await response.json()
        setRequestStatus((prev) => ({ ...prev, [targetEmail]: data.error || 'error' }))
      } else {
        setRequestStatus((prev) => ({ ...prev, [targetEmail]: 'requested' }))
        fetchMatches()
      }
    } catch {
      setRequestStatus((prev) => ({ ...prev, [targetEmail]: 'error' }))
    }
  }

  const handleUnrequest = async (courseId: string, targetEmail: string) => {
    setRequestStatus((prev) => ({ ...prev, [targetEmail]: 'pending' }))
    try {
      const response = await fetch('/api/matches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, targetEmail })
      })
      if (response.ok) {
        setRequestStatus((prev) => ({ ...prev, [targetEmail]: '' }))
        fetchMatches()
      } else {
        setRequestStatus((prev) => ({ ...prev, [targetEmail]: 'error' }))
      }
    } catch {
      setRequestStatus((prev) => ({ ...prev, [targetEmail]: 'error' }))
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">Loading courses...</h2>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">My Courses</h2>
          <p className="mt-2 text-sm text-gray-600">
            Add courses to find study buddies and join course-specific chats
          </p>
        </div>

        <div className="mt-8 max-w-xl mx-auto">
          <CourseSearch onSelect={handleCourseSelect} error={error} />
        </div>

        <div className="mt-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {courses.map((course) => (
                <li key={course.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-[#E84A27] truncate">
                          {course.code}
                        </p>
                        <p className="ml-2 text-sm text-gray-500">
                          {course.name}
                        </p>
                        <p className="ml-2 text-xs text-gray-400">
                          {course.subject}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => router.push(`/chat/${course.code}`)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-[#E84A27] hover:bg-[#C73E1D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
                        >
                          Chat
                        </button>
                        <button
                          onClick={() => handleRemoveCourse(course.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
                        >
                          Remove
                        </button>
                        <button
                          onClick={() => handleFindPartners(course.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-[#E84A27] text-xs font-medium rounded text-[#E84A27] bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
                        >
                          Find Study Partners
                        </button>
                      </div>
                    </div>
                    {showPartnersFor === course.id && studyPartners[course.id] && (
                      <div className="mt-2 p-2 bg-gray-50 rounded border border-gray-200" style={{ maxHeight: 200, overflowY: 'auto' }}>
                        <strong>Study Partners:</strong>
                        <ul className="list-disc ml-5">
                          {(() => {
                            // Build a map of unique partners for this course
                            const uniquePartners = new Map();
                            matches.forEach((m) => {
                              if (m.course === course.id && m.user && m.user.email !== currentUserEmail && m.status !== 'rejected') {
                                // Only keep the first (most relevant) match for each partner
                                if (!uniquePartners.has(m.user.email)) {
                                  uniquePartners.set(m.user.email, m);
                                }
                              }
                            });
                            return studyPartners[course.id]
                              .filter((partner) => partner.email !== currentUserEmail && uniquePartners.has(partner.email))
                              .map((partner) => {
                                const match = uniquePartners.get(partner.email);
                                return (
                                  <li key={partner.email} className="flex items-center justify-between mb-1">
                                    <span>{partner.name || partner.email} {partner.netId ? `(${partner.netId})` : ''}</span>
                                    {match ? (
                                      match.status === 'pending' ? (
                                        <button
                                          onClick={() => handleUnrequest(course.id, partner.email)}
                                          className="ml-2 px-2 py-1 text-xs rounded bg-gray-400 text-white hover:bg-gray-500 focus:outline-none"
                                        >
                                          Requested (Unrequest)
                                        </button>
                                      ) : match.status === 'accepted' ? (
                                        <button
                                          onClick={() => router.push(`/dm/${partner.email}`)}
                                          className="ml-2 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                                        >
                                          Direct Message
                                        </button>
                                      ) : null
                                    ) : (
                                      <button
                                        onClick={() => handleRequest(course.id, partner.email)}
                                        className="ml-2 px-2 py-1 text-xs rounded bg-[#E84A27] text-white hover:bg-[#D73D1C] focus:outline-none"
                                      >
                                        Request Match
                                      </button>
                                    )}
                                  </li>
                                );
                              });
                          })()}
                        </ul>
                      </div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
} 