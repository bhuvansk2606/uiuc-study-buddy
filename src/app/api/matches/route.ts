import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// Mock data for matches
const mockMatches = [
  {
    id: '1',
    course: { id: '1', code: 'CS 225', name: 'Data Structures', semester: 'SP24' },
    user: { id: '2', name: 'Jane Smith', netId: 'jsmith2' },
    status: 'pending',
  },
  {
    id: '2',
    course: { id: '2', code: 'CS 374', name: 'Algorithms & Models of Computation', semester: 'SP24' },
    user: { id: '3', name: 'Bob Johnson', netId: 'bjohns3' },
    status: 'accepted',
  },
]

export async function GET() {
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

    // Find all matches where the user is involved
    const matches = await prisma.match.findMany({
      where: {
        users: {
          some: {
            netId: user.netId
          }
        }
      },
      include: {
        users: true
      }
    })

    // Format the matches for the frontend
    const formattedMatches = await Promise.all(matches.map(async (match) => {
      const otherUser = match.users.find((u) => u.netId !== user.netId)
      // Fetch course details
      let courseObj = { id: match.course, code: '-', name: '-' }
      try {
        const course = await prisma.course.findUnique({ where: { id: match.course } })
        if (course) {
          courseObj = { id: course.id, code: course.code, name: course.name }
        }
      } catch {}
      return {
        id: match.id,
        course: courseObj,
        user: otherUser
          ? {
              id: otherUser.id,
              name: otherUser.name,
              netId: otherUser.netId
            }
          : null,
        status: match.status
      }
    }))

    return NextResponse.json({ matches: formattedMatches })
  } catch (error) {
    console.error('Failed to fetch matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = JSON.parse(userCookie.value)
    const { courseId, targetNetId } = await request.json()
    if (!courseId || !targetNetId) {
      return NextResponse.json({ error: 'Missing courseId or targetNetId' }, { status: 400 })
    }
    // Find the target user
    const targetUser = await prisma.user.findUnique({ where: { netId: targetNetId } })
    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 404 })
    }
    // Prevent duplicate matches
    const existingMatch = await prisma.match.findFirst({
      where: {
        course: courseId,
        users: {
          some: { netId: user.netId }
        },
        AND: {
          users: {
            some: { netId: targetNetId }
          }
        },
        status: { in: ['pending', 'accepted'] }
      }
    })
    if (existingMatch) {
      return NextResponse.json({ match: existingMatch })
    }
    // Create a match (pending)
    const match = await prisma.match.create({
      data: {
        users: {
          connect: [
            { netId: user.netId },
            { netId: targetNetId }
          ]
        },
        course: courseId,
        status: 'pending'
      }
    })
    return NextResponse.json({ match })
  } catch (error) {
    console.error('Error creating match:', error)
    return NextResponse.json({ error: 'Failed to create match' }, { status: 500 })
  }
}

// DELETE handler to allow unrequesting a pending match
export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('user');
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const user = JSON.parse(userCookie.value)
    const { courseId, targetNetId } = await request.json()
    if (!courseId || !targetNetId) {
      return NextResponse.json({ error: 'Missing courseId or targetNetId' }, { status: 400 })
    }
    // Find the pending match
    const match = await prisma.match.findFirst({
      where: {
        course: courseId,
        users: {
          some: { netId: user.netId }
        },
        AND: {
          users: {
            some: { netId: targetNetId }
          }
        },
        status: 'pending'
      }
    })
    if (!match) {
      return NextResponse.json({ error: 'No pending match found' }, { status: 404 })
    }
    await prisma.match.delete({ where: { id: match.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting match:', error)
    return NextResponse.json({ error: 'Failed to delete match' }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')

    if (!userCookie) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { matchId, status } = await request.json()

    if (!matchId || !status) {
      return NextResponse.json(
        { error: 'Match ID and status are required' },
        { status: 400 }
      )
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update the match status in the database
    await prisma.match.update({
      where: { id: matchId },
      data: { status }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
} 