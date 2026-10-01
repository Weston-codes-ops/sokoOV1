import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import sokoImg from '../../../public/sokoonline-logo.svg'
import api from '../../api/axios'



export default function Registerpage() {
    const [error, setError] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const submit = async (event) => {
        event.preventDefault()
        setError('')
        const formData = new FormData(event.currentTarget)
        const password = formData.get('password')
        if (password !== formData.get('confirmPassword')) {
            setError('The passwords do not match.')
            return
        }

        setSubmitting(true)
        try {
            const { data } = await api.post('/customers/register', {
                email: formData.get('email'),
                password,
            })
            navigate('/login', { replace: true, state: { notice: data.message || 'Account created. Sign in to continue.' } })
        } catch (requestError) {
            setError(requestError.response?.data?.message || 'Unable to create your account.')
        } finally {
            setSubmitting(false)
        }
    }

return(

    <section className="flex min-h-screen justify-center bg-surface">
    <div className="grid w-full max-w-5xl min-h-screen grid-cols-1 bg-surface md:grid-cols-[0.9fr_1.1fr]">
        <div className="relative flex flex-col items-center justify-center bg-brand-primary p-8 sm:p-12 md:sticky md:top-0 md:h-screen">
            <Link to="/" className="absolute left-8 top-8 inline-flex items-center gap-2 text-sm font-semibold text-white/80 transition-colors hover:text-white sm:left-12 sm:top-12">
                <ArrowLeft size={16} /> Back to home
            </Link>
            <img src={sokoImg} alt="SokoOnline" className="h-30 w-48 max-w-full" />
        </div>
        <div className="flex items-center justify-center bg-surface p-8 sm:p-12 md:h-screen md:overflow-scroll md:overscroll-contain">
            <form onSubmit={submit} className="flex w-full max-w-sm flex-col gap-5">
                <header className="space-y-2 mt-3">
                    <h1 className="text-2xl font-extrabold text-text-primary">Create your account</h1>
                    <p className="text-sm leading-6 text-text-muted">Join SokoOnline and discover local favorites.</p>
                </header>
                {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                <label htmlFor="register-email" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                    Email
                    <input id="register-email" name="email" type="email" autoComplete="email" required placeholder="Enter your email" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                </label>
                <label htmlFor="register-password" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                    Password
                    <input id="register-password" name="password" type="password" autoComplete="new-password" required placeholder="Create a password" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                </label>
                <label htmlFor="register-confirm-password" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                    Confirm password
                    <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Re-enter your password" className="w-full rounded-lg border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                </label>
                <button type="submit" disabled={submitting} className="mt-1 min-h-11 rounded-lg bg-brand-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60">
                    {submitting ? 'Creating account...' : 'Create account'}
                </button>
                <p className="text-center text-sm text-text-muted">
                    Have an account? <Link to="/login" className="font-bold text-brand-primary hover:text-brand-primary-hover">Sign in</Link>
                </p>
            </form>
        </div>
    </div>



    </section>

)


}