import type { TaskInput, TaskPriority } from '@/features/tasks/taskTypes'
import { isDateKey } from '@/lib/date'
import { normalizeText } from '@/lib/format'
import type { PlanSuggestion } from '@/services/task-planner.service'

export interface EditableSuggestion {
  key: string
  include: boolean
  title: string
  description: string
  priority: TaskPriority
  estimatedMinutes: string
  dueDate: string
  tags: string[]
}

export function toEditable(suggestions: PlanSuggestion[]): EditableSuggestion[] {
  return suggestions.map((suggestion) => ({
    key: suggestion.key,
    include: true,
    title: suggestion.title,
    description: suggestion.description,
    priority: suggestion.priority,
    estimatedMinutes: String(suggestion.estimatedMinutes),
    dueDate: suggestion.dueDate,
    tags: suggestion.tags,
  }))
}

/** Returns the keys of suggestions whose title already exists in the destination (or earlier in the list). */
export function findDuplicates(suggestions: EditableSuggestion[], existingTitles: string[]): Set<string> {
  const seen = new Set(existingTitles.map(normalizeText))
  const duplicates = new Set<string>()
  for (const suggestion of suggestions) {
    const title = normalizeText(suggestion.title)
    if (!title) continue
    if (seen.has(title)) duplicates.add(suggestion.key)
    else if (suggestion.include) seen.add(title)
  }
  return duplicates
}

/** Converts the selected, non-duplicate suggestions into task inputs. */
export function buildTaskInputs(
  suggestions: EditableSuggestion[],
  duplicates: Set<string>,
  projectId: string | null,
): TaskInput[] {
  return suggestions
    .filter((suggestion) => suggestion.include && !duplicates.has(suggestion.key) && suggestion.title.trim() !== '')
    .map((suggestion) => {
      const minutes = Number(suggestion.estimatedMinutes)
      return {
        title: suggestion.title.trim(),
        description: suggestion.description,
        projectId,
        status: 'todo',
        priority: suggestion.priority,
        startDate: null,
        dueDate: isDateKey(suggestion.dueDate) ? suggestion.dueDate : null,
        tags: suggestion.tags,
        estimatedMinutes: Number.isInteger(minutes) && minutes > 0 && minutes <= 1440 ? minutes : null,
        subtasks: [],
      }
    })
}
