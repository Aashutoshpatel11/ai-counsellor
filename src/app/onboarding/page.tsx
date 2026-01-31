'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { BookOpen, GraduationCap, Globe, DollarSign, FileText, CheckCircle2, School, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // --- Updated State for New Requirements ---
  const [formData, setFormData] = useState({
    // Target
    targetMajor: '',
    
    // 10th Details
    tenthBoard: '',
    tenthYear: '',
    tenthScore: '',
    
    // 12th Details
    twelfthBoard: '',
    twelfthYear: '',
    twelfthScore: '',

    // Bachelors Details (Optional)
    hasBachelors: false,
    bachelorsCourse: '',
    bachelorsYear: '',
    bachelorsScore: '', // GPA, CGPA or Percentage

    // Study Abroad Preferences (Existing)
    country: 'USA', 
    budget: 30000, 
    intake: '2026',
    englishTest: 'IELTS', 
    englishScore: '', 
    sopStatus: 'Not Started'
  })

  // Options for Country Selection
  const countries = [
    { name: 'India', flag: '🇮🇳', label: 'India' },
    { name: 'USA', flag: '🇺🇸', label: 'United States' },
    { name: 'UK', flag: '🇬🇧', label: 'United Kingdom' },
    { name: 'Canada', flag: '🇨🇦', label: 'Canada' },
    { name: 'Australia', flag: '🇦🇺', label: 'Australia' },
  ]

  // Options for SOP Status
  const sopOptions = [
    { value: 'Not Started', icon: '📝', desc: 'I need guidance' },
    { value: 'Drafting', icon: '✍️', desc: 'Work in progress' },
    { value: 'Ready', icon: '✅', desc: 'Ready for review' },
  ]

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) router.push('/login')
      else setUserId(user.id)
    }
    getUser()
  }, [])

  const handleSubmit = async () => {
    if (!userId) return
    setLoading(true)

    // Construct the academic_data JSON object
    // We map the "latest" score to 'gpa' so the existing Dashboard continues to work
    const latestScore = formData.hasBachelors ? formData.bachelorsScore : formData.twelfthScore

    const academicDataPayload = {
        // Legacy support for dashboard
        major: formData.targetMajor,
        gpa: parseFloat(latestScore) || 0, // Fallback for dashboard stats
        
        // New Detailed History
        history: {
            tenth: {
                board: formData.tenthBoard,
                year: formData.tenthYear,
                percentage: formData.tenthScore
            },
            twelfth: {
                board: formData.twelfthBoard,
                year: formData.twelfthYear,
                percentage: formData.twelfthScore
            },
            bachelors: formData.hasBachelors ? {
                course: formData.bachelorsCourse,
                year: formData.bachelorsYear,
                score: formData.bachelorsScore
            } : null
        }
    }

    const { error } = await supabase.from('profiles').update({
        onboarding_completed: true,
        current_stage: 'PROFILE',
        academic_data: academicDataPayload,
        preferences: { budget: formData.budget, country: formData.country, intake: formData.intake },
        readiness_data: { englishTest: formData.englishTest, englishScore: formData.englishScore, sopStatus: formData.sopStatus }
      }).eq('id', userId)

    if (!error) {
      toast.success('Profile setup complete!')
      router.push('/dashboard')
    }
    else toast.error('Error saving profile: ' + error.message)
    
    setLoading(false)
  }

  // Helper to scroll to top on step change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#18181B] flex flex-col items-center pt-10 px-4 transition-colors duration-300 relative overflow-x-hidden pb-20">
      
      {/* --- Background Decor --- */}
      <div className="absolute top-0 right-0 w-125 h-125 bg-[#FFC229]/10 dark:bg-[#FFC229]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 -z-10"></div>
      <div className="absolute bottom-0 left-0 w-125 h-125 bg-[#4A2B5E]/5 dark:bg-[#4A2B5E]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 -z-10"></div>

      {/* --- Steps Indicator --- */}
      <div className="w-full max-w-2xl mb-12">
        <ul className="steps w-full">
          {['Academics', 'Goals', 'Readiness'].map((label, index) => (
            <li 
                key={label}
                className={`step transition-colors duration-300 font-bold
                ${step >= index + 1 ? 'step-warning text-[#4A2B5E] dark:text-[#FFC229]' : 'text-gray-300 dark:text-gray-600'}`}
            >
                {label}
            </li>
          ))}
        </ul>
      </div>

      {/* --- Main Card --- */}
      <div className="card w-full max-w-xl bg-white dark:bg-[#23232A] shadow-2xl shadow-gray-200/50 dark:shadow-none border border-gray-100 dark:border-gray-800 transition-all duration-300">
        <div className="card-body p-8">
          
          {/* ================= STEP 1: ACADEMICS ================= */}
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <div className="flex items-center gap-3 border-b border-gray-100 dark:border-gray-700 pb-4">
                <div className="p-3 bg-[#FFC229]/20 rounded-xl">
                    <GraduationCap className="w-6 h-6 text-[#4A2B5E] dark:text-[#FFC229]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#4A2B5E] dark:text-white">Academic History</h2>
                    <p className="text-sm text-[#9CA3AF] dark:text-[#D1D5DB]">Tell us about your past education</p>
                </div>
              </div>
              
              {/* --- 10th Standard --- */}
              <div className="space-y-4">
                <h3 className="font-bold text-[#4A2B5E] dark:text-[#FFC229] flex items-center gap-2">
                    <School className="w-4 h-4" /> Class 10 Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                    <div className="form-control col-span-2 flex flex-col">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Board Name</span></label>
                        <input type="text" placeholder="e.g. CBSE, ICSE, State Board" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.tenthBoard} onChange={e => setFormData({...formData, tenthBoard: e.target.value})} />
                    </div>
                    <div className="form-control ">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Passing Year</span></label>
                        <input type="number" placeholder="2018" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.tenthYear} onChange={e => setFormData({...formData, tenthYear: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Percentage (%)</span></label>
                        <input type="number" placeholder="90.5" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.tenthScore} onChange={e => setFormData({...formData, tenthScore: e.target.value})} />
                    </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* --- 12th Standard --- */}
              <div className="space-y-4">
                <h3 className="font-bold text-[#4A2B5E] dark:text-[#FFC229] flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Class 12 Details
                </h3>
                <div className="grid grid-cols-2 gap-4 ">
                    <div className="form-control col-span-2 flex flex-col">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Board Name</span></label>
                        <input type="text" placeholder="e.g. CBSE, ISC" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.twelfthBoard} onChange={e => setFormData({...formData, twelfthBoard: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Passing Year</span></label>
                        <input type="number" placeholder="2020" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.twelfthYear} onChange={e => setFormData({...formData, twelfthYear: e.target.value})} />
                    </div>
                    <div className="form-control">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Percentage (%)</span></label>
                        <input type="number" placeholder="88.2" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.twelfthScore} onChange={e => setFormData({...formData, twelfthScore: e.target.value})} />
                    </div>
                </div>
              </div>

              <div className="divider"></div>

              {/* --- Bachelors Toggle --- */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-4">
                    <input type="checkbox" className="checkbox checkbox-warning" 
                        checked={formData.hasBachelors} onChange={e => setFormData({...formData, hasBachelors: e.target.checked})} />
                    <span className="label-text font-bold text-[#1F2937] dark:text-gray-300">I have completed or am pursuing a Bachelor's Degree</span>
                </label>
              </div>

              {/* --- Bachelors Details (Conditional) --- */}
              {formData.hasBachelors && (
                  <div className="space-y-4 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-gray-700 animate-in fade-in slide-in-from-top-2">
                    <h3 className="font-bold text-[#4A2B5E] dark:text-[#FFC229]">Bachelor's Information</h3>
                    
                    <div className="form-control flex flex-col">
                        <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Course Name</span></label>
                        <input type="text" placeholder="e.g. B.Tech in Computer Science" className="input input-bordered bg-white dark:bg-[#18181B]" 
                            value={formData.bachelorsCourse} onChange={e => setFormData({...formData, bachelorsCourse: e.target.value})} />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Passing Year</span></label>
                            <input type="number" placeholder="2024" className="input input-bordered bg-white dark:bg-[#18181B]" 
                                value={formData.bachelorsYear} onChange={e => setFormData({...formData, bachelorsYear: e.target.value})} />
                        </div>
                        <div className="form-control">
                            <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">CGPA / %</span></label>
                            <input type="number" placeholder="8.5" className="input input-bordered bg-white dark:bg-[#18181B]" 
                                value={formData.bachelorsScore} onChange={e => setFormData({...formData, bachelorsScore: e.target.value})} />
                        </div>
                    </div>
                  </div>
              )}

              {/* --- Target Major (Future Goal) --- */}
              <div className="form-control mt-6">
                <label className="label"><span className="label-text font-bold text-lg text-[#1F2937] dark:text-gray-300">What do you want to study abroad?</span></label>
                <input 
                  type="text" 
                  placeholder="e.g. Masters in Data Science" 
                  className="input input-lg input-bordered w-full bg-white dark:bg-[#18181B] border-[#FFC229] focus:ring-4 focus:ring-[#FFC229]/20" 
                  value={formData.targetMajor} 
                  onChange={e => setFormData({...formData, targetMajor: e.target.value})} 
                />
              </div>

              <div className="card-actions justify-end mt-6">
                <button 
                  className="btn bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none px-8 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-xl" 
                  onClick={() => setStep(2)}
                  disabled={!formData.tenthBoard || !formData.twelfthBoard || !formData.targetMajor}
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 2: GOALS (Unchanged logic) ================= */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#FFC229]/20 rounded-xl">
                    <Globe className="w-6 h-6 text-[#4A2B5E] dark:text-[#FFC229]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#4A2B5E] dark:text-white">Study Goals</h2>
                    <p className="text-sm text-[#9CA3AF] dark:text-[#D1D5DB]">Where do you want to go?</p>
                </div>
              </div>

              {/* Interactive Country Grid */}
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Preferred Country</span></label>
                <div className="grid grid-cols-2 gap-3 mt-3">
                    {countries.map((c) => (
                        <button
                            key={c.name}
                            onClick={() => setFormData({...formData, country: c.name})}
                            className={`
                                 items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200
                                ${formData.country === c.name 
                                    ? 'border-[#FFC229] bg-[#FFC229]/10 dark:bg-[#FFC229]/20' 
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                            `}
                        >
                            <span className={`text-sm font-medium ${formData.country === c.name ? 'text-[#4A2B5E] dark:text-[#FFC229]' : 'text-gray-500 dark:text-gray-400'}`}>
                                {c.label}
                            </span>
                        </button>
                    ))}
                </div>
              </div>

              {/* Budget Slider */}
              <div className="form-control">
                <label className="label cursor-pointer justify-between">
                   <span className="label-text font-semibold text-[#1F2937] dark:text-gray-300 flex items-center gap-2">
                     <DollarSign className="w-4 h-4" /> Annual Budget
                   </span>
                   <span className="text-[#4A2B5E] dark:text-[#FFC229] font-bold text-xl">${formData.budget.toLocaleString()}</span>
                </label>
                <input 
                  type="range" 
                  min="5000" 
                  max="100000" 
                  step="5000"
                  className="range range-warning w-full" 
                  value={formData.budget} 
                  onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} 
                />
                <div className="w-full flex justify-between text-xs px-1 text-gray-400 mt-2 font-medium">
                  <span>$5k</span>
                  <span>$100k+</span>
                </div>
              </div>

              <div className="card-actions justify-between mt-6">
                <button 
                  className="btn btn-ghost text-gray-500 hover:text-[#4A2B5E] dark:text-gray-400 dark:hover:text-[#FFC229]" 
                  onClick={() => setStep(1)}
                >
                  ← Back
                </button>
                <button 
                  className="btn bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none px-8 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-xl" 
                  onClick={() => setStep(3)}
                >
                  Next Step →
                </button>
              </div>
            </div>
          )}

          {/* ================= STEP 3: READINESS (Unchanged logic) ================= */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-[#FFC229]/20 rounded-xl">
                    <FileText className="w-6 h-6 text-[#4A2B5E] dark:text-[#FFC229]" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-[#4A2B5E] dark:text-white">Readiness</h2>
                    <p className="text-sm text-[#9CA3AF] dark:text-[#D1D5DB]">Final check before we start.</p>
                </div>
              </div>

              {/* SOP Status Cards */}
              <div className="form-control">
                <label className="label"><span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">SOP Status</span></label>
                <div className="grid grid-cols-1 gap-3 mt-3">
                    {sopOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => setFormData({...formData, sopStatus: opt.value})}
                            className={`
                                flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left
                                ${formData.sopStatus === opt.value 
                                    ? 'border-[#FFC229] bg-[#FFC229]/5 dark:bg-[#FFC229]/10' 
                                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{opt.icon}</span>
                                <div>
                                    <div className={`font-bold ${formData.sopStatus === opt.value ? 'text-[#4A2B5E] dark:text-[#FFC229]' : 'text-gray-700 dark:text-gray-300'}`}>{opt.value}</div>
                                    <div className="text-xs text-gray-400">{opt.desc}</div>
                                </div>
                            </div>
                            {formData.sopStatus === opt.value && (
                                <CheckCircle2 className="w-5 h-5 text-[#FFC229]" />
                            )}
                        </button>
                    ))}
                </div>
              </div>

              <div className="alert bg-[#F8F9FD] dark:bg-[#18181B] border-l-4 border-[#FFC229] text-sm text-[#4A2B5E] dark:text-gray-300 shadow-sm rounded-lg">
                <span>💡 You can update these details later in your dashboard.</span>
              </div>

              <div className="card-actions justify-between mt-6">
                <button 
                  className="btn btn-ghost text-gray-500 hover:text-[#4A2B5E] dark:text-gray-400 dark:hover:text-[#FFC229]" 
                  onClick={() => setStep(2)}
                >
                  ← Back
                </button>
                <button 
                  className="btn bg-[#4A2B5E] hover:bg-[#2D2D3A] text-white border-none px-8 font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all rounded-xl disabled:opacity-70" 
                  onClick={handleSubmit} 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : 'Finish Setup 🚀'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}