import i18n, { currentLocale } from '@/i18n'

const numberFormatters = new Map<string, Intl.NumberFormat>()

function numberFormat(): Intl.NumberFormat {
  const locale = currentLocale()
  let formatter = numberFormatters.get(locale)
  if (!formatter) {
    formatter = new Intl.NumberFormat(locale)
    numberFormatters.set(locale, formatter)
  }
  return formatter
}

export function formatNumber(value: number): string {
  return numberFormat().format(value)
}

export function formatPercent(value: number): string {
  return `${formatNumber(Math.round(value))}%`
}

/** 95 -> "1h 35m", 30 -> "30m", 120 -> "2h" (units localized). */
export function formatMinutes(minutes: number): string {
  const rounded = Math.round(minutes)
  if (rounded < 60) return i18n.t('format_duration_minutes', { minutes: formatNumber(rounded) })
  const hours = Math.floor(rounded / 60)
  const rest = rounded % 60
  return rest === 0
    ? i18n.t('format_duration_hours', { hours: formatNumber(hours) })
    : i18n.t('format_duration_hours_minutes', { hours: formatNumber(hours), minutes: formatNumber(rest) })
}

/** Milliseconds -> "mm:ss" (or "h:mm:ss" past an hour). */
export function formatClock(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const mm = String(minutes).padStart(2, '0')
  const ss = String(seconds).padStart(2, '0')
  return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`
}

/** Lower-cased, whitespace-collapsed text used for duplicate detection and search. */
export function normalizeText(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ')
}
