import sokoImg from "../../assets/sokoonline-logo.svg";
import { useState } from "react";
import { Check, ShieldPlus } from "lucide-react";
import api from "../../api/axios";

const permissionOptions = [
    { value: "PRODUCT_READ", label: "View products", detail: "Read catalogue and stock details" },
    { value: "PRODUCT_CREATE", label: "Create products", detail: "Add items to the catalogue" },
    { value: "CATEGORY_MANAGE", label: "Manage categories", detail: "Create and organize categories" },
    { value: "MEDIA_UPLOAD", label: "Upload product media", detail: "Upload catalogue images" },
];

export default function AdminRegisterPage() {
    const [error, setError] = useState("");
    const [notice, setNotice] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const submit = async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        const form = event.currentTarget;
        const formData = new FormData(form);
        const password = formData.get("password");
        if (password !== formData.get("confirmPassword")) {
            setError("The passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            await api.post("/admin/auth/register", {
                email: formData.get("email"),
                password,
                secretKey: formData.get("secretKey"),
                initialPermissions: formData.getAll("initialPermissions"),
            });
            setNotice("Administrator created. Sign in from the separate operations login page.");
            form.reset();
        } catch (requestError) {
            setError(requestError.response?.data?.message || "Unable to create the administrator account.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="min-h-screen bg-surface-subtle">
            <header className="flex min-h-16 items-center justify-between border-b border-border-default bg-surface px-5 sm:px-8">
                <span className="font-mono text-xs font-semibold text-text-muted">OPERATOR PROVISIONING</span>
                <div className="hidden items-center gap-3 sm:flex">
                    <img src={sokoImg} alt="SokoOnline" className="h-8 w-24 object-contain object-right" />
                    <span className="h-5 border-l border-border-default" />
                    <span className="font-mono text-xs font-semibold text-text-muted">ACCESS MANAGEMENT</span>
                </div>
            </header>

            <main className="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8">
                <div className="mb-6 flex flex-col justify-between gap-4 border-b border-border-default pb-5 sm:flex-row sm:items-end">
                    <div>
                        <p className="font-mono text-xs font-semibold text-brand-primary">OPERATOR PROVISIONING / 02</p>
                        <h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">Create administrator access</h1>
                    </div>
                    <div className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted">
                        <ShieldPlus size={16} className="text-brand-primary" />
                        CONTROLLED SETUP
                    </div>
                </div>

                <form onSubmit={submit} className="grid grid-cols-1 border border-border-default bg-surface lg:grid-cols-[0.8fr_1.2fr]">
                    <aside className="flex flex-col justify-between bg-surface-soft p-5 sm:p-7">
                        <div>
                            <p className="font-mono text-xs font-semibold text-text-muted">NEW OPERATOR</p>
                            <h2 className="mt-3 text-xl font-bold text-text-primary">Account profile</h2>
                            <p className="mt-2 text-sm leading-5 text-text-muted">Register an administrator identity and assign its initial market permissions.</p>
                        </div>
                        <div className="mt-8 border-t border-border-brand pt-4">
                            <div className="flex items-center justify-between font-mono text-xs text-text-muted">
                                <span>PROVISIONING STATUS</span>
                                <span className="inline-flex items-center gap-2 font-semibold text-brand-primary"><span className="h-2 w-2 rounded-full bg-brand-primary" /> READY</span>
                            </div>
                            <p className="mt-3 font-mono text-[11px] text-text-faint">ACCESS PROFILE / MARKET OPS</p>
                        </div>
                    </aside>

                    <div className="flex flex-col gap-6 p-5 sm:p-7">
                        {error && <p role="alert" className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
                        {notice && <p role="status" className="border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">{notice}</p>}
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-border-default pb-2">
                                <span className="font-mono text-xs font-bold text-brand-primary">01</span>
                                <h2 className="text-sm font-bold text-text-primary">Credentials</h2>
                            </div>
                            <label htmlFor="register-email" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                                Email address
                                <input id="register-email" name="email" type="email" autoComplete="email" required placeholder="name@company.com" className="min-h-11 w-full rounded border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                            </label>
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label htmlFor="register-password" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                                    Password
                                    <input id="register-password" name="password" type="password" autoComplete="new-password" required placeholder="Create password" className="min-h-11 w-full rounded border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                                </label>
                                <label htmlFor="register-confirm-password" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                                    Confirm password
                                    <input id="register-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required placeholder="Repeat password" className="min-h-11 w-full rounded border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                                </label>
                            </div>
                            <label htmlFor="register-secret-key" className="flex flex-col gap-2 text-sm font-semibold text-text-primary">
                                Setup secret key
                                <input id="register-secret-key" name="secretKey" type="password" autoComplete="off" required placeholder="Enter the admin setup key" className="min-h-11 w-full rounded border border-border-default bg-surface px-3 py-2.5 text-sm font-normal text-text-primary outline-none transition placeholder:text-text-faint focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10" />
                            </label>
                        </section>

                        <fieldset className="space-y-3">
                            <legend className="w-full border-b border-border-default pb-2 text-sm font-bold text-text-primary">
                                <span className="mr-2 font-mono text-xs text-brand-primary">02</span>
                                Initial permissions
                            </legend>
                            <div className="grid grid-cols-1 gap-px border border-border-default bg-border-default sm:grid-cols-2">
                                {permissionOptions.map((permission) => (
                                    <label key={permission.value} className="flex min-h-16 cursor-pointer items-start gap-3 bg-surface p-3">
                                        <input type="checkbox" name="initialPermissions" value={permission.value} className="mt-1 accent-brand-primary" />
                                        <span>
                                            <span className="block text-sm font-semibold text-text-primary">{permission.label}</span>
                                            <span className="mt-1 block text-xs font-normal leading-4 text-text-muted">{permission.detail}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>

                        <div className="flex flex-col gap-4 border-t border-border-default pt-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-xs leading-5 text-text-muted">Grant only the access needed for this operator.</p>
                            <button type="submit" disabled={submitting} className="inline-flex min-h-11 items-center justify-center gap-2 rounded bg-brand-primary px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-primary-hover disabled:cursor-wait disabled:opacity-60">
                                <Check size={16} />
                                {submitting ? "Creating operator..." : "Create operator"}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </section>
    );
}