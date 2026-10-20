import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { selectTasksByProject } from '@/features/tasks/taskSelectors'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { projectDeleted } from '../projectSlice'
import type { Project } from '../projectTypes'

interface DeleteProjectDialogProps {
  project: Project | null
  onClose: () => void
  onDeleted?: () => void
}

/** Deletion policy: the project is removed, its tasks are kept and moved to the Inbox. */
export function DeleteProjectDialog({ project, onClose, onDeleted }: DeleteProjectDialogProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const tasksByProject = useAppSelector(selectTasksByProject)
  const taskCount = project ? (tasksByProject[project.id]?.length ?? 0) : 0

  return (
    <ConfirmDialog
      open={project !== null}
      title={t('project_delete_title')}
      confirmLabel={t('projects_delete')}
      onCancel={onClose}
      onConfirm={() => {
        if (!project) return
        dispatch(projectDeleted(project.id))
        onClose()
        onDeleted?.()
        toast.success(t('toast_project_deleted'), {
          description: taskCount > 0 ? t('toast_project_tasks_moved', { count: taskCount }) : project.name,
        })
      }}
      description={
        <>
          <p>
            {t('project_delete_warning', { name: project?.name ?? '' })}
          </p>
          <p className="mt-2">
            {taskCount > 0
              ? t('project_delete_tasks_kept', { count: taskCount })
              : t('project_delete_no_tasks')}
          </p>
        </>
      }
    />
  )
}
