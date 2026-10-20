import { toast } from 'sonner'
import { Modal } from '@/components/ui/Modal'
import { selectProjectsSorted } from '@/features/projects/projectSelectors'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { emptyTaskFormValues, type TaskFormDefaults } from '../schemas/taskFormSchema'
import { taskCreated } from '../taskSlice'
import { TaskForm } from './TaskForm'

interface TaskCreateDialogProps {
  defaults: TaskFormDefaults
  onClose: () => void
  onCreated: (taskId: string) => void
}

export function TaskCreateDialog({ defaults, onClose, onCreated }: TaskCreateDialogProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const projects = useAppSelector(selectProjectsSorted)
  const defaultPriority = useAppSelector((state) => state.settings.defaultPriority)

  return (
    <Modal open onClose={onClose} title={t('tasks_create_title')} size="lg">
      <TaskForm
        initialValues={emptyTaskFormValues({ priority: defaultPriority, ...defaults })}
        projects={projects}
        submitLabel={t('tasks_create_submit')}
        onCancel={onClose}
        onSubmit={(input) => {
          const { payload } = dispatch(taskCreated(input))
          onClose()
          toast.success(t('toast_task_created'), {
            description: input.title,
            action: { label: t('common_open'), onClick: () => onCreated(payload.id) },
          })
        }}
      />
    </Modal>
  )
}
