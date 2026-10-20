import { ALL_TEMPLATES, GENERAL_TEMPLATE, PLAN_TEMPLATES, type PlanTemplate } from '@/features/smart-plan/planTemplates'
import type { TaskPriority } from '@/features/tasks/taskTypes'
import i18n from '@/i18n'
import { addDaysToKey } from '@/lib/date'
import { normalizeText } from '@/lib/format'
import type { DateKey } from '@/types/common'

export interface PlanRequest {
  goal: string
  /** Force a template, or `auto` to detect one from the goal text. */
  categoryId: string
  startDate: DateKey
}

export interface PlanSuggestion {
  key: string
  title: string
  description: string
  priority: TaskPriority
  estimatedMinutes: number
  dueDate: DateKey
  tags: string[]
}

export interface PlanResult {
  goal: string
  category: { id: string; label: string }
  matchedKeywords: string[]
  suggestions: PlanSuggestion[]
  /** Where the suggestions came from. A future AI-backed planner would report its own source. */
  source: 'template'
}

/**
 * Anything that turns a goal into suggested tasks. The UI depends only on this
 * interface, so a remote/AI implementation can replace the template planner
 * without UI changes.
 */
export interface TaskPlanner {
  generatePlan(request: PlanRequest): Promise<PlanResult>
}

/** Scores each template by keyword hits (multi-word keywords weigh more). Ties keep template order. */
export function detectTemplate(goal: string): { template: PlanTemplate; matchedKeywords: string[] } {
  // Keep letters, combining marks and digits of any script so Hindi and Gujarati goals match too.
  const text = ` ${normalizeText(goal).replace(/[^\p{L}\p{M}\p{N}\s-]/gu, ' ')} `
  let best: { template: PlanTemplate; matchedKeywords: string[]; score: number } = {
    template: GENERAL_TEMPLATE,
    matchedKeywords: [],
    score: 0,
  }
  for (const template of PLAN_TEMPLATES) {
    const matched = template.keywords.filter((keyword) => text.includes(` ${keyword}`))
    const score = matched.reduce((sum, keyword) => sum + keyword.split(' ').length, 0)
    if (score > best.score) best = { template, matchedKeywords: matched, score }
  }
  return { template: best.template, matchedKeywords: best.matchedKeywords }
}

/** Deterministic: the same request (and UI language) always yields the same plan. */
export function buildPlan(request: PlanRequest): PlanResult {
  const goal = request.goal.trim()
  const forced = request.categoryId === 'auto' ? undefined : ALL_TEMPLATES.find((t) => t.id === request.categoryId)
  const { template, matchedKeywords } = forced ? { template: forced, matchedKeywords: [] } : detectTemplate(goal)

  return {
    goal,
    category: { id: template.id, label: i18n.t(template.labelKey) },
    matchedKeywords,
    source: 'template',
    suggestions: template.steps.map((templateStep, index) => ({
      key: `${template.id}-${index}`,
      title: i18n.t(templateStep.titleKey),
      description: i18n.t(templateStep.descriptionKey),
      priority: templateStep.priority,
      estimatedMinutes: templateStep.estimatedMinutes,
      dueDate: addDaysToKey(request.startDate, templateStep.dayOffset),
      tags: templateStep.tags,
    })),
  }
}

export const templateTaskPlanner: TaskPlanner = {
  generatePlan: (request) => Promise.resolve(buildPlan(request)),
}
