'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Course {
  id: string
  code: string
  name: string
}

export default function CourseSearchPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/courses/search?q=${encodeURIComponent(searchQuery)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data)
      } else {
        setError('Failed to search courses')
      }
    } catch (error) {
      setError('An error occurred while searching')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (course: Course) => {
    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(course),
      })

      if (response.ok) {
        router.push('/courses')
      } else {
        setError('Failed to add course')
      }
    } catch (error) {
      setError('An error occurred while adding the course')
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-[#13294B] mb-8">Search for Courses</h1>
        
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by course code or name (e.g., CS 225 or Data Structures)"
              className="flex-1 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#E84A27] sm:text-sm sm:leading-6"
            />
            <button
              type="submit"
              disabled={loading}
              className="rounded-md bg-[#E84A27] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#D73D1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27] disabled:opacity-50"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-red-500 text-sm mb-4">{error}</div>
        )}

        <div className="space-y-4">
          {searchResults.map((course) => (
            <div
              key={course.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm ring-1 ring-gray-900/5"
            >
              <div>
                <h3 className="text-lg font-semibold text-[#13294B]">
                  {course.code}
                </h3>
                <p className="text-gray-600">{course.name}</p>
              </div>
              <button
                onClick={() => handleAddCourse(course)}
                className="rounded-md bg-[#E84A27] px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-[#D73D1C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E84A27]"
              >
                Add Course
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 