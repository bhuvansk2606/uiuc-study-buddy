import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, context: any) {
  try {
    const params = await context.params;
    const courseId = params.id;
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        users: {
          select: { name: true, netId: true }
        }
      }
    })
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }
    return NextResponse.json({ users: course.users })
  } catch (error) {
    console.error('Error fetching users for course:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
} 