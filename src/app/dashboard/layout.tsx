import ChatWidget from '@/components/dashboard/ChatWidget'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // We need to fetch User ID here to pass to the client component
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen bg-slate-50 text-base-100">
        {/* Existing Layout Code... */}
        {children}
        
        {/* Add the Widget Here - Only if user exists */}
        {user && <ChatWidget userId={user.id} initialMSG='' />}
    </div>
  )
}