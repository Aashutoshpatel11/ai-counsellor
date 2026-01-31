'use client'
import { useState, useRef, useEffect, useMemo } from 'react'
import { Bot, X, Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
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
  
  // --- VOICE STATE ---
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const recognitionRef = useRef<any>(null)
  
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null) 

  // --- MARKDOWN COMPONENT ---
  const MarkdownComponent = useMemo( () => ( 
        {
            code({ node, inline, className, children, ...props }:any) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                    <div className="relative my-4 overflow-hidden rounded-md border border-white/10 bg-[#1E1E24]">
                        <div className="flex items-center justify-between bg-[#2D2D3A] px-4 py-1.5 border-b border-white/5">
                            <span className="text-xs text-gray-400 font-mono">{match[1]}</span>
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
                    <code className="bg-black/10 dark:bg-white/10 text-[#4A2B5E] dark:text-[#FFC229] px-1.5 py-0.5 rounded text-sm font-mono border border-black/5 dark:border-white/5" {...props}>
                        {children}
                    </code>
                );
            },
            ul: ({ children }:any) => <ul className="list-disc ml-4 my-2 space-y-1">{children}</ul>,
            ol: ({ children }:any) => <ol className="list-decimal ml-4 my-2 space-y-1">{children}</ol>,
            li: ({ children }:any) => <li className="leading-relaxed">{children}</li>,
            p: ({ children }:any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
            strong: ({ children }:any) => <span className="font-bold text-[#4A2B5E] dark:text-[#FFC229]">{children}</span>,
            a: ({ children, href }:any) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline decoration-2 underline-offset-2">{children}</a>,
            h1: ({ children }:any) => <h1 className="text-2xl font-bold mt-6 mb-3 border-b border-gray-200 dark:border-gray-700 pb-2">{children}</h1>,
            h2: ({ children }:any) => <h2 className="text-xl font-bold mt-5 mb-2">{children}</h2>,
            h3: ({ children }:any) => <h3 className="text-lg font-semibold mt-4 mb-2">{children}</h3>,
        }
    ), [])

  // --- VOICE INITIALIZATION (FIXED) ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // FIX: Cast window to 'any' to avoid TS error
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput((prev) => prev + (prev ? ' ' : '') + transcript)
          setIsRecording(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error', event.error)
          setIsRecording(false)
        }
        
        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }
      }
    }
  }, [])

  // --- VOICE FUNCTIONS ---
  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Chrome or Edge.")
      return
    }
    if (isRecording) {
      recognitionRef.current.stop()
    } else {
      recognitionRef.current.start()
      setIsRecording(true)
    }
  }

  const speakText = (text: string) => {
    if (!isSpeaking) return
    window.speechSynthesis.cancel()
    
    // Clean markdown symbols for smoother speech (optional simple regex)
    const cleanText = text.replace(/[*#_`]/g, '')
    
    const utterance = new SpeechSynthesisUtterance(cleanText)
    
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices[0]
    if (preferredVoice) utterance.voice = preferredVoice
    
    window.speechSynthesis.speak(utterance)
  }

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
        const data = await res.json()
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        
        // Trigger Voice
        if (isSpeaking) {
            speakText(data.content)
        }
    } catch (err) {
        console.error(err)
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {/* Chat Container */}
        <div 
          className={`
            transform transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom-right
            ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-0 translate-y-10 pointer-events-none'}
            bg-white dark:bg-[#1E1E24] w-100 h-150 max-h-[80vh] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden
          `}
        >
            {/* Header */}
            <div className="bg-[#4A2B5E] p-4 text-white flex justify-between items-center shadow-md shrink-0 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC229]/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                       <Bot className="w-6 h-6 text-[#FFC229]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg leading-none">AI Counsellor</h3>
                        <div className="flex items-center gap-1.5 mt-1">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <span className="text-[10px] font-medium tracking-wide uppercase opacity-80">Online</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 relative z-10">
                    <button 
                        onClick={() => setIsSpeaking(!isSpeaking)} 
                        className={`p-2 rounded-full transition-colors ${isSpeaking ? 'bg-[#FFC229] text-[#4A2B5E]' : 'hover:bg-white/10 text-white/80'}`}
                        title={isSpeaking ? "Mute AI Voice" : "Enable AI Voice"}
                    >
                        {isSpeaking ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>

                    <button 
                      onClick={() => setIsOpen(false)} 
                      className="hover:bg-white/10 p-2 rounded-full transition-colors"
                      aria-label="Close chat"
                    >
                      <X className="w-5 h-5 text-white/80" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#F8F9FD] dark:bg-[#18181B] scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700" ref={scrollRef}>
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-[#FFC229]/20 rounded-2xl flex items-center justify-center mb-4 text-4xl">
                           👋
                        </div>
                        <h4 className="text-[#4A2B5E] dark:text-white font-bold text-lg mb-2">Hi there!</h4>
                        <p className="text-gray-500 dark:text-gray-400 text-sm max-w-50">
                            I'm your personal university guide. Ask me anything about admissions, visas, or universities!
                        </p>
                    </div>
                )}
                
                {messages.map((m, i) => (
                    <div key={i} className={`flex w-full ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`
                            max-w-[85%] p-4 text-sm shadow-sm relative group
                            ${m.role === 'user' 
                                ? 'bg-[#FFC229] text-[#1F2937] rounded-2xl rounded-br-none' 
                                : 'bg-white dark:bg-[#2D2D3A] text-[#1F2937] dark:text-gray-200 border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none'}
                        `}>
                            {m.role === 'assistant' && (
                                <div className="absolute -left-2 -bottom-2 w-4 h-4 bg-white dark:bg-[#2D2D3A] transform rotate-45"></div>
                            )}
                            <ReactMarkdown
                             remarkPlugins={[remarkGfm, remarkBreaks]}
                             components={MarkdownComponent}
                            >{m.content}</ReactMarkdown>
                        </div>
                    </div>
                ))}
                
                {loading && (
                    <div className="flex justify-start w-full">
                        <div className="bg-white dark:bg-[#2D2D3A] border border-gray-100 dark:border-gray-700 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                            <span className="w-2 h-2 bg-[#4A2B5E] dark:bg-[#FFC229] rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-[#4A2B5E] dark:bg-[#FFC229] rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-[#4A2B5E] dark:bg-[#FFC229] rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#1E1E24] border-t border-gray-100 dark:border-gray-700 flex gap-3 items-center">
                <div className="flex-1 flex items-center gap-2 bg-[#F8F9FD] dark:bg-[#2D2D3A] rounded-xl px-2 border border-transparent focus-within:border-[#FFC229] focus-within:ring-2 focus-within:ring-[#FFC229]/50 transition-all">
                    
                    {/* Mic Button */}
                    <button
                        type="button"
                        onClick={toggleRecording}
                        className={`p-2 rounded-full transition-all ${
                            isRecording 
                            ? 'text-red-500 animate-pulse bg-red-500/10' 
                            : 'text-gray-400 hover:text-[#4A2B5E] dark:hover:text-[#FFC229]'
                        }`}
                    >
                        {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>

                    <input 
                        ref={inputRef}
                        className={`flex-1 bg-transparent border-none outline-none py-3 text-[#1F2937] dark:text-white placeholder-gray-400 ${isRecording ? 'placeholder:text-[#4A2B5E] placeholder:animate-pulse' : ''}`}
                        value={input} 
                        onChange={e => setInput(e.target.value)} 
                        placeholder={isRecording ? "Listening..." : "Type your question..."} 
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={!input.trim() || loading}
                    className="btn btn-md btn-circle bg-[#4A2B5E] hover:bg-[#3d234d] text-white border-none disabled:bg-gray-200 disabled:text-gray-400 dark:disabled:bg-gray-800 transition-all shadow-md hover:shadow-lg hover:scale-105"
                >
                    <Send size={18} className={input.trim() ? 'ml-0.5' : ''} />
                </button>
            </form>
        </div>

        {/* Floating Toggle Button */}
        <button 
            className={`
                btn btn-circle w-16 h-16 shadow-2xl border-none transition-all duration-500 relative z-50
                ${isOpen 
                    ? 'bg-[#1E1E24] text-white hover:bg-black rotate-90' 
                    : 'bg-[#FFC229] text-[#4A2B5E] hover:bg-[#ffc947] hover:scale-110 hover:-translate-y-1'}
            `} 
            onClick={() => setIsOpen(!isOpen)}
        >
            {!isOpen && (
                <span className="absolute inset-0 rounded-full bg-[#FFC229] animate-ping opacity-75 duration-1000 -z-10"></span>
            )}
            
            {isOpen ? <X size={32}/> : <Bot size={32} />}
        </button>
    </div>
  )
}