'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function OnboardingWizard() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    degree: 'Bachelors', major: '', gpa: '', gradYear: '',
    country: 'USA', budget: 30000, intake: '2026',
    englishTest: 'IELTS', englishScore: '', sopStatus: 'Not Started'
  })

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
    const { error } = await supabase.from('profiles').update({
        onboarding_completed: true,
        current_stage: 'PROFILE',
        academic_data: { degree: formData.degree, major: formData.major, gpa: parseFloat(formData.gpa), gradYear: formData.gradYear },
        preferences: { budget: formData.budget, country: formData.country, intake: formData.intake },
        readiness_data: { englishTest: formData.englishTest, englishScore: formData.englishScore, sopStatus: formData.sopStatus }
      }).eq('id', userId)

    if (!error) router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-10 px-4">
      <ul className="steps w-full max-w-2xl mb-8 text-gray-500">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Academics</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Goals</li>
        <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Readiness</li>
      </ul>

      <div className="card w-full max-w-lg bg-white shadow-xl">
        <div className="card-body">
          {step === 1 && (
            <div className="space-y-4 text-base-100 ">
              <h2 className="card-title text-blue-800">Academics</h2>
              <input type="text" placeholder="Major" className="input input-bordered w-full bg-transparent border border-base-100/20" value={formData.major} onChange={e => setFormData({...formData, major: e.target.value})} />
              <input type="number" placeholder="GPA (e.g. 3.5)" className="input input-bordered w-full bg-transparent border border-base-100/20" value={formData.gpa} onChange={e => setFormData({...formData, gpa: e.target.value})} />
              <div className="card-actions justify-end"><button className="btn btn-primary" onClick={() => setStep(2)}>Next</button></div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="card-title text-blue-800">Goals</h2>
              <select className="select select-neutral w-full" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}>
                  <option className='bg-base-100 border border-base-100/20' value="India">India</option>
                  <option className='bg-base-100' value="United States">United States</option>
                  <option className='bg-base-100' value="United Kingdom">United Kingdom</option>
                  <option className='bg-base-100' value="Canada">Canada</option>
                  <option className='bg-base-100' value="Australia">Australia</option>
              </select>
              <input type="range" min="5000" max="15000" className="range range-neutral w-full " value={formData.budget} onChange={e => setFormData({...formData, budget: parseInt(e.target.value)})} />
              <p className="text-right font-bold text-base-100">${formData.budget}</p>
              <div className="card-actions justify-between text-base-100"><button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button><button className="btn btn-primary" onClick={() => setStep(3)}>Next</button></div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="card-title text-blue-800">Readiness</h2>
              <select className="select select-bordered w-full" value={formData.sopStatus} onChange={e => setFormData({...formData, sopStatus: e.target.value})}>
                  <option>Not Started</option><option>Drafting</option><option>Ready</option>
              </select>
              <div className="card-actions justify-between text-base-100 ">
                <button className="btn btn-ghost " onClick={() => setStep(2)}>Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>{loading ? 'Saving...' : 'Finish'}</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}