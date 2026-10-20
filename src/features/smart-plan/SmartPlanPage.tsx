import { ArrowRight, CircleCheck, Info, ListPlus, Sparkles, Wand } from 'lucide-react'
import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { Checkbox } from '@/components/ui/Checkbox'
import { EmptyState } from '@/components/ui/EmptyState'
import { Field } from '@/components/ui/Field'
import { fieldMessageId } from '@/components/ui/fieldIds'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { selectProjectsSorted } from '@/features/projects/projectSelectors'
import { projectCreated } from '@/features/projects/projectSlice'
import { selectTasksByProject, INBOX_KEY } from '@/features/tasks/taskSelectors'
import { tasksCreated } from '@/features/tasks/taskSlice'
import { pickOption, usePriorityOptions } from '@/features/tasks/hooks/useTaskOptions'
import { useTranslation } from '@/i18n/useTranslation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { isDateKey } from '@/lib/date'
import { cn } from '@/lib/cn'
import { templateTaskPlanner, type PlanResult, type TaskPlanner } from '@/services/task-planner.service'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { buildTaskInputs, findDuplicates, toEditable, type EditableSuggestion } from './planImport'
import { ALL_TEMPLATES, PLAN_TEMPLATES } from './planTemplates'

/** Swap this for an AI-backed implementation of `TaskPlanner` without touching the UI. */
const planner: TaskPlanner = templateTaskPlanner

const NEW_PROJECT = '__new__'
const INBOX = '__inbox__'

