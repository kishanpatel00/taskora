import { describe, expect, it } from 'vitest'
import { buildTaskInputs, findDuplicates, toEditable } from '@/features/smart-plan/planImport'
import { buildPlan, detectTemplate, templateTaskPlanner } from './task-planner.service'

const START = '2026-10-20'

describe('detectTemplate', () => {
  it.each([
    ['Launch my personal portfolio website', 'website'],
    ['Release the beta of our mobile app', 'product-launch'],
    ['Learn TypeScript generics', 'learning'],
    ['Run my first 10k', 'fitness'],
    ['Prepare for a frontend job interview', 'job-search'],
    ['Organize the garage', 'general'],
  ])('maps "%s" to %s', (goal, expected) => {
    expect(detectTemplate(goal).template.id).toBe(expected)
  })
})

describe('buildPlan', () => {
  it('produces the portfolio starter plan with dated, prioritized steps', () => {
    const plan = buildPlan({ goal: 'Launch my personal portfolio website', categoryId: 'auto', startDate: START })
    expect(plan.source).toBe('template')
    expect(plan.matchedKeywords).toEqual(expect.arrayContaining(['portfolio', 'website']))
    expect(plan.suggestions.map((step) => step.title)).toEqual(
      expect.arrayContaining(['Select the design direction', 'Build the homepage', 'Make the layout responsive', 'Test and deploy the website']),
    )
    expect(plan.suggestions[0]).toMatchObject({ dueDate: START, priority: 'high' })
    expect(plan.suggestions.every((step) => step.estimatedMinutes > 0 && step.dueDate >= START)).toBe(true)
  })

  it('is deterministic and honours a forced category', async () => {
    const request = { goal: 'Anything at all', categoryId: 'event', startDate: START }
    expect(buildPlan(request)).toEqual(buildPlan(request))
    expect((await templateTaskPlanner.generatePlan(request)).category.id).toBe('event')
  })
})

describe('plan import', () => {
  const plan = buildPlan({ goal: 'Launch my portfolio website', categoryId: 'auto', startDate: START })

  it('skips suggestions that already exist in the destination and duplicates within the plan', () => {
    const items = toEditable(plan.suggestions)
    const [first, second] = items
    if (!first || !second) throw new Error('expected suggestions')
    second.title = first.title.toUpperCase()
    const duplicates = findDuplicates(items, ['  build the HOMEPAGE '])
    const homepage = items.find((item) => item.title === 'Build the homepage')
    expect(duplicates.has(second.key)).toBe(true)
    expect(homepage && duplicates.has(homepage.key)).toBe(true)
    expect(duplicates.has(first.key)).toBe(false)
  })

  it('imports only included, valid, non-duplicate suggestions', () => {
    const items = toEditable(plan.suggestions).map((item, index) => ({
      ...item,
      include: index < 3,
      estimatedMinutes: index === 1 ? 'abc' : item.estimatedMinutes,
    }))
    const inputs = buildTaskInputs(items, new Set([items[2]?.key ?? '']), 'project_x')
    expect(inputs).toHaveLength(2)
    expect(inputs[0]).toMatchObject({ projectId: 'project_x', status: 'todo', subtasks: [] })
    expect(inputs[1]?.estimatedMinutes).toBeNull()
  })
})
