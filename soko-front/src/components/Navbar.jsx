import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCart, User, LogOut, Search, X, Menu } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/sokoonline-logo.svg'

export default function Navbar({ variant = 'default' }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const isAdmin  = user?.role === 'ADMIN'
  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    if (!window.confirm('Are you sure you want to sign out?')) return
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

  /* ── LOGO ────────────────────────────────────────────────────── */
  const Logo = () => (
    <Link to="/" className="shrink-0">
      <img src={logo} alt="SokoOnline" className="h-8 w-auto" />
    </Link>
  )

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
        <div className="w-full px-6 h-14 flex items-center gap-8">
          <Logo />

          {/* Nav links */}
          <div className="hidden md:flex items-center justify-center gap-6 flex-1">
            <NavLink to="/store"  label="Store"     active={isActive('/store')} />
            <NavLink to="/about"  label="About"     active={isActive('/about')} />
            <NavLink to="/faqs"   label="FAQs"      active={isActive('/faqs')} />
            {user && <NavLink to="/orders" label="Orders" active={isActive('/orders')} />}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3 ml-auto">
            {user ? (
              <>
                <Link to="/cart"
                  className="p-2 text-gray-500 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors">
                  <ShoppingCart size={18} />
                </Link>
                <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
                  <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center shrink-0">
                    <User size={13} className="text-[#0f4c35]" />
                  </div>
                  <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
                    {user.name || user.email}
                  </span>
                  <button onClick={handleLogout} title="Sign out"
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <LogOut size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login"
                  className="text-sm font-medium text-gray-600 hover:text-[#0f4c35] transition-colors px-3 py-1.5">
                  Sign in
                </Link>
                <Link to="/register"
                  className="text-sm font-semibold bg-[#0f4c35] hover:bg-[#1a6b4a] text-white px-4 py-1.5 rounded-lg transition-colors">
                  Get started
                </Link>
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
          <div className="flex items-center h-14 gap-8">

            {/* Logo */}
            <Logo />

            {/* Nav links — desktop */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              <NavLink to="/store"  label="Store"  active={isActive('/store')} />
              <NavLink to="/about"  label="About"  active={isActive('/about')} />
              <NavLink to="/faqs"   label="FAQs"   active={isActive('/faqs')} />
              {user && <NavLink to="/orders" label="Orders" active={isActive('/orders')} />}

            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">

              {user ? (
                <>
                  {isAdmin && (
                    <Link to="/hidden-admin/products"
                      className="text-sm font-semibold text-[#0f4c35] hover:text-[#1a6b4a] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#e8f5ee]">
                      Admin
                    </Link>
                  )}
                  {isAdmin && (
                    <Link to="/hidden-admin/products"
                      className="text-sm font-semibold text-[#0f4c35] hover:text-[#1a6b4a] transition-colors px-3 py-1.5 rounded-lg hover:bg-[#e8f5ee]">
                      Admin
                    </Link>
                  )}
                  <Link to="/cart"
                    className="p-2 text-gray-500 hover:text-[#0f4c35] hover:bg-[#e8f5ee] rounded-lg transition-colors">
                    <ShoppingCart size={18} />
                  </Link>
                  <div className="flex items-center gap-2 pl-2 border-l border-gray-100">
                    <div className="w-7 h-7 bg-[#e8f5ee] rounded-full flex items-center justify-center shrink-0">
                      <User size={13} className="text-[#0f4c35]" />
                    </div>
                    <span className="text-xs font-medium text-gray-700 max-w-[90px] truncate hidden lg:block">
                      {user.name || user.email}
                    </span>
                    <button onClick={handleLogout} title="Sign out"
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut size={14} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"
                    className="text-sm font-medium text-gray-600 hover:text-[#0f4c35] px-3 py-1.5 transition-colors">
                    Sign in
                  </Link>
                  <Link to="/register"
                    className="text-sm font-semibold bg-[#0f4c35] hover:bg-[#1a6b4a] text-white px-4 py-1.5 rounded-lg transition-colors">
                    Get started
                  </Link>
                </div>
              )}

              {/* Mobile menu toggle */}
              <button onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 text-gray-500 hover:text-[#0f4c35] rounded-lg transition-colors">
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
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-[#0f4c35]"
                />
              </div>
              <button type="submit"
                className="px-3 py-2 bg-[#0f4c35] text-white text-xs font-semibold rounded-lg">
                Go
              </button>
            </form>
            {[
              { to: '/store',  label: 'Store'  },
              { to: '/about',  label: 'About'  },
              { to: '/faqs',   label: 'FAQs'   },
              ...(user ? [{ to: '/orders', label: 'Orders' }] : []),
            ].map(item => (
              <Link key={item.to} to={item.to}
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#e8f5ee] hover:text-[#0f4c35] rounded-lg transition-colors">
                {item.label}
              </Link>
            ))}
            <div className="pt-2 border-t border-gray-100">
              {user
                ? <button onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-50 rounded-lg">
                    Sign out
                  </button>
                : <Link to="/login" onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#e8f5ee] rounded-lg">
                    Sign in
                  </Link>
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
      className={`text-sm transition-colors font-medium ${
        active
          ? 'text-[#0f4c35] font-semibold'
          : 'text-gray-500 hover:text-gray-900'
      }`}>
      {label}
    </Link>
  )
}