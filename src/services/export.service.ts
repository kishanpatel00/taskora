import type { TranslationKey } from '@/i18n/translation.types'
import { toDateKey } from '@/lib/date'
import { parsePersistedData, type PersistedData } from './persistedData'

export const MAX_IMPORT_BYTES = 5 * 1024 * 1024

export function serializeData(data: PersistedData): string {
  return JSON.stringify(data, null, 2)
}

export function exportFileName(now: Date = new Date()): string {
  return `taskora-backup-${toDateKey(now)}.json`
}

/** Triggers a browser download of the given data as a JSON file. */
export function downloadData(data: PersistedData, now: Date = new Date()): void {
  const blob = new Blob([serializeData(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = exportFileName(now)
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

/** `error` is a translation key; `detail` carries technical context such as the failing field path. */
export type ImportResult = { ok: true; data: PersistedData } | { ok: false; error: TranslationKey; detail?: string }

/** Parses and fully validates an exported file's text. Never touches application state. */
export function parseImportText(text: string): ImportResult {
  if (text.length > MAX_IMPORT_BYTES) return { ok: false, error: 'import_error_too_large' }
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    return { ok: false, error: 'import_error_not_json' }
  }
  if (typeof json !== 'object' || json === null || !('version' in json)) {
    return { ok: false, error: 'import_error_not_taskora' }
  }
  const parsed = parsePersistedData(json)
  return parsed.success
    ? { ok: true, data: parsed.data }
    : { ok: false, error: 'import_error_invalid', detail: parsed.error.split(':')[0] }
}
