import { useState, useEffect } from 'react'
import { Combobox } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/20/solid'

interface Course {
  code: string
  name: string
  subject: string
}

interface CourseSearchProps {
  onSelect: (course: Course) => void
  error?: string
}

function normalize(str: string) {
  return str.replace(/\s+/g, '').toLowerCase()
}

export default function CourseSearch({ onSelect, error }: CourseSearchProps) {
  const [query, setQuery] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])

  useEffect(() => {
    // Load course catalog and format it for the search
    const loadCourses = async () => {
      try {
        const response = await fetch('/api/courses/catalog')
        const data = await response.json()
        // Filter out any malformed course data
        const validCourses = data.courses.filter((course: any) => 
          course && 
          typeof course.code === 'string' && 
          typeof course.name === 'string' &&
          typeof course.subject === 'string'
        )
        setCourses(validCourses)
      } catch (error) {
        console.error('Failed to load courses:', error)
        setCourses([])
      }
    }
    loadCourses()
  }, [])

  useEffect(() => {
    const handler = setTimeout(() => {
      const searchTerm = normalize(query)
      let matches: Course[]
      if (searchTerm === '') {
        matches = [] // Show no options if nothing is typed
      } else {
        matches = courses.filter((course) => {
          if (!course || !course.name || !course.code || !course.subject) return false
          return (
            normalize(course.name).includes(searchTerm) ||
            normalize(course.code).includes(searchTerm) ||
            normalize(course.subject).includes(searchTerm)
          )
        })
      }
      setFilteredCourses(matches.slice(0, 50))
    }, 100)
    return () => clearTimeout(handler)
  }, [query, courses])

  const handleSelect = (course: Course) => {
    if (!course || !course.code || !course.name) return
    setSelectedCourse(course)
    onSelect(course)
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by course code, name, or subject..."
          className="w-full px-4 py-3 rounded-lg border border-white/20 bg-white text-[#0A1A2F] placeholder-[#0A1A2F]/60 focus:outline-none focus:ring-2 focus:ring-[#E84A27] focus:border-transparent"
        />
        {filteredCourses.length > 0 && (
          <ul className="mt-2 max-h-60 overflow-auto rounded-lg border border-white/20 bg-white/10 backdrop-blur-sm">
            {filteredCourses.map((course) => (
              <li
                key={course.code}
                onClick={() => handleSelect(course)}
                className="px-4 py-2 hover:bg-white/20 cursor-pointer text-white/90"
              >
                <div className="flex items-center">
                  <span className="font-medium text-[#E84A27]">{course.code}</span>
                  <span className="ml-2 text-sm">{course.name}</span>
                  <span className="ml-2 text-xs text-white/70">({course.subject})</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
} 