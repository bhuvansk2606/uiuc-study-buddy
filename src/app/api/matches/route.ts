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

    // For mock data, return the same matches for all users
    return NextResponse.json({ matches: mockMatches })
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

    // For mock data, just return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update match:', error)
    return NextResponse.json(
      { error: 'Failed to update match' },
      { status: 500 }
    )
  }
} 