"use client";
import { useParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

interface DMMessage {
  id: string
  content: string
  createdAt: string
  senderNetId: string
}

export default function DirectMessagePage() {
  const params = useParams();
  const { userNetId } = params as { userNetId: string };
  const [messages, setMessages] = useState<DMMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/dm?toNetId=${userNetId}`)
        if (res.ok) {
          const data = await res.json()
          setMessages(data.messages || [])
          setError(null)
          scrollToBottom()
        } else {
          setError('Failed to load messages')
        }
      } catch {
        setError('Failed to load messages')
      }
    }
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [userNetId])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/dm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toNetId: userNetId, message: newMessage })
      })
      if (!res.ok) {
        setError('Failed to send message')
      } else {
        setNewMessage('')
        // Optionally, refetch messages immediately
        const data = await res.json()
        setMessages(data.messages || [])
        scrollToBottom()
      }
    } catch {
      setError('Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Direct Message: {userNetId}</h1>
      <div className="bg-white rounded-lg shadow p-4 min-h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4">
          {error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : messages.length === 0 ? (
            <div className="text-gray-500 text-center">No messages yet</div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`mb-2 flex ${msg.senderNetId === userNetId ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3 py-2 rounded-lg ${msg.senderNetId === userNetId ? 'bg-blue-100 text-blue-900' : 'bg-gray-200 text-gray-800'}`}>
                  <span className="block text-xs text-gray-500">{msg.senderNetId}</span>
                  <span>{msg.content}</span>
                  <span className="block text-[10px] text-gray-400 text-right">{new Date(msg.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSend} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
} 