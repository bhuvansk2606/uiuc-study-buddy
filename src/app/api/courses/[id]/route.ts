import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export async function DELETE(request: Request, context: any) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = JSON.parse(userCookie.value)
    const params = await context.params;
    const courseId = params.id;
    // Disconnect the user from the course
    await prisma.course.update({
      where: { id: courseId },
      data: {
        users: {
          disconnect: { netId: user.netId }
        }
      }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing course:', error)
    return NextResponse.json({ error: 'Failed to remove course' }, { status: 500 })
  }
} 