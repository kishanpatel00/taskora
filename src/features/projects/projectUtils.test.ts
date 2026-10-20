import { describe, expect, it } from 'vitest'
import { createDemoData } from '@/data/demoData'
import { createAppStore, stateFromData } from '@/store'
import { makeProject, makeTask } from '@/test/factories'
import { selectProjectProgressMap } from './projectSelectors'
import { computeProgress, filterProjects, sortProjects } from './projectUtils'

describe('computeProgress', () => {
  it('returns 0% for a project without tasks', () => {
    expect(computeProgress([])).toEqual({ total: 0, completed: 0, percent: 0 })
  })

  it('rounds the share of done tasks', () => {
    const tasks = [makeTask({ status: 'done' }), makeTask({ status: 'todo' }), makeTask({ status: 'in_progress' })]
    expect(computeProgress(tasks)).toEqual({ total: 3, completed: 1, percent: 33 })
  })
})

describe('selectProjectProgressMap', () => {
  it('derives progress for every project from the task list', () => {
    const store = createAppStore(stateFromData(createDemoData(new Date(2026, 9, 20, 12))))
    const progress = selectProjectProgressMap(store.getState())
    expect(progress.project_office).toEqual({ total: 3, completed: 3, percent: 100 })
    expect(progress.project_portfolio?.total).toBe(10)
    // Memoized: same reference while tasks are unchanged.
    expect(selectProjectProgressMap(store.getState())).toBe(progress)
  })
})

describe('project filtering and sorting', () => {
  const projects = [
    makeProject({ id: 'a', name: 'Beta', status: 'active', dueDate: '2026-12-01' }),
    makeProject({ id: 'b', name: 'Alpha', status: 'completed', dueDate: null, description: 'Website relaunch' }),
  ]

  it('filters by search text and status', () => {
    expect(filterProjects(projects, 'website', 'all').map((p) => p.id)).toEqual(['b'])
    expect(filterProjects(projects, '', 'active').map((p) => p.id)).toEqual(['a'])
  })

  it('sorts by name, due date and progress', () => {
    const progress = { a: { total: 2, completed: 1, percent: 50 }, b: { total: 1, completed: 1, percent: 100 } }
    expect(sortProjects(projects, 'name', progress).map((p) => p.id)).toEqual(['b', 'a'])
    expect(sortProjects(projects, 'dueDate', progress).map((p) => p.id)).toEqual(['a', 'b'])
    expect(sortProjects(projects, 'progress', progress).map((p) => p.id)).toEqual(['b', 'a'])
  })
})
