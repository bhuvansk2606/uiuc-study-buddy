import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const { name, netId, phoneNumber } = await request.json()

    if (!name || !netId || !phoneNumber) {
      return NextResponse.json(
        { error: 'Name, NetID and phone number are required' },
        { status: 400 }
      )
    }

    // Upsert user in the database
    await prisma.user.upsert({
      where: { netId },
      update: { name, phoneNumber },
      create: { netId, name, phoneNumber }
    })

    // For mock data, we'll just create a simple session
    const response = NextResponse.json({ success: true })
    response.cookies.set('user', JSON.stringify({ name, netId }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Failed to sign in' },
      { status: 500 }
    )
  }
} 