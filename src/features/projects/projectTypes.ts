import type { TranslationKey } from '@/i18n/translation.types'
import type { DateKey, Timestamp } from '@/types/common'

export const PROJECT_STATUSES = ['planning', 'active', 'on_hold', 'completed'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABEL_KEYS: Record<ProjectStatus, TranslationKey> = {
  planning: 'project_status_planning',
  active: 'project_status_active',
  on_hold: 'project_status_on_hold',
  completed: 'project_status_completed',
}

export const PROJECT_COLORS = ['indigo', 'violet', 'sky', 'emerald', 'amber', 'rose', 'teal', 'slate'] as const
export type ProjectColor = (typeof PROJECT_COLORS)[number]

export const PROJECT_ICONS = [
  'folder',
  'code',
  'rocket',
  'book',
  'heart',
  'briefcase',
  'palette',
  'target',
  'globe',
  'dumbbell',
  'house',
  'lightbulb',
] as const
export type ProjectIcon = (typeof PROJECT_ICONS)[number]

export interface Project {
  id: string
  name: string
  description: string
  color: ProjectColor
  icon: ProjectIcon
  status: ProjectStatus
  startDate: DateKey | null
  dueDate: DateKey | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

export type ProjectInput = Pick<
  Project,
  'name' | 'description' | 'color' | 'icon' | 'status' | 'startDate' | 'dueDate'
>

export interface ProjectProgress {
  total: number
  completed: number
  /** 0–100, rounded. 0 when the project has no tasks. */
  percent: number
}

export type ProjectSortKey = 'name' | 'dueDate' | 'progress' | 'updatedAt'
