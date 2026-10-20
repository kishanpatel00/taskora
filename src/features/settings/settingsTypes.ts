import type { TaskPriority } from '@/features/tasks/taskTypes'
import type { ThemePreference, WeekStartsOn } from '@/types/common'

export type WorkspaceView = 'board' | 'list' | 'calendar' | 'insights'
export type ProjectsLayout = 'grid' | 'list'

export interface AppSettings {
  displayName: string
  theme: ThemePreference
  weekStartsOn: WeekStartsOn
  defaultFocusMinutes: number
  defaultBreakMinutes: number
  defaultPriority: TaskPriority
  showCompletedTasks: boolean
  focusSoundEnabled: boolean
  workspaceView: WorkspaceView
  projectsLayout: ProjectsLayout
  sidebarCollapsed: boolean
}

export const DEFAULT_SETTINGS: AppSettings = {
  displayName: 'Alex',
  theme: 'light',
  weekStartsOn: 1,
  defaultFocusMinutes: 25,
  defaultBreakMinutes: 5,
  defaultPriority: 'medium',
  showCompletedTasks: true,
  focusSoundEnabled: false,
  workspaceView: 'board',
  projectsLayout: 'grid',
  sidebarCollapsed: false,
}
