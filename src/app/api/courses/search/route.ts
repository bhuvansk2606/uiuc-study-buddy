import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Mock course data - in a real app, this would come from a database or external API
const mockCourses = [
  {
    id: '1',
    code: 'CS 225',
    name: 'Data Structures',
    semester: 'Fall 2024',
  },
  {
    id: '2',
    code: 'CS 233',
    name: 'Computer Architecture',
    semester: 'Fall 2024',
  },
  {
    id: '3',
    code: 'CS 241',
    name: 'System Programming',
    semester: 'Fall 2024',
  },
  {
    id: '4',
    code: 'CS 374',
    name: 'Introduction to Algorithms & Models of Computation',
    semester: 'Fall 2024',
  },
  {
    id: '5',
    code: 'CS 421',
    name: 'Programming Languages & Compilers',
    semester: 'Fall 2024',
  },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q')?.toLowerCase() || ''

  // Filter courses based on the search query
  const results = mockCourses.filter(
    (course) =>
      course.code.toLowerCase().includes(query) ||
      course.name.toLowerCase().includes(query)
  )

  return NextResponse.json(results)
} 