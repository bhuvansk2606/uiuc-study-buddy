'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import CourseSearch from '@/components/CourseSearch'
import { motion } from 'framer-motion'

interface Course {
  code: string
  name: string
  subject: string
}

interface StudyPartner {
  name: string | null
  netId: string
}

export default function CoursesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [studyPartners, setStudyPartners] = useState<Record<string, StudyPartner[]>>({})
  const [showPartnersFor, setShowPartnersFor] = useState<string | null>(null)
  const [requestStatus, setRequestStatus] = useState<Record<string, string>>({})
  const [currentUserNetId, setCurrentUserNetId] = useState<string | null>(null)
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    fetchCurrentUser()
    fetchMatches()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/session')
      if (res.ok) {
        const data = await res.json()
        setCurrentUserNetId(data.user?.netId || null)
      }
    } catch {}
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

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleCourseSelect = async (course: Course) => {
    try {
      const response = await fetch('/api/courses/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      })

      if (!response.ok) {
        throw new Error('Failed to add course')
      }

      // Refresh the courses list
      fetchCourses()
    } catch (error) {
      setError('Failed to add course')
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

  const handleRequest = async (courseId: string, targetNetId: string) => {
    setRequestStatus((prev) => ({ ...prev, [targetNetId]: 'pending' }))
    try {
      const response = await fetch('/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, targetNetId })
      })
      if (!response.ok) {
        const data = await response.json()
        setRequestStatus((prev) => ({ ...prev, [targetNetId]: data.error || 'error' }))
      } else {
        setRequestStatus((prev) => ({ ...prev, [targetNetId]: 'requested' }))
        fetchMatches()
      }
    } catch {
      setRequestStatus((prev) => ({ ...prev, [targetNetId]: 'error' }))
    }
  }

  const handleUnrequest = async (courseId: string, targetNetId: string) => {
    setRequestStatus((prev) => ({ ...prev, [targetNetId]: 'pending' }))
    try {
      const response = await fetch('/api/matches', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, targetNetId })
      })
      if (response.ok) {
        setRequestStatus((prev) => ({ ...prev, [targetNetId]: '' }))
        fetchMatches()
      } else {
        setRequestStatus((prev) => ({ ...prev, [targetNetId]: 'error' }))
      }
    } catch {
      setRequestStatus((prev) => ({ ...prev, [targetNetId]: 'error' }))
    }
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.2
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#13294B] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent mb-8">
              My Courses
            </h1>
            <div className="flex flex-col items-center justify-center space-y-6">
              <motion.div
                className="relative w-16 h-16"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute inset-0 border-4 border-[#E84A27]/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-t-[#E84A27] rounded-full"></div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-white/80 text-lg"
              >
                Loading your courses...
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#13294B] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-5xl font-bold bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent mb-4">
            My Courses
          </h2>
          <motion.p 
            className="mt-4 text-lg text-white/80"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Add courses to find study buddies and join course-specific chats
          </motion.p>
        </motion.div>

        <motion.div 
          className="mt-12 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CourseSearch onSelect={handleCourseSelect} error={error} />
        </motion.div>

        <motion.div 
          className="mt-12"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <div className="bg-white/10 backdrop-blur-sm shadow-lg overflow-hidden sm:rounded-md border border-white/20">
            <ul className="divide-y divide-white/20">
              {courses.map((course, index) => (
                <motion.li 
                  key={course.code}
                  variants={fadeInUp}
                  custom={index}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="px-6 py-5 sm:px-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-base font-medium text-[#E84A27] truncate">
                          {course.code}
                        </p>
                        <p className="ml-3 text-base text-white/90">
                          {course.name}
                        </p>
                        <p className="ml-3 text-sm text-white/70">
                          {course.subject}
                        </p>
                      </div>
                      <div className="flex space-x-3">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => router.push(`/chat/${course.code}`)}
                          className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded text-white bg-[#E84A27] hover:bg-[#C73E1D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
                        >
                          Chat
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleRemoveCourse(course.code)}
                          className="inline-flex items-center px-3 py-2 border border-white/20 text-sm font-medium rounded text-white bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
                        >
                          Remove
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleFindPartners(course.code)}
                          className="inline-flex items-center px-3 py-2 border border-[#E84A27] text-sm font-medium rounded text-[#E84A27] bg-white/10 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E84A27]"
                        >
                          Find Study Partners
                        </motion.button>
                      </div>
                    </div>
                    {showPartnersFor === course.code && studyPartners[course.code] && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-3 p-3 bg-white/5 rounded border border-white/20"
                        style={{ maxHeight: 200, overflowY: 'auto' }}
                      >
                        <strong className="text-white text-base">Study Partners:</strong>
                        <ul className="list-disc ml-5 mt-2">
                          {(() => {
                            // Build a map of unique partners for this course
                            const uniquePartners = new Map();
                            matches.forEach((m) => {
                              if (m.course === course.code && m.user && m.user.netId !== currentUserNetId && m.status !== 'rejected') {
                                // Only keep the first (most relevant) match for each partner
                                if (!uniquePartners.has(m.user.netId)) {
                                  uniquePartners.set(m.user.netId, m);
                                }
                              }
                            });
                            return studyPartners[course.code]
                              .filter((partner) => partner.netId !== currentUserNetId && uniquePartners.has(partner.netId))
                              .map((partner) => {
                                const match = uniquePartners.get(partner.netId);
                                return (
                                  <li key={partner.netId} className="flex items-center justify-between mb-2 text-white/90">
                                    <span className="text-base">{partner.name || partner.netId} ({partner.netId})</span>
                                    {match ? (
                                      match.status === 'pending' ? (
                                        <button
                                          onClick={() => handleUnrequest(course.code, partner.netId)}
                                          className="ml-3 px-3 py-1.5 text-sm rounded bg-gray-400 text-white hover:bg-gray-500 focus:outline-none"
                                        >
                                          Requested (Unrequest)
                                        </button>
                                      ) : match.status === 'accepted' ? (
                                        <button
                                          onClick={() => router.push(`/dm/${partner.netId}`)}
                                          className="ml-3 px-3 py-1.5 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
                                        >
                                          Direct Message
                                        </button>
                                      ) : null
                                    ) : (
                                      <button
                                        onClick={() => handleRequest(course.code, partner.netId)}
                                        className="ml-3 px-3 py-1.5 text-sm rounded bg-[#E84A27] text-white hover:bg-[#C73E1D] focus:outline-none"
                                      >
                                        Request
                                      </button>
                                    )}
                                    {requestStatus[partner.netId] && requestStatus[partner.netId] !== 'requested' && requestStatus[partner.netId] !== 'pending' && (
                                      <span className="ml-3 text-sm text-red-400">{requestStatus[partner.netId]}</span>
                                    )}
                                  </li>
                                );
                              });
                          })()}
                        </ul>
                      </motion.div>
                    )}
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 