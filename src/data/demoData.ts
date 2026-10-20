import type { FocusSession } from '@/features/focus/focusTypes'
import { createIdleTimer } from '@/features/focus/timer'
import type { Project } from '@/features/projects/projectTypes'
import { DEFAULT_SETTINGS } from '@/features/settings/settingsTypes'
import type { Task, TaskPriority, TaskStatus } from '@/features/tasks/taskTypes'
import { addDaysToKey, todayKey } from '@/lib/date'
import { STORAGE_VERSION, type PersistedData } from '@/services/persistedData'

/**
 * Builds the first-launch demo workspace. All dates are relative to `now` so
 * the demo always looks current, and ids are fixed so output is deterministic
 * for a given `now` (tests rely on this).
 */
export function createDemoData(now: Date = new Date()): PersistedData {
  const today = todayKey(now)
  const day = (offset: number) => addDaysToKey(today, offset)

  /** Timestamp `daysAgo` days before now, at a stable hour. Never in the future. */
  const at = (daysAgo: number, hour: number): string => {
    const date = new Date(now)
    date.setDate(date.getDate() - daysAgo)
    date.setHours(hour, (hour * 7) % 60, 0, 0)
    return (date > now ? new Date(now.getTime() - 45 * 60_000) : date).toISOString()
  }

  const projects: Project[] = [
    {
      id: 'project_portfolio',
      name: 'Portfolio Website',
      description: 'A fast, accessible personal site showcasing React projects, case studies and writing.',
      color: 'indigo',
      icon: 'code',
      status: 'active',
      startDate: day(-21),
      dueDate: day(18),
      createdAt: at(21, 9),
      updatedAt: at(1, 16),
    },
    {
      id: 'project_launch',
      name: 'Product Launch',
      description: 'Go-to-market plan for the mobile companion app: assets, announcements and QA.',
      color: 'violet',
      icon: 'rocket',
      status: 'active',
      startDate: day(-35),
      dueDate: day(10),
      createdAt: at(35, 10),
      updatedAt: at(1, 11),
    },
    {
      id: 'project_learning',
      name: 'Learning Roadmap',
      description: 'Structured path to master TypeScript, testing and system design fundamentals.',
      color: 'sky',
      icon: 'book',
      status: 'active',
      startDate: day(-42),
      dueDate: day(60),
      createdAt: at(42, 8),
      updatedAt: at(2, 20),
    },
    {
      id: 'project_personal',
      name: 'Personal Goals',
      description: 'Health, finances and life admin for this quarter.',
      color: 'rose',
      icon: 'heart',
      status: 'active',
      startDate: day(-30),
      dueDate: null,
      createdAt: at(30, 19),
      updatedAt: at(0, 7),
    },
    {
      id: 'project_office',
      name: 'Home Office Setup',
      description: 'Ergonomic desk setup for focused remote work.',
      color: 'amber',
      icon: 'house',
      status: 'completed',
      startDate: day(-52),
      dueDate: day(-36),
      createdAt: at(52, 18),
      updatedAt: at(36, 12),
    },
  ]

  interface Seed {
    id: string
    project: string | null
    title: string
    status: TaskStatus
    priority: TaskPriority
    createdDaysAgo: number
    due?: number
    start?: number
    completedDaysAgo?: number
    tags?: string[]
    estimate?: number
    description?: string
    subtasks?: Array<[string, boolean]>
  }

  const seeds: Seed[] = [
    // Portfolio Website
    { id: 'task_pf_structure', project: 'project_portfolio', title: 'Define site structure and navigation', status: 'done', priority: 'high', createdDaysAgo: 20, completedDaysAgo: 17, tags: ['planning'], estimate: 60, subtasks: [['List pages', true], ['Sketch sitemap', true]] },
    { id: 'task_pf_palette', project: 'project_portfolio', title: 'Choose typography and color palette', status: 'done', priority: 'medium', createdDaysAgo: 19, completedDaysAgo: 15, tags: ['design'], estimate: 45 },
    { id: 'task_pf_darkmode', project: 'project_portfolio', title: 'Add dark mode toggle', status: 'done', priority: 'low', createdDaysAgo: 14, completedDaysAgo: 9, tags: ['frontend'], estimate: 40 },
    { id: 'task_pf_screens', project: 'project_portfolio', title: 'Collect project screenshots', status: 'done', priority: 'low', createdDaysAgo: 10, completedDaysAgo: 5, tags: ['content'], estimate: 30 },
    { id: 'task_pf_hero', project: 'project_portfolio', title: 'Build responsive homepage hero', status: 'in_progress', priority: 'high', createdDaysAgo: 12, start: -2, due: 0, tags: ['frontend', 'react'], estimate: 120, description: 'Hero with headline, short intro, primary CTA and a subtle animated background. Must look great at 360px.', subtasks: [['Layout grid', true], ['Hero copy', true], ['Animated CTA', false], ['Mobile polish pass', false]] },
    { id: 'task_pf_casestudy', project: 'project_portfolio', title: 'Write case study: task manager app', status: 'todo', priority: 'high', createdDaysAgo: 6, due: 2, tags: ['writing'], estimate: 90, subtasks: [['Problem & goals', false], ['Architecture diagram', false], ['Results & learnings', false]] },
    { id: 'task_pf_gallery', project: 'project_portfolio', title: 'Create projects gallery section', status: 'todo', priority: 'medium', createdDaysAgo: 6, due: 5, tags: ['frontend'], estimate: 150 },
    { id: 'task_pf_deploy', project: 'project_portfolio', title: 'Configure custom domain and deploy', status: 'todo', priority: 'urgent', createdDaysAgo: 3, due: 17, tags: ['deploy'], estimate: 45 },
    { id: 'task_pf_contact', project: 'project_portfolio', title: 'Set up contact form validation', status: 'backlog', priority: 'low', createdDaysAgo: 4, due: 12, tags: ['frontend'], estimate: 60 },
    { id: 'task_pf_perf', project: 'project_portfolio', title: 'Improve Lighthouse performance score', status: 'backlog', priority: 'medium', createdDaysAgo: 2, due: 15, tags: ['performance'], estimate: 90 },

    // Product Launch
    { id: 'task_pl_pricing', project: 'project_launch', title: 'Finalize pricing tiers', status: 'done', priority: 'high', createdDaysAgo: 30, completedDaysAgo: 26, tags: ['strategy'], estimate: 90 },
    { id: 'task_pl_matrix', project: 'project_launch', title: 'Competitor feature matrix', status: 'done', priority: 'medium', createdDaysAgo: 22, completedDaysAgo: 18, tags: ['research'], estimate: 120 },
    { id: 'task_pl_analytics', project: 'project_launch', title: 'Set up analytics dashboard', status: 'done', priority: 'medium', createdDaysAgo: 25, completedDaysAgo: 20, tags: ['analytics'], estimate: 60 },
    { id: 'task_pl_landing', project: 'project_launch', title: 'Landing page copy review', status: 'done', priority: 'medium', createdDaysAgo: 14, completedDaysAgo: 10, tags: ['writing'], estimate: 45 },
    { id: 'task_pl_notes', project: 'project_launch', title: 'Write release notes for v1.0', status: 'done', priority: 'medium', createdDaysAgo: 12, completedDaysAgo: 3, tags: ['writing'], estimate: 60 },
    { id: 'task_pl_email', project: 'project_launch', title: 'Fix signup email deliverability', status: 'done', priority: 'urgent', createdDaysAgo: 7, completedDaysAgo: 1, tags: ['bug'], estimate: 75 },
    { id: 'task_pl_qa', project: 'project_launch', title: 'QA pass on onboarding flow', status: 'in_progress', priority: 'urgent', createdDaysAgo: 9, start: -4, due: -2, tags: ['qa'], estimate: 120, subtasks: [['iOS signup', true], ['Android signup', false], ['Password reset', false]] },
    { id: 'task_pl_blog', project: 'project_launch', title: 'Draft launch announcement blog post', status: 'in_progress', priority: 'high', createdDaysAgo: 8, due: 1, tags: ['writing', 'marketing'], estimate: 90, subtasks: [['Outline', true], ['First draft', false], ['Review with team', false]] },
    { id: 'task_pl_screens', project: 'project_launch', title: 'Prepare App Store screenshots', status: 'todo', priority: 'urgent', createdDaysAgo: 10, due: -1, tags: ['design'], estimate: 60 },
    { id: 'task_pl_beta', project: 'project_launch', title: 'Email beta users with launch date', status: 'todo', priority: 'medium', createdDaysAgo: 4, due: 0, tags: ['marketing'], estimate: 30 },
    { id: 'task_pl_demo', project: 'project_launch', title: 'Record product demo video', status: 'todo', priority: 'high', createdDaysAgo: 5, due: 3, tags: ['marketing'], estimate: 120 },
    { id: 'task_pl_press', project: 'project_launch', title: 'Coordinate press outreach list', status: 'backlog', priority: 'medium', createdDaysAgo: 3, due: 8, tags: ['marketing'], estimate: 60 },

    // Learning Roadmap
    { id: 'task_lr_generics', project: 'project_learning', title: 'Complete TypeScript generics module', status: 'done', priority: 'medium', createdDaysAgo: 40, completedDaysAgo: 33, tags: ['typescript'], estimate: 120 },
    { id: 'task_lr_rsc', project: 'project_learning', title: 'Notes on React Server Components', status: 'done', priority: 'low', createdDaysAgo: 16, completedDaysAgo: 13, tags: ['react'], estimate: 60 },
    { id: 'task_lr_ddia', project: 'project_learning', title: 'Read “Designing Data-Intensive Applications” ch. 1–3', status: 'done', priority: 'low', createdDaysAgo: 28, completedDaysAgo: 12, tags: ['reading'], estimate: 180 },
    { id: 'task_lr_vitest', project: 'project_learning', title: 'Set up Vitest in sandbox repo', status: 'done', priority: 'medium', createdDaysAgo: 11, completedDaysAgo: 8, tags: ['testing'], estimate: 45 },
    { id: 'task_lr_algos', project: 'project_learning', title: 'Solve 5 algorithm problems', status: 'done', priority: 'low', createdDaysAgo: 5, completedDaysAgo: 2, tags: ['practice'], estimate: 90 },
    { id: 'task_lr_rtl', project: 'project_learning', title: 'Practice React Testing Library patterns', status: 'in_progress', priority: 'medium', createdDaysAgo: 7, due: 4, tags: ['testing', 'react'], estimate: 120, subtasks: [['Queries by role', true], ['User events', true], ['Async utilities', false], ['Mocking modules', false]] },
    { id: 'task_lr_a11y', project: 'project_learning', title: 'Watch accessibility fundamentals course', status: 'todo', priority: 'low', createdDaysAgo: 3, due: 0, tags: ['a11y'], estimate: 60 },
    { id: 'task_lr_redux', project: 'project_learning', title: 'Build a Redux Toolkit side project', status: 'todo', priority: 'medium', createdDaysAgo: 6, due: 14, tags: ['react', 'redux'], estimate: 240 },
    { id: 'task_lr_sysdesign', project: 'project_learning', title: 'System design: URL shortener write-up', status: 'backlog', priority: 'low', createdDaysAgo: 2, due: 21, tags: ['system-design'], estimate: 120 },

    // Personal Goals
    { id: 'task_pg_donate', project: 'project_personal', title: 'Donate old clothes', status: 'done', priority: 'low', createdDaysAgo: 24, completedDaysAgo: 22, tags: ['home'], estimate: 45 },
    { id: 'task_pg_mealprep', project: 'project_personal', title: 'Meal prep for the week', status: 'done', priority: 'medium', createdDaysAgo: 9, completedDaysAgo: 7, tags: ['health'], estimate: 90 },
    { id: 'task_pg_subs', project: 'project_personal', title: 'Cancel unused subscriptions', status: 'done', priority: 'low', createdDaysAgo: 6, completedDaysAgo: 4, tags: ['finance'], estimate: 20 },
    { id: 'task_pg_run', project: 'project_personal', title: 'Morning run — 5k', status: 'done', priority: 'medium', createdDaysAgo: 1, completedDaysAgo: 0, due: 0, tags: ['health'], estimate: 35 },
    { id: 'task_pg_budget', project: 'project_personal', title: 'Review monthly budget', status: 'todo', priority: 'high', createdDaysAgo: 4, due: 0, tags: ['finance'], estimate: 30 },
    { id: 'task_pg_dentist', project: 'project_personal', title: 'Book dentist appointment', status: 'todo', priority: 'medium', createdDaysAgo: 8, due: -3, tags: ['health'], estimate: 10 },
    { id: 'task_pg_passport', project: 'project_personal', title: 'Renew passport', status: 'todo', priority: 'high', createdDaysAgo: 10, due: 9, tags: ['admin'], estimate: 60, subtasks: [['Get new photos', false], ['Fill in application', false], ['Submit at post office', false]] },
    { id: 'task_pg_hike', project: 'project_personal', title: 'Plan weekend hiking trip', status: 'backlog', priority: 'low', createdDaysAgo: 2, due: 6, tags: ['outdoors'], estimate: 45 },

    // Home Office Setup (completed project)
    { id: 'task_ho_desk', project: 'project_office', title: 'Order standing desk', status: 'done', priority: 'high', createdDaysAgo: 50, completedDaysAgo: 45, tags: ['purchase'], estimate: 30 },
    { id: 'task_ho_cables', project: 'project_office', title: 'Cable management', status: 'done', priority: 'low', createdDaysAgo: 48, completedDaysAgo: 40, tags: ['home'], estimate: 60 },
    { id: 'task_ho_monitor', project: 'project_office', title: 'Set up monitor arm', status: 'done', priority: 'medium', createdDaysAgo: 47, completedDaysAgo: 38, tags: ['home'], estimate: 40 },

    // Inbox
    { id: 'task_in_landlord', project: null, title: 'Call landlord about lease renewal', status: 'todo', priority: 'medium', createdDaysAgo: 2, due: 2, tags: ['home'], estimate: 15 },
    { id: 'task_in_downloads', project: null, title: 'Organize downloads folder', status: 'backlog', priority: 'low', createdDaysAgo: 1, tags: [], estimate: 20 },
  ]

  const columnCounters = new Map<string, number>()
  const tasks: Task[] = seeds.map((seed, index) => {
    const columnKey = `${seed.project ?? 'inbox'}:${seed.status}`
    const order = columnCounters.get(columnKey) ?? 0
    columnCounters.set(columnKey, order + 1)
    const createdAt = at(seed.createdDaysAgo, 9 + (index % 4))
    const completedAt = seed.completedDaysAgo === undefined ? null : at(seed.completedDaysAgo, 11 + (index % 8))
    return {
      id: seed.id,
      title: seed.title,
      description: seed.description ?? '',
      projectId: seed.project,
      status: seed.status,
      priority: seed.priority,
      startDate: seed.start === undefined ? null : day(seed.start),
      dueDate: seed.due === undefined ? (seed.completedDaysAgo === undefined ? null : day(-seed.completedDaysAgo)) : day(seed.due),
      tags: seed.tags ?? [],
      estimatedMinutes: seed.estimate ?? null,
      subtasks: (seed.subtasks ?? []).map(([title, completed], position) => ({
        id: `${seed.id}_sub${position}`,
        title,
        completed,
        order: position,
      })),
      createdAt,
      updatedAt: completedAt ?? createdAt,
      completedAt,
      order,
    }
  })

  // Focus history over the last three weeks; a repeating pattern keeps it deterministic.
  const sessionsPerDay = [2, 1, 3, 0, 2, 1, 0, 3, 2, 1, 2, 0, 1, 2, 3, 1, 0, 2, 1, 2, 1]
  const focusTasks = ['task_pf_hero', 'task_pl_qa', 'task_lr_rtl', 'task_pl_blog', 'task_lr_vitest', null]
  const focusSessions: FocusSession[] = []
  sessionsPerDay.forEach((count, dayIndex) => {
    const daysAgo = dayIndex + 1
    for (let n = 0; n < count; n++) {
      const interrupted = (dayIndex + n) % 7 === 3
      const minutes = interrupted ? 14 : n % 3 === 2 ? 50 : 25
      const start = new Date(at(daysAgo, 9 + n * 2))
      focusSessions.push({
        id: `focus_demo_${daysAgo}_${n}`,
        taskId: focusTasks[(dayIndex + n) % focusTasks.length] ?? null,
        startedAt: start.toISOString(),
        endedAt: new Date(start.getTime() + minutes * 60_000).toISOString(),
        durationMinutes: minutes,
        status: interrupted ? 'interrupted' : 'completed',
      })
    }
  })
  focusSessions.sort((a, b) => a.startedAt.localeCompare(b.startedAt))

  return {
    version: STORAGE_VERSION,
    tasks,
    projects,
    focusSessions,
    timer: createIdleTimer('focus', DEFAULT_SETTINGS.defaultFocusMinutes),
    planner: {
      pinned: { [today]: ['task_pf_hero', 'task_pl_qa', 'task_pg_budget'] },
      order: {},
    },
    settings: DEFAULT_SETTINGS,
  }
}
