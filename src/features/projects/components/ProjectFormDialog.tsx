import { zodResolver } from '@hookform/resolvers/zod'
import { useId, useRef, type FormEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { fieldMessageId } from '@/components/ui/fieldIds'
import { Input } from '@/components/ui/Input'
import { Modal, ModalBody, ModalFooter } from '@/components/ui/Modal'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  EMPTY_PROJECT_FORM,
  formValuesToProjectInput,
  projectFormSchema,
  projectToFormValues,
  type ProjectFormValues,
} from '../projectFormSchema'
import { selectProjectById } from '../projectSelectors'
import { projectCreated, projectUpdated } from '../projectSlice'
import { PROJECT_COLOR_STYLES } from '../projectStyles'
import { PROJECT_COLORS, PROJECT_ICONS, PROJECT_STATUS_LABEL_KEYS, PROJECT_STATUSES } from '../projectTypes'
import { PROJECT_ICON_COMPONENTS } from './ProjectAvatar'


interface ProjectFormDialogProps {
  /** `null` creates a new project. */
  projectId: string | null
  onClose: () => void
}

export function ProjectFormDialog({ projectId, onClose }: ProjectFormDialogProps) {
  const { t } = useTranslation()
  const statusOptions = PROJECT_STATUSES.map((value) => ({ value, label: t(PROJECT_STATUS_LABEL_KEYS[value]) }))
  const id = useId()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const submittedRef = useRef(false)
  const project = useAppSelector((state) => (projectId ? selectProjectById(state, projectId) : undefined))
  const editing = project !== undefined

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project ? projectToFormValues(project) : EMPTY_PROJECT_FORM,
    mode: 'onTouched',
  })
  const [selectedColor, selectedIcon] = useWatch({ control, name: ['color', 'icon'] })

  const submit = (event: FormEvent<HTMLFormElement>) =>
    handleSubmit((values) => {
      // Guards against a double submit before the dialog closes.
      if (submittedRef.current) return
      submittedRef.current = true
      const input = formValuesToProjectInput(values)
      if (project) {
        dispatch(projectUpdated(project.id, input))
        toast.success(t('toast_project_updated'))
        onClose()
        return
      }
      const { payload } = dispatch(projectCreated(input))
      onClose()
      toast.success(t('toast_project_created'), { description: input.name })
      void navigate(`/projects/${payload.id}`)
    })(event)

  const fieldId = (name: string) => `${id}-${name}`

  return (
    <Modal open onClose={onClose} title={editing ? t('projects_edit_title') : t('projects_create_title')} size="lg">
      <form onSubmit={(event) => void submit(event)} noValidate className="flex min-h-0 flex-1 flex-col">
        <ModalBody className="flex flex-col gap-3.5">
          <Field label={t('project_form_name')} htmlFor={fieldId('name')} error={errors.name?.message} required>
            <Input
              id={fieldId('name')}
              placeholder={t('project_form_name_placeholder')}
              autoComplete="off"
              data-autofocus
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? fieldMessageId(fieldId('name')) : undefined}
              {...register('name')}
            />
          </Field>
          <Field label={t('project_form_description')} htmlFor={fieldId('description')} error={errors.description?.message}>
            <Textarea
              id={fieldId('description')}
              rows={2}
              placeholder={t('project_form_description_placeholder')}
              aria-invalid={!!errors.description}
              {...register('description')}
            />
          </Field>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-fg-2">{t('project_form_color')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_COLORS.map((color) => (
                <label key={color} className="relative cursor-pointer" title={t(PROJECT_COLOR_STYLES[color].labelKey)}>
                  <input type="radio" value={color} className="peer sr-only" {...register('color')} />
                  <span className="sr-only">{t(PROJECT_COLOR_STYLES[color].labelKey)}</span>
                  <span
                    className={cn(
                      'block size-6 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-surface transition peer-checked:ring-fg peer-focus-visible:ring-ring',
                      PROJECT_COLOR_STYLES[color].solid,
                    )}
                    aria-hidden
                  />
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-1.5 text-xs font-medium text-fg-2">{t('project_form_icon')}</legend>
            <div className="flex flex-wrap gap-1.5">
              {PROJECT_ICONS.map((icon) => {
                const Icon = PROJECT_ICON_COMPONENTS[icon]
                const checked = selectedIcon === icon
                return (
                  <label key={icon} className="cursor-pointer" title={t(`project_icon_${icon}`)}>
                    <input type="radio" value={icon} className="peer sr-only" {...register('icon')} />
                    <span className="sr-only">{t(`project_icon_${icon}`)}</span>
                    <span
                      className={cn(
                        'flex size-8 items-center justify-center rounded-control border transition peer-focus-visible:ring-2 peer-focus-visible:ring-ring',
                        checked
                          ? cn('border-transparent', PROJECT_COLOR_STYLES[selectedColor].soft)
                          : 'border-line text-fg-3 hover:border-line-strong hover:text-fg',
                      )}
                      aria-hidden
                    >
                      <Icon className="size-4" />
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Field label={t('project_form_status')} htmlFor={fieldId('status')}>
              <Select id={fieldId('status')} options={statusOptions} {...register('status')} />
            </Field>
            <Field label={t('project_form_start_date')} htmlFor={fieldId('start')} error={errors.startDate?.message}>
              <Input id={fieldId('start')} type="date" aria-invalid={!!errors.startDate} {...register('startDate', { deps: ['dueDate'] })} />
            </Field>
            <Field label={t('project_form_due_date')} htmlFor={fieldId('due')} error={errors.dueDate?.message}>
              <Input
                id={fieldId('due')}
                type="date"
                aria-invalid={!!errors.dueDate}
                aria-describedby={errors.dueDate ? fieldMessageId(fieldId('due')) : undefined}
                {...register('dueDate')}
              />
            </Field>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="secondary" onClick={onClose}>
            {t('common_cancel')}
          </Button>
          <Button type="submit">{editing ? t('common_save_changes') : t('projects_create_submit')}</Button>
        </ModalFooter>
      </form>
    </Modal>
  )
}
