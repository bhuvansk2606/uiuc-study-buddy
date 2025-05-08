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
        <Combobox value={selectedCourse} onChange={handleSelect}>
          <div className="relative">
            <Combobox.Input
              className="w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:border-[#E84A27] focus:ring-[#E84A27]"
              onChange={(event) => setQuery(event.target.value)}
              displayValue={(course: Course) => course ? `${course.code} - ${course.name}` : ''}
              placeholder="Search by course code, name, or subject..."
            />
            <Combobox.Button className="absolute inset-y-0 right-0 flex items-center pr-2">
              <ChevronUpDownIcon
                className="h-5 w-5 text-gray-400"
                aria-hidden="true"
              />
            </Combobox.Button>
          </div>
          <Combobox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {filteredCourses.length === 0 && query !== '' ? (
              <div className="relative cursor-default select-none py-2 px-4 text-gray-700">
                Nothing found.
              </div>
            ) : (
              filteredCourses.map((course) => (
                <Combobox.Option
                  key={course.code}
                  className={({ active }) =>
                    `relative cursor-default select-none py-2 pl-4 pr-4 ${
                      active ? 'bg-[#E84A27] text-white' : 'text-gray-900'
                    }`
                  }
                  value={course}
                >
                  {({ selected, active }) => (
                    <div className="flex flex-col">
                      <span className={`block truncate font-medium`}>
                        {course.code}
                      </span>
                      <span className={`block truncate text-sm ${active ? 'text-white' : 'text-gray-500'}`}>
                        {course.name}
                      </span>
                      <span className={`block truncate text-xs ${active ? 'text-white' : 'text-gray-400'}`}>
                        {course.subject}
                      </span>
                    </div>
                  )}
                </Combobox.Option>
              ))
            )}
          </Combobox.Options>
        </Combobox>
      </div>

      {error && (
        <p className="text-red-500 text-sm">{error}</p>
      )}
    </div>
  )
} 