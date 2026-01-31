'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Plus, Check, Globe, DollarSign, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'

export default function DiscoveryGrid({ userId, userGpa, country, maxBudget }: any) {
  const [unis, setUnis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function getRecommendations() {
      let query = supabase.from('universities').select('*')
      
      // Filter by Country (if not Global/Any)
      if (country && country !== 'Global' && country !== 'Any') {
        query = query.eq('country', country)
      }
      
      // Filter by Budget (if set)
      if (maxBudget && maxBudget > 0) {
        query = query.lte('tuition_fee', maxBudget)
      }

      const { data } = await query.limit(6)
      
      if (data) {
        const taggedData = data.map((uni: any) => {
          let tag = 'TARGET'
          // Simple logic: If user GPA is significantly higher than acceptance rate threshold (proxy logic)
          // In a real app, you'd compare GPA to uni.avg_gpa
          const diff = userGpa - (uni.acceptance_rate / 20) // Dummy normalization
          
          if (uni.acceptance_rate > 60) tag = 'SAFE'
          else if (uni.acceptance_rate < 20) tag = 'DREAM'
          else tag = 'TARGET'
          
          return { ...uni, match: tag }
        })
        setUnis(taggedData)
      }
      setLoading(false)
    }
    getRecommendations()
  }, [country, maxBudget, userGpa])

  const handleAdd = async (uni: any) => {
    const toastId = toast.loading(`Adding ${uni.name}...`)
    
    const { error } = await supabase.from('shortlists').insert({
      user_id: userId,
      university_id: uni.id,
      category: uni.match,
      ai_notes: "Added manually from discovery grid."
    })
    
    if (error) {
        toast.error('Failed to add university', { id: toastId })
    } else {
        toast.success(`${uni.name} added to shortlist!`, { id: toastId })
    }
  }

  if (loading) return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-64 bg-gray-200 dark:bg-[#2D2D3A] animate-pulse rounded-2xl border border-transparent dark:border-white/5"></div>
      ))}
    </div>
  )

  if (unis.length === 0) return (
    <div className="col-span-full p-12 text-center bg-white dark:bg-[#1E1E24] rounded-2xl border border-gray-200 dark:border-gray-800 border-dashed">
      <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
        🔍
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white">No matches found</h3>
      <p className="text-gray-500 dark:text-gray-400">Try adjusting your budget or country preferences.</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {unis.map((uni) => (
        <div 
          key={uni.id} 
          className="card bg-white dark:bg-[#1E1E24] border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
        >
          <div className="card-body p-6 relative">
            
            {/* Top Row: Match Tag & Acceptance Rate */}
            <div className="flex justify-between items-start mb-4">
              <span className={`badge border-none font-bold px-3 py-3 text-xs tracking-wider ${
                uni.match === 'SAFE' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' 
                  : uni.match === 'DREAM' 
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' 
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300'
              }`}>
                {uni.match}
              </span>
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 px-2 py-1 rounded-lg">
                <Trophy size={12} className="text-[#FFC229]" />
                {uni.acceptance_rate}% Acc.
              </div>
            </div>

            {/* University Name */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 leading-tight group-hover:text-[#4A2B5E] dark:group-hover:text-[#FFC229] transition-colors">
              {uni.name}
            </h3>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-6 line-clamp-1">
              {uni.location || uni.country}
            </p>
            
            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#2D2D3A] border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
                  <Globe size={12} /> Country
                </div>
                <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm truncate">
                  {uni.country}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#2D2D3A] border border-gray-100 dark:border-white/5">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">
                  <DollarSign size={12} /> Tuition
                </div>
                <div className="font-semibold text-gray-700 dark:text-gray-200 text-sm truncate">
                  ${(uni.tuition_fee / 1000).toFixed(0)}k <span className="text-xs font-normal opacity-70">/yr</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button 
              onClick={() => handleAdd(uni)}
              className="btn btn-sm w-full h-10 bg-white dark:bg-white/5 border-2 border-gray-200 dark:border-white/10 hover:border-[#FFC229] hover:bg-[#FFC229] hover:text-[#4A2B5E] text-gray-600 dark:text-gray-300 font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
            >
              <Plus size={16} strokeWidth={3} />
              <span>Add to Shortlist</span>
            </button>

          </div>
        </div>
      ))}
    </div>
  )
}