'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'

export default function ShortlistTable({ userId }: { userId: string }) {
  const [shortlist, setShortlist] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchShortlist = async () => {
    // We join the 'shortlists' table with the 'universities' table
    const { data, error } = await supabase
      .from('shortlists')
      .select(`
        *,
        universities (
          name,
          country,
          tuition_fee,
          acceptance_rate
        )
      `)
      .eq('user_id', userId)
    
    if (error) console.error('Error fetching shortlist:', error)
    if (data) setShortlist(data)
    setLoading(false)
  }

  // Poll for updates every 3 seconds so AI changes appear automatically
  useEffect(() => {
    fetchShortlist()
    const interval = setInterval(fetchShortlist, 3000)
    return () => clearInterval(interval)
  }, [])

  if (loading) return (
    <div className="flex flex-col items-center justify-center p-12 text-[#FFC229] gap-2">
      <span className="loading loading-spinner loading-md"></span>
      <span className="text-xs text-gray-400 font-medium">Syncing shortlist...</span>
    </div>
  )
  
  if (shortlist.length === 0) return (
    <div className="text-center p-12 bg-[#F8F9FD] dark:bg-[#1E1E24] rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="w-16 h-16 bg-[#FFC229]/10 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        🎓
      </div>
      <h3 className="text-lg font-bold text-[#4A2B5E] dark:text-white">Your list is empty</h3>
      <p className="text-gray-500 dark:text-gray-400 font-medium mb-6">Start by asking the AI to find universities for you.</p>
      
      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2D2D3A] rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Try: <span className="font-bold text-[#4A2B5E] dark:text-[#FFC229] italic">"Add Stanford to my shortlist"</span>
        </p>
      </div>
    </div>
  )

  return (
    <div className="overflow-x-auto bg-white dark:bg-[#1E1E24] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <table className="table w-full">
        {/* Table Head */}
        <thead className="bg-[#F8F9FD] dark:bg-[#2D2D3A] text-[#9CA3AF] dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-xs uppercase tracking-wider font-semibold">
          <tr>
            <th className="py-5 pl-6">University</th>
            <th>Category</th>
            <th>Acceptance</th>
            <th>Est. Cost</th>
            <th className="pr-6">AI Insight</th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {shortlist.map((item) => (
            <tr key={item.id} className="group hover:bg-[#F8F9FD] dark:hover:bg-[#23232A] transition-colors duration-200">
              
              {/* University Name & Country */}
              <td className="pl-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="avatar placeholder">
                    <div className="bg-[#4A2B5E] text-white rounded-xl w-10 h-10 shadow-md ring-2 ring-white dark:ring-[#1E1E24]">
                      <span className="text-lg font-bold">{item.universities.name.substring(0,1)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[#1F2937] dark:text-white text-sm md:text-base">
                        {item.universities.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium flex items-center gap-1 mt-0.5">
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></span>
                        {item.universities.country}
                    </div>
                  </div>
                </div>
              </td>

              {/* Category Badge */}
              <td>
                <span className={`badge border-none font-bold px-3 py-2.5 text-xs ${
                    item.category === 'DREAM' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 ring-1 ring-red-100 dark:ring-red-900/50' : 
                    item.category === 'TARGET' ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-300 ring-1 ring-amber-100 dark:ring-amber-900/50' : 
                    'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-300 ring-1 ring-emerald-100 dark:ring-emerald-900/50'
                }`}>
                    {item.category}
                </span>
              </td>

              {/* Acceptance Rate */}
              <td>
                <div 
                  className="radial-progress text-[#4A2B5E] dark:text-[#FFC229] text-[10px] font-bold" 
                  style={{"--value": item.universities.acceptance_rate, "--size": "2.5rem", "--thickness": "3px"} as any}
                >
                  {item.universities.acceptance_rate}%
                </div>
              </td>

              {/* Cost */}
              <td className="font-mono text-[#1F2937] dark:text-gray-300 font-medium text-sm">
                ${(item.universities.tuition_fee / 1000).toFixed(0)}k
                <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">/yr</span>
              </td>

              {/* AI Notes */}
              <td className="pr-6">
                 {item.ai_notes ? (
                     <div className="tooltip tooltip-left tooltip-primary" data-tip={item.ai_notes}>
                        <div className="max-w-45 bg-white dark:bg-[#2D2D3A] border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 cursor-help group-hover:border-[#FFC229] transition-colors">
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center gap-2">
                                <span className="text-lg">🤖</span>
                                {item.ai_notes}
                            </p>
                        </div>
                     </div>
                 ) : (
                    <span className="text-xs text-gray-300 dark:text-gray-600 italic">No notes</span>
                 )}
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}