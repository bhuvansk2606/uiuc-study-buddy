import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { validateCourse } from '@/lib/courseValidation'

// Mock data for courses
const mockCourses = [
  { id: '1', code: 'CS 225', name: 'Data Structures' },
  { id: '2', code: 'CS 374', name: 'Algorithms & Models of Computation' },
  { id: '3', code: 'CS 241', name: 'System Programming' },
]

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (code) {
      const course = await prisma.course.findFirst({ where: { code } });
      if (!course) {
        return NextResponse.json({ error: 'Course not found' }, { status: 404 });
      }
      return NextResponse.json({ course });
    }

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userCookie.value)
    const courses = await prisma.course.findMany({
      where: {
        users: {
          some: {
            netId: user.netId
          }
        }
      }
    })

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
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');

    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userCookie.value)
    const { code, name } = await request.json()

    // Validate course against catalog
    const validation = validateCourse(code, name)
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Check if user exists in the database
    const dbUser = await prisma.user.findUnique({
      where: { netId: user.netId }
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found in database' },
        { status: 400 }
      )
    }

    // Check if user is already enrolled in this course
    const existingEnrollment = await prisma.course.findFirst({
      where: {
        code,
        users: {
          some: {
            netId: user.netId
          }
        }
      }
    })

    if (existingEnrollment) {
      return NextResponse.json(
        { error: `You are already enrolled in ${code}` },
        { status: 400 }
      )
    }

    // Find or create the course
    let course = await prisma.course.findFirst({ where: { code } });
    if (!course) {
      course = await prisma.course.create({
        data: {
          code,
          name,
          users: {
            connect: [{ netId: user.netId }]
          }
        }
      });
    } else {
      // Add user to course if not already enrolled
      await prisma.course.update({
        where: { id: course.id },
        data: {
          users: {
            connect: [{ netId: user.netId }]
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