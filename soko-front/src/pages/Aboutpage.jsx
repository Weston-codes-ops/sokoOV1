import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { Link } from 'react-router-dom'
import { ShoppingBag, Search, Heart, UserRound, ArrowRight } from 'lucide-react'

const VALUES = [
  { icon: ShoppingBag, title: 'My own little shop', desc: 'SokoOnline is an independent online store, built around the products I choose to share.' },
  { icon: Heart,       title: 'Picked with care',   desc: 'I bring together products that feel worth adding to the collection.' },
  { icon: Search,      title: 'Easy to explore',    desc: 'Browse the collection and find the details you need on each product.' },
  { icon: UserRound,   title: 'Growing over time',  desc: 'The shop will keep evolving as I add more products and discover new favorites.' },
]

const HIGHLIGHTS = [
  { value: 'Personal', label: 'A shop shaped by my own taste' },
  { value: 'Thoughtful', label: 'A collection chosen with care' },
  { value: 'Simple', label: 'A straightforward way to browse' },
  { value: 'Growing', label: 'More finds added over time' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="bg-brand-primary">
        <div className="max-w-5xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-4">Our Story</p>
            <h1 className="text-4xl font-extrabold text-white leading-tight mb-4">
              My online shop
            </h1>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              SokoOnline is my online store: a place to bring together products I enjoy
              and make them easy for you to discover. I’m building the collection one find at a time.
            </p>
            <Link to="/store"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-lg transition-colors text-sm">
              Browse the store <ArrowRight size={14} />
            </Link>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3">
            {HIGHLIGHTS.map(s => (
              <div key={s.label} className="bg-white/10 rounded-xl px-5 py-5 border border-white/10">
                <p className="text-xl font-extrabold text-brand-accent">{s.value}</p>
                <p className="text-white/60 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION ──────────────────────────────────────────────── */}
      <section className="py-14 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-3">Our Mission</p>
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">
            A personal collection, ready to explore
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xl mx-auto">
            I’m creating a shop that feels personal, easy to browse, and full of products
            I’m happy to share. Have a look around and see what you find.
          </p>
        </div>
      </section>

      {/* ── VALUES ───────────────────────────────────────────────── */}
      <section className="py-14 bg-surface-subtle">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2 text-center">The way I shop</p>
          <h2 className="text-xl font-extrabold text-gray-900 mb-8 text-center">What makes SokoOnline mine</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-xl p-5 border border-gray-100">
                <div className="w-10 h-10 bg-surface-tint rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-brand-primary" />
                </div>
                <p className="text-sm font-bold text-gray-900 mb-2">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONAL TOUCH ──────────────────────────────────────── */}
      <section className="py-14">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-brand-accent text-xs font-bold uppercase tracking-widest mb-2 text-center">A shop in progress</p>
          <h2 className="text-xl font-extrabold text-gray-900 mb-4 text-center">One find at a time</h2>
          <div className="max-w-2xl mx-auto text-center p-6 bg-surface-subtle rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 leading-relaxed">
              I’m growing SokoOnline at my own pace, adding products as the collection takes shape.
              Thanks for stopping by and being part of the beginning.
            </p>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-brand-primary">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-white mb-3">Ready to explore my shop?</h2>
          <p className="text-white/60 text-sm mb-6">Take a look through the SokoOnline collection.</p>
          <div className="flex items-center justify-center gap-3">
            <Link to="/store"
              className="px-5 py-2.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-lg transition-colors text-sm">
              Browse Store
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}