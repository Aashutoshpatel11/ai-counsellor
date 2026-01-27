'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(true)
  const [messages, setMessages] = useState<any[]>([
    { id: '1', role: 'assistant', content: 'Hello! I am your AI Counsellor. I can help you search for universities, shortlist them, and lock your final decision. How can I help?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  // Auto-scroll chat to bottom
  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Handle Sending Messages
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // 1. Add User Message to UI
    const userMsg = { id: Date.now().toString(), role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      // 2. Send to API (Non-Streaming)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      
      const data = await response.json()
      
      // 3. Add AI Message to UI
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.content }])
      
      // 4. Refresh the page so the Dashboard updates if the AI changed the database (e.g., Locked a university)
      router.refresh()

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { id: 'err', role: 'assistant', content: "Sorry, I encountered an error. Please try again." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* LEFT AREA: Main Content (Dashboard Page) */}
      {/* It shrinks when chat is open */}
      <div className={`flex-1 flex flex-col h-full transition-all duration-300 ${isChatOpen ? 'mr-96' : 'mr-0'}`}>
        
        {/* Top Navbar */}
        <div className="navbar bg-white border-b px-8 h-16 flex-none shadow-sm z-10">
          <div className="flex-1">
            <Link href="/dashboard" className="text-xl font-bold text-blue-700 flex items-center gap-2">
              🎓 AI Counsellor
            </Link>
          </div>
          <div className="flex-none">
            <button 
              className="btn btn-sm btn-ghost text-slate-500"
              onClick={() => setIsChatOpen(!isChatOpen)}
            >
              {isChatOpen ? 'Hide Chat →' : 'Show Chat ←'}
            </button>
          </div>
        </div>

        {/* Page Content Rendered Here */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>

      {/* RIGHT AREA: AI Chat Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-white border-l shadow-2xl transition-transform duration-300 transform flex flex-col z-50 ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        
        {/* Chat Header */}
        <div className="p-4 border-b bg-blue-50 flex justify-between items-center">
          <h3 className="font-bold text-blue-900 flex items-center gap-2">
            🤖 Counsellor
            <span className="badge badge-success badge-xs">Online</span>
          </h3>
          <button onClick={() => setIsChatOpen(false)} className="btn btn-xs btn-ghost">✕</button>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
          {messages.map((m) => (
            <div key={m.id} className={`chat ${m.role === 'user' ? 'chat-end' : 'chat-start'}`}>
              <div className="chat-header text-xs opacity-50 mb-1">
                {m.role === 'user' ? 'You' : 'AI Agent'}
              </div>
              <div className={`chat-bubble text-sm ${
                m.role === 'user' 
                  ? 'chat-bubble-primary text-white' 
                  : 'bg-white text-slate-700 border shadow-sm'
              }`}>
                {/* Simple Markdown-like rendering for lists/bold */}
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isLoading && (
            <div className="chat chat-start">
              <div className="chat-bubble bg-white text-slate-500 border shadow-sm">
                <span className="loading loading-dots loading-xs"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              className="input input-bordered input-sm w-full focus:outline-none focus:border-blue-500"
              value={input}
              placeholder="Ask me anything..."
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="btn btn-sm btn-primary"
              disabled={isLoading || !input.trim()}
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </form>
          <div className="text-[10px] text-center text-slate-400 mt-2">
            AI can make mistakes. Verify important info.
          </div>
        </div>

      </div>
    </div>
  )
}