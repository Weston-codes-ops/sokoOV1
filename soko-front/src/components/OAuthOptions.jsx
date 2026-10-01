import { oauthProviders } from '../data/oauthProviders'

export default function OAuthOptions({ onSelect }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border-default" />
        <span className="text-xs font-medium text-text-muted">or continue with</span>
        <span className="h-px flex-1 bg-border-default" />
      </div>
      <div className="flex flex-col gap-3">
        {oauthProviders.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => onSelect?.(provider.id)}
            className="flex min-h-11 w-full items-center justify-center gap-3 rounded-lg border border-border-default bg-surface px-4 py-3 text-sm font-semibold text-text-primary transition-colors hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/20"
          >
            <span className="flex h-5 w-5 items-center justify-center rounded-full border border-border-default text-xs font-bold text-brand-primary">
              {provider.mark}
            </span>
            Continue with {provider.name}
          </button>
        ))}
      </div>
    </div>
  )
}
