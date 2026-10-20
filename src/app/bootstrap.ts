import { createDemoData } from '@/data/demoData'
import type { TranslationKey } from '@/i18n/translation.types'
import { createAppStore, stateFromData, type AppStore } from '@/store'
import { backupRawData, getStorage, loadData, saveData } from '@/services/storage.service'

export interface BootstrapResult {
  store: AppStore
  storage: Storage | null
  /** A one-time message to show after startup (e.g. data recovery). */
  notice: { kind: 'info' | 'warning'; messageKey: TranslationKey } | null
}

/**
 * Initial data strategy:
 * - valid saved data → use it (never overwritten by demo data)
 * - nothing saved yet → seed the demo workspace and save it
 * - unreadable data → back it up under a separate key, then start from demo data
 * - storage unavailable → demo data in memory only
 */
export function bootstrap(now: Date = new Date()): BootstrapResult {
  const storage = getStorage()
  const loaded = loadData(storage)

  if (loaded.status === 'ok') {
    return { store: createAppStore(stateFromData(loaded.data)), storage, notice: null }
  }

  const demo = createDemoData(now)
  if (loaded.status === 'invalid') backupRawData(loaded.raw, storage, now)
  saveData(demo, storage)

  let notice: BootstrapResult['notice'] = null
  if (!storage) {
    notice = { kind: 'warning', messageKey: 'storage_unavailable' }
  } else if (loaded.status === 'invalid') {
    notice = { kind: 'warning', messageKey: 'storage_recovered' }
  }
  return { store: createAppStore(stateFromData(demo)), storage, notice }
}
