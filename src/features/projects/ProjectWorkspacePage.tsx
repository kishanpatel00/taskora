import { ArrowRight, CalendarDays, ChartNoAxesCombined, Columns3, Ellipsis, FolderX, List, Pencil, Plus, Trash } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PageContainer } from '@/components/layout/PageContainer'
import { SearchInput } from '@/components/shared/SearchInput'
import { ProjectStatusBadge } from '@/components/shared/StatusBadge'
import { Button, IconButton } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { DropdownMenu } from '@/components/ui/Dropdown'
import { EmptyState } from '@/components/ui/EmptyState'
import { Progress } from '@/components/ui/Progress'
import { Select } from '@/components/ui/Select'
import { tabId, tabPanelId } from '@/components/ui/tabIds'
import { Tabs } from '@/components/ui/Tabs'
import { CalendarView } from '@/features/calendar/CalendarView'
import { ProjectInsights } from '@/features/insights/components/ProjectInsights'
import { settingsUpdated } from '@/features/settings/settingsSlice'
import type { WorkspaceView } from '@/features/settings/settingsTypes'
import { KanbanBoard } from '@/features/tasks/components/kanban/KanbanBoard'
import { TaskTable } from '@/features/tasks/components/TaskTable'
import { selectTasksByProject } from '@/features/tasks/taskSelectors'
import { pickOption, usePriorityOptions } from '@/features/tasks/hooks/useTaskOptions'
import type { Task, TaskPriority } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { collectTags, filterTasks, isTaskDone, isTaskOverdue } from '@/features/tasks/taskUtils'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { formatShortDate } from '@/lib/date'
import { formatMinutes } from '@/lib/format'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { DeleteProjectDialog } from './components/DeleteProjectDialog'
import { ProjectAvatar } from './components/ProjectAvatar'
import { selectProjectById, selectProjectEntities } from './projectSelectors'
import { PROJECT_COLOR_STYLES } from './projectStyles'
import type { Project } from './projectTypes'
import { computeProgress } from './projectUtils'

const EMPTY_TASKS: Task[] = []
const VIEW_PREFIX = 'workspace-view'

export default function ProjectWorkspacePage() {
  const { projectId = '' } = useParams()
  const { t } = useTranslation()
  const project = useAppSelector((state) => selectProjectById(state, projectId))
  useDocumentTitle(project?.name ?? t('workspace_not_found_title'))

  if (!project) {
    return (
      <PageContainer width="narrow">
        <Card>
          <EmptyState
            icon={<FolderX />}
            title={t('workspace_not_found_title')}
            description={t('workspace_not_found_description')}
            action={
              <Link to="/projects" className={buttonClasses('primary')}>
                {t('workspace_back_to_projects')}
              </Link>
            }
          />
        </Card>
      </PageContainer>
    )
  }
  // Keyed so filters reset when switching between projects.
  return <Workspace key={project.id} project={project} />
}

