import { describe, expect, it } from 'vitest'
import { createDemoData } from '@/data/demoData'
import { selectAllTasks } from '@/features/tasks/taskSelectors'
import { createAppStore } from '@/store'
import { dataReplaced } from '@/store/sharedActions'
import { exportFileName, parseImportText, serializeData } from './export.service'

const NOW = new Date(2026, 9, 20, 12)

describe('import validation', () => {
  it('accepts a file produced by export', () => {
    const data = createDemoData(NOW)
    const result = parseImportText(serializeData(data))
    expect(result).toEqual({ ok: true, data })
  })

  it.each([
    ['not json', 'import_error_not_json'],
    ['[1, 2, 3]', 'import_error_not_taskora'],
    ['{"hello": "world"}', 'import_error_not_taskora'],
  ])('rejects %s', (text, error) => {
    expect(parseImportText(text)).toEqual({ ok: false, error })
  })

  it('rejects an unsupported version and invalid fields with a helpful message', () => {
    const data = createDemoData(NOW)
    expect(parseImportText(JSON.stringify({ ...data, version: 99 })).ok).toBe(false)
    const badTask = { ...data.tasks[0], priority: 'critical' }
    const result = parseImportText(JSON.stringify({ ...data, tasks: [badTask] }))
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result).toMatchObject({ error: 'import_error_invalid', detail: 'tasks.0.priority' })
  })

  it('leaves state untouched until a valid import is applied', () => {
    const store = createAppStore()
    const result = parseImportText('{"version":1,"tasks":"oops"}')
    expect(result.ok).toBe(false)
    expect(selectAllTasks(store.getState())).toHaveLength(0)

    const valid = parseImportText(serializeData(createDemoData(NOW)))
    if (valid.ok) store.dispatch(dataReplaced(valid.data))
    expect(selectAllTasks(store.getState()).length).toBeGreaterThan(0)
  })

  it('names exports by date', () => {
    expect(exportFileName(NOW)).toBe('taskora-backup-2026-10-20.json')
  })
})
