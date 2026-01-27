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

  if (loading) return <div className="text-center p-4">Loading choices...</div>
  
  if (shortlist.length === 0) return (
    <div className="text-center p-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
      <p className="text-slate-500">No universities shortlisted yet.</p>
      <p className="text-sm text-blue-500 mt-2">Ask the AI: "Add Stanford to my shortlist"</p>
    </div>
  )

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border">
      <table className="table w-full">
        {/* Table Head */}
        <thead className="bg-slate-50 text-slate-700">
          <tr>
            <th>University</th>
            <th>Category</th>
            <th>Acceptance Rate</th>
            <th>Est. Cost</th>
            <th>AI Reason</th>
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {shortlist.map((item) => (
            <tr key={item.id} className="hover:bg-slate-50">
              <td>
                <div className="flex items-center gap-3">
                  <div className="avatar placeholder">
                    <div className="bg-neutral text-neutral-content rounded-full w-8">
                      <span className="text-xs">{item.universities.name.substring(0,1)}</span>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold">{item.universities.name}</div>
                    <div className="text-xs opacity-50">{item.universities.country}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className={`badge ${
                    item.category === 'DREAM' ? 'badge-error text-white' : 
                    item.category === 'TARGET' ? 'badge-warning text-white' : 'badge-success text-white'
                }`}>
                    {item.category}
                </span>
              </td>
              <td>
                <div className="radial-progress text-primary text-xs" style={{"--value": item.universities.acceptance_rate, "--size": "2rem"} as any}>
                  {item.universities.acceptance_rate}%
                </div>
              </td>
              <td className="font-mono text-slate-600">
                ${item.universities.tuition_fee.toLocaleString()}
              </td>
              <td className="text-xs max-w-xs truncate text-slate-500" title={item.ai_notes}>
                {item.ai_notes || 'No notes added.'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}