import { useMemo, useState, type ReactNode } from 'react'
import { ProjectFormDialog } from '@/features/projects/components/ProjectFormDialog'
import { TaskCreateDialog } from '@/features/tasks/components/TaskCreateDialog'
import { TaskDetailDialog, type TaskDialogMode } from '@/features/tasks/components/TaskDetailDialog'
import type { TaskFormDefaults } from '@/features/tasks/schemas/taskFormSchema'
import { DialogsContext, type DialogsApi } from './dialogsContext'

type DialogState =
  | { kind: 'none' }
  | { kind: 'createTask'; defaults: TaskFormDefaults }
  | { kind: 'task'; taskId: string; mode: TaskDialogMode }
  | { kind: 'project'; projectId: string | null }

/** Hosts the global dialogs so any page, shortcut or command can open them. One dialog at a time. */
export function DialogsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DialogState>({ kind: 'none' })

  const api = useMemo<DialogsApi>(
    () => ({
      openCreateTask: (defaults = {}) => setState({ kind: 'createTask', defaults }),
      openTask: (taskId) => setState({ kind: 'task', taskId, mode: 'view' }),
      openEditTask: (taskId) => setState({ kind: 'task', taskId, mode: 'edit' }),
      openCreateProject: () => setState({ kind: 'project', projectId: null }),
      openEditProject: (projectId) => setState({ kind: 'project', projectId }),
    }),
    [],
  )
  const close = () => setState({ kind: 'none' })

  return (
    <DialogsContext value={api}>
      {children}
      {state.kind === 'createTask' && (
        <TaskCreateDialog defaults={state.defaults} onClose={close} onCreated={api.openTask} />
      )}
      {state.kind === 'task' && (
        <TaskDetailDialog
          key={state.taskId}
          taskId={state.taskId}
          mode={state.mode}
          onModeChange={(mode) => setState({ kind: 'task', taskId: state.taskId, mode })}
          onClose={close}
        />
      )}
      {state.kind === 'project' && <ProjectFormDialog projectId={state.projectId} onClose={close} />}
    </DialogsContext>
  )
}
