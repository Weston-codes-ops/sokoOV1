import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Shield, ShoppingBag } from 'lucide-react'
import api from '../api/axios'
import Footer from '../components/Footer'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/sokoonline-logo.svg'
import TypingAnimation from '../components/TypingAnimation'

const CTA_BG     = 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=1600&q=80'

export default function Homepage() {
  const [search, setSearch]           = useState('')
  const [products, setProducts]       = useState([])
  const [productsLoading, setProductsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const { customer, logout } = useAuth()
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
      setProducts(all)
    }).catch(() => setProducts([])).finally(() => setProductsLoading(false))
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/store?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {message && (
        <div className="fixed right-6 top-6 z-5 border border-green-100 bg-white px-4 py-3 text-sm font-medium text-brand-primary shadow-lg">
          {message}
        </div>
      )}

      {/* ══ MERGED NAVBAR + HERO ══════════════════════════════════════ */}
      <div className="relative overflow-hidden bg-brand-primary pb-24">
        <div className="home-hero-accent-glow absolute inset-x-0 top-0 h-96" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(255,255,255,0.08),transparent_22%),radial-gradient(circle_at_80%_15%,_rgba(255,255,255,0.06),transparent_20%)]" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-10">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 md:gap-8">
            <Link to="/" className="flex shrink-0 items-center gap-3 justify-self-start">
              <img src={logo} alt="SokoOnline" className="h-9 w-auto" />
            </Link>

            <div className="hidden items-center justify-center gap-8 md:flex">
              {[
                { to: '/store', label: 'Store' },
                { to: '/about', label: 'About' },
                { to: '/faqs',  label: 'FAQs'  },
              ].map(({ to, label }) => (
                <Link key={to} to={to}
                  className="relative text-base font-semibold text-white/90 hover:text-white transition-all border-b-2 border-transparent hover:border-brand-accent pb-1">
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex items-center justify-self-end gap-3">
              {customer && (
                <>
                  <span className="text-sm text-white/90 hidden sm:inline">Hi, {customer.name || customer.email}</span>
                  <button type="button" onClick={handleLogout}
                    className="text-sm font-semibold bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-lg transition-colors">
                    Sign out
                  </button>
                </>
              )}
              {!customer && (
                <div className="flex flex-col items-end gap-1">
                  <Link to="/register" className="bg-brand-accent px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-accent-hover">
                    Sign up
                  </Link>
                  <div className="flex items-center gap-2 text-[11px] text-white/80 sm:text-xs">
                    <Link to="/login" className="border border-white/40 px-2 py-1 font-bold text-white transition-colors hover:bg-white/10">
                    <span>Already have an account? </span>
                      login
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] items-start">
            <div>
              <p className="text-brand-accent text-xs font-semibold uppercase tracking-[0.28em] mb-4">
                Nairobi's online marketplace
              </p>
              <h1 className="text-5xl sm:text-6xl font-extrabold text-white leading-tight mb-6 max-w-2xl min-h-[2.5em]">
                <TypingAnimation text="Find fresh essentials, trending picks and everyday deals in one place."/>
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
                    className="w-full pl-14 pr-4 py-4 rounded-3xl text-sm sm:text-base text-white placeholder-white/60 bg-white/10 border border-white/15 focus:outline-none focus:ring-2 focus:ring-brand-accent/50"
                  />
                </div>
                <button type="submit"
                  className="inline-flex items-center justify-center px-8 py-4 bg-brand-accent hover:bg-brand-accent-hover text-white font-semibold rounded-3xl text-sm sm:text-base transition-colors">
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
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-accent">Fresh picks</span>
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

              <div className="rounded-[2rem] bg-brand-primary-dark/70 p-6 text-white">
                <p className="text-xs uppercase tracking-[0.25em] text-brand-accent font-semibold mb-4">Why shop with us</p>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="mt-1 h-9 w-9 rounded-2xl bg-brand-accent/20 flex items-center justify-center text-brand-accent">
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

      <section className="bg-surface-subtle py-14 sm:py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-brand-accent">Made for your everyday</p>
              <h2 className="text-2xl font-extrabold text-text-primary sm:text-3xl">Explore our products</h2>
            </div>
            <Link to="/store" className="inline-flex shrink-0 items-center gap-2 text-sm font-bold text-brand-primary transition-colors hover:text-brand-primary-hover">
              View all <ArrowRight size={16} />
            </Link>
          </div>

          {productsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {[...Array(4)].map((_, index) => <div key={index} className="aspect-[4/5] animate-pulse bg-surface" />)}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.slice(0, 8).map(product => (
                <Link key={product.id} to={`/store?search=${encodeURIComponent(product.name)}`} className="group overflow-hidden border border-border-brand-soft bg-surface transition-shadow hover:shadow-md">
                  <div className="aspect-[4/3] overflow-hidden bg-surface-tint">
                    {product.imageURL ? (
                      <img src={product.imageURL} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-brand-primary"><ShoppingBag size={24} /></div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-2 min-h-10 text-sm font-semibold text-text-primary">{product.name}</h3>
                    <p className="mt-2 text-sm font-extrabold text-brand-primary">KSh {Number(product.price).toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="rounded-xl border border-border-brand-soft bg-surface px-5 py-8 text-center text-sm text-text-muted">Products will appear here soon.</p>
          )}
        </div>
      </section>

      {/* ══ BOLD CTA ══════════════════════════════════════════════════ */}
      <section className="relative py-28">
        <div className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${CTA_BG}')` }} />
        <div className="absolute inset-0 bg-black/65" />
        <div className="absolute inset-0 bg-brand-primary/35" />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="text-brand-accent text-xs font-bold uppercase tracking-[0.25em] mb-4">
            Join thousands of shoppers
          </p>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-4 drop-shadow-lg">
            Everything you need,<br />
            <span className="text-brand-accent">delivered to your door.</span>
          </h2>
          <p className="text-white/60 text-base mb-10 max-w-md mx-auto">
            Fresh produce, fashion and home essentials. Same-day delivery across Nairobi.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link to="/store"
              className="px-8 py-3.5 bg-brand-accent hover:bg-brand-accent-hover text-white font-extrabold rounded-xl transition-colors text-sm shadow-xl flex items-center gap-2">
              <ShoppingBag size={16} /> Shop Now
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}