import { addDaysToKey, timestampToDateKey } from '@/lib/date'
import { normalizeText } from '@/lib/format'
import type { DateKey } from '@/types/common'
import { PRIORITY_RANK, TASK_STATUSES, type Task, type TaskFilters, type TaskSortKey } from './taskTypes'

export function isTaskDone(task: Task): boolean {
  return task.status === 'done'
}

export function isTaskOverdue(task: Task, today: DateKey): boolean {
  return !isTaskDone(task) && task.dueDate !== null && task.dueDate < today
}

export function isTaskDueOn(task: Task, date: DateKey): boolean {
  return task.dueDate === date
}

export function getSubtaskProgress(task: Task): { completed: number; total: number } {
  return {
    completed: task.subtasks.filter((subtask) => subtask.completed).length,
    total: task.subtasks.length,
  }
}

function matchesSearch(task: Task, query: string): boolean {
  if (!query) return true
  const haystack = normalizeText([task.title, task.description, ...task.tags].join(' '))
  return normalizeText(query)
    .split(' ')
    .every((word) => haystack.includes(word))
}

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const { search = '', projectId = 'all', priority = 'all', status = 'all', tag = 'all', includeCompleted = true } = filters
  return tasks.filter((task) => {
    if (!includeCompleted && isTaskDone(task)) return false
    if (projectId === 'inbox' && task.projectId !== null) return false
    if (projectId !== 'all' && projectId !== 'inbox' && task.projectId !== projectId) return false
    if (priority !== 'all' && task.priority !== priority) return false
    if (status !== 'all' && task.status !== status) return false
    if (tag !== 'all' && !task.tags.includes(tag)) return false
    return matchesSearch(task, search)
  })
}

/** Tasks without a due date sort last when sorting by due date. */
export function sortTasks(tasks: Task[], sortKey: TaskSortKey): Task[] {
  const sorted = [...tasks]
  switch (sortKey) {
    case 'manual':
      return sorted.sort((a, b) => a.order - b.order)
    case 'dueDate':
      return sorted.sort((a, b) => {
        if (a.dueDate === b.dueDate) return PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority]
        if (a.dueDate === null) return 1
        if (b.dueDate === null) return -1
        return a.dueDate < b.dueDate ? -1 : 1
      })
    case 'priority':
      return sorted.sort(
        (a, b) =>
          PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority] || (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'),
      )
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title))
    case 'createdAt':
      return sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'status':
      return sorted.sort((a, b) => TASK_STATUSES.indexOf(a.status) - TASK_STATUSES.indexOf(b.status) || a.order - b.order)
  }
}

export interface DayGroups {
  overdue: Task[]
  day: Task[]
  upcoming: Task[]
  completed: Task[]
}

/**
 * Groups tasks for the My Day planner.
 * - overdue: open tasks due before the real today
 * - day: open tasks due on the selected date
 * - upcoming: open tasks due within `upcomingDays` after the selected date
 * - completed: tasks completed on the selected date
 */
export function groupTasksForDay(tasks: Task[], selected: DateKey, today: DateKey, upcomingDays = 7): DayGroups {
  const upcomingEnd = addDaysToKey(selected, upcomingDays)
  const groups: DayGroups = { overdue: [], day: [], upcoming: [], completed: [] }
  for (const task of tasks) {
    if (isTaskDone(task)) {
      if (task.completedAt && timestampToDateKey(task.completedAt) === selected) groups.completed.push(task)
      continue
    }
    if (!task.dueDate) continue
    if (task.dueDate < today && selected >= today) groups.overdue.push(task)
    else if (task.dueDate === selected) groups.day.push(task)
    else if (task.dueDate > selected && task.dueDate <= upcomingEnd) groups.upcoming.push(task)
  }
  groups.overdue = sortTasks(groups.overdue, 'dueDate')
  groups.day = sortTasks(groups.day, 'priority')
  groups.upcoming = sortTasks(groups.upcoming, 'dueDate')
  groups.completed.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
  return groups
}

/** Applies a saved manual order; tasks not in the saved order keep their relative order at the end. */
export function applyManualOrder(tasks: Task[], orderedIds: string[] | undefined): Task[] {
  if (!orderedIds || orderedIds.length === 0) return tasks
  const position = new Map(orderedIds.map((id, index) => [id, index]))
  return [...tasks].sort(
    (a, b) => (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (position.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  )
}

export function collectTags(tasks: Task[]): string[] {
  return [...new Set(tasks.flatMap((task) => task.tags))].sort()
}

export type DueFilter = 'any' | 'overdue' | 'today' | 'week' | 'none'

/** Due-date bucket filter used by My Tasks. "week" = due within the next 7 days (including today). */
export function matchesDueFilter(task: Task, filter: DueFilter, today: DateKey): boolean {
  switch (filter) {
    case 'any':
      return true
    case 'overdue':
      return isTaskOverdue(task, today)
    case 'today':
      return task.dueDate === today
    case 'week':
      return task.dueDate !== null && task.dueDate >= today && task.dueDate <= addDaysToKey(today, 6)
    case 'none':
      return task.dueDate === null
  }
}
