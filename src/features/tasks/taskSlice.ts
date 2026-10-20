import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { projectDeleted } from '@/features/projects/projectSlice'
import { createId } from '@/lib/ids'
import { dataReplaced } from '@/store/sharedActions'
import type { Timestamp } from '@/types/common'
import type { Subtask, Task, TaskInput, TaskStatus } from './taskTypes'

export const tasksAdapter = createEntityAdapter<Task>()

export type NormalizedTaskInput = Omit<TaskInput, 'subtasks'> & { subtasks: Subtask[] }

interface TaskCreatedPayload {
  id: string
  now: Timestamp
  input: NormalizedTaskInput
}

/** Assigns ids/order to subtasks and trims text. Runs in action `prepare` so reducers stay pure. */
export function normalizeTaskInput<T extends Partial<TaskInput>>(input: T): Omit<T, 'subtasks'> & { subtasks?: Subtask[] } {
  const { subtasks, ...rest } = input
  const normalized: Omit<T, 'subtasks'> & { subtasks?: Subtask[] } = { ...rest }
  if (typeof rest.title === 'string') normalized.title = rest.title.trim()
  if (typeof rest.description === 'string') normalized.description = rest.description.trim()
  if (rest.tags) normalized.tags = [...new Set(rest.tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))]
  if (subtasks) {
    normalized.subtasks = subtasks
      .filter((subtask) => subtask.title.trim() !== '')
      .map((subtask, index) => ({
        id: subtask.id ?? createId('sub'),
        title: subtask.title.trim(),
        completed: subtask.completed,
        order: index,
      }))
  }
  return normalized
}

function prepareCreate(input: TaskInput, options: { id?: string; now?: Timestamp } = {}): { payload: TaskCreatedPayload } {
  const normalized = normalizeTaskInput(input)
  return {
    payload: {
      id: options.id ?? createId('task'),
      now: options.now ?? new Date().toISOString(),
      input: { ...normalized, subtasks: normalized.subtasks ?? [] },
    },
  }
}

type TasksState = ReturnType<typeof tasksAdapter.getInitialState>

function columnTasks(state: TasksState, projectId: string | null, status: TaskStatus, excludeId?: string): Task[] {
  return Object.values(state.entities)
    .filter((task) => task.projectId === projectId && task.status === status && task.id !== excludeId)
    .sort((a, b) => a.order - b.order)
}

function nextOrder(state: TasksState, projectId: string | null, status: TaskStatus): number {
  const column = columnTasks(state, projectId, status)
  const last = column[column.length - 1]
  return last ? last.order + 1 : 0
}

/** Keeps `completedAt` in sync with the status transition. */
function applyStatus(task: Task, status: TaskStatus, now: Timestamp): void {
  if (status === 'done' && task.status !== 'done') task.completedAt = now
  if (status !== 'done') task.completedAt = null
  task.status = status
}

function addTask(state: TasksState, { id, now, input }: TaskCreatedPayload): void {
  if (state.entities[id]) return
  tasksAdapter.addOne(state, {
    ...input,
    id,
    createdAt: now,
    updatedAt: now,
    completedAt: input.status === 'done' ? now : null,
    order: nextOrder(state, input.projectId, input.status),
  })
}

