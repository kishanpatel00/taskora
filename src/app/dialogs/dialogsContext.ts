import { createContext } from 'react'
import type { TaskFormDefaults } from '@/features/tasks/schemas/taskFormSchema'

export interface DialogsApi {
  openCreateTask: (defaults?: TaskFormDefaults) => void
  openTask: (taskId: string) => void
  openEditTask: (taskId: string) => void
  openCreateProject: () => void
  openEditProject: (projectId: string) => void
}

export const DialogsContext = createContext<DialogsApi | null>(null)
