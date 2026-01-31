'use client'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function StartDiscoveryButton({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleStart = async () => {
    setLoading(true)
    // IMPORTANT: This moves the user from PROFILE -> DISCOVERY stage
    const { error } = await supabase
      .from('profiles')
      .update({ current_stage: 'DISCOVERY' })
      .eq('id', userId)

    if (!error) {
      router.refresh() // Refresh to update the Server Component (Dashboard)
    } else {
      console.error("Update failed:", error.message)
    }
    setLoading(false)
  }

  return (
    <button 
      onClick={handleStart}
      disabled={loading}
      className="btn w-full bg-[#FFC229] hover:bg-[#F59E0B] text-[#4A2B5E] border-none font-black text-lg py-4 h-auto shadow-lg"
    >
      {loading ? <span className="loading loading-spinner"></span> : "Begin Search"}
    </button>
  )
}