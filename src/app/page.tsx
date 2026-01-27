import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="navbar max-w-7xl mx-auto px-4 py-6 flex justify-between">
        <span className="text-2xl font-bold text-blue-700">🎓 AI Counsellor</span>
        <Link href="/login" className="btn btn-primary px-6">Login</Link>
      </nav>

      <section className="text-center py-24 px-4 bg-linear-to-b from-white to-blue-50">
        <h1 className="text-5xl font-extrabold mb-6">Your AI-Powered Journey to <span className="text-blue-600">Global Education</span></h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">We analyze your profile, match you with Safe, Target, and Dream universities, and guide you until admission.</p>
        <Link href="/login" className="btn btn-primary btn-lg shadow-xl hover:-translate-y-1 transition-transform">Start Free Assessment</Link>
      </section>

      <section className="py-20 max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
            { icon: '📊', title: 'Profile Analysis', desc: 'We analyze GPA, budget, and readiness.' },
            { icon: '🎯', title: 'Smart Shortlisting', desc: 'AI categorizes schools as Safe, Target, or Dream.' },
            { icon: '✅', title: 'Task Tracking', desc: 'Auto-generated checklists for SOPs and Visas.' }
        ].map((f, i) => (
            <div key={i} className="card bg-white shadow-lg border p-6 hover:shadow-xl transition">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-500">{f.desc}</p>
            </div>
        ))}
      </section>
    </div>
  )
}