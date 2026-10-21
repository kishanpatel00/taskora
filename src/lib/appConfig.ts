/**
 * App-wide configuration from environment variables (see .env).
 * Only VITE_* values are available here, and they are public in the bundle.
 */

/** Absolute URL of the deployed app without a trailing slash. Falls back to the current origin. */
export const APP_URL: string = (import.meta.env.VITE_APP_URL?.trim() || window.location.origin).replace(/\/+$/, '')

/** Builds an absolute app URL for a route path such as `/dashboard`. */
export function appUrl(path = '/'): string {
  return `${APP_URL}${path.startsWith('/') ? path : `/${path}`}`
}
