import { useState } from "react";
import { useNavigate } from "react-router-dom";
import sokoImg from "../../assets/sokoonline-logo.svg";
import { ArrowRight, LockKeyhole, ShieldCheck } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function AdminLoginPage() {
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);
	const navigate = useNavigate();
	const { login } = useAuth();

	const submit = async (event) => {
		event.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const formData = new FormData(event.currentTarget);
			const { data } = await api.post("/admin/auth/login", {
				email: formData.get("email"),
				password: formData.get("password"),
			});
			login({ email: data.email, role: "ADMIN" }, data.token, data.refreshToken);
			navigate("/_market-ops/catalog", { replace: true });
		} catch (requestError) {
			setError(requestError.response?.data?.message || "Unable to sign in. Check the email and password.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<section className="flex min-h-screen flex-col bg-surface-subtle">
			<header className="flex min-h-16 items-center justify-between border-b border-border-default bg-surface px-5 sm:px-8">
				<img src={sokoImg} alt="SokoOnline" className="h-10 w-32 object-contain object-left" />
				<div className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted">
					<ShieldCheck size={16} className="text-brand-primary" />
					<span>SECURE ADMIN ACCESS</span>
				</div>
			</header>

			<main className="mx-auto grid w-full max-w-6xl flex-1 grid-cols-1 px-4 py-6 sm:px-6 sm:py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
				<section className="flex flex-col justify-between bg-brand-primary p-6 text-white sm:p-10">
					<div>
						<p className="font-mono text-xs font-semibold tracking-widest text-white/65">SOKO / MARKET OPERATIONS</p>
						<div className="mt-12 max-w-md sm:mt-20">
							<p className="font-mono text-xs text-brand-accent-light">CONTROL DESK 01</p>
							<h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl">Storefront access</h1>
							<p className="mt-4 max-w-sm text-sm leading-6 text-white/75">Sign in to manage the live product catalogue and market operations.</p>
						</div>
					</div>
					<div className="mt-12 border-t border-white/20 pt-5">
						<div className="flex items-center gap-2 font-mono text-xs text-white/80">
							<span className="h-2 w-2 rounded-full bg-brand-accent-light" />
							ADMIN NETWORK / RESTRICTED
						</div>
						<p className="mt-3 font-mono text-[11px] text-white/55">AUTHORIZED OPERATORS ONLY</p>
					</div>
				</section>

				<div className="flex items-center bg-surface px-5 py-8 sm:px-10 sm:py-12">
					<form onSubmit={submit} className="mx-auto flex w-full max-w-sm flex-col gap-5">
						<header className="border-b border-border-default pb-5">
							<p className="font-mono text-xs font-semibold text-text-muted">IDENTITY CHECK / 01</p>
							<h2 className="mt-2 text-2xl font-bold text-text-primary">Operator sign in</h2>
							<p className="mt-2 text-sm leading-5 text-text-muted">Use your administrator credentials to continue.</p>
						</header>
						{error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
						<label htmlFor="login-email" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
							Email address
							<input id="login-email" name="email" type="email" autoComplete="email" required placeholder="name@company.com" className="min-h-11 w-full rounded border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
						</label>
						<label htmlFor="login-password" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
							Password
							<input id="login-password" name="password" type="password" autoComplete="current-password" required placeholder="Enter password" className="min-h-11 w-full rounded border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
						</label>
						<button type="submit" disabled={submitting} className="mt-1 inline-flex min-h-11 items-center justify-center gap-2 rounded bg-brand-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60">
							<LockKeyhole size={16} />
							{submitting ? "Checking access..." : "Open operations"}
							<ArrowRight size={16} />
						</button>
					</form>
				</div>
			</main>
		</section>
	);
}