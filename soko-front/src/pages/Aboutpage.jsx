import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { Truck, Leaf, UserRound, ShieldCheck, ArrowRight } from 'lucide-react'

const VALUES = [
  { icon: Leaf,        title: 'Locally sourced',  desc: 'We work directly with Kenyan farmers and suppliers to bring you the freshest products.' },
  { icon: Truck,       title: 'Fast delivery',     desc: 'Same-day and next-day delivery across Nairobi. Orders over KSh 2,000 ship free.' },
  { icon: ShieldCheck, title: 'Secure & reliable', desc: 'Safe payments via M-Pesa and card. Every order is tracked and guaranteed.' },
  { icon: UserRound,   title: 'Community first',   desc: 'We support local businesses and create opportunities for Nairobi entrepreneurs.' },
]

const STATS = [
  { value: '10,000+', label: 'Happy customers' },
  { value: '500+',    label: 'Products listed' },
  { value: '3',       label: 'Counties served' },
  { value: '4.8★',    label: 'Average rating' },
]

const TEAM = [
  { name: 'Amara Osei',    role: 'Founder & CEO',       initial: 'A' },
  { name: 'Kevin Mwangi',  role: 'Head of Logistics',   initial: 'K' },
  { name: 'Fatuma Juma',   role: 'Supplier Relations',  initial: 'F' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-[#0f4c35]">
        <div className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-4">Our Story</p>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              Nairobi's most trusted online marketplace
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              SokoOnline was born from a simple idea — make it easy for Nairobi residents
              to access quality local products without the hassle of traffic and crowded markets.
              We connect you directly with verified local suppliers.
            </p>
            <Link to="/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold rounded-lg transition-colors text-sm">
              Browse the store <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-5 py-5 border border-white/10">
                <p className="text-2xl font-extrabold text-[#f59e0b]">{s.value}</p>
                <p className="text-white/60 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────── */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-3">Our Mission</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
            Bringing the market to your doorstep
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            We believe everyone deserves access to fresh, affordable, quality products —
            delivered fast and reliably. SokoOnline is building the infrastructure that
            makes local commerce work better for everyone.
          </p>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section className="py-14 bg-[#f9fafb]">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-2 text-center">What we stand for</p>
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center">Our values</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 bg-[#e8f5ee] rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-[#0f4c35]" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-2">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TEAM ─────────────────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-2 text-center">The people behind it</p>
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center">Our team</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {TEAM.map(member => (
              <div key={member.name} className="text-center p-6 bg-[#f9fafb] rounded-xl border border-gray-100">
                <div className="w-14 h-14 bg-[#0f4c35] rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-lg font-extrabold">{member.initial}</span>
                </div>
                <p className="text-sm font-bold text-gray-900">{member.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-[#0f4c35]">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to start shopping?</h2>
          <p className="text-white/60 text-sm mb-6">Join thousands of Nairobi residents already shopping with us.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/store"
              className="px-5 py-2.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold rounded-lg transition-colors text-sm">
              Browse Store
            </Link>
            <Link to="/register"
              className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors text-sm border border-white/20">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}