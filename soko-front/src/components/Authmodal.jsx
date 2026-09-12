/*
 * AuthModal.jsx — Slide-up login/register modal
 *
 * How it works:
 * - Opens as an overlay on top of whatever page the user is on
 * - Has two tabs: Sign in / Create account
 * - After login/register, modal closes and user stays on current page
 * - Backdrop click closes the modal
 * - Escape key closes the modal
 */

import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { X, Eye, EyeOff } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/sokoonline-logo.svg'

export default function AuthModal({ onClose, defaultTab = 'login' }) {
  const { login } = useAuth()
  const [tab, setTab] = useState(defaultTab) // 'login' | 'register'

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent background scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    // Backdrop
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      {/* Modal card — wider to fit split layout */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden
        animate-[slideUp_0.25s_ease-out] flex">

        {/* ── LEFT — solid green panel ─────────────────────────── */}
        <div className="hidden sm:flex w-2/5 bg-[#0f4c35] flex-col justify-center px-8 py-10 shrink-0">
          <Link to="/" onClick={onClose} className="mb-7">
            <img src={logo} alt="SokoOnline" className="h-8 w-auto" />
          </Link>
          {tab === 'login' ? (
            <>
              <h2 className="text-2xl font-extrabold text-white leading-snug mb-2">
                Your market,<br />
                <span className="text-[#f59e0b]">at your fingertips.</span>
              </h2>
              <p className="text-white/50 text-xs leading-relaxed">
                Sign in to continue shopping fresh produce, fashion & home essentials.
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-extrabold text-white leading-snug mb-2">
                Join thousands<br />
                <span className="text-[#f59e0b]">of happy shoppers.</span>
              </h2>
              <p className="text-white/50 text-xs leading-relaxed">
                Create a free account and start shopping across Nairobi.
              </p>
            </>
          )}
        </div>

        {/* ── RIGHT — form ─────────────────────────────────────── */}
        <div className="flex-1 flex flex-col" style={{
          background: 'linear-gradient(135deg, #f0faf4 0%, #ffffff 40%, #fffbf0 100%)'
        }}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-0">
            {/* Tabs */}
            <div className="flex gap-1">
              {['login', 'register'].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`pb-3 px-1 text-xs font-bold border-b-2 transition-colors mr-3 ${
                    tab === t
                      ? 'border-[#0f4c35] text-[#0f4c35]'
                      : 'border-transparent text-gray-400 hover:text-gray-600'
                  }`}>
                  {t === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors mb-2">
              <X size={14} />
            </button>
          </div>

          <div className="border-b border-gray-100 mx-6" />

          {/* Form area */}
          <div className="flex-1 px-6 py-5">
            {tab === 'login'
              ? <LoginForm login={login} onClose={onClose} />
              : <RegisterForm login={login} onClose={onClose} />
            }

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-xs text-gray-400">
              {tab === 'login' ? (
                <>No account?{' '}
                  <button onClick={() => setTab('register')}
                    className="text-[#0f4c35] font-bold hover:underline">
                    Create one free
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => setTab('login')}
                    className="text-[#0f4c35] font-bold hover:underline">
                    Sign in
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Slide-up animation */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

/* ── LOGIN FORM ──────────────────────────────────────────────── */
function LoginForm({ login, onClose }) {
  const navigate = useNavigate()
  const [form, setForm]                 = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/auth/login', form)
      const { accessToken, email, role, userId, fullName } = res.data
      login({ id: userId, email, role, name: fullName || email }, accessToken)
      onClose()
      if (role === 'ADMIN') navigate('/hidden-admin/products')
      else navigate('/store')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
        <input type="email" value={form.email}
          onChange={e => { setForm({ ...form, email: e.target.value }); setError('') }}
          placeholder="you@example.com" required autoComplete="email"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-semibold text-gray-700">Password</label>
          <a href="#" className="text-xs text-[#0f4c35] hover:underline font-medium">Forgot?</a>
        </div>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} value={form.password}
            onChange={e => { setForm({ ...form, password: e.target.value }); setError('') }}
            placeholder="Your password" required autoComplete="current-password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all pr-11"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 mt-1">
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    </form>
  )
}

/* ── REGISTER FORM ───────────────────────────────────────────── */
function RegisterForm({ onClose }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.')
    if (form.password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        firstName: form.name.split(' ')[0] || form.name,
        lastName: form.name.split(' ').slice(1).join(' ') || '',
        email: form.email,
        password: form.password
      })
      if (!res.data) throw new Error('Registration did not return a response.')
      onClose()
      navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' },
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const f = (field) => ({
    value: form[field],
    onChange: e => { setForm({ ...form, [field]: e.target.value }); setError('') }
  })

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full name</label>
        <input type="text" {...f('name')} placeholder="John Kamau" required autoComplete="name"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email address</label>
        <input type="email" {...f('email')} placeholder="you@example.com" required autoComplete="email"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all"
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
        <div className="relative">
          <input type={showPassword ? 'text' : 'password'} {...f('password')}
            placeholder="Min. 8 characters" required autoComplete="new-password"
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all pr-11"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Confirm password</label>
        <input type="password" {...f('confirmPassword')} placeholder="Repeat password" required
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all"
        />
      </div>
      <button type="submit" disabled={loading}
        className="w-full py-2.5 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 mt-1">
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  )
}