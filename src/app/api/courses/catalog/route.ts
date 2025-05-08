import { NextResponse } from 'next/server'
import { loadCourseCatalog } from '@/lib/courseValidation'

export async function GET() {
  try {
    const catalog = loadCourseCatalog()
    
    // Format the catalog for the frontend
    const courses = catalog.map(course => ({
      code: `${course.Subject} ${course.Number}`.trim(),
      name: course.Title.trim(),
      subject: course.Subject.trim()
    }))
    // Filter out any entries missing required fields
    .filter(course => course.code && course.name && course.subject)

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error loading course catalog:', error)
    return NextResponse.json(
      { error: 'Failed to load course catalog' },
      { status: 500 }
    )
  }
} 