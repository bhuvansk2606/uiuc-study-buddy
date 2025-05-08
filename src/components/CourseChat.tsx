import { useState, useEffect, useRef } from 'react'
import { PaperAirplaneIcon } from '@heroicons/react/24/solid'

interface Message {
  id: string
  content: string
  createdAt: string
  sender: {
    name: string | null
    netId: string
  }
}

interface CourseChatProps {
  courseId: string
}

export default function CourseChat({ courseId }: CourseChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
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
        const response = await fetch(`/api/messages?courseId=${courseId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch messages')
        }
        const data = await response.json()
        setMessages(data.messages || [])
        setError(null)
        scrollToBottom()
      } catch (error) {
        console.error('Error fetching messages:', error)
        setError('Failed to load messages')
      }
    }

    fetchMessages()
    // Set up polling for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [courseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    if (!courseId) {
      setError('Course ID is not available. Please try again.')
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const payload = {
        content: newMessage,
        courseId,
      }
      console.log('Sending message with payload:', payload)
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()
      if (data.message) {
        setMessages((prev) => [...prev, data.message])
        setNewMessage('')
        scrollToBottom()
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setError(error instanceof Error ? error.message : 'Failed to send message')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Course Chat</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-center">No messages yet</div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-baseline space-x-2">
                <span className="font-medium text-sm">
                  {message.sender.name || message.sender.netId}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-gray-800">{message.content}</p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex space-x-2">
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
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </div>
        {error && (
          <p className="mt-2 text-red-500 text-sm">{error}</p>
        )}
      </form>
    </div>
  )
} 