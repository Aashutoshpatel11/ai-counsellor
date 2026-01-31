'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: email.split('@')[0] } // Default name from email
        }
      })
      if (error) alert(error.message)
      else alert('Check your email for the confirmation link!')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) alert(error.message)
      else router.push('/dashboard') // Redirect to dashboard on success
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8F9FD] dark:bg-[#18181B] transition-colors duration-300 relative overflow-hidden">
      
      {/* --- Background Decor (Consistent with Landing) --- */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-[#FFC229]/10 dark:bg-[#FFC229]/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 -z-10"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#4A2B5E]/5 dark:bg-[#4A2B5E]/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 -z-10"></div>

      {/* --- Card Container --- */}
      <div className="card w-full max-w-md bg-white dark:bg-[#23232A] shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
      <div
      className="
        absolute top-0 left-0
        w-64 h-64 rounded-full
        -translate-x-1/2 -translate-y-1/2
        bg-[conic-gradient(from_-270deg,rgba(255,255,255,0.08)_0deg_90deg,transparent_45deg)]
      "
      ></div>

      <div
      className="
        absolute bottom-0 right-0
        w-64 h-64 rounded-full
        translate-x-1/2 translate-y-1/2
        bg-[conic-gradient(from_270deg,rgba(255,194,41,0.15)_0deg_90deg,transparent_45deg)]
      "
      ></div>

        <div className="card-body p-8">
          
          {/* Logo / Header */}
          <div className="text-center mb-6">
            <span className="text-4xl mb-2 block">🎓</span>
            <h2 className="text-3xl font-bold text-[#4A2B5E] dark:text-white tracking-tight">
              AI Counsellor
            </h2>
            <p className="text-[#9CA3AF] dark:text-[#D1D5DB] mt-2 text-sm font-medium">
              {isSignUp ? 'Create your free account' : 'Welcome back, future scholar'}
            </p>
          </div>
          
          <form onSubmit={handleAuth} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Email</span>
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                className="input input-bordered w-full bg-white dark:bg-[#18181B] border-gray-200 dark:border-gray-700 focus:border-[#FFC229] focus:outline-none focus:ring-2 focus:ring-[#FFC229]/20 transition-all text-[#1F2937] dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold text-[#1F2937] dark:text-gray-300">Password</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                className="input input-bordered w-full bg-white dark:bg-[#18181B] border-gray-200 dark:border-gray-700 focus:border-[#FFC229] focus:outline-none focus:ring-2 focus:ring-[#FFC229]/20 transition-all text-[#1F2937] dark:text-white"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {!isSignUp && (
                <label className="label">
                  <a href="#" className="label-text-alt link link-hover text-[#4A2B5E] dark:text-[#FFC229]">Forgot password?</a>
                </label>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none font-bold text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                isSignUp ? 'Sign Up' : 'Login'
              )}
            </button>
          </form>

          <div className="divider text-gray-400 dark:text-gray-600 text-sm">OR</div>
          
          <div className="text-center">
            <button 
              className="group text-sm font-medium text-[#9CA3AF] hover:text-[#4A2B5E] dark:text-[#D1D5DB] dark:hover:text-[#FFC229] transition-colors"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Already have an account? ' : 'New here? '}
              <span className="underline decoration-[#FFC229] underline-offset-4 group-hover:text-[#4A2B5E] dark:group-hover:text-[#FFC229] text-[#1F2937] dark:text-white font-bold transition-colors">
                {isSignUp ? 'Login' : 'Create Account'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Back to Home Link */}
      <Link href="/" className="absolute top-6 left-6 text-sm font-medium text-[#9CA3AF] hover:text-[#4A2B5E] dark:text-gray-500 dark:hover:text-[#FFC229] transition-colors flex items-center gap-2">
        ← Back to Home
      </Link>
    </div>
  )
}