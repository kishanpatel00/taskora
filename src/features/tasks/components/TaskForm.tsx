import { zodResolver } from '@hookform/resolvers/zod'
import { ListChecks, Plus, X } from 'lucide-react'
import { useId, useRef, useState, type FormEvent } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Button, IconButton } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Field } from '@/components/ui/Field'
import { fieldMessageId } from '@/components/ui/fieldIds'
import { Input } from '@/components/ui/Input'
import { ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Select, type SelectOption } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import type { Project } from '@/features/projects/projectTypes'
import {
  formValuesToTaskInput,
  MAX_TAGS,
  taskFormSchema,
  type TaskFormValues,
} from '../schemas/taskFormSchema'
import type { TaskInput } from '../taskTypes'
import { useTranslateMessage, useTranslation } from '@/i18n/useTranslation'
import { usePriorityOptions, useStatusOptions } from '../hooks/useTaskOptions'
import { TagInput } from './TagInput'


interface TaskFormProps {
  initialValues: TaskFormValues
  projects: Project[]
  submitLabel: string
  onSubmit: (input: TaskInput) => void
  onCancel: () => void
}

/** Shared create/edit task form. Used inside a Modal (renders ModalBody + ModalFooter). */
export function TaskForm({ initialValues, projects, submitLabel, onSubmit, onCancel }: TaskFormProps) {
  const { t } = useTranslation()
  const translate = useTranslateMessage()
  const statusOptions = useStatusOptions()
  const priorityOptions = usePriorityOptions()
  const id = useId()
  const submittedRef = useRef(false)
  const [newSubtask, setNewSubtask] = useState('')
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: initialValues,
    mode: 'onTouched',
  })
  const subtasks = useFieldArray({ control, name: 'subtasks' })

  const projectOptions: SelectOption[] = [
    { value: '', label: t('task_form_inbox_option') },
    ...projects.map((project) => ({ value: project.id, label: project.name })),
  ]

  const addSubtask = () => {
    const title = newSubtask.trim()
    if (!title) return
    subtasks.append({ title, completed: false })
    setNewSubtask('')
  }

  const submit = (event: FormEvent<HTMLFormElement>) =>
    handleSubmit((values) => {
      // Guards against a double submit before the dialog closes.
      if (submittedRef.current) return
      submittedRef.current = true
      onSubmit(formValuesToTaskInput(values))
    })(event)

  const fieldId = (name: string) => `${id}-${name}`
  const described = (name: string, hasMessage: boolean) => (hasMessage ? fieldMessageId(fieldId(name)) : undefined)

  return (
    <form onSubmit={(event) => void submit(event)} noValidate className="flex min-h-0 flex-1 flex-col">
      <ModalBody className="flex flex-col gap-3.5">
        <Field label={t('task_form_title')} htmlFor={fieldId('title')} error={errors.title?.message} required>
          <Input
            id={fieldId('title')}
            placeholder={t('task_form_title_placeholder')}
            autoComplete="off"
            data-autofocus
            size="lg"
            className="font-medium"
            aria-invalid={!!errors.title}
            aria-describedby={described('title', !!errors.title)}
            {...register('title')}
          />
        </Field>

        <Field label={t('task_form_description')} htmlFor={fieldId('description')} error={errors.description?.message}>
          <Textarea
            id={fieldId('description')}
            placeholder={t('task_form_description_placeholder')}
            aria-invalid={!!errors.description}
            aria-describedby={described('description', !!errors.description)}
            {...register('description')}
          />
        </Field>

        {/* Planning: where the task lives and how urgent it is; then scheduling. */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
          <Field label={t('task_form_project')} htmlFor={fieldId('project')} className="col-span-2">
            <Select id={fieldId('project')} options={projectOptions} {...register('projectId')} />
          </Field>
          <Field label={t('task_form_status')} htmlFor={fieldId('status')}>
            <Select id={fieldId('status')} options={statusOptions} {...register('status')} />
          </Field>
          <Field label={t('task_form_priority')} htmlFor={fieldId('priority')}>
            <Select id={fieldId('priority')} options={priorityOptions} {...register('priority')} />
          </Field>
          <Field label={t('task_form_start_date')} htmlFor={fieldId('start')} error={errors.startDate?.message}>
            <Input
              id={fieldId('start')}
              type="date"
              aria-invalid={!!errors.startDate}
              aria-describedby={described('start', !!errors.startDate)}
              {...register('startDate', { deps: ['dueDate'] })}
            />
          </Field>
          <Field label={t('task_form_due_date')} htmlFor={fieldId('due')} error={errors.dueDate?.message}>
            <Input
              id={fieldId('due')}
              type="date"
              aria-invalid={!!errors.dueDate}
              aria-describedby={described('due', !!errors.dueDate)}
              {...register('dueDate')}
            />
          </Field>
          <Field
            label={t('task_form_estimate')}
            htmlFor={fieldId('estimate')}
            error={errors.estimatedMinutes?.message}
            className="col-span-2"
          >
            <Input
              id={fieldId('estimate')}
              inputMode="numeric"
              placeholder={t('task_form_estimate_placeholder')}
              aria-invalid={!!errors.estimatedMinutes}
              aria-describedby={described('estimate', !!errors.estimatedMinutes)}
              {...register('estimatedMinutes')}
            />
          </Field>
        </div>

        <Field
          label={t('task_form_tags')}
          htmlFor={fieldId('tags')}
          error={errors.tags?.message ?? errors.tags?.find?.((tag) => tag?.message)?.message}
          hint={t('task_form_tags_hint', { max: MAX_TAGS })}
        >
          <Controller
            control={control}
            name="tags"
            render={({ field }) => (
              <TagInput
                id={fieldId('tags')}
                value={field.value}
                onChange={field.onChange}
                max={MAX_TAGS}
                invalid={!!errors.tags}
                describedBy={fieldMessageId(fieldId('tags'))}
              />
            )}
          />
        </Field>

        <fieldset className="flex flex-col gap-1.5">
          <legend className="mb-1 flex items-center gap-1.5 text-xs font-medium text-fg-2">
            <ListChecks className="size-3.5" aria-hidden />
            {t('task_form_subtasks')}
            {subtasks.fields.length > 0 && <span className="text-fg-3">({subtasks.fields.length})</span>}
          </legend>
          {subtasks.fields.length > 0 && (
            <ul className="flex flex-col gap-1">
              {subtasks.fields.map((field, index) => {
                const error = translate(errors.subtasks?.[index]?.title?.message)
                return (
                  <li key={field.id} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Controller
                        control={control}
                        name={`subtasks.${index}.completed`}
                        render={({ field: checkbox }) => (
                          <Checkbox
                            size="sm"
                            checked={checkbox.value}
                            onChange={(event) => checkbox.onChange(event.target.checked)}
                            aria-label={t('task_form_subtask_complete', { number: index + 1 })}
                          />
                        )}
                      />
                      <Input
                        aria-label={t('task_form_subtask_label', { number: index + 1 })}
                        aria-invalid={!!error}
                        size="sm"
                        {...register(`subtasks.${index}.title`)}
                      />
                      <IconButton label={t('task_form_subtask_remove', { number: index + 1 })} size="sm" onClick={() => subtasks.remove(index)}>
                        <X />
                      </IconButton>
                    </div>
                    {error && (
                      <p className="pl-7 text-xs text-rose-600 dark:text-rose-400" role="alert">
                        {error}
                      </p>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          <div className="flex gap-2">
            <Input
              aria-label={t('task_form_new_subtask')}
              placeholder={t('task_form_new_subtask_placeholder')}
              value={newSubtask}
              onChange={(event) => setNewSubtask(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  addSubtask()
                }
              }}
              size="sm"
            />
            <Button variant="secondary" size="sm" onClick={addSubtask} leftIcon={<Plus />} disabled={!newSubtask.trim()}>
              {t('common_add')}
            </Button>
          </div>
          {errors.subtasks?.message && (
            <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
              {translate(errors.subtasks.message)}
            </p>
          )}
        </fieldset>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel}>
          {t('common_cancel')}
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </ModalFooter>
    </form>
  )
}
