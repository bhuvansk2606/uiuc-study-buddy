'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

interface Message {
  id: string
  content: string
  senderId: string
  recipientId: string
  createdAt: string
}

interface User {
  id: string
  name: string
  email: string
  netId?: string
}

export default function DirectMessagePage({ params }: { params: { id: string } }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [recipient, setRecipient] = useState<User | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [loading, user, router])

  useEffect(() => {
    if (user) {
      fetchMessages()
      fetchRecipient()
    }
  }, [user])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages/dm/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to fetch messages:', error)
    }
  }

  const fetchRecipient = async () => {
    try {
      const response = await fetch(`/api/users/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setRecipient(data.user)
      }
    } catch (error) {
      console.error('Failed to fetch recipient:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    try {
      const response = await fetch('/api/messages/dm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newMessage,
          recipientId: params.id,
        }),
      })

      if (response.ok) {
        setNewMessage('')
        fetchMessages()
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send message')
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E84A27]"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-[#13294B]">
            Chat with {recipient?.name || 'Loading...'} {recipient?.netId ? `(${recipient.netId})` : ''}
          </h1>
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700"
          >
            Back
          </button>
        </div>

        <div className="space-y-4 mb-6" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.senderId === user.id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.senderId === user.id
                    ? 'bg-[#E84A27] text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(message.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#E84A27]"
          />
          <button
            type="submit"
            className="bg-[#E84A27] text-white px-6 py-2 rounded-lg hover:bg-[#D73D1C] focus:outline-none focus:ring-2 focus:ring-[#E84A27] focus:ring-offset-2"
          >
            Send
          </button>
        </form>

        {error && (
          <p className="text-red-500 mt-2 text-sm">{error}</p>
        )}
      </div>
    </div>
  )
} 