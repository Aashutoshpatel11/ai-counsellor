'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import {Bot, X} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

export default function ChatWidget({ userId, initialMSG=""}: { userId: string, initialMSG:string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) 

  const MarkdownComponent = useMemo( () => ( 
        {
            // 1. Code Block & Inline Code Handling
            code({ node, inline, className, children, ...props }:any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <div className="relative my-4 overflow-hidden rounded-md border border-white/10 bg-black/50">
                        <div className="flex items-center justify-between bg-zinc-900/50 px-4 py-1.5 border-b border-white/5">
                            <span className="text-xs text-zinc-400 font-mono">{match[1]}</span>
                        </div>
                        <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{ margin: 0, borderRadius: 0, background: 'transparent', fontSize: '13px' }}
                            {...props}
                        >
                            {String(children).replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    </div>
                ) : (
                    <code className="bg-zinc-700/50 text-zinc-200 px-1.5 py-0.5 rounded text-sm font-mono border border-white/5" {...props}>
                        {children}
                    </code>
                );
            },
            // 2. General Formatting Overrides
            ul: ({ children }:any) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
            ol: ({ children }:any) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
            li: ({ children }:any) => <li className="leading-relaxed">{children}</li>,
            p: ({ children }:any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            strong: ({ children }:any) => <span className="font-semibold text-gray-500">{children}</span>,
            a: ({ children, href }:any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{children}</a>,
            h1: ({ children }:any) => <h1 className="text-3xl font-bold text-gray-500 mt-10 mb-4">{children}</h1>,
            h2: ({ children }:any) => <h2 className="text-2xl font-bold text-gray-500 mt-10 mb-3 border-b border-white/40 pb-2">{children}</h2>,
            h3: ({ children }:any) => <h3 className="text-lg font-semibold text-gray-500 mt-6 mb-2">{children}</h3>,
            h4: ({ children }:any) => <h4 className="text-base font-semibold text-gray-500 mt-6 mb-2">{children}</h4>,
            br: ({ children }:any) => <h4 className="border-b-2 border-black/20 my-3">{children}</h4>,
        }
    ), [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }, [messages, loading])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMsg = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            body: JSON.stringify({ messages: [...messages, userMsg], userId: userId })
        })
        console.log("AGENT RESPONSE :: :: :", res )
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        <div 
          className={`
            transform transition-all duration-300 ease-in-out origin-bottom-right
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-4 pointer-events-none hidden'}
            bg-white w-96 h-150 rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden
          `}
        >
            {/* Header */}
            <div className="bg-linear-to-r from-blue-600 to-blue-700 p-4 text-white flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="font-bold tracking-wide">AI Counsellor</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                  aria-label="Close chat"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm gap-2">
                        <span className="text-4xl">👋</span>
                        <p>Hi! How can I help you today?</p>
                    </div>
                )}
                
                {messages.map((m, i) => (
                    <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[80%] p-3 text-sm shadow-sm
                            ${m.role === 'user' 
                                ? 'bg-blue-600 text-white rounded-2xl rounded-br-none' 
                                : 'bg-white text-slate-700 border border-slate-100 rounded-2xl rounded-bl-none'}
                        `}>
                            <ReactMarkdown
                             remarkPlugins={[remarkGfm, remarkBreaks]}
                             components={MarkdownComponent}
                            >{m.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1 items-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center">
                <input 
                    ref={inputRef}
                    className="flex-1 input input-sm bg-slate-100 border-transparent focus:border-blue-500 focus:bg-white transition-all rounded-full px-4" 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    placeholder="Type your message..." 
                />
                <button 
                    type="submit" 
                    disabled={!input.trim() || loading}
                    className="btn btn-sm btn-circle btn-primary disabled:bg-slate-200 disabled:text-slate-400 transition-transform active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                </button>
            </form>
        </div>

        <button 
            className={`
                btn btn-circle btn-lg shadow-xl border-4 border-white transition-all duration-300
                ${isOpen ? 'btn-error rotate-90' : 'btn-primary hover:scale-110'}
            `} 
            onClick={() => setIsOpen(!isOpen)}
        >
            {isOpen ? <X/> : <Bot />}
        </button>
    </div>
  )
}