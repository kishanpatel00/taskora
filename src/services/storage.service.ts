import { parsePersistedData, type PersistedData } from './persistedData'

export const STORAGE_KEY = 'taskora:data'
const BACKUP_KEY_PREFIX = 'taskora:backup:'

export type LoadResult =
  | { status: 'empty' }
  | { status: 'ok'; data: PersistedData }
  | { status: 'invalid'; error: string; raw: string }

export type SaveResult = { ok: true } | { ok: false; reason: 'quota' | 'unavailable' | 'unknown' }

/**
 * Returns localStorage when it exists and is writable. Returns `null` in
 * non-browser environments, private modes that block storage, etc.
 */
export function getStorage(): Storage | null {
  try {
    if (typeof window === 'undefined' || !('localStorage' in window)) return null
    const storage = window.localStorage
    const probe = '__taskora_probe__'
    storage.setItem(probe, probe)
    storage.removeItem(probe)
    return storage
  } catch {
    return null
  }
}

export function loadData(storage: Storage | null = getStorage()): LoadResult {
  if (!storage) return { status: 'empty' }
  let raw: string | null
  try {
    raw = storage.getItem(STORAGE_KEY)
  } catch {
    return { status: 'empty' }
  }
  if (raw === null || raw.trim() === '') return { status: 'empty' }

  let json: unknown
  try {
    json = JSON.parse(raw)
  } catch {
    return { status: 'invalid', error: 'Saved data is not valid JSON', raw }
  }

  const parsed = parsePersistedData(json)
  return parsed.success ? { status: 'ok', data: parsed.data } : { status: 'invalid', error: parsed.error, raw }
}

function isQuotaError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

export function saveData(data: PersistedData, storage: Storage | null = getStorage()): SaveResult {
  if (!storage) return { ok: false, reason: 'unavailable' }
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(data))
    return { ok: true }
  } catch (error) {
    return { ok: false, reason: isQuotaError(error) ? 'quota' : 'unknown' }
  }
}

/** Keeps unreadable data under a separate key so it is never silently destroyed. */
export function backupRawData(raw: string, storage: Storage | null = getStorage(), now: Date = new Date()): void {
  if (!storage) return
  try {
    storage.setItem(`${BACKUP_KEY_PREFIX}${now.toISOString()}`, raw)
  } catch {
    // Backups are best-effort; failing to write one must not block startup.
  }
}
