import { createClient } from '@supabase/supabase-js'
import { tool } from '@langchain/core/tools'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const aiTools = [
  // Tool 1: Smart Search
  tool(
    async ({ query, maxBudget, country, userGpa }) => {
      let dbQuery = supabase.from('universities').select('*')
      if (country) dbQuery = dbQuery.eq('country', country)
      if (maxBudget) dbQuery = dbQuery.lte('tuition_fee', maxBudget)
      if (query) dbQuery = dbQuery.ilike('name', `%${query}%`)

      const { data } = await dbQuery.limit(6)
      if (!data || data.length === 0) return "No universities found."

      // LOGIC: Tag Results
      return JSON.stringify(data.map((uni: any) => {
          let tag = 'TARGET'
          const diff = userGpa - uni.avg_gpa
          if (diff >= 0.5) tag = 'SAFE'
          else if (diff < 0) tag = 'DREAM'
          return { ...uni, match_category: tag }
      }))
    },
    {
      name: 'searchUniversities',
      description: 'Search universities. REQUIRES userGpa to calculate match chance.',
      schema: z.object({
        query: z.string().optional(),
        maxBudget: z.number().optional(),
        country: z.string().optional(),
        userGpa: z.number().describe("The user's GPA from their profile")
      }),
    }
  ),
  
  // Tool 2: Shortlist
  tool(
      async ({ userId, universityId, category, reason }) => {
          await supabase.from('shortlists').insert({ user_id: userId, university_id: universityId, category, ai_notes: reason })
          return "Added to shortlist."
      },
      {
          name: 'addToShortlist',
          description: 'Add to shortlist',
          schema: z.object({ userId: z.string(), universityId: z.string(), category: z.enum(['DREAM','TARGET','SAFE']), reason: z.string() })
      }
  ),

  // Tool 3: Lock
  tool(
      async ({ userId, universityId }) => {
          await supabase.from('profiles').update({ locked_university_id: universityId, current_stage: 'APPLICATION' }).eq('id', userId)
          return "Locked. Moved to Application stage."
      },
      {
          name: 'lockUniversity',
          description: 'Lock decision',
          schema: z.object({ userId: z.string(), universityId: z.string() })
      }
  )
]