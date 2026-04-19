import Link from 'next/link';
import { ArrowRight, BarChart3, Kanban, Bell, Shield, Zap, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-indigo-950 to-gray-950 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center font-bold text-sm">IT</div>
          <span className="font-bold text-lg">InternTrack Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white text-sm transition-colors">Sign in</Link>
          <Link href="/register" className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-8 py-24 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-6">
          <Zap className="w-3.5 h-3.5" /> Real-time job tracking for students
        </div>
        <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
          Track Every Application.<br />
          <span className="text-indigo-400">Land Your Dream Job.</span>
        </h1>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Stop losing track of applications in spreadsheets. InternTrack Pro gives you a powerful Kanban board, analytics dashboard, and real-time notifications — all in one place.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/register" className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3.5 rounded-xl font-semibold text-lg transition-colors">
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to land the job</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Kanban, title: 'Kanban Pipeline', desc: 'Drag-and-drop applications through Applied → OA → Interview → Offer stages with real-time sync.' },
            { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Track conversion rates, application trends, and performance insights with beautiful charts.' },
            { icon: Bell, title: 'Real-Time Notifications', desc: 'Get instant alerts for interview schedules, status changes, and follow-up reminders via WebSockets.' },
            { icon: Shield, title: 'Resume Manager', desc: 'Upload multiple resumes and track which version was used for each application.' },
            { icon: Users, title: 'Interview Logs', desc: 'Record interview questions, feedback, and outcomes for every round.' },
            { icon: Zap, title: 'Premium Analytics', desc: 'Unlock advanced insights, unlimited tracking, and priority support with Premium.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-indigo-400" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-16 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-2">Free</h3>
            <p className="text-4xl font-bold mb-1">₹0<span className="text-lg text-gray-400 font-normal">/mo</span></p>
            <p className="text-gray-400 text-sm mb-6">Perfect to get started</p>
            <ul className="space-y-2 text-sm text-gray-300 mb-8">
              {['Up to 10 applications', 'Kanban board', 'Basic analytics', 'Resume manager (2 files)', 'Interview logs'].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="text-green-400">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/register" className="block text-center border border-gray-600 hover:border-gray-400 text-white py-2.5 rounded-lg font-medium transition-colors">Get Started</Link>
          </div>
          <div className="bg-indigo-600 border border-indigo-500 rounded-2xl p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full">POPULAR</div>
            <h3 className="text-xl font-bold mb-2">Premium</h3>
            <p className="text-4xl font-bold mb-1">₹199<span className="text-lg text-indigo-200 font-normal">/mo</span></p>
            <p className="text-indigo-200 text-sm mb-6">For serious job seekers</p>
            <ul className="space-y-2 text-sm text-indigo-100 mb-8">
              {['Unlimited applications', 'Advanced analytics', 'Unlimited resumes', 'Priority notifications', 'Export to CSV', 'Admin dashboard access'].map((f) => (
                <li key={f} className="flex items-center gap-2"><span className="text-yellow-300">✓</span>{f}</li>
              ))}
            </ul>
            <Link href="/register" className="block text-center bg-white text-indigo-600 hover:bg-indigo-50 py-2.5 rounded-lg font-semibold transition-colors">Start Premium</Link>
          </div>
        </div>
      </section>

      <footer className="text-center py-8 text-gray-500 text-sm border-t border-gray-800">
        © 2026 InternTrack Pro. Built for students, by students.
      </footer>
    </div>
  );
}
