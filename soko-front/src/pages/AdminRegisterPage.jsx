import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, KeyRound, ShieldCheck } from 'lucide-react'
import api from '../api/axios'

export default function AdminRegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', firstName: '', lastName: '', password: '', secretKey: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await api.post('/admin/auth/register', form)
      setSuccess('Operator account created successfully. Please sign in to continue.')
      window.setTimeout(() => navigate('/_market-ops/entrance', { replace: true }), 1200)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'That invitation key did not open the door.')
    } finally {
      setLoading(false)
    }
  }

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }))
    setError('')
  }

  return (
    <main className="min-h-screen bg-[#10251d] text-white flex items-center justify-center px-5 py-10">
      <section className="w-full max-w-lg rounded-4xl bg-[#f8fbf7] p-7 text-slate-900 shadow-2xl shadow-black/20 sm:p-9">
        <div className="mb-8">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#e5f2e9] text-[#0f4c35]"><ShieldCheck size={20} /></div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0f4c35]">Private provisioning</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Create an operator account</h1>
          <p className="mt-2 text-sm text-slate-500">You will need the invitation key supplied by the shop owner.</p>
        </div>

        {error && <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        {success && <div className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-[#0f4c35]">{success}</div>}

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold sm:col-span-2">Email<input required type="email" value={form.email} onChange={(event) => update('email', event.target.value)} className="admin-input" placeholder="operator@example.com" /></label>
          <label className="text-sm font-semibold">First name<input required value={form.firstName} onChange={(event) => update('firstName', event.target.value)} className="admin-input" placeholder="Amina" /></label>
          <label className="text-sm font-semibold">Last name<input required value={form.lastName} onChange={(event) => update('lastName', event.target.value)} className="admin-input" placeholder="Otieno" /></label>
          <label className="text-sm font-semibold">Password<input required minLength="6" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} className="admin-input" placeholder="At least 6 characters" /></label>
          <label className="text-sm font-semibold">Invitation key<div className="relative"><KeyRound className="absolute left-4 top-3 text-slate-400" size={16} /><input required type="password" value={form.secretKey} onChange={(event) => update('secretKey', event.target.value)} className="admin-input pl-11" placeholder="Secret key" /></div></label>
          <button disabled={loading} className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-[#0f4c35] px-4 py-3.5 text-sm font-bold text-white transition hover:bg-[#0b3928] disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
            {loading ? 'Checking the key...' : 'Open the operator account'} {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <Link to="/_market-ops/entrance" className="mt-6 inline-block text-xs font-semibold text-slate-400 hover:text-[#0f4c35]">Already provisioned? Sign in</Link>
      </section>
    </main>
  )
}
