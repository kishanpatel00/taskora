import { TASK_STATUSES, type Task, type TaskStatus } from '../../taskTypes'

export type Columns = Record<TaskStatus, string[]>

export const columnDroppableId = (status: TaskStatus) => `column:${status}`

export function buildColumns(tasks: Task[]): Columns {
  const columns: Columns = { backlog: [], todo: [], in_progress: [], done: [] }
  for (const task of [...tasks].sort((a, b) => a.order - b.order)) columns[task.status].push(task.id)
  return columns
}

export function findColumn(columns: Columns, id: string): TaskStatus | undefined {
  const asColumn = TASK_STATUSES.find((status) => columnDroppableId(status) === id)
  if (asColumn) return asColumn
  return TASK_STATUSES.find((status) => columns[status].includes(id))
}

/**
 * Converts a drop position in the *visible* (possibly filtered) column into an
 * index in the project's *full* column, so hidden tasks keep their positions.
 */
export function toFullColumnIndex(
  visibleColumn: string[],
  movedId: string,
  fullColumn: string[],
): number {
  const withoutMoved = fullColumn.filter((id) => id !== movedId)
  const position = visibleColumn.indexOf(movedId)
  const previous = visibleColumn[position - 1]
  if (previous !== undefined) {
    const index = withoutMoved.indexOf(previous)
    if (index !== -1) return index + 1
  }
  const next = visibleColumn[position + 1]
  if (next !== undefined) {
    const index = withoutMoved.indexOf(next)
    if (index !== -1) return index
  }
  return position <= 0 ? 0 : withoutMoved.length
}
