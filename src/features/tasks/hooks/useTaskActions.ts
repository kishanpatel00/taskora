import { useMemo } from 'react'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { useAppDispatch } from '@/store/hooks'
import { taskCompletionToggled, taskDeleted, taskUpdated } from '../taskSlice'
import type { Task } from '../taskTypes'

/** Common task mutations with consistent user feedback. */
export function useTaskActions() {
  const dispatch = useAppDispatch()

  return useMemo(
    () => ({
      toggleComplete: (task: Task) => {
        dispatch(taskCompletionToggled(task.id))
        if (task.status === 'done') {
          toast(i18n.t('toast_task_reopened'), { description: task.title })
          return
        }
        toast.success(i18n.t('toast_task_completed'), {
          description: task.title,
          action: { label: i18n.t('common_undo'), onClick: () => dispatch(taskUpdated(task.id, { status: task.status })) },
        })
      },
      deleteTask: (task: Task) => {
        dispatch(taskDeleted(task.id))
        toast.success(i18n.t('toast_task_deleted'), { description: task.title })
      },
    }),
    [dispatch],
  )
}
