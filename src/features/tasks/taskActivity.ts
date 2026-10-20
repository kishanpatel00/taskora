import type { FocusSession } from '@/features/focus/focusTypes'
import type { Timestamp } from '@/types/common'
import type { Task } from './taskTypes'

export interface TaskActivityEntry {
  id: string
  kind: 'created' | 'updated' | 'completed' | 'focus'
  at: Timestamp
  /** Minutes focused, for focus entries. */
  minutes?: number
  interrupted?: boolean
}

/**
 * Builds a task's activity timeline from data that is actually recorded:
 * creation, completion, the latest update, and focus sessions linked to it.
 * Newest first.
 */
export function buildTaskActivity(task: Task, sessions: FocusSession[]): TaskActivityEntry[] {
  const entries: TaskActivityEntry[] = [{ id: `${task.id}-created`, kind: 'created', at: task.createdAt }]
  if (task.completedAt) entries.push({ id: `${task.id}-completed`, kind: 'completed', at: task.completedAt })
  if (task.updatedAt !== task.createdAt && task.updatedAt !== task.completedAt) {
    entries.push({ id: `${task.id}-updated`, kind: 'updated', at: task.updatedAt })
  }
  for (const session of sessions) {
    if (session.taskId !== task.id) continue
    entries.push({
      id: session.id,
      kind: 'focus',
      at: session.endedAt,
      minutes: session.durationMinutes,
      interrupted: session.status === 'interrupted',
    })
  }
  return entries.sort((a, b) => b.at.localeCompare(a.at))
}
