import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function VerifyEmailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const searchParams = new URLSearchParams(location.search)
  const [email, setEmail] = useState(location.state?.email || searchParams.get('email') || '')
  const [code, setCode] = useState('')
  const [notice, setNotice] = useState(location.state?.notice || (
    searchParams.get('sent') === 'false'
      ? 'A code was recently requested. Use the latest code or wait before requesting another.'
      : searchParams.get('sent') === 'true'
        ? 'A verification code was sent to your email.'
        : ''
  ))
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const { data } = await api.post('/customers/verify-email', { email, code })
      if (data.accessToken) {
        login({ id: data.userId, email: data.email, name: data.fullName, role: 'USER' }, data.accessToken, data.refreshToken)
        navigate('/store', { replace: true })
      } else {
        navigate('/login', { replace: true, state: { notice: data.message } })
      }
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify this code. Request a new code and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resend = async () => {
    setError('')
    setNotice('')
    setResending(true)
    try {
      const { data } = await api.post('/customers/resend-verification', { email })
      setNotice(data.message)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to request a new code right now.')
    } finally {
      setResending(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-surface p-6">
      <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-5">
        <header className="space-y-2">
          <h1 className="text-2xl font-extrabold text-text-primary">Verify your email</h1>
          <p className="text-sm leading-6 text-text-muted">Enter the six-digit code sent to your email address. The code expires after 10 minutes.</p>
        </header>
        {notice && <p role="status" className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>}
        {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        <label htmlFor="verify-email" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
          Email
          <input id="verify-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
        </label>
        <label htmlFor="verify-code" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
          Verification code
          <input id="verify-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} autoComplete="one-time-code" required value={code} onChange={(event) => setCode(event.target.value)} className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm font-normal tracking-[0.3em] text-text-primary outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
        </label>
        <button type="submit" disabled={submitting} className="min-h-11 rounded-lg bg-brand-primary px-4 py-3 text-sm font-bold text-white hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60">
          {submitting ? 'Verifying...' : 'Verify email'}
        </button>
        <button type="button" disabled={!email || resending} onClick={resend} className="text-sm font-semibold text-brand-primary hover:text-brand-primary-hover disabled:opacity-60">
          {resending ? 'Requesting...' : 'Resend verification code'}
        </button>
        <p className="text-center text-sm text-text-muted">
          Already verified? <Link to="/login" className="font-bold text-brand-primary hover:text-brand-primary-hover">Sign in</Link>
        </p>
      </form>
    </section>
  )
}
