'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation' // Fix 1: Use Next.js router
import { Lock } from 'lucide-react'

export default function ShortlistTable({ userId }: { userId: string }) {
  const [shortlist, setShortlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const supabase = createClient()
  const router = useRouter() // Initialize router

  const fetchShortlist = async () => {
    const { data } = await supabase
      .from('shortlists')
      .select(`*, universities (*)`) // Fetches full university object
      .eq('user_id', userId)
    
    if (data) setShortlist(data)
    setLoading(false)
  }

  // Fix 2: Accept both IDs to update relations correctly
  const handleManualLock = async (shortlistId: string, universityId: string) => {
    setIsUpdating(true)

    try {
        // 1. Update Shortlist: Mark this specific entry as locked
        const { error: slideError } = await supabase
            .from('shortlists')
            .update({ is_locked: true })
            .eq('id', shortlistId)
        
        if (slideError) throw slideError

        // 2. Update Profile: Set stage AND the specific committed university
        // This ensures the Application Dashboard knows WHICH uni you picked
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                current_stage: 'APPLICATION',
                locked_university_id: universityId 
            })
            .eq('id', userId)

        if (profileError) throw profileError

        // 3. Smooth Refresh
        router.refresh() 
        
    } catch (error) {
        console.error("Locking failed:", error)
        setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchShortlist()
    const interval = setInterval(fetchShortlist, 5000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="p-12 text-center text-[#FFC229]"><span className="loading loading-spinner"></span></div>

  return (
    <div className="overflow-x-auto bg-white dark:bg-[#1E1E24] rounded-2xl border border-gray-100 dark:border-gray-800">
      <table className="table w-full">
        <thead className="bg-[#F8F9FD] dark:bg-[#2D2D3A] uppercase text-xs text-gray-500 dark:text-gray-400">
          <tr>
            <th className="py-5 pl-6">University</th>
            <th>Category</th>
            <th>AI Insight</th>
            <th className="pr-6">Manual Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {shortlist.map((item) => (
            <tr key={item.id} className="hover:bg-[#F8F9FD] dark:hover:bg-[#23232A] transition-colors">
              <td className="pl-6 py-4">
                <div className="font-bold text-[#1F2937] dark:text-white">{item.universities.name}</div>
                <div className="text-xs text-gray-500">{item.universities.country}</div>
              </td>
              <td>
                <span className={`badge border-none font-bold text-xs ${
                    item.category === 'SAFE' ? 'bg-emerald-100 text-emerald-700' :
                    item.category === 'DREAM' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                }`}>
                    {item.category}
                </span>
              </td>
              <td className="text-xs text-gray-500 dark:text-gray-400 italic max-w-xs truncate">
                {item.ai_notes || 'No notes'}
              </td>
              <td className="pr-6">
                <button 
                    disabled={isUpdating || item.is_locked}
                    // Fix 3: Pass BOTH the shortlist ID and the University ID
                    onClick={() => handleManualLock(item.id, item.universities.id)}
                    className="btn btn-xs bg-[#4A2B5E] text-white hover:bg-[#2D2D3A] dark:bg-[#FFC229] dark:text-[#4A2B5E] border-none gap-2"
                >
                  <Lock size={12} /> {item.is_locked ? 'Locked' : 'Lock & Commit'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}