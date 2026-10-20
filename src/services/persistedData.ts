import { z } from 'zod'
import type { FocusSession, TimerState } from '@/features/focus/focusTypes'
import type { PlannerState } from '@/features/planner/plannerTypes'
import { PROJECT_COLORS, PROJECT_ICONS, PROJECT_STATUSES, type Project } from '@/features/projects/projectTypes'
import { DEFAULT_SETTINGS, type AppSettings } from '@/features/settings/settingsTypes'
import { TASK_PRIORITIES, TASK_STATUSES, type Subtask, type Task } from '@/features/tasks/taskTypes'
import { dateKeySchema, describeZodError, idSchema, timestampSchema } from '@/lib/validation'

export const STORAGE_VERSION = 1

/** Everything Taskora persists. This is also the export/import file format. */
export interface PersistedData {
  version: typeof STORAGE_VERSION
  tasks: Task[]
  projects: Project[]
  focusSessions: FocusSession[]
  timer: TimerState
  planner: PlannerState
  settings: AppSettings
}

const subtaskSchema = z.object({
  id: idSchema,
  title: z.string().max(200),
  completed: z.boolean(),
  order: z.number().int(),
}) satisfies z.ZodType<Subtask>

const taskSchema = z.object({
  id: idSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(5000),
  projectId: idSchema.nullable(),
  status: z.enum(TASK_STATUSES),
  priority: z.enum(TASK_PRIORITIES),
  startDate: dateKeySchema.nullable(),
  dueDate: dateKeySchema.nullable(),
  tags: z.array(z.string().max(40)).max(20),
  estimatedMinutes: z.number().int().min(0).max(10_000).nullable(),
  subtasks: z.array(subtaskSchema).max(100),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
  completedAt: timestampSchema.nullable(),
  order: z.number(),
}) satisfies z.ZodType<Task>

const projectSchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(120),
  description: z.string().max(2000),
  color: z.enum(PROJECT_COLORS),
  icon: z.enum(PROJECT_ICONS),
  status: z.enum(PROJECT_STATUSES),
  startDate: dateKeySchema.nullable(),
  dueDate: dateKeySchema.nullable(),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
}) satisfies z.ZodType<Project>

const focusSessionSchema = z.object({
  id: idSchema,
  taskId: idSchema.nullable(),
  startedAt: timestampSchema,
  endedAt: timestampSchema,
  durationMinutes: z.number().min(0).max(24 * 60),
  status: z.enum(['completed', 'interrupted']),
}) satisfies z.ZodType<FocusSession>

const timerSchema = z.object({
  mode: z.enum(['focus', 'break']),
  phase: z.enum(['idle', 'running', 'paused', 'finished']),
  durationMs: z.number().int().positive(),
  runningSince: z.number().nullable(),
  elapsedBeforeMs: z.number().min(0),
  sessionStartedAt: z.number().nullable(),
  taskId: idSchema.nullable(),
}) satisfies z.ZodType<TimerState>

const plannerSchema = z.object({
  pinned: z.record(dateKeySchema, z.array(idSchema)),
  order: z.record(dateKeySchema, z.array(idSchema)),
}) satisfies z.ZodType<PlannerState>

const d = DEFAULT_SETTINGS
/** Settings are lenient: unknown or missing values fall back to defaults. */
const settingsSchema = z.object({
  displayName: z.string().max(60).catch(d.displayName),
  theme: z.enum(['light', 'dark', 'system']).catch(d.theme),
  weekStartsOn: z.union([z.literal(0), z.literal(1)]).catch(d.weekStartsOn),
  defaultFocusMinutes: z.number().int().min(1).max(180).catch(d.defaultFocusMinutes),
  defaultBreakMinutes: z.number().int().min(1).max(60).catch(d.defaultBreakMinutes),
  defaultPriority: z.enum(TASK_PRIORITIES).catch(d.defaultPriority),
  showCompletedTasks: z.boolean().catch(d.showCompletedTasks),
  focusSoundEnabled: z.boolean().catch(d.focusSoundEnabled),
  workspaceView: z.enum(['board', 'list', 'calendar', 'insights']).catch(d.workspaceView),
  projectsLayout: z.enum(['grid', 'list']).catch(d.projectsLayout),
  sidebarCollapsed: z.boolean().catch(d.sidebarCollapsed),
}) satisfies z.ZodType<AppSettings>

export const persistedDataSchema = z.object({
  version: z.literal(STORAGE_VERSION),
  tasks: z.array(taskSchema),
  projects: z.array(projectSchema),
  focusSessions: z.array(focusSessionSchema),
  timer: timerSchema,
  planner: plannerSchema,
  settings: settingsSchema.catch(DEFAULT_SETTINGS),
}) satisfies z.ZodType<PersistedData>

export type ParseResult = { success: true; data: PersistedData } | { success: false; error: string }

/**
 * Upgrades older snapshots to the current schema. Version 1 is the first
 * schema, so this is the identity; add a step here when STORAGE_VERSION changes.
 */
function migrate(raw: unknown): unknown {
  return raw
}

function findDuplicateId(items: Array<{ id: string }>): string | null {
  const seen = new Set<string>()
  for (const item of items) {
    if (seen.has(item.id)) return item.id
    seen.add(item.id)
  }
  return null
}

/**
 * Validates unknown input (from localStorage or an imported file) and repairs
 * dangling references so the app never runs on inconsistent data.
 */
export function parsePersistedData(raw: unknown): ParseResult {
  const result = persistedDataSchema.safeParse(migrate(raw))
  if (!result.success) return { success: false, error: describeZodError(result.error) }

  const data = result.data
  const duplicate = findDuplicateId(data.tasks) ?? findDuplicateId(data.projects)
  if (duplicate) return { success: false, error: `Duplicate id "${duplicate}"` }

  const projectIds = new Set(data.projects.map((project) => project.id))
  const taskIds = new Set(data.tasks.map((task) => task.id))
  const keepKnown = (record: Record<string, string[]>) =>
    Object.fromEntries(Object.entries(record).map(([key, ids]) => [key, ids.filter((id) => taskIds.has(id))]))

  return {
    success: true,
    data: {
      ...data,
      tasks: data.tasks.map((task) =>
        task.projectId && !projectIds.has(task.projectId) ? { ...task, projectId: null } : task,
      ),
      planner: { pinned: keepKnown(data.planner.pinned), order: keepKnown(data.planner.order) },
      timer: data.timer.taskId && !taskIds.has(data.timer.taskId) ? { ...data.timer, taskId: null } : data.timer,
    },
  }
}
