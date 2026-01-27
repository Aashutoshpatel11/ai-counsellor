'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

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
    
    // Optimistic Update (Update UI immediately)
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))

    // Update DB
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  // Poll for new tasks if the AI adds them
  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div>Loading checklist...</div>

  return (
    <div className="card bg-white border shadow-sm">
      <div className="card-body">
        <h2 className="card-title text-slate-700 flex justify-between">
          Application Checklist
          <span className="text-xs font-normal text-slate-400">Auto-generated</span>
        </h2>
        
        <div className="space-y-2 mt-4">
          {tasks.length === 0 && <p className="text-slate-400">No tasks generated yet.</p>}
          
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
              <input 
                type="checkbox" 
                className="checkbox checkbox-primary"
                checked={task.status === 'DONE'}
                onChange={() => toggleTask(task.id, task.status)}
              />
              <div className={`flex-1 ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                {task.title}
              </div>
              <div className="badge badge-ghost badge-xs">{task.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}