const taskSlice = createSlice({
  name: 'tasks',
  initialState: tasksAdapter.getInitialState(),
  reducers: {
    taskCreated: {
      reducer(state, action: PayloadAction<TaskCreatedPayload>) {
        addTask(state, action.payload)
      },
      prepare: prepareCreate,
    },
    tasksCreated: {
      reducer(state, action: PayloadAction<TaskCreatedPayload[]>) {
        for (const payload of action.payload) addTask(state, payload)
      },
      prepare(inputs: TaskInput[], now: Timestamp = new Date().toISOString()) {
        return { payload: inputs.map((input) => prepareCreate(input, { now }).payload) }
      },
    },
    taskUpdated: {
      reducer(
        state,
        action: PayloadAction<{ id: string; changes: Partial<NormalizedTaskInput>; now: Timestamp }>,
      ) {
        const { id, changes, now } = action.payload
        const task = state.entities[id]
        if (!task) return
        const { status, projectId, ...rest } = changes
        const movesColumn =
          (status !== undefined && status !== task.status) ||
          (projectId !== undefined && projectId !== task.projectId)
        Object.assign(task, rest)
        if (movesColumn) {
          const targetProject = projectId === undefined ? task.projectId : projectId
          const targetStatus = status ?? task.status
          task.order = nextOrder(state, targetProject, targetStatus)
          task.projectId = targetProject
          applyStatus(task, targetStatus, now)
        }
        task.updatedAt = now
      },
      prepare(id: string, changes: Partial<TaskInput>, now: Timestamp = new Date().toISOString()) {
        return { payload: { id, changes: normalizeTaskInput(changes), now } }
      },
    },
    taskCompletionToggled: {
      reducer(state, action: PayloadAction<{ id: string; now: Timestamp }>) {
        const task = state.entities[action.payload.id]
        if (!task) return
        const status: TaskStatus = task.status === 'done' ? 'todo' : 'done'
        task.order = nextOrder(state, task.projectId, status)
        applyStatus(task, status, action.payload.now)
        task.updatedAt = action.payload.now
      },
      prepare(id: string, now: Timestamp = new Date().toISOString()) {
        return { payload: { id, now } }
      },
    },
    /** Drag-and-drop: moves a task to `toStatus` at `toIndex` within its project's column. */
    taskMoved: {
      reducer(state, action: PayloadAction<{ id: string; toStatus: TaskStatus; toIndex: number; now: Timestamp }>) {
        const { id, toStatus, toIndex, now } = action.payload
        const task = state.entities[id]
        if (!task) return
        const siblings = columnTasks(state, task.projectId, toStatus, id)
        const index = Math.max(0, Math.min(toIndex, siblings.length))
        siblings.splice(index, 0, task)
        siblings.forEach((sibling, position) => {
          sibling.order = position
        })
        if (task.status !== toStatus) applyStatus(task, toStatus, now)
        task.updatedAt = now
      },
      prepare(payload: { id: string; toStatus: TaskStatus; toIndex: number }) {
        return { payload: { ...payload, now: new Date().toISOString() } }
      },
    },
    subtaskToggled: {
      reducer(state, action: PayloadAction<{ taskId: string; subtaskId: string; now: Timestamp }>) {
        const task = state.entities[action.payload.taskId]
        const subtask = task?.subtasks.find((item) => item.id === action.payload.subtaskId)
        if (!task || !subtask) return
        subtask.completed = !subtask.completed
        task.updatedAt = action.payload.now
      },
      prepare(taskId: string, subtaskId: string) {
        return { payload: { taskId, subtaskId, now: new Date().toISOString() } }
      },
    },
    taskDeleted(state, action: PayloadAction<string>) {
      tasksAdapter.removeOne(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(dataReplaced, (state, action) => {
        tasksAdapter.setAll(state, action.payload.tasks)
      })
      .addCase(projectDeleted, (state, action) => {
        // Policy: deleting a project keeps its tasks and moves them to the Inbox.
        const inboxOrder = Object.values(state.entities).filter((task) => task.projectId === null).length
        let offset = 0
        for (const task of Object.values(state.entities)) {
          if (task.projectId !== action.payload.id) continue
          task.projectId = null
          task.order = inboxOrder + offset++
          task.updatedAt = action.payload.now
        }
      })
  },
})

export const {
  taskCreated,
  tasksCreated,
  taskUpdated,
  taskCompletionToggled,
  taskMoved,
  subtaskToggled,
  taskDeleted,
} = taskSlice.actions

export default taskSlice.reducer
