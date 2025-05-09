'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Course {
  code: string
  name: string
  subject: string
}

interface User {
  name: string | null
  netId: string
}

interface Match {
  id: string
  course: string
  user: User
  status: 'pending' | 'accepted' | 'rejected'
}

export default function MatchesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, matchesRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/matches')
        ])

        if (coursesRes.ok && matchesRes.ok) {
          const [coursesData, matchesData] = await Promise.all([
            coursesRes.json(),
            matchesRes.json()
          ])
          setCourses(coursesData.courses)
          setMatches(matchesData.matches)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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
              Study Partners
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
                Loading your study partners...
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
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#FF5F05] via-[#E84A27] to-[#D73D1C] bg-clip-text text-transparent mb-4">
            Study Partners
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            className="flex flex-col p-8 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">My Courses</h2>
            {courses.length === 0 ? (
              <p className="text-white/80">No courses added yet.</p>
            ) : (
              <ul className="space-y-4">
                {courses.map((course) => (
                  <motion.li
                    key={course.code}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-[#E84A27] font-medium">{course.code}</p>
                      <p className="text-white/80 text-sm">{course.name}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push(`/courses`)}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#E84A27] rounded-lg hover:bg-[#C73E1D] transition-colors"
                    >
                      View Course
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>

          <motion.div
            variants={fadeInUp}
            initial="initial"
            animate="animate"
            transition={{ delay: 0.2 }}
            className="flex flex-col p-8 rounded-2xl bg-white/10 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/20"
          >
            <h2 className="text-2xl font-semibold text-white mb-4">My Matches</h2>
            {matches.length === 0 ? (
              <p className="text-white/80">No matches yet.</p>
            ) : (
              <ul className="space-y-4">
                {matches.map((match) => (
                  <motion.li
                    key={match.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div>
                      <p className="text-[#E84A27] font-medium">{match.course}</p>
                      <p className="text-white/80 text-sm">{match.user?.name || match.user?.netId}</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push(`/dm/${match.user?.netId}`)}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#E84A27] rounded-lg hover:bg-[#C73E1D] transition-colors"
                    >
                      Message
                    </motion.button>
                  </motion.li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 