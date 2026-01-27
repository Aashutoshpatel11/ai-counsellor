import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShortlistTable from '@/components/dashboard/ShortlistTable'
import TaskList from '@/components/dashboard/TaskList'
import StartDiscoveryButton from '@/components/dashboard/StartDiscoveryButton' // <--- IMPORT THIS

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const currentStage = profile?.current_stage || 'PROFILE'
  const stepIndices: Record<string, number> = {
    'PROFILE': 0,
    'DISCOVERY': 1,
    'SHORTLIST': 2,
    'APPLICATION': 3
  }
  const currentStepIndex = stepIndices[currentStage] || 0

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Welcome, {profile?.full_name?.split(' ')[0] || 'Student'} 👋
          </h1>
          <p className="text-slate-500 mt-2">
            AI Counsellor Control Center
          </p>
        </div>
        <div className="badge badge-lg badge-primary badge-outline">
          {currentStage} STAGE
        </div>
      </div>

      {/* STEPPER */}
      <ul className="steps w-full">
        <li className={`text-gray-500 step ${currentStepIndex >= 0 ? 'step-primary' : ''}`}>Profile</li>
        <li className={`text-gray-500 step ${currentStepIndex >= 1 ? 'step-primary' : ''}`}>Discovery</li>
        <li className={`text-gray-500 step ${currentStepIndex >= 2 ? 'step-primary' : ''}`}>Shortlist</li>
        <li className={`text-gray-500 step ${currentStepIndex >= 3 ? 'step-primary' : ''}`}>Apply</li>
      </ul>

      {/* DYNAMIC CONTENT */}
      <div className="min-h-100">

        {/* --- STAGE 0: PROFILE (NEW ADDITION) --- */}
        {currentStage === 'PROFILE' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* Left: Analysis Card */}
                <div className="card bg-white border shadow-xl">
                    <div className="card-body">
                        <h2 className="card-title text-blue-800">📊 Profile Analysis</h2>
                        <div className="divider my-0"></div>
                        
                        <div className="py-4 space-y-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Academic Standing</p>
                                <div className="text-2xl font-bold text-slate-700">
                                    {profile?.academic_data?.gpa} GPA
                                </div>
                                <p className="text-sm text-slate-500">
                                    Targeting {profile?.academic_data?.degree} in {profile?.academic_data?.major}
                                </p>
                            </div>

                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase">Financial Plan</p>
                                <div className="text-2xl font-bold text-green-600">
                                    ${profile?.preferences?.budget?.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ year</span>
                                </div>
                                <p className="text-sm text-slate-500">
                                    Preferred Country: <strong>{profile?.preferences?.country}</strong>
                                </p>
                            </div>
                        </div>

                        <div className="alert bg-blue-50 text-blue-900 text-sm mt-4">
                            Based on your GPA of {profile?.academic_data?.gpa}, the AI recommends focusing on universities with acceptance rates between <strong>40-70%</strong> for a Safe/Target mix.
                        </div>
                    </div>
                </div>

                {/* Right: Action Card */}
                <div className="card bg-linear-to-br from-blue-600 to-blue-800 text-white shadow-xl">
                    <div className="card-body justify-center items-center text-center">
                        <div className="text-6xl mb-4">🚀</div>
                        <h2 className="card-title text-3xl">Ready to Launch?</h2>
                        <p className="text-blue-100 mb-6">
                            Your profile is set. Activate the AI Counsellor to start finding your best university matches.
                        </p>
                        <StartDiscoveryButton userId={user.id} />
                    </div>
                </div>

            </div>
        )}
        
        {/* --- STAGE 1: DISCOVERY --- */}
        {currentStage === 'DISCOVERY' && (
          <div className="hero bg-blue-50 rounded-2xl p-10">
            <div className="hero-content text-center">
              <div className="max-w-md">
                <h2 className="text-3xl font-bold text-blue-900">Start Your Search</h2>
                <p className="py-6 text-slate-600">
                  Your profile is ready! Use the AI Assistant on the right 👉 to search for universities.
                </p>
                <div className="stats shadow bg-white">
                  <div className="stat place-items-center">
                    <div className="stat-title">Target Country</div>
                    <div className="stat-value text-blue-600 text-2xl">{profile?.preferences?.country || 'Any'}</div>
                  </div>
                  <div className="stat place-items-center">
                    <div className="stat-title">Major</div>
                    <div className="stat-value text-blue-600 text-2xl">{profile?.academic_data?.major || 'General'}</div>
                  </div>
                </div>
                <div className="mt-8 text-sm text-slate-400">
                  Try asking: <em>"Find universities in {profile?.preferences?.country} for me."</em>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- STAGE 2: SHORTLIST --- */}
        {currentStage === 'SHORTLIST' && (
          <div className="space-y-6">
            <div className="alert alert-info shadow-sm bg-blue-50 border-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6 text-blue-600"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span>Review your list below. Ask the AI to "Lock" a university to proceed.</span>
            </div>
            <ShortlistTable userId={user.id} />
          </div>
        )}

        {/* --- STAGE 3: APPLICATION --- */}
        {currentStage === 'APPLICATION' && (
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-700">
            <div className="space-y-6">
              <div className="card bg-success text-white shadow-xl">
                <div className="card-body items-center text-center">
                  <h2 className="card-title text-3xl">🎉 Congratulations!</h2>
                  <p>You have committed to a university.</p>
                  <div className="badge badge-outline text-white p-4 text-lg mt-4">
                    Locked & Confirmed
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <button className="btn btn-outline w-full">Download Guide</button>
                 <button className="btn btn-outline w-full">Visa Info</button>
              </div>
            </div>
            <TaskList userId={user.id} />
          </div>
        )}

      </div>
    </div>
  )
}