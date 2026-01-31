'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ClipboardList, Plus, Sparkles, CalendarClock } from 'lucide-react'
import toast from 'react-hot-toast' // Import toast

export default function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<any[]>([])
  const [newTask, setNewTask] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchTasks = async () => {
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }) // Newest first
    
    if (data) setTasks(data)
    setLoading(false)
  }

  // --- AUTO-GENERATOR LOGIC ---
  const generateApplicationTasks = async () => {
    // 1. Check if we already generated tasks to prevent duplicates
    const { count } = await supabase
      .from('tasks')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('type', 'APPLICATION') // We use this type to track auto-generated ones
    
    if (count && count > 0) return; // Already exists, don't generate again

    // 2. Define the "Required" Core Tasks
    const coreTasks = [
        { title: '📝 Draft Statement of Purpose (SOP) - Due: 1 Week', type: 'APPLICATION' },
        { title: '📨 Request Letters of Recommendation (LORs) - Due: 2 Weeks', type: 'APPLICATION' },
        { title: '📄 Submit Official Transcripts - Due: ASAP', type: 'APPLICATION' },
        { title: '🛂 Check Passport Validity (>6 months) - Due: Immediate', type: 'APPLICATION' },
    ]

    // 3. Define "Random/Dynamic" Tasks to simulate AI suggestions
    const randomPool = [
        { title: '💉 Complete Medical Checkup & Vaccinations', type: 'APPLICATION' },
        { title: '🏦 Prepare Financial Proof/Bank Statements', type: 'APPLICATION' },
        { title: '🏠 Research Off-campus Housing Options', type: 'APPLICATION' },
        { title: '✈️ Block Flight Tickets (Tentative)', type: 'APPLICATION' },
        { title: '🗣️ Connect with Alumni on LinkedIn', type: 'APPLICATION' },
        { title: '🎓 Join University WhatsApp/Discord Group', type: 'APPLICATION' },
    ]

    // Pick 3 random tasks from the pool
    const selectedRandom = randomPool.sort(() => 0.5 - Math.random()).slice(0, 3)

    // Combine and Format for Insert
    const allTasks = [...coreTasks, ...selectedRandom].map(t => ({
        user_id: userId,
        title: t.title,
        type: t.type,
        status: 'PENDING'
    }))

    // 4. Batch Insert into Supabase
    const { error } = await supabase.from('tasks').insert(allTasks)
    
    if (!error) {
        console.log("Auto-generated tasks for Application Phase")
        fetchTasks() // Refresh UI
    }
  }

  const addManualTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    // 1. Show loading feedback
    const toastId = toast.loading("Adding task...")

    // 2. Perform Insert
    const { data, error } = await supabase.from('tasks').insert([{
      user_id: userId,
      title: newTask,
      type: 'MANUAL',
      status: 'PENDING'
    }]).select()

    // 3. Handle Result
    if (error) {
        console.error("Task add failed:", error)
        toast.error("Failed to add task. Please try again.", { id: toastId })
    } else if (data) {
        setTasks([data[0], ...tasks])
        setNewTask('')
        toast.success("Task added successfully!", { id: toastId })
    }
  }

  const toggleTask = async (taskId: string, currentStatus: string) => {
    // Optimistic Update (Update UI instantly)
    const newStatus = currentStatus === 'PENDING' ? 'DONE' : 'PENDING'
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    
    // Background DB Update
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
  }

  useEffect(() => {
    fetchTasks()

    // Check if user is in 'APPLICATION' phase to trigger generation
    const checkPhase = async () => {
        const { data: profile } = await supabase.from('profiles').select('current_stage').eq('id', userId).single()
        
        if (profile?.current_stage === 'APPLICATION') {
            generateApplicationTasks()
        }
    }
    checkPhase()
  }, [])

  if (loading) return <div className="card h-full animate-pulse bg-gray-100 dark:bg-[#1E1E24]"></div>

  return (
    <div className="card h-full bg-white dark:bg-[#1E1E24] border border-gray-100 dark:border-gray-800 shadow-xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 pb-2 border-b border-gray-50 dark:border-white/5">
        <h2 className="card-title text-[#4A2B5E] dark:text-white mb-1 flex items-center gap-2">
          <ClipboardList className="text-[#FFC229]" /> 
          Action Plan
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">
           {tasks.filter(t => t.status === 'DONE').length}/{tasks.length} tasks completed
        </p>
      </div>
      
      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
        {tasks.length === 0 && (
            <div className="text-center py-10 text-gray-400 text-sm">
                No tasks yet. Add one below!
            </div>
        )}

        {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => toggleTask(task.id, task.status)}
              className={`group flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200
                ${task.status === 'DONE' 
                    ? 'bg-gray-50 dark:bg-white/5 border-transparent opacity-60' 
                    : 'bg-white dark:bg-[#2D2D3A] border-gray-100 dark:border-gray-700 hover:border-[#FFC229] hover:shadow-md'
                }`}
            >
              {/* Custom Checkbox */}
              <div className={`mt-1 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors
                  ${task.status === 'DONE' ? 'bg-[#FFC229] border-[#FFC229]' : 'border-gray-300 dark:border-gray-500 group-hover:border-[#FFC229]'}`}>
                  {task.status === 'DONE' && <Sparkles size={12} className="text-[#4A2B5E]" />}
              </div>
              
              <div className="flex-1">
                  <p className={`text-sm leading-relaxed ${task.status === 'DONE' ? 'line-through text-gray-400' : 'font-medium text-gray-700 dark:text-gray-200'}`}>
                      {task.title}
                  </p>
                  
                  {/* Metadata Tags */}
                  <div className="flex gap-2 mt-2">
                    {task.type === 'APPLICATION' && (
                        <span className="badge badge-xs bg-blue-50 text-blue-600 border-none font-bold py-2">
                           System
                        </span>
                    )}
                    {/* Heuristic to show 'Urgent' if title contains 'ASAP' or 'Immediate' */}
                    {(task.title.includes('ASAP') || task.title.includes('Immediate')) && task.status !== 'DONE' && (
                        <span className="badge badge-xs bg-red-50 text-red-600 border-none font-bold py-2 flex items-center gap-1">
                           <CalendarClock size={10} /> Urgent
                        </span>
                    )}
                  </div>
              </div>
            </div>
          ))}
      </div>

      {/* Manual Input Footer */}
      <div className="p-4 bg-gray-50 dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
        <form onSubmit={addManualTask} className="flex gap-2">
            <input 
                value={newTask}
                onChange={e => setNewTask(e.target.value)}
                placeholder="Add your own task..." 
                className="input input-sm flex-1 bg-white text-black dark:bg-[#2D2D3A] boder-black dark:border-transparent focus:border-[#FFC229] focus:outline-none dark:text-white" 
            />
            <button 
            type="submit" 
            // disabled={!newTask} 
            className="btn btn-sm btn-circle bg-[#4A2B5E] dark:bg-[#FFC229] text-white dark:text-[#4A2B5E] border-none hover:scale-110 transition-transform">
                <Plus size={16} strokeWidth={3} />
            </button>
        </form>
      </div>
    </div>
  )
}