"use client"

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'

export default function LandingPage() {
  const observerRef = useRef<any>(null);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-10');
        }
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observerRef.current.observe(el));

    return () => observerRef.current.disconnect();
  }, []);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    if (newTheme) {
      document.body.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#18181B] text-[#1F2937] dark:text-white font-sans selection:bg-[#FFC229] selection:text-[#4A2B5E] transition-colors duration-300">
      
      {/* --- Navbar --- */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-[#18181B]/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎓</span>
            <span className="text-xl font-bold tracking-tight text-[#4A2B5E] dark:text-white">AI Counsellor</span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
              <a href="#how-it-works" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">How it works</a>
              <a href="#features" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Features</a>
              <a href="#pricing" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Pricing</a>
            </div>
            
            <ThemeToggle />

            <Link href="/login" className="btn bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none font-bold px-6 rounded-full shadow-md hover:shadow-lg transition-all duration-300">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-20 px-4 overflow-hidden">
        {/* Background Blob Effect */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-[#FFC229]/10 dark:bg-[#FFC229]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-[#4A2B5E]/5 dark:bg-[#4A2B5E]/20 rounded-full blur-3xl -z-10"></div>

        <div className="max-w-4xl mx-auto text-center reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-white dark:bg-[#23232A] border border-gray-200 dark:border-gray-700 shadow-sm">
            <span className="text-xs font-bold text-[#4A2B5E] dark:text-[#FFC229] tracking-wide uppercase">🚀 New: 2026 Admissions Open</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold mb-8 text-[#1F2937] dark:text-white leading-tight">
            Unlock Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC229] to-[#F59E0B]">Global Potential</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-[#9CA3AF] dark:text-[#D1D5DB] mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop guessing. We analyze your academic profile to match you with 
            <span className="text-[#4A2B5E] dark:text-[#FFC229] font-semibold"> Safe, Target, and Dream</span> universities instantly.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <Link href="/login" className="btn bg-[#4A2B5E] hover:bg-[#2D2D3A] dark:bg-[#FFC229] dark:hover:bg-[#E5AC24] text-white dark:text-[#1F2937] border-none btn-lg px-8 rounded-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              Start Free Assessment
            </Link>
            <span className="text-sm text-gray-400 font-medium">No credit card required</span>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-800 grid grid-cols-2 md:grid-cols-4 gap-8 opacity-80">
            {[
              { num: '98%', label: 'Acceptance Rate' },
              { num: '50+', label: 'Countries Supported' },
              { num: '10k+', label: 'Student Successes' },
              { num: '24/7', label: 'AI Support' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-[#4A2B5E] dark:text-[#FFC229]">{stat.num}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- How It Works (Steps) --- */}
      <section id="how-it-works" className="py-24 bg-white dark:bg-[#1E1E24] relative transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700">
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-white mb-4">Your Pathway to Success</h2>
            <p className="text-[#9CA3AF] dark:text-[#D1D5DB]">Three simple steps to your dream university.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-100 dark:bg-gray-800 -z-10"></div>

            {[
              { step: '01', title: 'Input Profile', desc: 'Enter your GPA, test scores, and preferred countries.' },
              { step: '02', title: 'Get AI Match', desc: 'Our algorithm categorizes 500+ universities for you.' },
              { step: '03', title: 'Track & Apply', desc: 'Follow a generated roadmap for SOPs and Visas.' },
            ].map((item, i) => (
              <div key={i} className="relative bg-white dark:bg-[#1E1E24] p-6 reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700 delay-100">
                <div className="w-14 h-14 bg-[#F8F9FD] dark:bg-[#23232A] border-2 border-[#FFC229] rounded-2xl flex items-center justify-center text-xl font-bold text-[#4A2B5E] dark:text-[#FFC229] mb-6 shadow-sm mx-auto md:mx-0">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-3 text-[#1F2937] dark:text-white">{item.title}</h3>
                <p className="text-[#9CA3AF] dark:text-[#D1D5DB] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Features Grid --- */}
      <section id="features" className="py-24 px-4 bg-[#F8F9FD] dark:bg-[#18181B] transition-colors duration-300">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '📊', title: 'Deep Profile Analysis', desc: 'We go beyond grades. Our AI evaluates your extracurriculars, budget, and readiness to suggest the perfect fit.' },
              { icon: '🎯', title: 'Smart Shortlisting', desc: 'Stop wasting application fees. Get a categorized list of Safe, Target, and Dream schools based on real data.' },
              { icon: '✅', title: 'Automated Task Tracking', desc: 'Never miss a deadline. Generated checklists for Recommendations, SOPs, and Visa interviews.' },
              { icon: '📝', title: 'SOP Assistant', desc: 'Get structural suggestions and grammar improvements for your Statement of Purpose.' },
              { icon: '💰', title: 'Scholarship Finder', desc: 'Automatically match with scholarships that fit your specific profile and destination.' },
              { icon: '💬', title: '24/7 AI Mentor', desc: 'Have a question at 3 AM? Your dedicated AI counselor is ready to answer specific admission queries.' }
            ].map((f, i) => (
              <div key={i} className="group bg-white dark:bg-[#23232A] rounded-2xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-[#FFC229]/30 dark:border-gray-800 reveal-on-scroll opacity-0 translate-y-10">
                <div className="w-12 h-12 bg-[#FFF8E1] dark:bg-[#2D2D3A] rounded-lg flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-3 text-[#1F2937] dark:text-white group-hover:text-[#4A2B5E] dark:group-hover:text-[#FFC229] transition-colors">{f.title}</h3>
                <p className="text-[#9CA3AF] dark:text-[#D1D5DB] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto bg-[#4A2B5E] dark:bg-[#23232A] rounded-3xl p-12 text-center relative overflow-hidden shadow-2xl reveal-on-scroll opacity-0 translate-y-10 transition-all duration-700">
          {/* Decorative Circles */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#FFC229]/10 rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 relative z-10">Ready to start your journey?</h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">
            Join thousands of students who found their dream university with AI Counsellor.
          </p>
          <Link href="/login" className="relative z-10 btn bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none btn-lg px-10 rounded-full font-bold shadow-lg hover:scale-105 transition-transform">
            Get Started for Free
          </Link>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-[#1E1E24] py-12 border-t border-gray-100 dark:border-gray-800 text-sm text-[#9CA3AF] dark:text-gray-500 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© 2026 AI Counsellor. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Privacy</a>
            <a href="#" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Terms</a>
            <a href="#" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}