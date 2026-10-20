import { CalendarCheck, ChevronLeft, ChevronRight, CornerDownLeft, Plus, Star, Sun } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button, IconButton } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { ProgressRing } from '@/components/ui/Progress'
import { Select } from '@/components/ui/Select'
import { selectProjectEntities, selectProjectsSorted } from '@/features/projects/projectSelectors'
import { TaskRow } from '@/features/tasks/components/TaskRow'
import { selectAllTasks } from '@/features/tasks/taskSelectors'
import { taskCreated } from '@/features/tasks/taskSlice'
import { pickOption, usePriorityOptions } from '@/features/tasks/hooks/useTaskOptions'
import type { Task, TaskPriority } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { applyManualOrder, filterTasks, groupTasksForDay, isTaskDone } from '@/features/tasks/taskUtils'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { addDaysToKey, formatDateLabel, formatLongDate, isDateKey } from '@/lib/date'
import { formatMinutes } from '@/lib/format'
import { cn } from '@/lib/cn'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { DateKey } from '@/types/common'
import { DaySection } from './components/DaySection'
import { SortableTaskList } from './components/SortableTaskList'
import { WeekStrip } from './components/WeekStrip'
import { dayOrderChanged, priorityPinToggled } from './plannerSlice'
import { MAX_PINNED_PRIORITIES } from './plannerTypes'

const EMPTY: string[] = []

