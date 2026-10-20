import type { FocusSession } from '@/features/focus/focusTypes'
import { buildDailySeries, type DailyPoint } from '@/features/insights/insightsUtils'
import type { Project } from '@/features/projects/projectTypes'
import type { Task } from '@/features/tasks/taskTypes'
import { isTaskDone, isTaskOverdue, sortTasks } from '@/features/tasks/taskUtils'
import { addDaysToKey, timestampToDateKey } from '@/lib/date'
import type { DateKey, Timestamp } from '@/types/common'

export interface ActivityItem {
  id: string
  kind: 'created' | 'completed'
  task: Task
  at: Timestamp
}

export interface DashboardMetrics {
  dueToday: Task[]
  overdue: Task[]
  completedToday: number
  completedThisWeek: number
  completedPreviousWeek: number
  activeProjects: number
  week: DailyPoint[]
  topPriorities: Task[]
  upcoming: Task[]
  activity: ActivityItem[]
}

export function computeDashboardMetrics(
  tasks: Task[],
  projects: Project[],
  sessions: FocusSession[],
  pinnedIds: string[],
  today: DateKey,
): DashboardMetrics {
  const open = tasks.filter((task) => !isTaskDone(task))
  const week = buildDailySeries(tasks, sessions, addDaysToKey(today, -6), today)
  const previousWeek = buildDailySeries(tasks, sessions, addDaysToKey(today, -13), addDaysToKey(today, -7))
  const sum = (points: DailyPoint[]) => points.reduce((total, point) => total + point.completed, 0)

  const dueToday = open.filter((task) => task.dueDate === today)
  const overdue = sortTasks(
    open.filter((task) => isTaskOverdue(task, today)),
    'dueDate',
  )

  // Pinned priorities first, then the most important due/overdue work.
  const byId = new Map(tasks.map((task) => [task.id, task]))
  const pinned = pinnedIds.map((id) => byId.get(id)).filter((task): task is Task => task !== undefined && !isTaskDone(task))
  const candidates = sortTasks(
    open.filter((task) => !pinnedIds.includes(task.id) && task.dueDate !== null && task.dueDate <= today),
    'priority',
  )
  const topPriorities = [...pinned, ...candidates].slice(0, 3)

  const upcomingEnd = addDaysToKey(today, 7)
  const upcoming = sortTasks(
    open.filter((task) => task.dueDate !== null && task.dueDate > today && task.dueDate <= upcomingEnd),
    'dueDate',
  ).slice(0, 6)

  const activity: ActivityItem[] = tasks
    .flatMap((task): ActivityItem[] => [
      { id: `${task.id}-created`, kind: 'created', task, at: task.createdAt },
      ...(task.completedAt ? [{ id: `${task.id}-completed`, kind: 'completed' as const, task, at: task.completedAt }] : []),
    ])
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 7)

  return {
    dueToday,
    overdue,
    completedToday: tasks.filter((task) => task.completedAt && timestampToDateKey(task.completedAt) === today).length,
    completedThisWeek: sum(week),
    completedPreviousWeek: sum(previousWeek),
    activeProjects: projects.filter((project) => project.status === 'active').length,
    week,
    topPriorities,
    upcoming,
    activity,
  }
}
