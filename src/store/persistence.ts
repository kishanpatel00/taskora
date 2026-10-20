import { saveData, type SaveResult } from '@/services/storage.service'
import { dataFromState, type AppStore } from './index'

interface PersistenceOptions {
  storage: Storage | null
  delayMs?: number
  onError?: (result: Extract<SaveResult, { ok: false }>) => void
}

/**
 * Saves the store to localStorage after changes, debounced. Persistence lives
 * outside the reducers; only state reference changes trigger a write, so
 * there are no save loops. Pending writes are flushed when the page is hidden.
 */
export function startPersistence(store: AppStore, { storage, delayMs = 400, onError }: PersistenceOptions): () => void {
  let lastState = store.getState()
  let timeout: ReturnType<typeof setTimeout> | undefined
  let pending = false

  const flush = () => {
    clearTimeout(timeout)
    if (!pending) return
    pending = false
    const result = saveData(dataFromState(store.getState()), storage)
    if (!result.ok) onError?.(result)
  }

  const unsubscribe = store.subscribe(() => {
    const state = store.getState()
    if (state === lastState) return
    lastState = state
    pending = true
    clearTimeout(timeout)
    timeout = setTimeout(flush, delayMs)
  })

  const onHide = () => flush()
  window.addEventListener('pagehide', onHide)
  document.addEventListener('visibilitychange', onHide)

  return () => {
    flush()
    unsubscribe()
    window.removeEventListener('pagehide', onHide)
    document.removeEventListener('visibilitychange', onHide)
  }
}
