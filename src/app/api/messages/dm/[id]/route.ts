import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request, context: any) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const params = await context.params
    const recipientEmail = params.id

    // Get the current user
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!currentUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get the recipient user
    const recipientUser = await prisma.user.findUnique({
      where: { email: recipientEmail }
    })

    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Get messages between the two users
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          {
            AND: [
              { senderId: currentUser.id },
              { recipientId: recipientUser.id }
            ]
          },
          {
            AND: [
              { senderId: recipientUser.id },
              { recipientId: currentUser.id }
            ]
          }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Failed to fetch messages:', error)
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
} 