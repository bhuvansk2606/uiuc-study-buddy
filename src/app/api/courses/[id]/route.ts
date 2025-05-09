import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const params = await context.params;
    const courseId = params.id;
    // Disconnect the user from the course by email
    await prisma.course.update({
      where: { id: courseId },
      data: {
        users: {
          disconnect: { email: session.user.email }
        }
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing course:', error)
    return NextResponse.json({ error: 'Failed to remove course' }, { status: 500 })
  }
} 