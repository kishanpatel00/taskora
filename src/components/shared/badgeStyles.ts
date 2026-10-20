import type { TaskPriority, TaskStatus } from '@/features/tasks/taskTypes'

export const PRIORITY_FLAG_COLORS: Record<TaskPriority, string> = {
  low: 'text-slate-400',
  medium: 'text-sky-500',
  high: 'text-amber-500',
  urgent: 'text-rose-500',
}

export const STATUS_DOT_COLORS: Record<TaskStatus, string> = {
  backlog: 'bg-slate-400',
  todo: 'bg-sky-500',
  in_progress: 'bg-indigo-500',
  done: 'bg-emerald-500',
}
