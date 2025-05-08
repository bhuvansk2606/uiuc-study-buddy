import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

interface RawCourseEntry {
  Subject: string
  Number: string
  Name: string
  Description: string
  'Credit Hours': string
  'Degree Attributes': string
}

interface CleanedCourseEntry {
  Subject: string
  Number: string
  Title: string
  Description: string
  CreditHours: string
  DegreeAttributes: string
}

function cleanCourseCatalog() {
  try {
    // Read the original CSV file
    const filePath = path.join(process.cwd(), 'course-catalog.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')
    
    // Parse the CSV
    const courses = parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    }) as RawCourseEntry[]

    // Create a map to store unique courses
    const uniqueCourses = new Map<string, CleanedCourseEntry>()

    // Process each course
    courses.forEach(course => {
      // Skip invalid entries
      if (!course || !course.Subject || !course.Number || !course.Name) {
        return
      }

      // Create a unique key combining subject and number
      const key = `${course.Subject.trim()}-${course.Number.trim()}`
      
      // Only keep the first occurrence of each course
      if (!uniqueCourses.has(key)) {
        uniqueCourses.set(key, {
          Subject: course.Subject.trim(),
          Number: course.Number.trim(),
          Title: course.Name.trim(),
          Description: course.Description ? course.Description.trim() : '',
          CreditHours: course['Credit Hours'] ? course['Credit Hours'].trim() : '',
          DegreeAttributes: course['Degree Attributes'] ? course['Degree Attributes'].trim() : ''
        })
      }
    })

    // Convert the map back to an array
    const cleanedCourses = Array.from(uniqueCourses.values())

    // Sort the courses by subject and number
    cleanedCourses.sort((a, b) => {
      if (a.Subject !== b.Subject) {
        return a.Subject.localeCompare(b.Subject)
      }
      return a.Number.localeCompare(b.Number)
    })

    // Write the cleaned data back to a new CSV file
    const outputPath = path.join(process.cwd(), 'course-catalog-cleaned.csv')
    const output = stringify(cleanedCourses, {
      header: true,
      columns: ['Subject', 'Number', 'Title', 'Description', 'CreditHours', 'DegreeAttributes']
    })

    fs.writeFileSync(outputPath, output)
    console.log(`Cleaned course catalog written to ${outputPath}`)
    console.log(`Original courses: ${courses.length}`)
    console.log(`Cleaned courses: ${cleanedCourses.length}`)
  } catch (error) {
    console.error('Error cleaning course catalog:', error)
    process.exit(1)
  }
}

cleanCourseCatalog() 