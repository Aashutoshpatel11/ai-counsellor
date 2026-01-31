'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

export default function ProceedToShortlistButton({ userId }: { userId: string }) {
  const [hasShortlist, setHasShortlist] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const checkShortlist = async () => {
    const { count } = await supabase
      .from('shortlists')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
    
    setHasShortlist((count || 0) > 0)
  }

  useEffect(() => {
    checkShortlist()
    // Subscribe to realtime changes so the button appears instantly when a user adds a uni
    const channel = supabase.channel('shortlist_check')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shortlists', filter: `user_id=eq.${userId}` }, () => {
        checkShortlist()
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [userId])

  const handleProceed = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('profiles')
      .update({ current_stage: 'SHORTLIST' })
      .eq('id', userId)
    
    if (!error) {
      router.refresh()
    } else {
      setLoading(false)
      console.error(error)
    }
  }

  if (!hasShortlist) return null

  return (
    <div className="flex justify-end mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={handleProceed}
        disabled={loading}
        className="btn btn-lg bg-[#4A2B5E] dark:bg-[#FFC229] text-white dark:text-[#4A2B5E] hover:bg-[#2D2D3A] dark:hover:bg-[#e0a800] border-none shadow-xl gap-3 rounded-2xl px-8"
      >
        {loading ? (
          <span className="loading loading-spinner"></span>
        ) : (
          <>
            Review Shortlist <ArrowRight size={20} />
          </>
        )}
      </button>
    </div>
  )
}