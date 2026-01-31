'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Lock, AlertCircle } from 'lucide-react'

export default function ShortlistTable({ userId }: { userId: string }) {
  const [shortlist, setShortlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const fetchShortlist = async () => {
    // FIX: Removed 'location' from this query to prevent Error 42703
    const { data, error } = await supabase
      .from('shortlists')
      .select(`
        *,
        universities (
          id,
          name,
          country
        )
      `) 
      .eq('user_id', userId)
    
    if (error) {
      console.error("Error fetching shortlist:", error)
      setErrorMsg(error.message)
    } else {
      setShortlist(data || [])
    }
    setLoading(false)
  }

  const handleManualLock = async (shortlistId: string, universityId: string) => {
    setIsUpdating(true)
    try {
        // 1. Lock the shortlist item
        const { error: slideError } = await supabase
            .from('shortlists')
            .update({ is_locked: true })
            .eq('id', shortlistId)
        
        if (slideError) throw slideError

        // 2. Update Profile with the committed university
        const { error: profileError } = await supabase
            .from('profiles')
            .update({ 
                current_stage: 'APPLICATION',
                locked_university_id: universityId 
            })
            .eq('id', userId)

        if (profileError) throw profileError

        // 3. Refresh to update UI
        router.refresh() 
        
    } catch (error) {
        console.error("Locking failed:", error)
        setIsUpdating(false)
    }
  }

  useEffect(() => {
    fetchShortlist()
    // Poll every 5 seconds to keep data fresh
    const interval = setInterval(fetchShortlist, 5000) 
    return () => clearInterval(interval)
  }, [])

  if (loading) return <div className="p-12 text-center text-[#FFC229]"><span className="loading loading-spinner"></span></div>

  // Display error if the query fails
  if (errorMsg) return (
    <div className="p-8 text-center text-red-500 bg-red-50 rounded-2xl border border-red-100">
      <AlertCircle className="w-8 h-8 mx-auto mb-2" />
      <p>Error: {errorMsg}</p>
    </div>
  )

  // Empty state if no universities have been added
  if (shortlist.length === 0) return (
    <div className="p-12 text-center bg-white dark:bg-[#1E1E24] rounded-2xl border border-gray-100 dark:border-gray-800">
      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        📋
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Your shortlist is empty</h3>
      <p className="text-gray-500 dark:text-gray-400 mb-4">Go back to the Discovery phase to add universities.</p>
    </div>
  )

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
                {/* SAFE ACCESS: Uses optional chaining (?.) */}
                <div className="font-bold text-[#1F2937] dark:text-white">
                  {item.universities?.name || 'Unknown University'}
                </div>
                <div className="text-xs text-gray-500">
                  {item.universities?.country || 'Unknown Location'}
                </div>
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
                    onClick={() => handleManualLock(item.id, item.universities?.id)}
                    className="cursor-pointer btn btn-xs bg-[#4A2B5E] text-white hover:bg-[#2D2D3A] dark:bg-[#FFC229] dark:text-[#4A2B5E] border-none gap-2"
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