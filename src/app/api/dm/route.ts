import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

// GET: /api/dm?toNetId=...
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userSession = JSON.parse(userCookie.value)
    const user = await prisma.user.findUnique({ where: { netId: userSession.netId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const { searchParams } = new URL(request.url)
    const toNetId = searchParams.get('toNetId')
    if (!toNetId) {
      return NextResponse.json({ error: 'Missing toNetId' }, { status: 400 })
    }
    // Find the recipient user
    const recipient = await prisma.user.findUnique({ where: { netId: toNetId } })
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }
    // Fetch all messages between the two users
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, recipientId: recipient.id },
          { senderId: recipient.id, recipientId: user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ messages: messages.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderNetId: m.senderId === user.id ? user.netId : toNetId
    })) })
  } catch (error) {
    console.error('Error fetching DMs:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST: /api/dm { toNetId, message }
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const userCookie = cookieStore.get('user')
    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userSession = JSON.parse(userCookie.value)
    const user = await prisma.user.findUnique({ where: { netId: userSession.netId } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    const { toNetId, message } = await request.json()
    if (!toNetId || !message) {
      return NextResponse.json({ error: 'Missing toNetId or message' }, { status: 400 })
    }
    // Find the recipient user
    const recipient = await prisma.user.findUnique({ where: { netId: toNetId } })
    if (!recipient) {
      return NextResponse.json({ error: 'Recipient not found' }, { status: 404 })
    }
    // Create the message
    await prisma.directMessage.create({
      data: {
        content: message,
        senderId: user.id,
        recipientId: recipient.id
      }
    })
    // Return updated messages
    const messages = await prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: user.id, recipientId: recipient.id },
          { senderId: recipient.id, recipientId: user.id }
        ]
      },
      orderBy: { createdAt: 'asc' }
    })
    return NextResponse.json({ messages: messages.map(m => ({
      id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      senderNetId: m.senderId === user.id ? user.netId : toNetId
    })) })
  } catch (error) {
    console.error('Error sending DM:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
} 