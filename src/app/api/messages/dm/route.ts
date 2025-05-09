import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, recipientId } = await request.json()

    if (!content || !recipientId) {
      return NextResponse.json(
        { error: 'Content and recipient ID are required' },
        { status: 400 }
      )
    }

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
      where: { email: recipientId }
    })

    if (!recipientUser) {
      return NextResponse.json(
        { error: 'Recipient not found' },
        { status: 404 }
      )
    }

    // Create the message
    const message = await prisma.directMessage.create({
      data: {
        content,
        senderId: currentUser.id,
        recipientId: recipientUser.id
      }
    })

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
} 