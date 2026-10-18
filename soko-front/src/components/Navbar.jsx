import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Search, X, Menu, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/sokoonline-logo.svg'

function Logo() {
  return (
    <Link to="/" className="shrink-0">
      <img src={logo} alt="SokoOnline" className="h-8 w-auto" />
    </Link>
  )
}

export default function Navbar({ variant = 'default' }) {
  const { customer, logout, isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const isActive = (path) => location.pathname === path

  useEffect(() => {
    if (!userMenuOpen) return

    const closeOnOutsideClick = (event) => {
      if (!userMenuRef.current?.contains(event.target)) setUserMenuOpen(false)
    }
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [userMenuOpen])

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to sign out?')) return
    setUserMenuOpen(false)
    logout()
    navigate('/', { state: { message: 'You have been signed out successfully.' } })
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/store?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
      setMobileOpen(false)
    }
  }

  /* ── AUTH VARIANT ────────────────────────────────────────────── */
  if (variant === 'auth') return (
    <nav className="bg-white border-b border-gray-100">
      <div className="px-6 h-14 flex items-center">
        <Logo />
      </div>
    </nav>
  )

  /* ── MINIMAL VARIANT (HomePage) ──────────────────────────────── */
  if (variant === 'minimal') return (
    <>
      <nav className="bg-white border-b border-gray-100">
        <div className="w-full px-6 h-14 grid grid-cols-[1fr_auto_1fr] items-center gap-6">
          <Logo />

          {/* Nav links */}
          <div className="hidden md:flex items-center justify-center gap-6">
            <NavLink to="/store"  label="Store"     active={isActive('/store')} />
            <NavLink to="/about"  label="About"     active={isActive('/about')} />
            <NavLink to="/faqs"   label="FAQs"      active={isActive('/faqs')} />
          </div>

          {/* Right side */}
          <div className="flex items-center justify-end gap-3">
            {customer?.role === 'USER' && (
              <>
                <Link to="/cart"
                  className="p-2 text-gray-500 hover:text-brand-primary hover:bg-surface-tint rounded-lg transition-colors">
                  <ShoppingCart size={18} />
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
                  <div className="w-7 h-7 bg-surface-tint rounded-full flex items-center justify-center shrink-0">
                    <User size={13} className="text-brand-primary" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 max-w-25 truncate hidden sm:block">
                    {customer.name || customer.email}
                  </span>
                  <button onClick={handleLogout} title="Sign out"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>
    </>
  )

  /* ── DEFAULT VARIANT ─────────────────────────────────────────── */
  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="w-full px-6">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center h-14 gap-6">

            {/* Logo */}
            <Logo />

            {/* Nav links — desktop */}
            <div className="hidden md:flex items-center justify-center gap-6">
              <NavLink to="/store"  label="Store"  active={isActive('/store')} />
              <NavLink to="/about"  label="About"  active={isActive('/about')} />
              <NavLink to="/faqs"   label="FAQs"   active={isActive('/faqs')} />
            </div>

            {/* Right side */}
            <div className="flex items-center justify-end gap-2">

              {!isLoggedIn && (
                <>
                  <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-2 py-2 text-xs font-semibold text-brand-primary underline transition-colors hover:text-brand-primary-hover sm:text-sm"
                    >
                      Log in
                    </Link>
                    <span className="text-xs text-gray-500">
                      to continue shopping
                    </span>
                  </span>
                </>
              )}

              {customer?.role === 'USER' && (
                <>
                  <Link
                    to="/cart"
                    aria-label="View cart"
                    title="View cart"
                    className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-surface-tint hover:text-brand-primary"
                  >
                    <ShoppingCart size={18} />
                    <p className="text-xs font-medium">View Cart</p>
                  </Link>
                  <div ref={userMenuRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(open => !open)}
                      aria-label="Account menu"
                      aria-haspopup="menu"
                      aria-expanded={userMenuOpen}
                      className="flex items-center gap-2 p-1.5 text-gray-600 transition-colors hover:text-brand-primary"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary">
                        <User size={15} className="text-white" />
                      </span>
                      <span className="hidden max-w-32 truncate text-xs font-medium lg:block">
                        {customer.name || customer.email}
                      </span>
                      <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {userMenuOpen && (
                      <div
                        role="menu"
                        aria-label="Account options"
                        className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg"
                      >
                        <Link
                          to="/cart"
                          role="menuitem"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-surface-tint hover:text-brand-primary"
                        >
                          <ShoppingCart size={16} />
                          View cart
                        </Link>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleLogout}
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut size={16} />
                          Log out
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-brand-primary rounded-lg transition-colors">
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 px-6 py-3 space-y-1 bg-white">
            <form onSubmit={handleSearch} className="flex items-center gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search products..."
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                />
              </div>
              <button type="submit"
                className="px-3 py-2 bg-brand-primary text-white text-xs font-semibold rounded-lg">
                Go
              </button>
            </form>
            {[
              { to: '/store',  label: 'Store'  },
              { to: '/about',  label: 'About'  },
              { to: '/faqs',   label: 'FAQs'   },
              ...(customer?.role === 'USER' ? [{ to: '/orders', label: 'Orders' }] : []),
            ].map(item => (
              <Link key={item.to} to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-surface-tint hover:text-brand-primary rounded-lg transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {customer?.role === 'USER' &&
                <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg">
                    Sign out
                  </button>
              }
            </div>
          </div>
        )}
      </nav>
    </>
  )
}

/* ── NAV LINK ────────────────────────────────────────────────── */
function NavLink({ to, label, active }) {
  return (
    <Link to={to}
      className={`nav-link ${
        active
          ? 'nav-link-active'
          : ''
      }`}>
      {label}
    </Link>
  )
}