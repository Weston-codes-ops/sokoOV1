const DEFAULT_ADMIN_SUBDOMAIN = 'admin'

export function isAdminSubdomain(hostname = window.location.hostname) {
  const host = String(hostname || '').toLowerCase()
  if (!host) return false

  // Allow localhost in development
  if (host.startsWith('localhost') || host === '127.0.0.1' || host === '[::1]') {
    return true
  }

  const configuredHost = import.meta.env.VITE_ADMIN_HOST?.toLowerCase()
  if (configuredHost) {
    return host === configuredHost || host === `www.${configuredHost}`
  }

  const adminSubdomain = import.meta.env.VITE_ADMIN_SUBDOMAIN || DEFAULT_ADMIN_SUBDOMAIN
  return host === adminSubdomain || host.startsWith(`${adminSubdomain}.`) || host.startsWith('admin.')
}

export function getAdminRedirectUrl(pathname = window.location.pathname, search = window.location.search) {
  const configuredHost = import.meta.env.VITE_ADMIN_HOST?.toLowerCase()
  if (!configuredHost) return null

  const currentUrl = new URL(window.location.href)
  currentUrl.hostname = configuredHost
  currentUrl.pathname = pathname
  currentUrl.search = search
  return currentUrl.toString()
}
