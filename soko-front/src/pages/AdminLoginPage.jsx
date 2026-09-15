import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function AdminLoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const { data } = await api.post('/admin/auth/login', form)
      if (data.role !== 'ADMIN') {
        throw new Error('This account is not an administrator account.')
      }
      login({
        id: data.userId,
        email: data.email,
        role: data.role,
        name: data.fullName || data.email,
      }, data.accessToken)
      setSuccess('Access confirmed. Opening the catalog...')
      window.setTimeout(() => navigate('/_market-ops/catalog', { replace: true }), 900)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'The back room did not recognize those credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#10251d] text-white flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-5xl grid lg:grid-cols-[1fr_420px] gap-12 items-center">
        <section className="hidden lg:block max-w-xl">
          <div className="flex items-center gap-3 text-[#f7bd61] text-xs font-bold uppercase tracking-[0.22em]">
            <ShieldCheck size={17} /> Quiet market operations
          </div>
          <h1 className="mt-7 text-6xl font-black leading-[0.95] tracking-tight">The shelves have a back room.</h1>
          <p className="mt-6 text-white/60 text-lg leading-relaxed max-w-md">
            A private door for the people who keep SokoOnline stocked, tidy, and moving.
          </p>
        </section>

        <section className="bg-[#f8fbf7] text-slate-900 rounded-4xl p-7 sm:p-9 shadow-2xl shadow-black/20">
          <div className="mb-8">
            <div className="w-11 h-11 rounded-2xl bg-[#e5f2e9] text-[#0f4c35] flex items-center justify-center mb-5">
              <LockKeyhole size={20} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">Restricted entrance</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Operator sign in</h2>
            <p className="mt-2 text-sm text-slate-500">This door is intentionally absent from the public navigation.</p>
          </div>

          {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
          {success && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-[#0f4c35]">{success}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-semibold">
              Email
              <input
                required
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0f4c35] focus:ring-2 focus:ring-[#0f4c35]/15"
                placeholder="operator@example.com"
              />
            </label>
            <label className="block text-sm font-semibold">
              Password
              <input
                required
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#0f4c35] focus:ring-2 focus:ring-[#0f4c35]/15"
                placeholder="Your password"
              />
            </label>
            <button
              disabled={loading}
              className="w-full rounded-xl bg-[#0f4c35] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b3928] disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? 'Opening the door...' : 'Enter operations'}
              {!loading && <ArrowRight className="inline ml-2" size={16} />}
            </button>
          </form>

          <Link to="/" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#0f4c35]">
            <KeyRound size={14} /> Return to the storefront
          </Link>
        </section>
      </div>
    </main>
  )
}
