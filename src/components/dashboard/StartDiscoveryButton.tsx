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
      className="btn btn-primary btn-lg w-full shadow-lg hover:scale-105 transition-transform"
      onClick={handleStart}
      disabled={loading}
    >
      {loading ? <span className="loading loading-spinner"></span> : "Find My Universities →"}
    </button>
  )
}