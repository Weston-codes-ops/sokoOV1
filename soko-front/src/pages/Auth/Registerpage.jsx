import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import api from '../../api/axios'
import logo from '../../assets/sokoonline-logo.svg'

export default function RegisterPage() {
  const navigate  = useNavigate()

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const nameParts = form.name.trim().split(/\s+/)
      const res = await api.post('/auth/register', {
        firstName: nameParts[0] || form.name,
        lastName: nameParts.slice(1).join(' '),
        email: form.email,
        password: form.password,
      })
      if (!res.data) throw new Error('Registration did not return a response.')
      setSuccess('Account created successfully. Taking you to sign in...')
      window.setTimeout(() => navigate('/login', {
        state: { message: 'Account created successfully. Please sign in.' },
      }), 1200)
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex mx-50" style={{
      background: 'radial-gradient(ellipse at top left, #e8f5ee 0%, #f9fafb 40%, #f0f4ff 100%)'
    }}>

      {/* ══ LEFT PANEL — solid green, logo + text ══════════════════ */}
      <div className="hidden lg:flex lg:w-2/5 flex-col justify-center px-14 bg-[#0f4c35]">
        <Link to="/" className="mb-8">
          <img src={logo} alt="SokoOnline" className="h-10 w-auto" />
        </Link>
        <h2 className="text-3xl font-extrabold text-white leading-snug mb-3">
          Join thousands<br />
          <span className="text-[#f59e0b]">of happy shoppers.</span>
        </h2>
        <p className="text-white/50 text-sm leading-relaxed">
          Create a free account and start shopping<br />
          fresh produce, fashion & home essentials.
        </p>
      </div>

      {/* ══ RIGHT PANEL — Register form ════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Top bar */}
        <div className="flex items-center justify-between px-10 py-6 border-b border-gray-100">
          <Link to="/" className="lg:hidden">
            <img src={logo} alt="SokoOnline" className="h-7 w-auto" />
          </Link>
          <span className="hidden lg:block" />
          <Link to="/"
            className="text-xs text-gray-400 hover:text-[#0f4c35] font-medium transition-colors">
            ← Back to home
          </Link>
        </div>

        {/* Form centered */}
        <div className="flex-1 flex items-center justify-center px-10">
          <div className="w-full max-w-md">

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Create an account</h1>
              <p className="text-sm text-gray-400">Join SokoOnline and start shopping today</p>
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-5 p-3 bg-green-50 border border-green-100 rounded-lg text-sm text-[#0f4c35]">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Full name */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Full name
                </label>
                <input
                  type="text" name="name" value={form.name}
                  onChange={handleChange} placeholder="John Kamau"
                  required autoComplete="name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com"
                  required autoComplete="email"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password" value={form.password}
                    onChange={handleChange} placeholder="Min. 8 characters"
                    required autoComplete="new-password"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all pr-11 bg-gray-50 focus:bg-white"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password" name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} placeholder="Repeat your password"
                  required autoComplete="new-password"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0f4c35] focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                />
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-3 bg-[#0f4c35] hover:bg-[#1a6b4a] text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1">
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-xs text-gray-300 font-medium">or</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <p className="text-center text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#0f4c35] font-bold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>

        <div className="py-6" />
      </div>
    </div>
  )
}