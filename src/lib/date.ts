import {
  addDays,
  differenceInCalendarDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isValid,
  parse,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import i18n, { currentLocale } from '@/i18n'
import type { TranslationKey } from '@/i18n/translation.types'
import type { DateKey, Timestamp, WeekStartsOn } from '@/types/common'

const KEY_FORMAT = 'yyyy-MM-dd'
const KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/* ---------- Date keys and calculations (locale-independent) ---------- */

export function toDateKey(date: Date): DateKey {
  return format(date, KEY_FORMAT)
}

export function todayKey(now: Date = new Date()): DateKey {
  return toDateKey(now)
}

/** Parses a `yyyy-MM-dd` key as a local-time date (midnight). */
export function parseDateKey(key: DateKey): Date {
  return parse(key, KEY_FORMAT, new Date(0))
}

export function isDateKey(value: string): value is DateKey {
  return KEY_PATTERN.test(value) && isValid(parseDateKey(value))
}

export function addDaysToKey(key: DateKey, days: number): DateKey {
  return toDateKey(addDays(parseDateKey(key), days))
}

/** Converts a timestamp to the local calendar day it falls on. */
export function timestampToDateKey(timestamp: Timestamp): DateKey {
  return toDateKey(new Date(timestamp))
}

/** Day difference `to - from` (both keys). */
export function daysBetween(from: DateKey, to: DateKey): number {
  return differenceInCalendarDays(parseDateKey(to), parseDateKey(from))
}

/** Returns full weeks (rows of 7 days) covering the month containing `month`. */
export function getMonthGrid(month: Date, weekStartsOn: WeekStartsOn): Date[][] {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn })
  const end = endOfWeek(endOfMonth(month), { weekStartsOn })
  const days = eachDayOfInterval({ start, end })
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7))
  return weeks
}

/** Inclusive list of date keys from `start` to `end`. */
export function dateKeyRange(start: DateKey, end: DateKey): DateKey[] {
  if (start > end) return []
  return eachDayOfInterval({ start: parseDateKey(start), end: parseDateKey(end) }).map(toDateKey)
}

export function weekStartKey(key: DateKey, weekStartsOn: WeekStartsOn): DateKey {
  return toDateKey(startOfWeek(parseDateKey(key), { weekStartsOn }))
}

/** Milliseconds until the next local midnight. */
export function msUntilMidnight(now: Date = new Date()): number {
  const next = new Date(now)
  next.setHours(24, 0, 0, 0)
  return next.getTime() - now.getTime()
}

/* ---------- Display formatting (follows the UI language via Intl) ---------- */

const formatters = new Map<string, Intl.DateTimeFormat>()

/** Cached Intl.DateTimeFormat for the current locale. */
function dateFormat(options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const locale = currentLocale()
  const cacheKey = `${locale}|${JSON.stringify(options)}`
  let formatter = formatters.get(cacheKey)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat(locale, options)
    formatters.set(cacheKey, formatter)
  }
  return formatter
}

const toDate = (value: DateKey | Date) => (typeof value === 'string' ? parseDateKey(value) : value)

/** "Tue, Oct 20" style. */
export function formatWeekdayDate(value: DateKey | Date): string {
  return dateFormat({ weekday: 'short', month: 'short', day: 'numeric' }).format(toDate(value))
}

/** "Oct 20" style. */
export function formatMonthDay(value: DateKey | Date): string {
  return dateFormat({ month: 'short', day: 'numeric' }).format(toDate(value))
}

/** "Tuesday, October 20" style. */
export function formatLongDate(value: DateKey | Date): string {
  return dateFormat({ weekday: 'long', month: 'long', day: 'numeric' }).format(toDate(value))
}

/** "Oct 20, 2026" style. */
export function formatShortDate(value: DateKey | Date): string {
  return dateFormat({ month: 'short', day: 'numeric', year: 'numeric' }).format(toDate(value))
}

/** "October 2026" style. */
export function formatMonthYear(value: DateKey | Date): string {
  return dateFormat({ month: 'long', year: 'numeric' }).format(toDate(value))
}

/** Short weekday name, e.g. "Tue". */
export function formatWeekday(value: DateKey | Date, style: 'short' | 'narrow' = 'short'): string {
  return dateFormat({ weekday: style }).format(toDate(value))
}

/** Day of month number in the locale's numbering. */
export function formatDayOfMonth(value: DateKey | Date): string {
  return dateFormat({ day: 'numeric' }).format(toDate(value))
}

export function formatDateTime(timestamp: Timestamp): string {
  return dateFormat({ dateStyle: 'medium', timeStyle: 'short' }).format(new Date(timestamp))
}

/** Label relative to today: "Today", "Tomorrow", "Yesterday", "Mon, Oct 21", "Oct 21, 2027". */
export function formatDateLabel(key: DateKey, today: DateKey): string {
  const diff = daysBetween(today, key)
  if (diff === 0) return i18n.t('date_today')
  if (diff === 1) return i18n.t('date_tomorrow')
  if (diff === -1) return i18n.t('date_yesterday')
  if (Math.abs(diff) < 7) return formatWeekdayDate(key)
  if (parseDateKey(key).getFullYear() === parseDateKey(today).getFullYear()) return formatMonthDay(key)
  return formatShortDate(key)
}

const RELATIVE_UNITS: Array<[Intl.RelativeTimeFormatUnit, number]> = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
]

/** "2 hours ago", "in 3 days" — localized with Intl.RelativeTimeFormat. */
export function formatRelativeTime(timestamp: Timestamp, now: Date = new Date()): string {
  const seconds = (new Date(timestamp).getTime() - now.getTime()) / 1000
  if (Math.abs(seconds) < 60) return i18n.t('date_just_now')
  const formatter = new Intl.RelativeTimeFormat(currentLocale(), { numeric: 'auto' })
  for (const [unit, size] of RELATIVE_UNITS) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit)
  }
  return i18n.t('date_just_now')
}

/** Translation key for a time-of-day greeting. */
export function getGreetingKey(hour: number): TranslationKey {
  if (hour < 5) return 'dashboard_greeting_night'
  if (hour < 12) return 'dashboard_greeting_morning'
  if (hour < 18) return 'dashboard_greeting_afternoon'
  return 'dashboard_greeting_evening'
}

/** Weekday names starting on the configured first day of the week. */
export function getWeekdayLabels(weekStartsOn: WeekStartsOn, style: 'short' | 'narrow' = 'short'): string[] {
  const start = startOfWeek(new Date(2024, 0, 10), { weekStartsOn })
  return Array.from({ length: 7 }, (_, i) => formatWeekday(addDays(start, i), style))
}
