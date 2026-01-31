"use client"

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import ThemeToggle from '@/components/ThemeToggle'
import Logo from '@/components/Logo';
import { Check, X, ArrowRight, Brain, Zap, Globe, Shield } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#F8F9FD] dark:bg-[#0a0a0a] text-[#1F2937] dark:text-white font-sans selection:bg-[#FFC229] selection:text-[#4A2B5E] transition-colors duration-300 overflow-x-hidden">
      
      {/* --- Navbar --- */}
      <nav className="fixed w-full z-50 transition-all duration-300 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl"><Logo /></span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex gap-8 text-sm font-medium text-gray-500 dark:text-gray-400">
              <a href="#manifesto" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Why Us</a>
              <a href="#engine" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">The Engine</a>
            </div>
            
            <ThemeToggle />

            <Link href="/login" className="btn bg-[#1F2937] dark:bg-[#FFC229] text-white dark:text-[#1F2937] border-none font-bold px-5 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all duration-300">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Abstract Backgrounds */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#FFC229]/5 dark:bg-[#FFC229]/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 -z-10 animate-pulse"></div>
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Copy */}
          <div className="reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 ease-out">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-[#4A2B5E]/5 dark:bg-[#FFC229]/10 border border-[#4A2B5E]/10 dark:border-[#FFC229]/20">
              <span className="w-2 h-2 rounded-full bg-[#4A2B5E] dark:bg-[#FFC229] animate-pulse"></span>
              <span className="text-xs font-bold text-[#4A2B5E] dark:text-[#FFC229] tracking-wide uppercase">AI v2.0 Live</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-6 text-[#1F2937] dark:text-white leading-[1.1] tracking-tight">
              Don't just apply. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFC229] to-[#F59E0B]">Engineer your acceptance.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mb-8 max-w-lg leading-relaxed font-medium">
              Most students guess. Our algorithm calculates your admission probability for 500+ universities before you spend a dollar on application fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/login" className="btn bg-[#4A2B5E] hover:bg-[#3d234d] dark:bg-[#FFC229] dark:hover:bg-[#E5AC24] text-white dark:text-[#1F2937] border-none h-14 px-8 rounded-2xl font-bold text-lg shadow-xl shadow-[#4A2B5E]/20 hover:shadow-2xl hover:-translate-y-1 transition-all">
                Analyze My Profile
              </Link>
              <button className="btn btn-ghost h-14 px-6 rounded-2xl font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5">
                View Sample Report
              </button>
            </div>
            
            <div className="mt-8 flex items-center gap-4 text-sm font-medium text-gray-400">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-[#0a0a0a] bg-gray-200 dark:bg-gray-700"></div>
                 ))}
              </div>
              <p>Trusted by 10,000+ applicants</p>
            </div>
          </div>

          {/* Interactive Visual (The "Differentiator") */}
          <div className="relative reveal-on-scroll opacity-0 translate-y-10 transition-all duration-1000 delay-200">
            {/* The "Card" */}
            <div className="relative z-10 bg-white dark:bg-[#18181B] border border-gray-200 dark:border-gray-800 rounded-3xl shadow-2xl p-6 md:p-8 max-w-md mx-auto transform rotate-3 hover:rotate-0 transition-transform duration-500">
              
              {/* Fake UI Header */}
              <div className="flex items-center justify-between mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FFC229]/20 flex items-center justify-center text-[#FFC229]">
                    <Brain size={20} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-400 uppercase">Analysis Engine</div>
                    <div className="text-sm font-bold dark:text-white">Stanford University</div>
                  </div>
                </div>
                <div className="badge bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 font-bold border-none">
                  Reach
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>GPA Match</span>
                    <span>3.8 / 4.0</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full w-[90%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                    <span>Budget Fit</span>
                    <span>$45k / $60k</span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                    <div className="bg-[#FFC229] h-2 rounded-full w-[75%]"></div>
                  </div>
                </div>
              </div>

              {/* The "Verdict" Box */}
              <div className="mt-6 bg-[#F8F9FD] dark:bg-[#23232A] rounded-xl p-4 border border-gray-100 dark:border-white/5">
                <div className="flex gap-3">
                   <div className="mt-1"><Zap size={16} className="text-[#FFC229]" fill="currentColor" /></div>
                   <p className="text-xs leading-relaxed text-gray-600 dark:text-gray-300">
                     <strong className="text-[#4A2B5E] dark:text-[#FFC229]">AI Verdict:</strong> Based on your research papers, your odds increase by <strong>14%</strong> if you apply Early Action.
                   </p>
                </div>
              </div>

              {/* Floating Badge */}
              <div className="absolute -right-6 -bottom-6 bg-[#4A2B5E] text-white px-5 py-3 rounded-2xl shadow-xl animate-bounce">
                <span className="text-xs font-bold opacity-75 block">Acceptance Probability</span>
                <span className="text-2xl font-black">18.4%</span>
              </div>
            </div>
            
            {/* Background Blob behind card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-tr from-[#FFC229] to-[#4A2B5E] opacity-20 blur-3xl rounded-full -z-10"></div>
          </div>

        </div>
      </section>

      {/* --- "The Old Way" vs "Our Way" Section --- */}
      <section id="manifesto" className="py-24 bg-white dark:bg-[#0a0a0a] border-y border-gray-100 dark:border-white/5 relative">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center mb-16 reveal-on-scroll opacity-0 translate-y-10">
               <h2 className="text-sm font-bold text-[#FFC229] uppercase tracking-widest mb-3">The Problem</h2>
               <h3 className="text-3xl md:text-4xl font-bold text-[#1F2937] dark:text-white">Why the old way is broken</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
               {/* Old Way */}
               <div className="p-8 rounded-3xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-500/10 reveal-on-scroll opacity-0 translate-y-10 delay-100">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-400">
                        <X size={20} />
                     </div>
                     <h4 className="text-xl font-bold text-red-900 dark:text-red-200">The Traditional Agent</h4>
                  </div>
                  <ul className="space-y-4 text-red-800/70 dark:text-red-200/60 font-medium">
                     <li className="flex gap-2">❌ Pushes you to universities that pay them commission.</li>
                     <li className="flex gap-2">❌ "Shortlist" is just a copy-pasted generic list.</li>
                     <li className="flex gap-2">❌ Costs $2,000+ for basic advice.</li>
                  </ul>
               </div>

               {/* New Way */}
               <div className="p-8 rounded-3xl bg-[#F8F9FD] dark:bg-[#18181B] border border-gray-200 dark:border-white/10 relative overflow-hidden reveal-on-scroll opacity-0 translate-y-10 delay-200">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFC229]/10 rounded-full blur-2xl"></div>
                  <div className="flex items-center gap-3 mb-6 relative z-10">
                     <div className="w-10 h-10 rounded-full bg-[#FFC229]/20 flex items-center justify-center text-[#4A2B5E] dark:text-[#FFC229]">
                        <Check size={20} strokeWidth={3} />
                     </div>
                     <h4 className="text-xl font-bold text-[#1F2937] dark:text-white">The AI Counsellor</h4>
                  </div>
                  <ul className="space-y-4 text-gray-600 dark:text-gray-400 font-medium relative z-10">
                     <li className="flex gap-2"><span className="text-[#FFC229]">✓</span> Unbiased, data-driven recommendations.</li>
                     <li className="flex gap-2"><span className="text-[#FFC229]">✓</span> Analyzes 100,000+ admission records.</li>
                     <li className="flex gap-2"><span className="text-[#FFC229]">✓</span> Available 24/7 for a fraction of the cost.</li>
                  </ul>
               </div>
            </div>
         </div>
      </section>

      {/* --- "The Engine" (Features) --- */}
      <section id="engine" className="py-24 px-6 bg-[#F8F9FD] dark:bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20 max-w-2xl reveal-on-scroll opacity-0 translate-y-10">
            <h2 className="text-4xl md:text-5xl font-black text-[#1F2937] dark:text-white mb-6">
              Your Unfair Advantage.
            </h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">
              We've digitized the entire admissions department. Here is what is under the hood.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { 
                icon: <Brain className="w-8 h-8"/>, 
                title: 'Pattern Recognition', 
                desc: 'Our AI compares your profile against 5 years of admission data to find hidden "Safe" schools you missed.' 
              },
              { 
                icon: <Shield className="w-8 h-8"/>, 
                title: 'Risk Assessment', 
                desc: 'We flag weaknesses in your application (low GRE, gaps) and suggest specific certifications to fix them.' 
              },
              { 
                icon: <Globe className="w-8 h-8"/>, 
                title: 'Visa Probability', 
                desc: 'Don’t get rejected at the embassy. We analyze your financial documents to predict visa success rates.' 
              },
            ].map((f, i) => (
              <div key={i} className="group bg-white dark:bg-[#18181B] rounded-3xl p-8 border border-gray-100 dark:border-white/5 hover:border-[#FFC229] transition-all duration-300 reveal-on-scroll opacity-0 translate-y-10 hover:shadow-2xl dark:hover:shadow-none hover:-translate-y-2">
                <div className="w-16 h-16 bg-[#F8F9FD] dark:bg-[#23232A] rounded-2xl flex items-center justify-center text-[#4A2B5E] dark:text-[#FFC229] mb-8 group-hover:scale-110 transition-transform">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-[#1F2937] dark:text-white">{f.title}</h3>
                <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#FFC229] to-[#F59E0B] rounded-3xl blur-2xl opacity-20 transform rotate-1"></div>
          
          <div className="relative bg-[#4A2B5E] dark:bg-[#18181B] rounded-3xl p-12 md:p-20 text-center overflow-hidden border border-white/10 shadow-2xl reveal-on-scroll opacity-0 translate-y-10">
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            <h2 className="text-3xl md:text-5xl font-black text-white mb-8 relative z-10">
              Ready to see where you get in?
            </h2>
            <p className="text-gray-300 text-xl mb-10 max-w-2xl mx-auto relative z-10 font-medium">
              Join the new wave of applicants using data, not hope.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Link href="/login" className="btn bg-[#FFC229] hover:bg-[#E5AC24] text-[#1F2937] border-none btn-lg px-12 rounded-full font-bold text-lg shadow-lg hover:shadow-[#FFC229]/50 transition-all hover:scale-105">
                Start Free Assessment
              </Link>
            </div>
            
            <p className="mt-6 text-sm text-white/40 font-medium">No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-white dark:bg-[#0a0a0a] py-12 border-t border-gray-100 dark:border-white/5 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
             <Logo /> 
             <span className="font-bold text-gray-400">AI Counsellor</span>
          </div>
          <p className="text-gray-400">© 2026. Engineered for success.</p>
          <div className="flex gap-8 font-medium text-gray-500">
            <a href="#" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">Twitter</a>
            <a href="#" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-[#4A2B5E] dark:hover:text-[#FFC229] transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}