import { z } from 'zod'
import { isDateKey } from '@/lib/date'
import { PROJECT_COLORS, PROJECT_ICONS, PROJECT_STATUSES, type Project, type ProjectInput } from './projectTypes'

const optionalDate = z.string().refine((value) => value === '' || isDateKey(value), 'validation_date_invalid')

export const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, 'validation_project_name_required').max(60, 'validation_project_name_too_long'),
    description: z.string().max(300, 'validation_project_description_too_long'),
    color: z.enum(PROJECT_COLORS),
    icon: z.enum(PROJECT_ICONS),
    status: z.enum(PROJECT_STATUSES),
    startDate: optionalDate,
    dueDate: optionalDate,
  })
  .refine((values) => !values.startDate || !values.dueDate || values.dueDate >= values.startDate, {
    path: ['dueDate'],
    message: 'validation_due_before_start',
  })

export type ProjectFormValues = z.infer<typeof projectFormSchema>

export const EMPTY_PROJECT_FORM: ProjectFormValues = {
  name: '',
  description: '',
  color: 'indigo',
  icon: 'folder',
  status: 'active',
  startDate: '',
  dueDate: '',
}

export function projectToFormValues(project: Project): ProjectFormValues {
  return {
    name: project.name,
    description: project.description,
    color: project.color,
    icon: project.icon,
    status: project.status,
    startDate: project.startDate ?? '',
    dueDate: project.dueDate ?? '',
  }
}

export function formValuesToProjectInput(values: ProjectFormValues): ProjectInput {
  return {
    ...values,
    startDate: values.startDate === '' ? null : values.startDate,
    dueDate: values.dueDate === '' ? null : values.dueDate,
  }
}
