import type { FocusSession } from '@/features/focus/focusTypes'
import { PRIORITY_LABEL_KEYS, TASK_PRIORITIES, type Task, type TaskPriority } from '@/features/tasks/taskTypes'
import type { TranslationKey } from '@/i18n/translation.types'
import { isTaskDone } from '@/features/tasks/taskUtils'
import { addDaysToKey, dateKeyRange, timestampToDateKey, weekStartKey } from '@/lib/date'
import type { DateKey, WeekStartsOn } from '@/types/common'

export interface DailyPoint {
  date: DateKey
  created: number
  completed: number
  focusMinutes: number
  focusSessions: number
}

/** One point per day in [start, end], counting real timestamps only. */
export function buildDailySeries(tasks: Task[], sessions: FocusSession[], start: DateKey, end: DateKey): DailyPoint[] {
  const points = new Map<DateKey, DailyPoint>(
    dateKeyRange(start, end).map((date) => [date, { date, created: 0, completed: 0, focusMinutes: 0, focusSessions: 0 }]),
  )
  for (const task of tasks) {
    const created = points.get(timestampToDateKey(task.createdAt))
    if (created) created.created++
    if (task.completedAt) {
      const completed = points.get(timestampToDateKey(task.completedAt))
      if (completed) completed.completed++
    }
  }
  for (const session of sessions) {
    const point = points.get(timestampToDateKey(session.startedAt))
    if (!point) continue
    point.focusMinutes += session.durationMinutes
    point.focusSessions++
  }
  return [...points.values()]
}

export interface WeeklyPoint {
  weekStart: DateKey
  completed: number
  created: number
  focusMinutes: number
}

/** Aggregates daily points into calendar weeks. */
export function groupByWeek(daily: DailyPoint[], weekStartsOn: WeekStartsOn): WeeklyPoint[] {
  const weeks = new Map<DateKey, WeeklyPoint>()
  for (const point of daily) {
    const key = weekStartKey(point.date, weekStartsOn)
    const week = weeks.get(key) ?? { weekStart: key, completed: 0, created: 0, focusMinutes: 0 }
    week.completed += point.completed
    week.created += point.created
    week.focusMinutes += point.focusMinutes
    weeks.set(key, week)
  }
  return [...weeks.values()]
}

export interface InsightSummary {
  completed: number
  created: number
  /** Share of tasks created in the range that are now done; null when none were created. */
  completionRate: number | null
  /** Mean hours from creation to completion; null with fewer than 3 samples. */
  avgCompletionHours: number | null
  focusSessions: number
  focusMinutes: number
}

export const MIN_COMPLETION_SAMPLES = 3

export function computeSummary(tasks: Task[], sessions: FocusSession[], start: DateKey, end: DateKey): InsightSummary {
  const inRange = (timestamp: string) => {
    const key = timestampToDateKey(timestamp)
    return key >= start && key <= end
  }
  const createdInRange = tasks.filter((task) => inRange(task.createdAt))
  const completedInRange = tasks.filter((task) => task.completedAt !== null && inRange(task.completedAt))
  const durations = completedInRange
    .map((task) => (Date.parse(task.completedAt ?? '') - Date.parse(task.createdAt)) / 3_600_000)
    .filter((hours) => Number.isFinite(hours) && hours >= 0)
  const rangeSessions = sessions.filter((session) => inRange(session.startedAt))

  return {
    completed: completedInRange.length,
    created: createdInRange.length,
    completionRate:
      createdInRange.length === 0
        ? null
        : (createdInRange.filter(isTaskDone).length / createdInRange.length) * 100,
    avgCompletionHours:
      durations.length < MIN_COMPLETION_SAMPLES ? null : durations.reduce((sum, value) => sum + value, 0) / durations.length,
    focusSessions: rangeSessions.length,
    focusMinutes: rangeSessions.reduce((sum, session) => sum + session.durationMinutes, 0),
  }
}

export function priorityDistribution(tasks: Task[]): Array<{ priority: TaskPriority; labelKey: TranslationKey; count: number }> {
  return TASK_PRIORITIES.map((priority) => ({
    priority,
    labelKey: PRIORITY_LABEL_KEYS[priority],
    count: tasks.filter((task) => !isTaskDone(task) && task.priority === priority).length,
  }))
}

export interface HeatmapCell {
  date: DateKey
  count: number
  level: 0 | 1 | 2 | 3 | 4
  future: boolean
}

/** Buckets a count into five intensity levels relative to the busiest day. */
export function activityLevel(count: number, max: number): HeatmapCell['level'] {
  if (count <= 0 || max <= 0) return 0
  const ratio = count / max
  if (ratio > 0.75) return 4
  if (ratio > 0.5) return 3
  if (ratio > 0.25) return 2
  return 1
}

/**
 * Activity heatmap: `weeks` columns ending with the week containing `end`.
 * Activity = tasks completed + focus sessions.
 */
export function buildHeatmap(
  tasks: Task[],
  sessions: FocusSession[],
  end: DateKey,
  weeks: number,
  weekStartsOn: WeekStartsOn,
): HeatmapCell[][] {
  const firstDay = addDaysToKey(weekStartKey(end, weekStartsOn), -(weeks - 1) * 7)
  const lastDay = addDaysToKey(firstDay, weeks * 7 - 1)
  const daily = buildDailySeries(tasks, sessions, firstDay, lastDay)
  const counts = daily.map((point) => point.completed + point.focusSessions)
  const max = Math.max(0, ...counts)
  const columns: HeatmapCell[][] = []
  daily.forEach((point, index) => {
    const count = counts[index] ?? 0
    const cell: HeatmapCell = { date: point.date, count, level: activityLevel(count, max), future: point.date > end }
    const column = Math.floor(index / 7)
    ;(columns[column] ??= []).push(cell)
  })
  return columns
}
