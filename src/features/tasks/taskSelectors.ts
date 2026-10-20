import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store'
import type { DateKey } from '@/types/common'
import { tasksAdapter } from './taskSlice'
import type { Task } from './taskTypes'
import { isTaskDone, isTaskOverdue } from './taskUtils'

const adapterSelectors = tasksAdapter.getSelectors((state: RootState) => state.tasks)

export const selectAllTasks = adapterSelectors.selectAll
export const selectTaskEntities = adapterSelectors.selectEntities
export const selectTaskById = adapterSelectors.selectById

export const INBOX_KEY = 'inbox'

/** Tasks grouped by project id (`inbox` for tasks without a project). */
export const selectTasksByProject = createSelector([selectAllTasks], (tasks) => {
  const groups: Record<string, Task[]> = {}
  for (const task of tasks) {
    const key = task.projectId ?? INBOX_KEY
    ;(groups[key] ??= []).push(task)
  }
  return groups
})

export const selectOpenTasks = createSelector([selectAllTasks], (tasks) => tasks.filter((task) => !isTaskDone(task)))

/** Open tasks that are overdue or due on `today` — drives the notification bell. */
export const selectAttentionTasks = createSelector(
  [selectOpenTasks, (_state: RootState, today: DateKey) => today],
  (tasks, today) =>
    tasks
      .filter((task) => task.dueDate !== null && task.dueDate <= today)
      .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? '')),
)

export const selectDueTodayCount = createSelector(
  [selectOpenTasks, (_state: RootState, today: DateKey) => today],
  (tasks, today) => tasks.filter((task) => task.dueDate === today).length,
)

export const selectOverdueTasks = createSelector(
  [selectOpenTasks, (_state: RootState, today: DateKey) => today],
  (tasks, today) => tasks.filter((task) => isTaskOverdue(task, today)),
)
