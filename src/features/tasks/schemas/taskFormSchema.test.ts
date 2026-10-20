import { describe, expect, it } from 'vitest'
import { emptyTaskFormValues, formValuesToTaskInput, taskFormSchema } from './taskFormSchema'

const valid = { ...emptyTaskFormValues(), title: 'Plan sprint' }
const firstError = (values: unknown) => {
  const result = taskFormSchema.safeParse(values)
  return result.success ? null : result.error.issues[0]
}

describe('taskFormSchema', () => {
  it('accepts a minimal valid task', () => {
    expect(taskFormSchema.safeParse(valid).success).toBe(true)
  })

  // Messages are translation keys; the Field component renders them in the active language.
  it('rejects empty and whitespace-only titles', () => {
    expect(firstError({ ...valid, title: '   ' })?.message).toBe('validation_task_title_required')
  })

  it('rejects a due date before the start date', () => {
    const issue = firstError({ ...valid, startDate: '2026-10-20', dueDate: '2026-10-18' })
    expect(issue?.path).toEqual(['dueDate'])
    expect(issue?.message).toBe('validation_due_before_start')
  })

  it('validates the estimate', () => {
    expect(firstError({ ...valid, estimatedMinutes: '1.5' })?.message).toBe('validation_estimate_whole_minutes')
    expect(firstError({ ...valid, estimatedMinutes: '0' })?.message).toBe('validation_estimate_range')
    expect(taskFormSchema.safeParse({ ...valid, estimatedMinutes: '45' }).success).toBe(true)
  })

  it('rejects empty subtasks and invalid dates', () => {
    expect(firstError({ ...valid, subtasks: [{ title: ' ', completed: false }] })?.message).toBe('validation_subtask_required')
    expect(firstError({ ...valid, dueDate: '2026-02-30' })?.message).toBe('validation_date_invalid')
  })

  it('converts form strings to a typed task input', () => {
    const input = formValuesToTaskInput({ ...valid, projectId: '', dueDate: '2026-10-21', estimatedMinutes: '30' })
    expect(input).toMatchObject({ projectId: null, dueDate: '2026-10-21', startDate: null, estimatedMinutes: 30 })
  })
})
