'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

interface ProceedToShortlistButtonProps {
  userId: string;
  showButton: boolean;
}

export default function ProceedToShortlistButton({ userId, showButton }: ProceedToShortlistButtonProps) {
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  const router = useRouter()

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

  if (!showButton) return null

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