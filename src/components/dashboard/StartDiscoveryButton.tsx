'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function StartDiscoveryButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleStart = async () => {
    setLoading(true)
    // Update stage to DISCOVERY
    const { error } = await supabase
      .from('profiles')
      .update({ current_stage: 'DISCOVERY' })
      .eq('id', userId)

    if (error) {
      alert('Error updating stage')
    } else {
      router.refresh() // Refresh page to show new stage
    }
    setLoading(false)
  }

  return (
    <button 
      className="btn bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none btn-lg w-full font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
      onClick={handleStart}
      disabled={loading}
    >
      {loading ? (
        <span className="loading loading-spinner loading-md text-[#1F2937]"></span>
      ) : (
        "Find My Universities →"
      )}
    </button>
  )
}