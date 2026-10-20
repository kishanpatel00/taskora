import { beforeEach, describe, expect, it, vi } from 'vitest'
import { bootstrap } from '@/app/bootstrap'
import { createDemoData } from '@/data/demoData'
import { selectAllTasks } from '@/features/tasks/taskSelectors'
import { parsePersistedData } from './persistedData'
import { loadData, saveData, STORAGE_KEY } from './storage.service'

const NOW = new Date(2026, 9, 20, 12)

beforeEach(() => localStorage.clear())

describe('loadData / saveData', () => {
  it('reports empty storage', () => {
    expect(loadData(localStorage)).toEqual({ status: 'empty' })
  })

  it('round-trips saved data', () => {
    const data = createDemoData(NOW)
    expect(saveData(data, localStorage)).toEqual({ ok: true })
    const loaded = loadData(localStorage)
    expect(loaded.status).toBe('ok')
    if (loaded.status === 'ok') expect(loaded.data).toEqual(data)
  })

  it('flags malformed JSON as invalid without throwing', () => {
    localStorage.setItem(STORAGE_KEY, '{not json')
    expect(loadData(localStorage)).toMatchObject({ status: 'invalid', error: 'Saved data is not valid JSON' })
  })

  it('flags structurally invalid data', () => {
    const data = createDemoData(NOW)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...data, tasks: [{ id: 'x', title: '' }] }))
    expect(loadData(localStorage).status).toBe('invalid')
  })

  it('reports quota errors instead of throwing', () => {
    const storage = {
      ...localStorage,
      setItem: vi.fn(() => {
        throw new DOMException('full', 'QuotaExceededError')
      }),
    } as unknown as Storage
    expect(saveData(createDemoData(NOW), storage)).toEqual({ ok: false, reason: 'quota' })
  })

  it('returns unavailable when there is no storage', () => {
    expect(saveData(createDemoData(NOW), null)).toEqual({ ok: false, reason: 'unavailable' })
    expect(loadData(null)).toEqual({ status: 'empty' })
  })
})

describe('parsePersistedData repairs', () => {
  it('moves tasks with an unknown project to the Inbox and drops dangling planner ids', () => {
    const data = createDemoData(NOW)
    const [first] = data.tasks
    if (!first) throw new Error('demo data has no tasks')
    const raw = {
      ...data,
      tasks: [{ ...first, projectId: 'project_missing' }],
      planner: { pinned: { '2026-10-20': [first.id, 'task_missing'] }, order: {} },
    }
    const result = parsePersistedData(raw)
    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.data.tasks[0]?.projectId).toBeNull()
    expect(result.data.planner.pinned['2026-10-20']).toEqual([first.id])
  })

  it('falls back to default settings values that are invalid', () => {
    const data = createDemoData(NOW)
    const result = parsePersistedData({ ...data, settings: { ...data.settings, theme: 'neon', defaultFocusMinutes: -5 } })
    expect(result.success && result.data.settings.theme).toBe('light')
    expect(result.success && result.data.settings.defaultFocusMinutes).toBe(25)
  })

  it('rejects duplicate ids', () => {
    const data = createDemoData(NOW)
    const result = parsePersistedData({ ...data, tasks: [...data.tasks, data.tasks[0]] })
    expect(result).toMatchObject({ success: false })
  })
})

describe('bootstrap', () => {
  it('seeds demo data on first launch and saves it', () => {
    const { store, notice } = bootstrap(NOW)
    expect(selectAllTasks(store.getState()).length).toBeGreaterThan(20)
    expect(notice).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull()
  })

  it('never replaces valid saved data with demo data', () => {
    const data = createDemoData(NOW)
    saveData({ ...data, tasks: data.tasks.slice(0, 2) }, localStorage)
    const { store } = bootstrap(NOW)
    expect(selectAllTasks(store.getState())).toHaveLength(2)
  })

  it('backs up corrupt data, loads demo data and explains what happened', () => {
    localStorage.setItem(STORAGE_KEY, 'corrupted!')
    const { store, notice } = bootstrap(NOW)
    expect(notice?.kind).toBe('warning')
    expect(selectAllTasks(store.getState()).length).toBeGreaterThan(0)
    const backupKey = Object.keys(localStorage).find((key) => key.startsWith('taskora:backup:'))
    expect(backupKey && localStorage.getItem(backupKey)).toBe('corrupted!')
  })
})