export default function MyDayPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('my_day_title'))
  const basePriorityOptions = usePriorityOptions()
  const priorityOptions = useMemo(
    () => [{ value: 'all' as const, label: t('filter_all_priorities') }, ...basePriorityOptions],
    [t, basePriorityOptions],
  )
  const today = useToday()
  const dispatch = useAppDispatch()
  const { openCreateTask } = useDialogs()
  const [searchParams, setSearchParams] = useSearchParams()
  const dateParam = searchParams.get('date')
  const selected: DateKey = dateParam && isDateKey(dateParam) ? dateParam : today

  const tasks = useAppSelector(selectAllTasks)
  const projects = useAppSelector(selectProjectsSorted)
  const projectEntities = useAppSelector(selectProjectEntities)
  const weekStartsOn = useAppSelector((state) => state.settings.weekStartsOn)
  const defaultPriority = useAppSelector((state) => state.settings.defaultPriority)
  const pinnedIds = useAppSelector((state) => state.planner.pinned[selected] ?? EMPTY)
  const manualOrder = useAppSelector((state) => state.planner.order[selected])

  const [priority, setPriority] = useState<TaskPriority | 'all'>('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [quickTitle, setQuickTitle] = useState('')
  const filtersActive = priority !== 'all' || projectFilter !== 'all'

  const setSelected = (date: DateKey) => {
    setSearchParams(date === today ? {} : { date }, { replace: true })
  }

  const groups = useMemo(() => {
    const filtered = filterTasks(tasks, { priority, projectId: projectFilter })
    const grouped = groupTasksForDay(filtered, selected, today)
    return { ...grouped, day: applyManualOrder(grouped.day, manualOrder) }
  }, [tasks, priority, projectFilter, selected, today, manualOrder])

  const dueCounts = useMemo(() => {
    const counts: Record<DateKey, number> = {}
    for (const task of tasks) {
      if (task.dueDate && !isTaskDone(task)) counts[task.dueDate] = (counts[task.dueDate] ?? 0) + 1
    }
    return counts
  }, [tasks])

  const pinnedTasks = useMemo(() => {
    const byId = new Map(tasks.map((task) => [task.id, task]))
    return pinnedIds.map((id) => byId.get(id)).filter((task): task is Task => task !== undefined)
  }, [tasks, pinnedIds])

  const dayTotal = groups.day.length + groups.completed.length
  const percent = dayTotal === 0 ? 0 : Math.round((groups.completed.length / dayTotal) * 100)
  const remainingMinutes = groups.day.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0)
  const dayLabel = formatDateLabel(selected, today)

  const togglePin = (task: Task) => {
    if (!pinnedIds.includes(task.id) && pinnedIds.length >= MAX_PINNED_PRIORITIES) {
      toast.info(t('my_day_pin_limit', { max: MAX_PINNED_PRIORITIES }), { description: t('my_day_pin_limit_hint') })
      return
    }
    dispatch(priorityPinToggled({ date: selected, taskId: task.id }))
  }

  const addQuickTask = (event: FormEvent) => {
    event.preventDefault()
    const title = quickTitle.trim()
    if (!title) return
    dispatch(
      taskCreated({
        title,
        description: '',
        projectId: projectFilter === 'all' || projectFilter === 'inbox' ? null : projectFilter,
        status: 'todo',
        priority: priority === 'all' ? defaultPriority : priority,
        startDate: null,
        dueDate: selected,
        tags: [],
        estimatedMinutes: null,
        subtasks: [],
      }),
    )
    setQuickTitle('')
    toast.success(t('my_day_task_added'), { description: t('my_day_task_added_detail', { title, day: dayLabel }) })
  }

  const pinButton = (task: Task) => {
    const pinned = pinnedIds.includes(task.id)
    return (
      <IconButton
        label={pinned ? t('my_day_unpin', { title: task.title }) : t('my_day_pin', { title: task.title })}
        size="sm"
        aria-pressed={pinned}
        onClick={() => togglePin(task)}
        className={cn('size-7', !pinned && 'opacity-60 group-hover:opacity-100 focus-visible:opacity-100')}
      >
        <Star className={cn(pinned && 'fill-amber-400 text-amber-500')} />
      </IconButton>
    )
  }

  const nothingToShow =
    groups.overdue.length + groups.day.length + groups.upcoming.length + groups.completed.length === 0

  return (
    <PageContainer width="narrow">
      <PageHeader
        eyebrow={formatLongDate(selected)}
        title={selected === today ? t('my_day_title') : dayLabel}
        description={t('my_day_description')}
        actions={
          <div className="flex items-center gap-1">
            <IconButton label={t('my_day_previous_day')} variant="secondary" size="sm" onClick={() => setSelected(addDaysToKey(selected, -1))}>
              <ChevronLeft />
            </IconButton>
            <Input
              type="date"
              aria-label={t('my_day_select_date')}
              value={selected}
              onChange={(event) => {
                if (isDateKey(event.target.value)) setSelected(event.target.value)
              }}
              size="sm"
              className="w-36"
            />
            <IconButton label={t('my_day_next_day')} variant="secondary" size="sm" onClick={() => setSelected(addDaysToKey(selected, 1))}>
              <ChevronRight />
            </IconButton>
            {selected !== today && (
              <Button variant="soft" size="sm" onClick={() => setSelected(today)}>
                {t('my_day_today_button')}
              </Button>
            )}
          </div>
        }
      />

      <WeekStrip selected={selected} today={today} weekStartsOn={weekStartsOn} counts={dueCounts} onSelect={setSelected} />

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
        <Card className="flex items-center gap-3 px-3.5 py-3">
          <ProgressRing value={percent} size={48} stroke={4} label={t('my_day_completion', { day: dayLabel })} />
          <div>
            <p className="text-sm font-semibold text-fg">
              {dayTotal === 0 ? t('my_day_no_tasks_scheduled') : t('my_day_done_of', { done: groups.completed.length, total: dayTotal })}
            </p>
            <p className="mt-0.5 text-xs text-fg-3">
              {remainingMinutes > 0 ? t('my_day_estimate_left', { duration: formatMinutes(remainingMinutes) }) : t('my_day_no_estimates')}
            </p>
          </div>
        </Card>
        <Card className="px-3.5 py-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <h2 className="text-sm font-semibold text-fg">{t('my_day_top_priorities')}</h2>
            <span className="tabular text-xs text-fg-3">
              {pinnedTasks.length}/{MAX_PINNED_PRIORITIES}
            </span>
          </div>
          <ol className="flex flex-col">
            {Array.from({ length: MAX_PINNED_PRIORITIES }, (_, index) => {
              const task = pinnedTasks[index]
              return (
                <li key={task?.id ?? `slot-${index}`} className="flex h-7 items-center gap-2 text-sm">
                  <span className="tabular flex size-4 shrink-0 items-center justify-center rounded-[3px] bg-surface-3 text-[10px] font-semibold text-fg-2">
                    {index + 1}
                  </span>
                  {task ? (
                    <span className={cn('min-w-0 flex-1 truncate', isTaskDone(task) ? 'text-fg-2' : 'text-fg')}>
                      {task.title}
                    </span>
                  ) : (
                    <span className="flex flex-1 items-center gap-1 truncate text-fg-3">
                      <Star className="size-3 shrink-0" aria-hidden />
                      {t('my_day_pin_hint')}
                    </span>
                  )}
                  {task && isTaskDone(task) && <StatusBadge status="done" />}
                  {task && pinButton(task)}
                </li>
              )
            })}
          </ol>
        </Card>
      </div>

      <form onSubmit={addQuickTask} className="flex flex-col gap-2 sm:flex-row">
        <Input
          aria-label={t('my_day_quick_add_label', { day: dayLabel })}
          placeholder={t('my_day_quick_add_placeholder', { day: dayLabel })}
          value={quickTitle}
          onChange={(event) => setQuickTitle(event.target.value)}
          leading={<Plus />}
          trailing={<CornerDownLeft className="size-3.5 text-fg-3" aria-hidden />}
          maxLength={120}
        />
        <div className="flex gap-2">
          <Select
            aria-label={t('filter_by_priority')}
            options={priorityOptions}
            value={priority}
            onChange={(event) => {
              const next = pickOption(priorityOptions, event.target.value)
              if (next) setPriority(next)
            }}
            className="flex-1 sm:w-32"
          />
          <Select
            aria-label={t('filter_by_project')}
            options={[
              { value: 'all', label: t('filter_all_projects') },
              { value: 'inbox', label: t('common_inbox') },
              ...projects.map((project) => ({ value: project.id, label: project.name })),
            ]}
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="flex-1 sm:w-36"
          />
        </div>
      </form>

      {nothingToShow ? (
        <Card>
          <EmptyState
            icon={filtersActive ? <CalendarCheck /> : <Sun />}
            title={filtersActive ? t('my_day_no_match_title') : t('my_day_empty_title', { day: dayLabel })}
            description={filtersActive ? t('my_day_no_match_description') : t('my_day_empty_description')}
            action={
              filtersActive ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setPriority('all')
                    setProjectFilter('all')
                  }}
                >
                  {t('filter_clear_all')}
                </Button>
              ) : (
                <Button leftIcon={<Plus />} onClick={() => openCreateTask({ dueDate: selected })}>
                  {t('common_new_task')}
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {groups.overdue.length > 0 && (
            <DaySection id="overdue" title={t('my_day_section_overdue')} count={groups.overdue.length} tone="danger" description={t('my_day_section_overdue_hint')}>
              <ul className="flex flex-col">
                {groups.overdue.map((task) => (
                  <li key={task.id}>
                    <TaskRow task={task} today={today} project={task.projectId ? projectEntities[task.projectId] : undefined} trailing={pinButton(task)} />
                  </li>
                ))}
              </ul>
            </DaySection>
          )}

          <DaySection
            id="day"
            title={selected === today ? t('my_day_section_today') : dayLabel}
            count={groups.day.length}
            description={filtersActive ? t('my_day_reorder_disabled') : t('my_day_reorder_hint')}
          >
            {groups.day.length === 0 ? (
              <p className="px-3 py-3 text-sm text-fg-3">{t('my_day_day_empty', { day: dayLabel })}</p>
            ) : (
              <SortableTaskList
                tasks={groups.day}
                disabled={filtersActive}
                onReorder={(taskIds) => dispatch(dayOrderChanged({ date: selected, taskIds }))}
                renderTask={(task, handle) => (
                  <TaskRow
                    task={task}
                    today={today}
                    project={task.projectId ? projectEntities[task.projectId] : undefined}
                    leading={handle}
                    trailing={pinButton(task)}
                  />
                )}
              />
            )}
          </DaySection>

          <DaySection id="upcoming" title={t('my_day_section_upcoming')} count={groups.upcoming.length} description={t('my_day_section_upcoming_hint')}>
            {groups.upcoming.length === 0 ? (
              <p className="px-3 py-3 text-sm text-fg-3">{t('my_day_upcoming_empty')}</p>
            ) : (
              <ul className="flex flex-col">
                {groups.upcoming.map((task) => (
                  <li key={task.id}>
                    <TaskRow task={task} today={today} project={task.projectId ? projectEntities[task.projectId] : undefined} />
                  </li>
                ))}
              </ul>
            )}
          </DaySection>

          <DaySection id="completed" title={t('my_day_section_completed')} count={groups.completed.length} tone="success" defaultOpen={groups.completed.length <= 5}>
            {groups.completed.length === 0 ? (
              <p className="px-3 py-3 text-sm text-fg-3">{t('my_day_completed_empty', { day: dayLabel })}</p>
            ) : (
              <ul className="flex flex-col">
                {groups.completed.map((task) => (
                  <li key={task.id}>
                    <TaskRow task={task} today={today} project={task.projectId ? projectEntities[task.projectId] : undefined} />
                  </li>
                ))}
              </ul>
            )}
          </DaySection>
        </div>
      )}
    </PageContainer>
  )
}
