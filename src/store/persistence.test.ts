import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { taskCreated } from '@/features/tasks/taskSlice'
import { loadData } from '@/services/storage.service'
import { makeTaskInput } from '@/test/factories'
import { createAppStore } from './index'
import { startPersistence } from './persistence'

beforeEach(() => vi.useFakeTimers())
afterEach(() => vi.useRealTimers())

describe('startPersistence', () => {
  it('debounces writes and saves the latest state', () => {
    const store = createAppStore()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const stop = startPersistence(store, { storage: localStorage, delayMs: 300 })

    store.dispatch(taskCreated(makeTaskInput({ title: 'One' })))
    store.dispatch(taskCreated(makeTaskInput({ title: 'Two' })))
    expect(setItem).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)
    expect(setItem).toHaveBeenCalledTimes(1)
    const loaded = loadData(localStorage)
    expect(loaded.status === 'ok' && loaded.data.tasks.map((task) => task.title)).toEqual(['One', 'Two'])
    stop()
  })

  it('does not write when nothing changed', () => {
    const store = createAppStore()
    const setItem = vi.spyOn(Storage.prototype, 'setItem')
    const stop = startPersistence(store, { storage: localStorage })
    store.dispatch({ type: 'unknown/action' })
    vi.advanceTimersByTime(1000)
    expect(setItem).not.toHaveBeenCalled()
    stop()
  })

  it('flushes pending changes when the page is hidden', () => {
    const store = createAppStore()
    const stop = startPersistence(store, { storage: localStorage, delayMs: 10_000 })
    store.dispatch(taskCreated(makeTaskInput()))
    window.dispatchEvent(new Event('pagehide'))
    expect(loadData(localStorage).status).toBe('ok')
    stop()
  })

  it('reports write failures', () => {
    const store = createAppStore()
    const onError = vi.fn()
    const stop = startPersistence(store, { storage: null, delayMs: 10, onError })
    store.dispatch(taskCreated(makeTaskInput()))
    vi.advanceTimersByTime(10)
    expect(onError).toHaveBeenCalledWith({ ok: false, reason: 'unavailable' })
    stop()
  })
})
