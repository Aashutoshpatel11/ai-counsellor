'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Onboarding() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    degree: 'Bachelors',
    major: '',
    gpa: '',
    budget: '20000',
    country: 'USA',
    intake: '2025'
  })

  // Check if user is logged in
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

    // Update Profile in Supabase
    const { error } = await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        current_stage: 'DISCOVERY', // Move to next stage
        academic_data: { 
            degree: formData.degree, 
            major: formData.major, 
            gpa: formData.gpa 
        },
        preferences: { 
            budget: parseInt(formData.budget), 
            country: formData.country, 
            intake: formData.intake 
        }
      })
      .eq('id', userId)

    if (error) {
      alert('Error saving profile: ' + error.message)
    } else {
      router.push('/dashboard') // Success! Go to dashboard
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pt-10">
      
      {/* Progress Steps */}
      <ul className="steps steps-horizontal w-full max-w-2xl mb-10">
        <li className={`step ${step >= 1 ? 'step-primary' : ''}`}>Academics</li>
        <li className={`step ${step >= 2 ? 'step-primary' : ''}`}>Preferences</li>
        <li className={`step ${step >= 3 ? 'step-primary' : ''}`}>Finish</li>
      </ul>

      <div className="card w-96 bg-white shadow-xl">
        <div className="card-body">
          
          {/* STEP 1: ACADEMICS */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="card-title text-blue-700">Academic Background</h2>
              <select 
                className="select select-bordered w-full"
                value={formData.degree}
                onChange={(e) => setFormData({...formData, degree: e.target.value})}
              >
                <option value="Bachelors">Applying for Bachelors</option>
                <option value="Masters">Applying for Masters</option>
              </select>
              <input 
                type="text" 
                placeholder="Intended Major (e.g. Computer Science)" 
                className="input input-bordered w-full"
                value={formData.major}
                onChange={(e) => setFormData({...formData, major: e.target.value})}
              />
              <input 
                type="number" 
                placeholder="Current GPA / Percentage" 
                className="input input-bordered w-full"
                value={formData.gpa}
                onChange={(e) => setFormData({...formData, gpa: e.target.value})}
              />
              <div className="card-actions justify-end mt-4">
                <button className="btn btn-primary" onClick={() => setStep(2)}>Next</button>
              </div>
            </div>
          )}

          {/* STEP 2: PREFERENCES */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="card-title text-blue-700">Study Goals</h2>
              <select 
                className="select select-bordered w-full"
                value={formData.country}
                onChange={(e) => setFormData({...formData, country: e.target.value})}
              >
                <option value="USA">USA</option>
                <option value="UK">UK</option>
                <option value="Canada">Canada</option>
                <option value="Germany">Germany</option>
                <option value="Australia">Australia</option>
              </select>
              <label className="label cursor-pointer justify-start gap-2">
                <span className="label-text">Max Budget (USD/Year):</span>
                <span className="font-bold text-blue-600">${formData.budget}</span>
              </label>
              <input 
                type="range" 
                min="0" 
                max="100000" 
                step="5000" 
                className="range range-primary" 
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
              />
              <div className="card-actions justify-between mt-4">
                <button className="btn btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>Next</button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW & SUBMIT */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="card-title text-blue-700">Ready to start?</h2>
              <p className="text-slate-600">Your AI Counsellor will use this data to find your best university matches.</p>
              
              <div className="bg-blue-50 p-4 rounded-lg text-sm">
                <p><strong>Major:</strong> {formData.major}</p>
                <p><strong>Budget:</strong> ${formData.budget}</p>
                <p><strong>Country:</strong> {formData.country}</p>
              </div>

              <div className="card-actions justify-between mt-4">
                <button className="btn btn-ghost" onClick={() => setStep(2)}>Back</button>
                <button 
                    className="btn btn-primary w-32" 
                    onClick={handleSubmit}
                    disabled={loading}
                >
                    {loading ? <span className="loading loading-spinner"></span> : "Let's Go"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}