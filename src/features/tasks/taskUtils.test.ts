import { describe, expect, it } from 'vitest'
import { makeTask } from '@/test/factories'
import { applyManualOrder, filterTasks, groupTasksForDay, isTaskOverdue, sortTasks } from './taskUtils'

const TODAY = '2026-10-20'
const at = (date: string) => `${date}T10:00:00`

describe('filterTasks', () => {
  const tasks = [
    makeTask({ id: 'a', title: 'Design homepage', priority: 'high', projectId: 'p1', tags: ['design'] }),
    makeTask({ id: 'b', title: 'Write copy', priority: 'low', projectId: 'p1', status: 'done' }),
    makeTask({ id: 'c', title: 'Book flights', priority: 'high', projectId: null, description: 'Homepage-free task' }),
  ]
  const ids = (filters: Parameters<typeof filterTasks>[1]) => filterTasks(tasks, filters).map((task) => task.id)

  it('matches every search word across title, description and tags', () => {
    expect(ids({ search: 'homepage' })).toEqual(['a', 'c'])
    expect(ids({ search: 'design homepage' })).toEqual(['a'])
  })

  it('filters by project, inbox, priority, tag and completion', () => {
    expect(ids({ projectId: 'p1' })).toEqual(['a', 'b'])
    expect(ids({ projectId: 'inbox' })).toEqual(['c'])
    expect(ids({ priority: 'high' })).toEqual(['a', 'c'])
    expect(ids({ tag: 'design' })).toEqual(['a'])
    expect(ids({ includeCompleted: false })).toEqual(['a', 'c'])
  })
})

describe('sortTasks', () => {
  const tasks = [
    makeTask({ id: 'none', title: 'B', dueDate: null, priority: 'urgent' }),
    makeTask({ id: 'late', title: 'C', dueDate: '2026-10-25', priority: 'low' }),
    makeTask({ id: 'soon', title: 'A', dueDate: '2026-10-21', priority: 'medium' }),
  ]

  it('sorts by due date with undated tasks last', () => {
    expect(sortTasks(tasks, 'dueDate').map((task) => task.id)).toEqual(['soon', 'late', 'none'])
  })

  it('sorts by priority (most important first) and by title', () => {
    expect(sortTasks(tasks, 'priority').map((task) => task.id)).toEqual(['none', 'soon', 'late'])
    expect(sortTasks(tasks, 'title').map((task) => task.title)).toEqual(['A', 'B', 'C'])
  })

  it('does not mutate the input array', () => {
    const copy = [...tasks]
    sortTasks(tasks, 'title')
    expect(tasks).toEqual(copy)
  })
})

describe('groupTasksForDay', () => {
  const tasks = [
    makeTask({ id: 'overdue', dueDate: '2026-10-18' }),
    makeTask({ id: 'today', dueDate: TODAY }),
    makeTask({ id: 'upcoming', dueDate: '2026-10-24' }),
    makeTask({ id: 'far', dueDate: '2026-11-30' }),
    makeTask({ id: 'done-today', status: 'done', dueDate: '2026-10-19', completedAt: at(TODAY) }),
    makeTask({ id: 'done-earlier', status: 'done', dueDate: TODAY, completedAt: at('2026-10-15') }),
    makeTask({ id: 'undated', dueDate: null }),
  ]

  it('groups into overdue, day, upcoming and completed', () => {
    const groups = groupTasksForDay(tasks, TODAY, TODAY)
    expect(groups.overdue.map((task) => task.id)).toEqual(['overdue'])
    expect(groups.day.map((task) => task.id)).toEqual(['today'])
    expect(groups.upcoming.map((task) => task.id)).toEqual(['upcoming'])
    expect(groups.completed.map((task) => task.id)).toEqual(['done-today'])
  })

  it('does not show overdue tasks when viewing a past date', () => {
    const groups = groupTasksForDay(tasks, '2026-10-18', TODAY)
    expect(groups.overdue).toEqual([])
    expect(groups.day.map((task) => task.id)).toEqual(['overdue'])
  })

  it('identifies overdue tasks', () => {
    expect(isTaskOverdue(makeTask({ dueDate: '2026-10-19' }), TODAY)).toBe(true)
    expect(isTaskOverdue(makeTask({ dueDate: '2026-10-19', status: 'done' }), TODAY)).toBe(false)
    expect(isTaskOverdue(makeTask({ dueDate: TODAY }), TODAY)).toBe(false)
  })
})

describe('applyManualOrder', () => {
  it('applies saved order and keeps unknown tasks at the end', () => {
    const tasks = ['a', 'b', 'c'].map((id) => makeTask({ id }))
    expect(applyManualOrder(tasks, ['c', 'a']).map((task) => task.id)).toEqual(['c', 'a', 'b'])
  })
})
