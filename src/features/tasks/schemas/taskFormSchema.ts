import { z } from 'zod'
import { isDateKey } from '@/lib/date'
import type { DateKey } from '@/types/common'
import { TASK_PRIORITIES, TASK_STATUSES, type Task, type TaskInput, type TaskPriority, type TaskStatus } from '../taskTypes'

export const MAX_TAGS = 8
export const MAX_ESTIMATE_MINUTES = 24 * 60

const optionalDate = z.string().refine((value) => value === '' || isDateKey(value), 'validation_date_invalid')

/**
 * Form values are kept as strings (as inputs produce them) and converted on submit.
 * Error messages are translation keys; the Field component renders them in the active language.
 */
export const taskFormSchema = z
  .object({
    title: z.string().trim().min(1, 'validation_task_title_required').max(120, 'validation_task_title_too_long'),
    description: z.string().max(2000, 'validation_description_too_long'),
    projectId: z.string(),
    status: z.enum(TASK_STATUSES),
    priority: z.enum(TASK_PRIORITIES),
    startDate: optionalDate,
    dueDate: optionalDate,
    tags: z.array(z.string().max(24, 'validation_tag_too_long')).max(MAX_TAGS, 'validation_too_many_tags'),
    estimatedMinutes: z
      .string()
      .refine((value) => value === '' || /^\d+$/.test(value), 'validation_estimate_whole_minutes')
      .refine(
        (value) => value === '' || (Number(value) >= 1 && Number(value) <= MAX_ESTIMATE_MINUTES),
        'validation_estimate_range',
      ),
    subtasks: z
      .array(
        z.object({
          id: z.string().optional(),
          title: z.string().trim().min(1, 'validation_subtask_required').max(200, 'validation_subtask_too_long'),
          completed: z.boolean(),
        }),
      )
      .max(30, 'validation_too_many_subtasks'),
  })
  .refine((values) => !values.startDate || !values.dueDate || values.dueDate >= values.startDate, {
    path: ['dueDate'],
    message: 'validation_due_before_start',
  })

export type TaskFormValues = z.infer<typeof taskFormSchema>

export interface TaskFormDefaults {
  projectId?: string | null
  status?: TaskStatus
  priority?: TaskPriority
  dueDate?: DateKey | null
  title?: string
}

export function emptyTaskFormValues(defaults: TaskFormDefaults = {}): TaskFormValues {
  return {
    title: defaults.title ?? '',
    description: '',
    projectId: defaults.projectId ?? '',
    status: defaults.status ?? 'todo',
    priority: defaults.priority ?? 'medium',
    startDate: '',
    dueDate: defaults.dueDate ?? '',
    tags: [],
    estimatedMinutes: '',
    subtasks: [],
  }
}

export function taskToFormValues(task: Task): TaskFormValues {
  return {
    title: task.title,
    description: task.description,
    projectId: task.projectId ?? '',
    status: task.status,
    priority: task.priority,
    startDate: task.startDate ?? '',
    dueDate: task.dueDate ?? '',
    tags: task.tags,
    estimatedMinutes: task.estimatedMinutes === null ? '' : String(task.estimatedMinutes),
    subtasks: [...task.subtasks]
      .sort((a, b) => a.order - b.order)
      .map(({ id, title, completed }) => ({ id, title, completed })),
  }
}

export function formValuesToTaskInput(values: TaskFormValues): TaskInput {
  return {
    title: values.title,
    description: values.description,
    projectId: values.projectId === '' ? null : values.projectId,
    status: values.status,
    priority: values.priority,
    startDate: values.startDate === '' ? null : values.startDate,
    dueDate: values.dueDate === '' ? null : values.dueDate,
    tags: values.tags,
    estimatedMinutes: values.estimatedMinutes === '' ? null : Number(values.estimatedMinutes),
    subtasks: values.subtasks,
  }
}
