import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShortlistTable from '@/components/dashboard/ShortlistTable'
import TaskList from '@/components/dashboard/TaskList'
import StartDiscoveryButton from '@/components/dashboard/StartDiscoveryButton'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const currentStage = profile?.current_stage || 'PROFILE'

  const stepIndices: Record<string, number> = {
    'PROFILE': 0,
    'DISCOVERY': 1,
    'SHORTLIST': 2,
    'APPLICATION': 3
  }
  const currentStepIndex = stepIndices[currentStage] || 0

  return (
    <div className="min-h-screen pb-20 relative transition-colors duration-500 bg-[#F8F9FD] dark:bg-[#0a0a0a] selection:bg-[#FFC229] selection:text-[#4A2B5E]">
      
      {/* --- Ambient Background Glow (Animated) --- */}
      <div className="fixed top-0 left-0 w-125 h-125 bg-[#FFC229]/20 dark:bg-[#FFC229]/5 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-125 h-125 bg-[#4A2B5E]/10 dark:bg-[#4A2B5E]/20 rounded-full blur-[100px] translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-6xl mx-auto space-y-12 px-6 md:px-8 pt-12">
      
        {/* --- HEADER SECTION --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 mb-4 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold tracking-wide text-gray-500 dark:text-gray-400 uppercase">System Online</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-[#4A2B5E] dark:text-white tracking-tight leading-tight">
              Hello, <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FFC229] to-[#F59E0B]">{profile?.full_name?.split(' ')[0] || 'Student'}</span>
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Let's get you into your dream university.
            </p>
          </div>
          
          <div className="badge bg-[#4A2B5E] dark:bg-[#FFC229] text-white dark:text-[#1F2937] border-none px-6 py-4 text-sm font-bold shadow-xl shadow-[#4A2B5E]/20">
            {currentStage} PHASE
          </div>
        </div>

        {/* --- PROGRESS STEPPER --- */}
        <div className="w-full overflow-x-auto pb-2 scrollbar-hide">
          <ul className="steps w-full min-w-150">
            {['Profile', 'Discovery', 'Shortlist', 'Apply'].map((step, index) => (
              <li 
                key={step}
                data-content={currentStepIndex >= index ? "✓" : "●"}
                className={`step transition-all duration-300 font-bold px-4
                  ${currentStepIndex >= index 
                    ? 'step-warning text-[#4A2B5E] dark:text-[#FFC229]' 
                    : 'text-gray-300 dark:text-gray-600'}`
                }
              >
                <span className={`mt-2 text-sm ${currentStepIndex >= index ? 'opacity-100' : 'opacity-60'}`}>{step}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* --- MAIN STAGE CONTENT --- */}
        <div className="min-h-125">

        {/* === STAGE 0: PROFILE === */}
          {currentStage === 'PROFILE' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                
              {/* Left: Analysis Card */}
              <div className="card bg-white/80 dark:bg-[#1E1E24]/80 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="card-body p-8">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-[#4A2B5E] dark:text-white flex items-center gap-2">
                          📊 Profile Insights
                        </h2>
                        <span className="badge badge-ghost font-mono text-xs">Updated Just Now</span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                          <div className="p-4 rounded-2xl bg-[#F8F9FD] dark:bg-white/5 border border-transparent hover:border-[#FFC229]/50 transition-colors">
                              <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">GPA Strength</p>
                              <div className="text-4xl font-black text-[#1F2937] dark:text-white">
                                  {profile?.academic_data?.gpa}
                              </div>
                              <p className="text-xs font-medium text-[#4A2B5E] dark:text-[#FFC229] mt-2">
                                  Top 15% bracket
                              </p>
                          </div>

                          <div className="p-4 rounded-2xl bg-[#F8F9FD] dark:bg-white/5 border border-transparent hover:border-[#FFC229]/50 transition-colors">
                              <p className="text-xs font-bold text-[#9CA3AF] uppercase tracking-wider mb-2">Budget / Year</p>
                              <div className="text-3xl font-black text-[#1F2937] dark:text-white truncate">
                                  ${(profile?.preferences?.budget / 1000)}k
                              </div>
                              <p className="text-xs font-medium text-gray-500 mt-2 truncate">
                                  {profile?.preferences?.country}
                              </p>
                          </div>
                      </div>

                      <div className="mt-6 p-4 rounded-xl bg-[#FFC229]/10 border border-[#FFC229]/20 text-sm text-[#4A2B5E] dark:text-[#D1D5DB] flex gap-3 items-start">
                          <span className="text-xl">💡</span>
                          <span className="leading-relaxed">Based on your academic profile, our AI suggests targeting universities with acceptance rates between <strong>40-70%</strong> for optimal success.</span>
                      </div>
                  </div>
              </div>

              {/* Right: Action Card */}
              <div className="card bg-gradient-to-br from-[#4A2B5E] to-[#2D2D3A] text-white shadow-2xl shadow-[#4A2B5E]/30 relative overflow-hidden group">
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-[#FFC229]/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:bg-[#FFC229]/20 transition-all duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
                  
                  <div className="card-body justify-center items-center text-center relative z-10 p-10">
                      <div className="text-8xl mb-6 transform group-hover:-translate-y-2 transition-transform duration-500">🚀</div>
                      <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Blastoff?</h2>
                      <p className="text-gray-300 text-lg mb-8 max-w-md leading-relaxed">
                          Your profile is locked in. Activate the engine to start matching with your top universities instantly.
                      </p>
                      <div className="w-full max-w-xs relative group/btn">
                          <div className="absolute -inset-1 bg-gradient-to-r from-[#FFC229] to-orange-400 rounded-lg blur opacity-25 group-hover/btn:opacity-75 transition duration-200"></div>
                          <StartDiscoveryButton userId={user.id} /> 
                      </div>
                  </div>
              </div>

            </div>
          )}
          
          {/* === STAGE 1: DISCOVERY === */}
          {currentStage === 'DISCOVERY' && (
            <div className="hero min-h-100 bg-white dark:bg-[#1E1E24] rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 animate-in fade-in zoom-in-95 duration-500 overflow-hidden relative">
              
              {/* Grid Pattern Background */}
              <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
              
              <div className="hero-content text-center relative z-10">
                <div className="max-w-2xl">
                  <span className="badge bg-[#FFC229] text-[#1F2937] border-none mb-6 font-bold">AI Assistant Active</span>
                  <h2 className="text-5xl font-black text-[#4A2B5E] dark:text-white mb-6">Start Your Search</h2>
                  <p className="text-xl text-gray-500 dark:text-gray-300 mb-10 leading-relaxed">
                    Look at the bottom right 👉 <br/>
                    Ask me: <span className="font-bold text-[#4A2B5E] dark:text-[#FFC229]">"Find computer science universities in Canada under $30k"</span>
                  </p>
                  
                  <div className="flex justify-center gap-4 flex-wrap">
                     <div className="px-6 py-3 rounded-full bg-[#F8F9FD] dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium">
                        Target: {profile?.preferences?.country || 'Global'}
                     </div>
                     <div className="px-6 py-3 rounded-full bg-[#F8F9FD] dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-medium">
                        Major: {profile?.academic_data?.major || 'Undecided'}
                     </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* === STAGE 2: SHORTLIST === */}
          {currentStage === 'SHORTLIST' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="alert bg-[#FFC229]/10 border-l-4 border-[#FFC229] text-[#4A2B5E] dark:text-gray-200 shadow-sm rounded-r-xl">
                <div className="flex items-center gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-[#FFC229] shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <span className="font-medium">Review your list below. Ask the AI to <span className="font-bold border-b-2 border-[#FFC229]">"Lock"</span> a university to proceed to application.</span>
                </div>
              </div>
              
              <div className="bg-white dark:bg-[#1E1E24] rounded-2xl shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden border border-gray-100 dark:border-gray-800">
                 <ShortlistTable userId={user.id} />
              </div>
            </div>
          )}

          {/* === STAGE 3: APPLICATION === */}
          {currentStage === 'APPLICATION' && (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-700">
              <div className="space-y-6">
                
                {/* Congratulations Card */}
                <div className="card bg-linear-to-br from-[#FFC229] to-[#F59E0B] text-[#1F2937] shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/20 rounded-full blur-2xl"></div>
                  <div className="card-body items-center text-center p-10">
                    <div className="text-6xl mb-4">🎉</div>
                    <h2 className="card-title text-3xl font-black mb-2">Congratulations!</h2>
                    <p className="font-medium text-[#1F2937]/80 text-lg">You have committed to your future.</p>
                    <div className="mt-6 px-6 py-2 rounded-full bg-[#1F2937]/10 border border-[#1F2937]/10 font-bold backdrop-blur-sm">
                      Status: Locked & Confirmed
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-4">
                   <button className="btn h-auto py-6 bg-white dark:bg-[#1E1E24] border-gray-100 dark:border-gray-800 hover:border-[#FFC229] hover:shadow-lg text-[#4A2B5E] dark:text-white shadow-sm flex flex-col gap-2 transition-all">
                    <span className="text-2xl">📥</span>
                    Download Guide
                   </button>
                   <button className="btn h-auto py-6 bg-white dark:bg-[#1E1E24] border-gray-100 dark:border-gray-800 hover:border-[#FFC229] hover:shadow-lg text-[#4A2B5E] dark:text-white shadow-sm flex flex-col gap-2 transition-all">
                    <span className="text-2xl">✈️</span>
                    Visa Info
                   </button>
                </div>
              </div>

              {/* Task List */}
              <div className="bg-white dark:bg-[#1E1E24] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden h-full">
                  <TaskList userId={user.id} />
              </div>
            </div>
          )}

        </div>
      </div>


    </div>
  )
}