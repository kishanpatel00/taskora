import { CircleCheckBig, ListFilter, Plus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { selectProjectEntities, selectProjectsSorted } from '@/features/projects/projectSelectors'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'
import { TaskTable } from './components/TaskTable'
import { selectAllTasks } from './taskSelectors'
import { pickOption as pick, usePriorityOptions, useStatusOptions } from './hooks/useTaskOptions'
import type { TaskPriority, TaskStatus } from './taskTypes'
import { filterTasks, isTaskDone, isTaskOverdue, matchesDueFilter, type DueFilter } from './taskUtils'


/** Every task across all projects in one dense, filterable table. */
export default function MyTasksPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('my_tasks_title'))
  const baseStatusOptions = useStatusOptions()
  const basePriorityOptions = usePriorityOptions()
  const statusOptions = useMemo(
    () => [{ value: 'all' as const, label: t('filter_any_status') }, ...baseStatusOptions],
    [t, baseStatusOptions],
  )
  const priorityOptions = useMemo(
    () => [{ value: 'all' as const, label: t('filter_any_priority') }, ...basePriorityOptions],
    [t, basePriorityOptions],
  )
  const dueOptions = useMemo<ReadonlyArray<{ value: DueFilter; label: string }>>(
    () => [
      { value: 'any', label: t('filter_any_due') },
      { value: 'overdue', label: t('filter_due_overdue') },
      { value: 'today', label: t('filter_due_today') },
      { value: 'week', label: t('filter_due_week') },
      { value: 'none', label: t('filter_due_none') },
    ],
    [t],
  )
  const today = useToday()
  const { openCreateTask } = useDialogs()
  const tasks = useAppSelector(selectAllTasks)
  const projects = useAppSelector(selectProjectsSorted)
  const projectEntities = useAppSelector(selectProjectEntities)

  const [search, setSearch] = useState('')
  const [projectId, setProjectId] = useState('all')
  const [status, setStatus] = useState<TaskStatus | 'all'>('all')
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all')
  const [due, setDue] = useState<DueFilter>('any')
  const [showCompleted, setShowCompleted] = useState(false)

  const visible = useMemo(
    () =>
      filterTasks(tasks, { search, projectId, status, priority, includeCompleted: showCompleted || status === 'done' }).filter(
        (task) => matchesDueFilter(task, due, today),
      ),
    [tasks, search, projectId, status, priority, showCompleted, due, today],
  )

  const counts = useMemo(() => {
    const open = tasks.filter((task) => !isTaskDone(task))
    return {
      open: open.length,
      overdue: open.filter((task) => isTaskOverdue(task, today)).length,
      today: open.filter((task) => task.dueDate === today).length,
      done: tasks.length - open.length,
    }
  }, [tasks, today])

  const filtersActive = search !== '' || projectId !== 'all' || status !== 'all' || priority !== 'all' || due !== 'any'
  const clearFilters = () => {
    setSearch('')
    setProjectId('all')
    setStatus('all')
    setPriority('all')
    setDue('any')
  }

  const quickFilters: Array<{ label: string; count: number; active: boolean; apply: () => void; tone?: string }> = [
    {
      label: t('my_tasks_quick_open'),
      count: counts.open,
      active: !filtersActive && !showCompleted,
      apply: () => {
        clearFilters()
        setShowCompleted(false)
      },
    },
    { label: t('my_tasks_quick_overdue'), count: counts.overdue, active: due === 'overdue', apply: () => setDue('overdue'), tone: 'text-rose-600 dark:text-rose-400' },
    { label: t('my_tasks_quick_due_today'), count: counts.today, active: due === 'today', apply: () => setDue('today'), tone: 'text-amber-600 dark:text-amber-400' },
    {
      label: t('my_tasks_quick_completed'),
      count: counts.done,
      active: status === 'done',
      apply: () => {
        clearFilters()
        setStatus('done')
      },
    },
  ]

  return (
    <PageContainer>
      <PageHeader
        title={t('my_tasks_title')}
        description={t('my_tasks_description')}
        actions={
          <Button leftIcon={<Plus />} onClick={() => openCreateTask()}>
            {t('common_new_task')}
          </Button>
        }
      />

      <div className="flex flex-wrap gap-1.5" role="group" aria-label={t('filter_quick')}>
        {quickFilters.map((filter) => (
          <button
            key={filter.label}
            type="button"
            aria-pressed={filter.active}
            onClick={filter.apply}
            className={cn(
              'inline-flex h-7 items-center gap-1.5 rounded-control border px-2.5 text-xs font-medium transition-colors',
              filter.active ? 'border-brand/40 bg-brand-soft text-brand-ink' : 'border-line bg-surface text-fg-2 hover:border-line-strong hover:text-fg',
            )}
          >
            {filter.label}
            <span className={cn('tabular', !filter.active && filter.tone)}>{filter.count}</span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-2 border-b border-line p-2.5 lg:flex-row lg:items-center">
          <SearchInput value={search} onChange={setSearch} label={t('my_tasks_search')} placeholder={t('my_tasks_search_placeholder')} className="lg:w-64" />
          <div className="grid flex-1 grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <Select
              aria-label={t('filter_by_project')}
              value={projectId}
              onChange={(event) => setProjectId(event.target.value)}
              options={[
                { value: 'all', label: t('filter_all_projects') },
                { value: 'inbox', label: t('common_inbox') },
                ...projects.map((project) => ({ value: project.id, label: project.name })),
              ]}
              className="sm:w-40"
            />
            <Select aria-label={t('filter_by_status')} options={statusOptions} value={status} onChange={(event) => setStatus(pick(statusOptions, event.target.value) ?? 'all')} className="sm:w-32" />
            <Select aria-label={t('filter_by_priority')} options={priorityOptions} value={priority} onChange={(event) => setPriority(pick(priorityOptions, event.target.value) ?? 'all')} className="sm:w-32" />
            <Select aria-label={t('filter_by_due')} options={dueOptions} value={due} onChange={(event) => setDue(pick(dueOptions, event.target.value) ?? 'any')} className="sm:w-36" />
          </div>
          <div className="flex items-center justify-between gap-3 lg:justify-end">
            <span className="flex items-center gap-2 text-xs text-fg-2">
              <Switch id="show-completed" aria-labelledby="show-completed-label" checked={showCompleted} onChange={setShowCompleted} />
              <span id="show-completed-label">{t('my_tasks_show_completed')}</span>
            </span>
            {filtersActive && (
              <Button variant="ghost" size="sm" leftIcon={<ListFilter />} onClick={clearFilters}>
                {t('filter_clear')}
              </Button>
            )}
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={tasks.length === 0 ? <CircleCheckBig /> : <SearchX />}
            title={tasks.length === 0 ? t('my_tasks_empty_title') : t('my_tasks_no_match_title')}
            description={tasks.length === 0 ? t('my_tasks_empty_description') : t('my_tasks_no_match_description')}
            action={
              tasks.length === 0 ? (
                <Button leftIcon={<Plus />} onClick={() => openCreateTask()}>
                  {t('common_new_task')}
                </Button>
              ) : (
                <Button variant="secondary" onClick={clearFilters}>
                  {t('filter_clear_all')}
                </Button>
              )
            }
          />
        ) : (
          <TaskTable tasks={visible} today={today} projects={projectEntities} label={t('my_tasks_table_label')} />
        )}
        <div className="border-t border-line px-3 py-1.5 text-xs text-fg-3" role="status">
          {filtersActive || showCompleted
            ? t('my_tasks_showing_of', { count: visible.length, total: tasks.length })
            : t('my_tasks_showing', { count: visible.length })}
        </div>
      </Card>
    </PageContainer>
  )
}
