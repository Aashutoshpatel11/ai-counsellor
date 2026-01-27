import { createClient } from '@supabase/supabase-js'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// 1. Search Tool
export const searchUniversities = tool(
  async ({ query, maxBudget, country }) => {
    let dbQuery = supabase.from('universities').select('*')
    if (country) dbQuery = dbQuery.eq('country', country)
    if (maxBudget) dbQuery = dbQuery.lte('tuition_fee', maxBudget)
    if (query) dbQuery = dbQuery.ilike('name', `%${query}%`)

    const { data } = await dbQuery.limit(5)
    return data && data.length > 0 ? JSON.stringify(data) : "No universities found."
  },
  {
    name: 'searchUniversities',
    description: 'Search for universities based on budget, country, or name.',
    schema: z.object({
      query: z.string().optional(),
      maxBudget: z.number().optional(),
      country: z.string().optional(),
    }),
  }
)

// 2. Add to Shortlist
export const addToShortlist = tool(
  async ({ userId, universityId, category, reason }) => {
    const { error } = await supabase.from('shortlists').insert({
      user_id: userId,
      university_id: universityId,
      category,
      ai_notes: reason
    })
    return error ? `Error: ${error.message}` : "Added to shortlist."
  },
  {
    name: 'addToShortlist',
    description: 'Add a university to the shortlist.',
    schema: z.object({
      userId: z.string(),
      universityId: z.string(),
      category: z.enum(['DREAM', 'TARGET', 'SAFE']),
      reason: z.string(),
    }),
  }
)

// 3. Lock Decision
export const lockUniversity = tool(
  async ({ userId, universityId }) => {
    // 1. Lock the University
    const { error: lockError } = await supabase.from('profiles').update({
      locked_university_id: universityId,
      current_stage: 'APPLICATION'
    }).eq('id', userId)

    if (lockError) return `Error locking: ${lockError.message}`

    // 2. Auto-Generate Standard Tasks
    // In a real app, AI would generate specific ones. For Hackathon speed, we inject standard ones.
    const tasks = [
      { user_id: userId, title: 'Draft Statement of Purpose (SOP)', type: 'AI_GENERATED' },
      { user_id: userId, title: 'Request Letter of Recommendations', type: 'AI_GENERATED' },
      { user_id: userId, title: 'Prepare Financial Documents', type: 'SYSTEM' },
      { user_id: userId, title: 'Book Visa Appointment', type: 'SYSTEM' }
    ]

    const { error: taskError } = await supabase.from('tasks').insert(tasks)
    
    if (taskError) return "University locked, but failed to create tasks."
    return "University locked! I have generated your Application Checklist. Check the dashboard."
  },
  {
    name: 'lockUniversity',
    description: 'Lock a final university choice. Use this when user explicitly confirms.',
    schema: z.object({
      userId: z.string(),
      universityId: z.string()
    }),
  }
)

export const tools = [searchUniversities, addToShortlist, lockUniversity]