import { CalendarClock, CircleCheckBig, FolderKanban, Plus, Timer, TriangleAlert } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { Card } from '@/components/ui/Card'
import { selectAllProjects, selectProjectEntities, selectProjectProgressMap } from '@/features/projects/projectSelectors'
import { selectAllTasks } from '@/features/tasks/taskSelectors'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { formatLongDate, getGreetingKey, timestampToDateKey } from '@/lib/date'
import { formatMinutes } from '@/lib/format'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'
import { ActivityCard, RecentProjectsCard, TopPrioritiesCard, UpcomingCard } from './components/DashboardLists'
import { StatCard } from './components/StatCard'
import { WeeklyChart } from './components/WeeklyChart'
import { computeDashboardMetrics } from './dashboardMetrics'

const EMPTY_PINS: string[] = []

export default function DashboardPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('dashboard_title'))
  const today = useToday()
  const { openCreateTask } = useDialogs()
  const tasks = useAppSelector(selectAllTasks)
  const projects = useAppSelector(selectAllProjects)
  const projectEntities = useAppSelector(selectProjectEntities)
  const progress = useAppSelector(selectProjectProgressMap)
  const sessions = useAppSelector((state) => state.focus.sessions)
  const pinned = useAppSelector((state) => state.planner.pinned[today] ?? EMPTY_PINS)
  const name = useAppSelector((state) => state.settings.displayName)

  const metrics = useMemo(
    () => computeDashboardMetrics(tasks, projects, sessions, pinned, today),
    [tasks, projects, sessions, pinned, today],
  )
  const focusToday = useMemo(
    () =>
      sessions
        .filter((session) => timestampToDateKey(session.startedAt) === today)
        .reduce((sum, session) => sum + session.durationMinutes, 0),
    [sessions, today],
  )
  const recentProjects = useMemo(
    () =>
      [...projects]
        .filter((project) => project.status !== 'completed')
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
        .slice(0, 4),
    [projects],
  )

  const greeting = t(getGreetingKey(new Date().getHours()))

  return (
    <PageContainer>
      <PageHeader
        eyebrow={formatLongDate(today)}
        title={name ? t('dashboard_welcome', { greeting, name }) : greeting}
        description={
          metrics.dueToday.length + metrics.overdue.length > 0
            ? metrics.overdue.length > 0
              ? t('dashboard_summary_due_overdue', { count: metrics.dueToday.length, overdue: metrics.overdue.length })
              : t('dashboard_summary_due', { count: metrics.dueToday.length })
            : t('dashboard_summary_clear')
        }
        actions={
          <>
            <Link to="/focus" className={buttonClasses('secondary')}>
              <Timer />
              {t('dashboard_start_focus')}
            </Link>
            <Button leftIcon={<Plus />} onClick={() => openCreateTask({ dueDate: today })}>
              {t('dashboard_task_for_today')}
            </Button>
          </>
        }
      />

      <section aria-label={t('dashboard_key_metrics')} className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label={t('dashboard_stat_due_today')}
          value={metrics.dueToday.length}
          icon={<CalendarClock />}
          tone="brand"
          to="/today"
          hint={t('dashboard_stat_done_today', { count: metrics.completedToday })}
        />
        <StatCard
          label={t('dashboard_stat_completed')}
          value={metrics.completedThisWeek}
          icon={<CircleCheckBig />}
          tone="success"
          to="/insights"
          hint={t('dashboard_stat_last_7_days')}
        />
        <StatCard
          label={t('dashboard_stat_overdue')}
          value={metrics.overdue.length}
          icon={<TriangleAlert />}
          tone="danger"
          to="/today"
          hint={metrics.overdue.length > 0 ? t('dashboard_stat_need_rescheduling') : t('dashboard_stat_on_track')}
        />
        <StatCard
          label={t('dashboard_stat_active_projects')}
          value={metrics.activeProjects}
          icon={<FolderKanban />}
          tone="accent"
          to="/projects?status=active"
          hint={t('dashboard_stat_of_projects', { count: projects.length })}
        />
      </section>

      <div className="grid gap-3 lg:grid-cols-3">
        <WeeklyChart
          data={metrics.week}
          completedThisWeek={metrics.completedThisWeek}
          completedPreviousWeek={metrics.completedPreviousWeek}
        />
        <TopPrioritiesCard tasks={metrics.topPriorities} today={today} projects={projectEntities} />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="flex flex-col gap-3 lg:col-span-2">
          <UpcomingCard tasks={metrics.upcoming} today={today} projects={projectEntities} />
          <RecentProjectsCard projects={recentProjects} progress={progress} />
        </div>
        <div className="flex flex-col gap-3">
          <FocusShortcut minutesToday={focusToday} />
          <ActivityCard items={metrics.activity} projects={projectEntities} />
        </div>
      </div>
    </PageContainer>
  )
}

function FocusShortcut({ minutesToday }: { minutesToday: number }) {
  const { t } = useTranslation()
  return (
    <Card className="flex items-center gap-3 px-3.5 py-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-control bg-accent-soft text-accent" aria-hidden>
        <Timer className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <h2 className="text-sm font-semibold text-fg">{t('dashboard_focus_title')}</h2>
        <p className="truncate text-xs text-fg-3">
          {minutesToday > 0 ? t('dashboard_focus_logged', { duration: formatMinutes(minutesToday) }) : t('dashboard_focus_none')}
        </p>
      </div>
      <Link to="/focus" className={buttonClasses('soft', 'sm')}>
        {t('dashboard_focus_start')}
      </Link>
    </Card>
  )
}
