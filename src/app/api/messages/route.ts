import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json(
        { error: 'Course ID is required' },
        { status: 400 }
      )
    }

    const messages = await prisma.message.findMany({
      where: {
        courseId: courseId
      },
      include: {
        sender: {
          select: {
            name: true,
            netId: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = JSON.parse(userCookie.value)
    const { content, courseId } = await request.json()

    if (!content || !courseId) {
      return NextResponse.json(
        { error: 'Content and courseId are required' },
        { status: 400 }
      )
    }

    // Find the user in the database by netId
    const dbUser = await prisma.user.findUnique({ where: { netId: user.netId } })
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 400 })
    }

    // Optionally, check that the user is enrolled in the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: { users: { where: { netId: user.netId } } }
    })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    if (!course.users.length) {
      return NextResponse.json({ error: 'You are not enrolled in this course' }, { status: 403 })
    }

    const message = await prisma.message.create({
      data: {
        content,
        courseId,
        senderId: dbUser.id
      },
      include: {
        sender: {
          select: {
            name: true,
            netId: true
          }
        }
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Error creating message:', error, JSON.stringify(error, Object.getOwnPropertyNames(error)))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 