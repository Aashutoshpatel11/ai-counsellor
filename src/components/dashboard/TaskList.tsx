'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ClipboardList, Plus } from 'lucide-react'

export default function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = async () => {
    const { data } = await supabase.from('tasks').select('*').eq('user_id', userId).order('created_at', { ascending: false })
    if (data) setTasks(data)
    setLoading(false)
  }

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return
    const { data } = await supabase.from('tasks').insert([{
      user_id: userId,
      title: newTask,
      type: 'MANUAL',
      status: 'PENDING'
    }]).select()
    if (data) setTasks([data[0], ...tasks])
    setNewTask('')
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'PENDING' ? 'DONE' : 'PENDING'
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  return (
    <div className="card h-full bg-white dark:bg-[#1E1E24] border border-gray-100 shadow-xl">
      <div className="card-body p-6">
        <h2 className="card-title text-[#4A2B5E] mb-4 flex items-center gap-2">
          <ClipboardList className="text-[#FFC229]" /> Checklist
        </h2>
        
        {/* Manual Add Task */}
        <form onSubmit={addManualTask} className="flex gap-2 mb-6">
            <input 
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Add manual task..." 
                className="input input-sm input-bordered flex-1 bg-gray-50 dark:bg-[#18181B]" 
            />
            <button type="submit" className="btn btn-sm btn-circle bg-[#4A2B5E] text-white border-none">
                <Plus size={16} />
            </button>
        </form>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id, task.status)}
              className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all 
                ${task.status === 'DONE' ? 'opacity-50 bg-gray-50' : 'bg-white dark:bg-[#2D2D3A]'}`}
            >
              <div className={`w-5 h-5 rounded border-2 ${task.status === 'DONE' ? 'bg-[#FFC229] border-[#FFC229]' : 'border-gray-300'}`}></div>
              <p className={`text-sm flex-1 ${task.status === 'DONE' ? 'line-through' : 'font-medium'}`}>{task.title}</p>
              <div className="badge text-[10px] font-bold bg-[#FFC229]/10 text-[#4A2B5E] border-none">{task.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}