export default function SmartPlanPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('smart_plan_title'))
  const priorityOptions = usePriorityOptions()
  const categoryOptions = useMemo(
    () => [
      { value: 'auto', label: t('smart_plan_type_auto') },
      ...ALL_TEMPLATES.map((template) => ({ value: template.id, label: t(template.labelKey) })),
    ],
    [t],
  )
  const id = useId()
  const today = useToday()
  const dispatch = useAppDispatch()
  const projects = useAppSelector(selectProjectsSorted)
  const tasksByProject = useAppSelector(selectTasksByProject)

  const [goal, setGoal] = useState('')
  const [category, setCategory] = useState('auto')
  const [startDate, setStartDate] = useState(today)
  const [goalError, setGoalError] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [plan, setPlan] = useState<PlanResult | null>(null)
  const [items, setItems] = useState<EditableSuggestion[]>([])
  const [destination, setDestination] = useState(NEW_PROJECT)
  const [imported, setImported] = useState<{ count: number; projectId: string | null } | null>(null)

  const existingTitles = useMemo(() => {
    if (destination === NEW_PROJECT) return []
    const key = destination === INBOX ? INBOX_KEY : destination
    return (tasksByProject[key] ?? []).map((task) => task.title)
  }, [destination, tasksByProject])
  const duplicates = useMemo(() => findDuplicates(items, existingTitles), [items, existingTitles])
  const selectedCount = items.filter((item) => item.include && !duplicates.has(item.key) && item.title.trim()).length
  const allSelected = items.length > 0 && items.every((item) => item.include)

  const generate = async (event: FormEvent) => {
    event.preventDefault()
    if (goal.trim().length < 3) {
      setGoalError('smart_plan_goal_error')
      return
    }
    setGoalError(null)
    setGenerating(true)
    try {
      const result = await planner.generatePlan({ goal, categoryId: category, startDate: isDateKey(startDate) ? startDate : today })
      setPlan(result)
      setItems(toEditable(result.suggestions))
      setImported(null)
    } catch {
      toast.error(t('smart_plan_generate_failed'))
    } finally {
      setGenerating(false)
    }
  }

  const update = (key: string, changes: Partial<EditableSuggestion>) => {
    setItems((current) => current.map((item) => (item.key === key ? { ...item, ...changes } : item)))
  }

  const importTasks = () => {
    if (!plan || selectedCount === 0) return
    let projectId: string | null = destination === INBOX ? null : destination
    if (destination === NEW_PROJECT) {
      const included = items.filter((item) => item.include && isDateKey(item.dueDate)).map((item) => item.dueDate)
      const { payload } = dispatch(
        projectCreated({
          name: plan.goal.slice(0, 60),
          description: t('smart_plan_project_description', { category: plan.category.label }),
          color: 'violet',
          icon: 'target',
          status: 'active',
          startDate: isDateKey(startDate) ? startDate : today,
          dueDate: included.length > 0 ? included.reduce((max, date) => (date > max ? date : max)) : null,
        }),
      )
      projectId = payload.id
    }
    const inputs = buildTaskInputs(items, duplicates, projectId)
    dispatch(tasksCreated(inputs))
    setImported({ count: inputs.length, projectId })
    setPlan(null)
    setItems([])
    toast.success(t('smart_plan_added', { count: inputs.length }), {
      description: destination === NEW_PROJECT ? t('smart_plan_new_project_created') : undefined,
    })
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('smart_plan_title')}
        description={t('smart_plan_description')}
        actions={
          <Badge tone="accent">
            <Wand /> {t('smart_plan_badge')}
          </Badge>
        }
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader title={t('smart_plan_goal_card')} icon={<Sparkles />} />
          <CardBody>
            <form onSubmit={(event) => void generate(event)} className="flex flex-col gap-3" noValidate>
              <Field label={t('smart_plan_goal')} htmlFor={`${id}-goal`} error={goalError ?? undefined} required>
                <Input
                  id={`${id}-goal`}
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder={t('smart_plan_goal_placeholder')}
                  maxLength={160}
                  aria-invalid={goalError !== null}
                  aria-describedby={goalError ? fieldMessageId(`${id}-goal`) : undefined}
                />
              </Field>
              <div className="flex flex-wrap gap-1.5" aria-label={t('smart_plan_examples')}>
                {PLAN_TEMPLATES.slice(0, 5).map((template) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => setGoal(t(template.exampleKey))}
                    className="rounded-control border border-line px-2 py-0.5 text-xs text-fg-2 transition-colors hover:border-brand/40 hover:bg-brand-soft hover:text-brand-ink"
                  >
                    {t(template.exampleKey)}
                  </button>
                ))}
              </div>
              <Field label={t('smart_plan_type')} htmlFor={`${id}-category`}>
                <Select id={`${id}-category`} options={categoryOptions} value={category} onChange={(event) => setCategory(event.target.value)} />
              </Field>
              <Field label={t('smart_plan_start_date')} htmlFor={`${id}-start`} hint={t('smart_plan_start_hint')}>
                <Input id={`${id}-start`} type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
              </Field>
              <Button type="submit" loading={generating} leftIcon={<Sparkles />}>
                {t('smart_plan_generate')}
              </Button>
              <p className="flex gap-2 rounded-control bg-surface-2 p-2.5 text-xs leading-relaxed text-fg-2">
                <Info className="mt-0.5 size-3.5 shrink-0 text-fg-3" aria-hidden />
                {t('smart_plan_disclaimer')}
              </p>
            </form>
          </CardBody>
        </Card>

        {plan ? (
          <Card>
            <CardHeader
              title={t('smart_plan_suggested', { category: plan.category.label })}
              description={
                plan.matchedKeywords.length > 0
                  ? t('smart_plan_matched', { keywords: plan.matchedKeywords.join(', ') })
                  : category === 'auto'
                    ? t('smart_plan_no_match')
                    : t('smart_plan_manual')
              }
              icon={<ListPlus />}
            />
            <CardBody className="flex flex-col gap-3">
              <Field label={t('smart_plan_destination')} htmlFor={`${id}-destination`} className="sm:max-w-sm">
                <Select
                  id={`${id}-destination`}
                  value={destination}
                  onChange={(event) => setDestination(event.target.value)}
                  options={[
                    { value: NEW_PROJECT, label: t('smart_plan_new_project_option', { goal: plan.goal.slice(0, 40) }) },
                    { value: INBOX, label: t('smart_plan_inbox_option') },
                    ...projects.map((project) => ({ value: project.id, label: project.name })),
                  ]}
                />
              </Field>

              <div className="overflow-hidden rounded-menu border border-line">
                <div className="grid h-8 grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 border-b border-line bg-surface-2 px-3 text-xs font-medium text-fg-3 md:grid-cols-[auto_minmax(0,1fr)_112px_88px_136px]">
                  <Checkbox
                    size="sm"
                    checked={allSelected}
                    onChange={(event) => setItems((current) => current.map((item) => ({ ...item, include: event.target.checked })))}
                    aria-label={allSelected ? t('smart_plan_deselect_all') : t('smart_plan_select_all')}
                  />
                  <span>
                    {t('smart_plan_column_step')}{' '}
                    <span className="tabular font-normal">{t('smart_plan_selected_count', { selected: selectedCount, total: items.length })}</span>
                  </span>
                  <span className="hidden md:block">{t('smart_plan_column_priority')}</span>
                  <span className="hidden md:block">{t('smart_plan_column_estimate')}</span>
                  <span className="hidden md:block">{t('smart_plan_column_due')}</span>
                </div>
                <ul className="divide-y divide-line">
                  {items.map((item, index) => {
                    const duplicate = duplicates.has(item.key)
                    const emptyTitle = item.include && item.title.trim() === ''
                    return (
                      <li
                        key={item.key}
                        className={cn(
                          'grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-2.5 gap-y-1.5 px-3 py-2 md:grid-cols-[auto_minmax(0,1fr)_112px_88px_136px] md:items-center',
                          (duplicate || !item.include) && 'bg-surface-2',
                        )}
                      >
                        <Checkbox
                          size="sm"
                          checked={item.include && !duplicate}
                          disabled={duplicate}
                          onChange={(event) => update(item.key, { include: event.target.checked })}
                          aria-label={t('smart_plan_include_step', { number: index + 1 })}
                          className="mt-2 md:mt-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <Input
                              size="sm"
                              aria-label={t('smart_plan_step_title', { number: index + 1 })}
                              value={item.title}
                              onChange={(event) => update(item.key, { title: event.target.value })}
                              aria-invalid={emptyTitle}
                              maxLength={120}
                              className="font-medium"
                            />
                            {duplicate && <Badge tone="warning">{t('smart_plan_exists')}</Badge>}
                          </div>
                          <p className="mt-0.5 truncate px-0.5 text-xs text-fg-3" title={item.description}>
                            {item.description}
                          </p>
                        </div>
                        <div className="col-start-2 grid grid-cols-3 gap-1.5 md:contents">
                          <Select
                            size="sm"
                            aria-label={t('smart_plan_step_priority', { number: index + 1 })}
                            options={priorityOptions}
                            value={item.priority}
                            onChange={(event) => {
                              const priority = pickOption(priorityOptions, event.target.value)
                              if (priority) update(item.key, { priority })
                            }}
                          />
                          <Input
                            size="sm"
                            aria-label={t('smart_plan_step_estimate', { number: index + 1 })}
                            inputMode="numeric"
                            value={item.estimatedMinutes}
                            onChange={(event) => update(item.key, { estimatedMinutes: event.target.value.replace(/\D/g, '').slice(0, 4) })}
                            trailing={<span className="text-[11px] text-fg-3">{t('smart_plan_minutes_suffix')}</span>}
                          />
                          <Input
                            size="sm"
                            type="date"
                            aria-label={t('smart_plan_step_due', { number: index + 1 })}
                            value={item.dueDate}
                            onChange={(event) => update(item.key, { dueDate: event.target.value })}
                          />
                        </div>
                      </li>
                    )
                  })}
                </ul>
              </div>

              <div className="flex flex-col-reverse items-stretch gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-fg-3">
                  {duplicates.size > 0 && `${t('smart_plan_duplicates_skipped', { count: duplicates.size })} `}
                  {t('smart_plan_edit_later')}
                </p>
                <Button leftIcon={<ListPlus />} onClick={importTasks} disabled={selectedCount === 0}>
                  {t('smart_plan_add_tasks', { count: selectedCount })}
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card>
            {imported ? (
              <EmptyState
                icon={<CircleCheck />}
                title={t('smart_plan_added', { count: imported.count })}
                description={t('smart_plan_ready')}
                action={
                  <Link to={imported.projectId ? `/projects/${imported.projectId}` : '/today'} className={buttonClasses('primary')}>
                    {imported.projectId ? t('smart_plan_open_project') : t('smart_plan_open_my_day')}
                    <ArrowRight />
                  </Link>
                }
              />
            ) : (
              <EmptyState
                icon={<Sparkles />}
                title={t('smart_plan_empty_title')}
                description={t('smart_plan_empty_description')}
              />
            )}
          </Card>
        )}
      </div>
    </PageContainer>
  )
}
