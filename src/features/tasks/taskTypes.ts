import type { TranslationKey } from '@/i18n/translation.types'
import type { DateKey, Timestamp } from '@/types/common'

export const TASK_STATUSES = ['backlog', 'todo', 'in_progress', 'done'] as const
export type TaskStatus = (typeof TASK_STATUSES)[number]

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const
export type TaskPriority = (typeof TASK_PRIORITIES)[number]

/** Translation keys for display names; render with `t(STATUS_LABEL_KEYS[status])`. */
export const STATUS_LABEL_KEYS: Record<TaskStatus, TranslationKey> = {
  backlog: 'task_status_backlog',
  todo: 'task_status_todo',
  in_progress: 'task_status_in_progress',
  done: 'task_status_done',
}

export const PRIORITY_LABEL_KEYS: Record<TaskPriority, TranslationKey> = {
  low: 'task_priority_low',
  medium: 'task_priority_medium',
  high: 'task_priority_high',
  urgent: 'task_priority_urgent',
}

/** Higher number = more important. Used for sorting. */
export const PRIORITY_RANK: Record<TaskPriority, number> = {
  low: 0,
  medium: 1,
  high: 2,
  urgent: 3,
}

export interface Subtask {
  id: string
  title: string
  completed: boolean
  order: number
}

export interface Task {
  id: string
  title: string
  description: string
  /** `null` means the task lives in the Inbox (no project). */
  projectId: string | null
  status: TaskStatus
  priority: TaskPriority
  startDate: DateKey | null
  dueDate: DateKey | null
  tags: string[]
  estimatedMinutes: number | null
  subtasks: Subtask[]
  createdAt: Timestamp
  updatedAt: Timestamp
  completedAt: Timestamp | null
  /** Position within its status column (scoped to the project). */
  order: number
}

/** Editable fields supplied when creating or updating a task. */
export interface TaskInput {
  title: string
  description: string
  projectId: string | null
  status: TaskStatus
  priority: TaskPriority
  startDate: DateKey | null
  dueDate: DateKey | null
  tags: string[]
  estimatedMinutes: number | null
  subtasks: Array<Pick<Subtask, 'title' | 'completed'> & { id?: string }>
}

export type TaskSortKey = 'manual' | 'dueDate' | 'priority' | 'title' | 'createdAt' | 'status'

export interface TaskFilters {
  search?: string
  /** A project id, `'inbox'` for tasks without a project, or `'all'`. */
  projectId?: string
  priority?: TaskPriority | 'all'
  status?: TaskStatus | 'all'
  /** A tag, or `'all'`. */
  tag?: string
  includeCompleted?: boolean
}
