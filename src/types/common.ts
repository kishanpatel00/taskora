/** Calendar date without time, formatted `yyyy-MM-dd` in the user's local time zone. */
export type DateKey = string

/** Full ISO-8601 timestamp, e.g. `2026-10-20T08:30:00.000Z`. */
export type Timestamp = string

export type ThemePreference = 'light' | 'dark' | 'system'

export type WeekStartsOn = 0 | 1

export type SortDirection = 'asc' | 'desc'
