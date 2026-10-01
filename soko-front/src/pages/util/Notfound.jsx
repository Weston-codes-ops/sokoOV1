import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {

return(
<div className="flex flex-col items-center justify-center min-h-screen bg-surface-subtle">
    <h1 className="text-6xl font-extrabold text-text-primary">404</h1>
    <p className="mt-4 text-lg text-text-muted">Page not found</p>
    <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-accent-light">
        Go back home
    </Link>
</div>

)


}