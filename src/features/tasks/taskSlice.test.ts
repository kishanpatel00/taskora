import { describe, expect, it } from 'vitest'
import { priorityPinToggled } from '@/features/planner/plannerSlice'
import { projectCreated, projectDeleted } from '@/features/projects/projectSlice'
import { createAppStore } from '@/store'
import { makeTaskInput } from '@/test/factories'
import { selectAllTasks, selectTaskById } from './taskSelectors'
import { subtaskToggled, taskCompletionToggled, taskCreated, taskDeleted, taskMoved, taskUpdated } from './taskSlice'

const NOW = '2026-10-20T10:00:00.000Z'
const LATER = '2026-10-20T12:00:00.000Z'

function setup() {
  const store = createAppStore()
  const create = (overrides = {}, id = 'task_a') => store.dispatch(taskCreated(makeTaskInput(overrides), { id, now: NOW }))
  const task = (id = 'task_a') => selectTaskById(store.getState(), id)
  return { store, create, task }
}

describe('task creation', () => {
  it('creates a task with timestamps, trimmed text and normalized subtasks', () => {
    const { create, task } = setup()
    create({
      title: '  Ship the release  ',
      tags: ['Release', 'release', ' qa '],
      subtasks: [
        { title: 'Changelog', completed: false },
        { title: '   ', completed: false },
      ],
    })

    const created = task()
    expect(created).toMatchObject({
      title: 'Ship the release',
      tags: ['release', 'qa'],
      createdAt: NOW,
      updatedAt: NOW,
      completedAt: null,
      order: 0,
    })
    expect(created?.subtasks).toHaveLength(1)
    expect(created?.subtasks[0]).toMatchObject({ title: 'Changelog', completed: false, order: 0 })
    expect(created?.subtasks[0]?.id).toMatch(/^sub_/)
  })

  it('appends new tasks to the end of their column', () => {
    const { create, task } = setup()
    create({}, 'task_a')
    create({}, 'task_b')
    expect(task('task_b')?.order).toBe(1)
  })

  it('ignores a duplicate id instead of overwriting', () => {
    const { store, create } = setup()
    create({ title: 'First' }, 'task_a')
    create({ title: 'Second' }, 'task_a')
    expect(selectAllTasks(store.getState())).toHaveLength(1)
    expect(selectAllTasks(store.getState())[0]?.title).toBe('First')
  })
})

describe('task editing', () => {
  it('updates fields and the updatedAt timestamp', () => {
    const { store, create, task } = setup()
    create()
    store.dispatch(taskUpdated('task_a', { title: 'Renamed', priority: 'urgent' }, LATER))
    expect(task()).toMatchObject({ title: 'Renamed', priority: 'urgent', updatedAt: LATER, createdAt: NOW })
  })

  it('sets and clears completedAt when the status changes', () => {
    const { store, create, task } = setup()
    create()
    store.dispatch(taskUpdated('task_a', { status: 'done' }, LATER))
    expect(task()?.completedAt).toBe(LATER)
    store.dispatch(taskUpdated('task_a', { status: 'in_progress' }, LATER))
    expect(task()?.completedAt).toBeNull()
  })

  it('toggles a subtask', () => {
    const { store, create, task } = setup()
    create({ subtasks: [{ id: 'sub_1', title: 'Step', completed: false }] })
    store.dispatch(subtaskToggled('task_a', 'sub_1'))
    expect(task()?.subtasks[0]?.completed).toBe(true)
  })
})

describe('task completion', () => {
  it('completes and reopens a task', () => {
    const { store, create, task } = setup()
    create()
    store.dispatch(taskCompletionToggled('task_a', LATER))
    expect(task()).toMatchObject({ status: 'done', completedAt: LATER })
    store.dispatch(taskCompletionToggled('task_a', LATER))
    expect(task()).toMatchObject({ status: 'todo', completedAt: null })
  })
})

describe('task deletion', () => {
  it('removes the task and any pinned reference to it', () => {
    const { store, create } = setup()
    create()
    store.dispatch(priorityPinToggled({ date: '2026-10-20', taskId: 'task_a' }))
    store.dispatch(taskDeleted('task_a'))
    expect(selectAllTasks(store.getState())).toHaveLength(0)
    expect(store.getState().planner.pinned['2026-10-20']).toEqual([])
  })
})

describe('drag and drop moves', () => {
  it('moves a task to another column at a position and renumbers orders', () => {
    const { store, create, task } = setup()
    create({ status: 'todo' }, 'a')
    create({ status: 'done' }, 'x')
    create({ status: 'done' }, 'y')

    store.dispatch(taskMoved({ id: 'a', toStatus: 'done', toIndex: 1 }))

    expect(task('a')?.status).toBe('done')
    expect(task('a')?.completedAt).not.toBeNull()
    expect([task('x')?.order, task('a')?.order, task('y')?.order]).toEqual([0, 1, 2])
    expect(selectAllTasks(store.getState())).toHaveLength(3)
  })

  it('reorders within the same column', () => {
    const { store, create, task } = setup()
    create({}, 'a')
    create({}, 'b')
    create({}, 'c')
    store.dispatch(taskMoved({ id: 'c', toStatus: 'todo', toIndex: 0 }))
    expect([task('c')?.order, task('a')?.order, task('b')?.order]).toEqual([0, 1, 2])
  })
})

describe('project deletion policy', () => {
  it('moves the project tasks to the Inbox instead of deleting them', () => {
    const { store, create, task } = setup()
    store.dispatch(
      projectCreated(
        { name: 'Launch', description: '', color: 'violet', icon: 'rocket', status: 'active', startDate: null, dueDate: null },
        { id: 'p1', now: NOW },
      ),
    )
    create({ projectId: 'p1' })
    store.dispatch(projectDeleted('p1', LATER))
    expect(task()).toMatchObject({ projectId: null, updatedAt: LATER })
  })
})