function Workspace({ project }: { project: Project }) {
  const { t } = useTranslation()
  const basePriorityOptions = usePriorityOptions()
  const priorityOptions = useMemo(
    () => [{ value: 'all' as const, label: t('filter_all_priorities') }, ...basePriorityOptions],
    [t, basePriorityOptions],
  )
  const viewTabs = useMemo(
    () =>
      [
        { value: 'board', label: t('workspace_view_board'), icon: <Columns3 /> },
        { value: 'list', label: t('workspace_view_list'), icon: <List /> },
        { value: 'calendar', label: t('workspace_view_calendar'), icon: <CalendarDays /> },
        { value: 'insights', label: t('workspace_view_insights'), icon: <ChartNoAxesCombined /> },
      ] as const,
    [t],
  )
  const today = useToday()
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { openCreateTask, openEditProject } = useDialogs()
  const projectTasks = useAppSelector((state) => selectTasksByProject(state)[project.id] ?? EMPTY_TASKS)
  const view = useAppSelector((state) => state.settings.workspaceView)
  const weekStartsOn = useAppSelector((state) => state.settings.weekStartsOn)
  const showCompleted = useAppSelector((state) => state.settings.showCompletedTasks)
  const projectEntities = useAppSelector(selectProjectEntities)
  const [search, setSearch] = useState('')
  const [priority, setPriority] = useState<TaskPriority | 'all'>('all')
  const [tag, setTag] = useState('all')
  const [deleting, setDeleting] = useState(false)

  const progress = useMemo(() => computeProgress(projectTasks), [projectTasks])
  const tags = useMemo(() => collectTags(projectTasks), [projectTasks])
  const filtered = useMemo(
    () => filterTasks(projectTasks, { search, priority, tag }),
    [projectTasks, search, priority, tag],
  )
  const stats = useMemo(() => {
    const open = projectTasks.filter((task) => !isTaskDone(task))
    return {
      inProgress: projectTasks.filter((task) => task.status === 'in_progress').length,
      overdue: open.filter((task) => isTaskOverdue(task, today)).length,
      remaining: open.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0),
    }
  }, [projectTasks, today])
  const filtersActive = search !== '' || priority !== 'all' || tag !== 'all'

  return (
    <PageContainer width="wide">
      <header className="flex flex-col gap-3 overflow-hidden rounded-panel border border-line bg-surface">
        <div className="flex flex-col gap-3 px-3.5 pt-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <ProjectAvatar color={project.color} icon={project.icon} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-semibold tracking-tight text-fg">{project.name}</h1>
                <ProjectStatusBadge status={project.status} />
              </div>
              <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 text-xs text-fg-3">
                <CalendarDays className="size-3" aria-hidden />
                {project.startDate ? formatShortDate(project.startDate) : t('workspace_no_start_date')}
                <ArrowRight className="size-3" aria-label={t('workspace_date_to')} />
                {project.dueDate ? formatShortDate(project.dueDate) : t('workspace_no_due_date')}
                {project.description && <span className="hidden truncate before:mr-1.5 before:content-['·'] md:inline">{project.description}</span>}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button variant="secondary" size="sm" leftIcon={<Pencil />} onClick={() => openEditProject(project.id)}>
              {t('common_edit')}
            </Button>
            <DropdownMenu
              label={t('workspace_more_actions')}
              trigger={(props) => (
                <IconButton {...props} label={t('workspace_more_actions')} variant="secondary" size="sm">
                  <Ellipsis />
                </IconButton>
              )}
              items={[{ label: t('projects_delete'), icon: <Trash />, danger: true, onSelect: () => setDeleting(true) }]}
            />
            <Button size="sm" leftIcon={<Plus />} onClick={() => openCreateTask({ projectId: project.id })}>
              {t('common_new_task')}
            </Button>
          </div>
        </div>

        <dl className="grid grid-cols-3 gap-px border-t border-line bg-line sm:grid-cols-6 [&>div]:bg-surface [&>div]:px-3.5 [&>div]:py-2">
          <div className="flex flex-col justify-center gap-1">
            <dt className="flex items-center justify-between text-xs text-fg-3">
              {t('workspace_progress')} <span className="tabular font-medium text-fg">{progress.percent}%</span>
            </dt>
            <dd>
              <Progress value={progress.percent} label={t('workspace_progress_label')} size="xs" barClassName={PROJECT_COLOR_STYLES[project.color].solid} />
            </dd>
          </div>
          <Stat label={t('workspace_stat_total')} value={progress.total} />
          <Stat label={t('workspace_stat_in_progress')} value={stats.inProgress} />
          <Stat label={t('workspace_stat_done')} value={progress.completed} />
          <Stat label={t('workspace_stat_overdue')} value={stats.overdue} danger={stats.overdue > 0} />
          <Stat label={t('workspace_stat_remaining')} value={stats.remaining > 0 ? formatMinutes(stats.remaining) : '—'} />
        </dl>
      </header>

      {/* Tabs and filters share a row only when there is room (xl); below that the filters wrap onto their own line. */}
      <div className="flex flex-col gap-2 xl:flex-row xl:items-center">
        <Tabs<WorkspaceView>
          label={t('workspace_view_label')}
          idPrefix={VIEW_PREFIX}
          items={viewTabs}
          value={view}
          onChange={(value) => dispatch(settingsUpdated({ workspaceView: value }))}
          compactOnMobile
          className="self-start"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
          <SearchInput value={search} onChange={setSearch} label={t('workspace_search')} placeholder={t('workspace_search_placeholder')} className="sm:w-56" />
          <div className="flex gap-2">
            <Select
              aria-label={t('filter_by_priority')}
              options={priorityOptions}
              value={priority}
              onChange={(event) => {
                const next = pickOption(priorityOptions, event.target.value)
                if (next) setPriority(next)
              }}
              className="flex-1 sm:w-32 sm:flex-none"
            />
            <Select
              aria-label={t('filter_by_tag')}
              options={[{ value: 'all', label: t('workspace_all_tags') }, ...tags.map((value) => ({ value, label: `#${value}` }))]}
              value={tag}
              onChange={(event) => setTag(event.target.value)}
              className="flex-1 sm:w-32 sm:flex-none"
            />
          </div>
        </div>
      </div>
      {filtersActive && (
        <p className="-mt-2 text-xs text-fg-3" role="status">
          {t('workspace_showing', { count: filtered.length, total: projectTasks.length })}{' '}
          <button
            type="button"
            className="font-medium text-brand-ink hover:underline"
            onClick={() => {
              setSearch('')
              setPriority('all')
              setTag('all')
            }}
          >
            {t('filter_clear_all')}
          </button>
        </p>
      )}

      <div role="tabpanel" id={tabPanelId(VIEW_PREFIX, view)} aria-labelledby={tabId(VIEW_PREFIX, view)}>
        {projectTasks.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Plus />}
              title={t('workspace_empty_title')}
              description={t('workspace_empty_description')}
              action={
                <Button leftIcon={<Plus />} onClick={() => openCreateTask({ projectId: project.id })}>
                  {t('workspace_add_first_task')}
                </Button>
              }
            />
          </Card>
        ) : view === 'board' ? (
          <KanbanBoard tasks={filtered} allProjectTasks={projectTasks} projectId={project.id} today={today} />
        ) : view === 'list' ? (
          <Card className="overflow-hidden">
            <TaskTable
              tasks={showCompleted ? filtered : filtered.filter((task) => !isTaskDone(task))}
              today={today}
              projects={projectEntities}
              showProject={false}
              label={t('workspace_table_label', { name: project.name })}
              initialSort="status"
            />
          </Card>
        ) : view === 'calendar' ? (
          <CalendarView tasks={filtered} today={today} weekStartsOn={weekStartsOn} projectId={project.id} />
        ) : (
          <ProjectInsights tasks={filtered} today={today} />
        )}
      </div>

      <DeleteProjectDialog
        project={deleting ? project : null}
        onClose={() => setDeleting(false)}
        onDeleted={() => void navigate('/projects')}
      />
    </PageContainer>
  )
}

function Stat({ label, value, danger = false }: { label: string; value: number | string; danger?: boolean }) {
  return (
    <div>
      <dt className="text-xs text-fg-3">{label}</dt>
      <dd className={danger ? 'tabular text-base font-semibold text-rose-600 dark:text-rose-400' : 'tabular text-base font-semibold text-fg'}>
        {value}
      </dd>
    </div>
  )
}
