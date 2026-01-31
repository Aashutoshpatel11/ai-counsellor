'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ClipboardList, CheckCircle2 } from 'lucide-react'

export default function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    
    if (data) setTasks(data)
    setLoading(false)
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'DONE' : 'PENDING'
    
    // Optimistic Update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    // Update DB
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  // Poll for new tasks
  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 h-full text-[#FFC229]">
      <span className="loading loading-spinner loading-md"></span>
    </div>
  )

  return (
    <div className="card h-full bg-white dark:bg-[#1E1E24] border border-gray-100 dark:border-gray-800 shadow-xl transition-colors duration-300">
      <div className="card-body p-6">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-[#4A2B5E] dark:text-white text-lg flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-[#FFC229]" />
            Checklist
          </h2>
          <span className="px-2 py-1 rounded-full bg-[#F8F9FD] dark:bg-[#2D2D3A] text-[10px] font-bold text-gray-400 uppercase tracking-wider border border-gray-100 dark:border-gray-700">
            Auto-generated
          </span>
        </div>
        
        <div className="space-y-3 mt-2">
          {tasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl bg-[#F8F9FD] dark:bg-[#2D2D3A]/30">
              <div className="w-12 h-12 bg-gray-100 dark:bg-[#2D2D3A] rounded-full flex items-center justify-center mb-3">
                <ClipboardList className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">No tasks generated yet.</p>
              <p className="text-xs text-gray-400 mt-1">Your AI counselor is planning your steps...</p>
            </div>
          )}
          
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id, task.status)}
              className={`group flex items-start gap-4 p-4 rounded-xl border cursor-pointer transition-all duration-200 
                ${task.status === 'DONE' 
                  ? 'bg-[#F8F9FD] dark:bg-[#18181B]/50 border-transparent opacity-60' 
                  : 'bg-white dark:bg-[#2D2D3A] border-gray-100 dark:border-gray-700 hover:border-[#FFC229] hover:shadow-sm'
                }`}
            >
              <div className="pt-0.5">
                  <div className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-300
                    ${task.status === 'DONE' 
                        ? 'bg-[#FFC229] border-[#FFC229]' 
                        : 'border-gray-300 dark:border-gray-500 group-hover:border-[#FFC229]'}
                  `}>
                      {task.status === 'DONE' && <CheckCircle2 className="w-3.5 h-3.5 text-[#4A2B5E]" strokeWidth={3} />}
                  </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium transition-colors duration-300 leading-tight
                  ${task.status === 'DONE' 
                    ? 'line-through text-gray-400 dark:text-gray-600' 
                    : 'text-[#1F2937] dark:text-gray-200'
                  }`}>
                  {task.title}
                </p>
              </div>
              
              <div className={`badge text-[10px] font-bold border-none h-5 px-2
                 ${task.status === 'DONE' 
                    ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600' 
                    : 'bg-[#FFC229]/10 text-[#4A2B5E] dark:bg-[#FFC229]/20 dark:text-[#FFC229]'}
              `}>
                {task.type}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}