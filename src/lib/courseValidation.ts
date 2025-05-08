import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

interface CourseCatalogEntry {
  Subject: string
  Number: string
  Title: string
  Description: string
  CreditHours: string
  DegreeAttributes: string
}

let courseCatalog: CourseCatalogEntry[] = []

export function loadCourseCatalog(): CourseCatalogEntry[] {
  if (courseCatalog.length > 0) return courseCatalog

  try {
    const filePath = path.join(process.cwd(), 'course-catalog-cleaned.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    courseCatalog = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    })

    return courseCatalog
  } catch (error) {
    console.error('Error loading course catalog:', error)
    return []
  }
}

export function validateCourse(code: string, name: string): { isValid: boolean; error?: string } {
  const catalog = loadCourseCatalog()
  if (catalog.length === 0) {
    return {
      isValid: false,
      error: 'Course catalog is not available'
    }
  }
  
  // Split the course code into subject and number
  const [subject, number] = code.split(' ').map(s => s.trim())
  
  if (!subject || !number) {
    return {
      isValid: false,
      error: 'Invalid course code format. Please use format like "CS 225"'
    }
  }

  // Find matching course in catalog
  const matchingCourse = catalog.find(
    course => 
      course.Subject === subject && 
      course.Number === number
  )

  if (!matchingCourse) {
    return {
      isValid: false,
      error: `Course ${code} not found in course catalog`
    }
  }

  // Check if the provided name matches the catalog name (case-insensitive)
  if (matchingCourse.Title.toLowerCase() !== name.toLowerCase()) {
    return {
      isValid: false,
      error: `Course name doesn't match catalog. Expected: "${matchingCourse.Title}"`
    }
  }

  return { isValid: true }
}

export function getCourseName(code: string): string | null {
  const catalog = loadCourseCatalog()
  if (catalog.length === 0) {
    return null
  }

  const [subject, number] = code.split(' ').map(s => s.trim())
  
  const matchingCourse = catalog.find(
    course => 
      course.Subject === subject && 
      course.Number === number
  )

  return matchingCourse ? matchingCourse.Title : null
}

export function getCourseDetails(code: string): CourseCatalogEntry | null {
  const catalog = loadCourseCatalog()
  if (catalog.length === 0) {
    return null
  }

  const [subject, number] = code.split(' ').map(s => s.trim())
  
  return catalog.find(
    course => 
      course.Subject === subject && 
      course.Number === number
  ) || null
} 