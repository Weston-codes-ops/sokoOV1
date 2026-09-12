import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Truck, Shield, Star, ShoppingBag } from 'lucide-react'
import api from '../api/axios'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/sokoonline-logo.svg'
import PromoSection from '../components/PromoSlider'
import TypingAnimation from '../components/TypingAnimation'

const CLEAN_BG   = 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=1200&q=80'
const FASHION_BG = 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80'
const HERO_BG    = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&q=80'
const CTA_BG     = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80'

const PERKS = [
  { icon: Truck,       label: 'Free delivery',    sub: 'Orders over KSh 2,000' },
  { icon: Shield,      label: 'Secure payments',  sub: 'M-Pesa & card'          },
  { icon: Star,        label: '4.8★ rated',       sub: '2,000+ customers'       },
  { icon: ShoppingBag, label: 'Wide selection',   sub: 'Thousands of products'  },
]

const BADGES = ['HOT DEAL', 'NEW', '20% OFF', 'POPULAR', 'LIMITED', 'FRESH']

export default function Homepage() {
  const [search, setSearch]           = useState('')
  const [categories, setCategories]   = useState([])
  const [promoItems, setPromoItems]   = useState([])
  const [specialized, setSpecialized] = useState({})
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()
  const message = location.state?.message

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to sign out?')) return
    logout()
    navigate('/', { state: { message: 'You have been signed out successfully.' } })
  }

  useEffect(() => {
    if (!location.state?.message) return

    const timer = setTimeout(() => {
      navigate(location.pathname, { replace: true, state: null })
    }, 4000)
    return () => clearTimeout(timer)
  }, [location.pathname, location.state, navigate])

  useEffect(() => {
    api.get('/products?size=50').then(res => {
      const all = res.data.content ?? res.data ?? []
      const grouped = {}
      all.forEach(p => {
        const categoryName = p.categories?.[0] || 'General'
        if (!grouped[categoryName]) grouped[categoryName] = []
        if (grouped[categoryName].length < 6) grouped[categoryName].push(p)
      })
      setSpecialized(grouped)
    }).catch(() => {})
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/store?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {message && (
        <div className="fixed right-6 top-6 z-50 rounded-lg border border-green-100 bg-white px-4 py-3 text-sm font-medium text-[#0f4c35] shadow-lg">
          {message}
        </div>
      )}

      {/* ══ MERGED NAVBAR + HERO ══════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-[#0f4c35] pb-24">
        <div className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top_right,_rgba(245,158,11,0.4),transparent_35%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_80%_15%,_rgba(255,255,255,0.06),transparent_20%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">
          <div className="flex items-center gap-8">
            <Link to="/" className="shrink-0 flex items-center gap-3">
              <img src={logo} alt="SokoOnline" className="h-9 w-auto" />
            </Link>

            <div className="hidden md:flex items-center justify-center gap-8 flex-1">
              {[
                { to: '/store', label: 'Store' },
                { to: '/about', label: 'About' },
                { to: '/faqs',  label: 'FAQs'  },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className="relative text-base font-semibold text-white/90 hover:text-white transition-all border-b-2 border-transparent hover:border-[#f59e0b] pb-1">
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-3 ml-auto">
              {user ? (
                <>
                  <span className="text-sm text-white/90 hidden sm:inline">Hi, {user.name || user.email}</span>
                  <button type="button" onClick={handleLogout}
                    className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg transition-colors">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login"
                    className="text-sm font-medium text-white/80 hover:text-white transition-colors px-3 py-1.5">
                    Sign in
                  </Link>
                  <Link to="/register"
                    className="text-sm font-semibold bg-[#f59e0b] hover:bg-[#d97706] text-white px-4 py-1.5 rounded-lg transition-colors">
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="text-[#f59e0b] text-xs font-semibold uppercase tracking-[0.28em] mb-4">
                Nairobi's online marketplace
              </p>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6 max-w-2xl min-h-[2.5em]">
                <TypingAnimation text="Find fresh essentials, trending picks and everyday deals in one place." />
              </h1>
              <p className="text-white/75 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
                Shop groceries, fashion and home essentials with fast delivery, trusted sellers, and a polished online experience built for Nairobi.
              </p>

              <form onSubmit={handleSearch}
                className="flex flex-col sm:flex-row items-stretch gap-3 max-w-3xl">
                <div className="relative flex-1">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60" />
                  <input
                    type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Search products, brands and deals"
                    className="w-full pl-14 pr-4 py-4 rounded-3xl text-sm sm:text-base text-white placeholder-white/60 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-[#f59e0b]/50"
                  />
                </div>
                <button type="submit"
                  className="inline-flex items-center justify-center px-8 py-4 bg-[#f59e0b] hover:bg-[#d97706] text-white font-semibold rounded-3xl text-sm sm:text-base transition-colors">
                  Search
                </button>
              </form>

              <div className="mt-6 flex flex-wrap gap-3 max-w-3xl">
                {[
                  { label: 'Fresh produce', query: 'fresh produce' },
                  { label: 'Fashion clothing', query: 'fashion' },
                  { label: 'Home essentials', query: 'home essentials' },
                  { label: 'Beauty picks', query: 'beauty products' },
                  { label: 'Groceries', query: 'groceries' },
                  { label: 'Daily deals', query: 'daily deals' },
                ].map(item => (
                  <Link
                    key={item.label}
                    to={`/store?search=${encodeURIComponent(item.query)}`}
                    className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white/90 hover:bg-white/20 transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

            </div>

            <div className="space-y-6">
              <div className="rounded-[2rem] border border-white/10 bg-white/10 backdrop-blur-xl p-5 shadow-2xl shadow-black/20 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-xs uppercase tracking-[0.28em] text-white/70">Visual highlights</p>
                    <h3 className="text-xl font-extrabold text-white">A framed collection of inspiration</h3>
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#f59e0b]">Fresh picks</span>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/10 h-40">
                      <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=900&q=80" alt="Fresh produce" className="w-full h-full object-cover" />
                    </div>
                    <div className="grid gap-3">
                      <div className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/10 h-20">
                        <img src="https://images.unsplash.com/photo-1521334884684-d80222895322?w=900&q=80" alt="Fashion essentials" className="w-full h-full object-cover" />
                      </div>
                      <div className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/10 h-20">
                        <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&q=80" alt="Home essentials" className="w-full h-full object-cover" />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-[1.75rem] overflow-hidden border border-white/10 bg-white/10 h-44 relative">
                    <img src="https://images.unsplash.com/photo-1506806732259-39c2d0268443?auto=format&fit=crop&w=900&q=80" alt="Shopping highlights" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <p className="text-xs uppercase tracking-[0.25em] text-white/70 mb-1">In every aisle</p>
                      <p className="text-sm font-semibold">Trending picks, fresh finds, and best-selling bundles.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#153d27]/70 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-[#f59e0b] font-semibold mb-4">Why shop with us</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-9 w-9 rounded-2xl bg-[#f59e0b]/20 flex items-center justify-center text-[#f59e0b]">
                      <ShoppingBag size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Quick checkout</p>
                      <p className="text-xs text-white/70">Payment with M-Pesa and card.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-9 w-9 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                      <Shield size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Secure experience</p>
                      <p className="text-xs text-white/70">Trusted shopping from verified sellers.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

         
        </div>
      </div>

      {/* ══ PROMO SECTION ═════════════════════════════════════════════ */}
      {promoItems.length > 0 && (
        <section className="py-10 bg-white">
          <div className="max-w-5xl mx-auto px-6 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#f59e0b] uppercase tracking-widest mb-1">
                  🔥 Today's Deals
                </p>
                <h2 className="text-xl font-extrabold text-gray-900">Hot Offers</h2>
              </div>
              <Link to="/store"
                className="text-xs font-semibold text-[#0f4c35] hover:text-[#1a6b4a] flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
          </div>
          <PromoSection items={promoItems} />
        </section>
      )}

      {/* ══ SPECIALIZED SECTIONS ══════════════════════════════════════ */}
      {Object.entries(specialized).slice(0, 3).map(([catName, products], i) => {
        const bgs = [CLEAN_BG, FASHION_BG, HERO_BG]
        const bg  = bgs[i % bgs.length]
        return (
          <section key={catName} className="relative py-14 overflow-hidden">
            <div className="absolute inset-0 bg-cover bg-center bg-fixed"
              style={{ backgroundImage: `url('${bg}')` }} />
            <div className="absolute inset-0 bg-black/70" />
            <div className="absolute inset-0 bg-[#0f4c35]/30" />
            <div className="relative z-10 max-w-5xl mx-auto px-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-widest mb-1">Featured</p>
                  <h2 className="text-2xl font-extrabold text-white">{catName}</h2>
                </div>
                <Link to="/store"
                  className="flex items-center gap-1.5 text-xs font-semibold text-white/70 hover:text-white border border-white/20 hover:border-white/40 px-3 py-1.5 rounded-lg transition-colors">
                  Shop all <ArrowRight size={12} />
                </Link>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                {products.map(p => (
                  <Link key={p.id} to={`/products/${p.slug}`}
                    className="group bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/10 hover:border-white/30 rounded-xl overflow-hidden transition-all">
                    <div className="aspect-square overflow-hidden bg-black/20">
                      {p.imageURL
                        ? <img src={p.imageURL} alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag size={18} className="text-white/30" />
                          </div>
                      }
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold text-white line-clamp-2 leading-snug">{p.name}</p>
                      <p className="text-xs font-extrabold text-[#f59e0b] mt-1">
                        KSh {Number(p.price).toLocaleString()}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )
      })}

      {/* ══ BOLD CTA ══════════════════════════════════════════════════ */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${CTA_BG}')` }} />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-[#0f4c35]/35" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-[#f59e0b] text-xs font-bold uppercase tracking-[0.25em] mb-4">
            Join thousands of shoppers
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            Everything you need,<br />
            <span className="text-[#f59e0b]">delivered to your door.</span>
          </h2>
          <p className="text-white/60 text-base mb-10 max-w-md mx-auto">
            Fresh produce, fashion and home essentials. Same-day delivery across Nairobi.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/store"
              className="px-8 py-3.5 bg-[#f59e0b] hover:bg-[#d97706] text-white font-extrabold rounded-xl transition-colors text-sm shadow-xl flex items-center gap-2">
              <ShoppingBag size={16} /> Shop Now
            </Link>
            <Link to="/register"
              className="px-8 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-colors text-sm border border-white/30 flex items-center gap-2">
              Create Account <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}