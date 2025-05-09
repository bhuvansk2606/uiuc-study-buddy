import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { validateCourse } from '@/lib/courseValidation'
import { authOptions } from '@/lib/auth'

// Mock data for courses
const mockCourses = [
  { id: '1', code: 'CS 225', name: 'Data Structures' },
  { id: '2', code: 'CS 374', name: 'Algorithms & Models of Computation' },
  { id: '3', code: 'CS 241', name: 'System Programming' },
]

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (code) {
      const course = await prisma.course.findFirst({ where: { code } });
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      return NextResponse.json({ course });
    }

    // Use Prisma ORM to fetch user's courses
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { courses: true }
    });
    const courses = user?.courses || [];

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      console.log('No session user email')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { code, name } = await request.json()
    console.log('POST /api/courses - code:', code, 'name:', name, 'session.user.email:', session.user.email)

    // Validate course against catalog
    const validation = validateCourse(code, name)
    if (!validation.isValid) {
      console.log('Course validation failed:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if user exists in the database using raw query
    const users = await prisma.$queryRaw`
      SELECT * FROM User WHERE email = ${session.user.email}
    `
    const user = users[0]
    console.log('User found in DB:', user)

    if (!user) {
      console.log('User not found in DB for email:', session.user.email)
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 400 }
      )
    }

    // Check if user is already enrolled in this course
    const existingEnrollments = await prisma.$queryRaw`
      SELECT c.* FROM Course c
      INNER JOIN _CourseToUser cu ON c.id = cu.B
      INNER JOIN User u ON u.id = cu.A
      WHERE u.email = ${session.user.email} AND c.code = ${code}
    `
    const existingEnrollment = existingEnrollments[0]
    console.log('Existing enrollment:', existingEnrollment)

    if (existingEnrollment) {
      console.log('User already enrolled in course:', code)
      return NextResponse.json(
        { error: `You are already enrolled in ${code}` },
        { status: 400 }
      )
    }

    // Find or create the course
    let course = await prisma.course.findFirst({ where: { code } });
    if (!course) {
      console.log('Creating new course:', code)
      course = await prisma.course.create({
        data: {
          code,
          name,
          users: {
            connect: [{ id: user.id }]
          }
        }
      });
      console.log('Created course:', course)
    } else {
      console.log('Updating course to connect user:', course.id, user.id)
      await prisma.course.update({
        where: { id: course.id },
        data: {
          users: {
            connect: [{ id: user.id }]
          }
        }
      });
    }
    return NextResponse.json({ course })
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 