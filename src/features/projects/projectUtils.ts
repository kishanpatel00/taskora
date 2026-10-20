import { isTaskDone } from '@/features/tasks/taskUtils'
import type { Task } from '@/features/tasks/taskTypes'
import { normalizeText } from '@/lib/format'
import type { Project, ProjectProgress, ProjectSortKey, ProjectStatus } from './projectTypes'

export function computeProgress(tasks: Task[]): ProjectProgress {
  const total = tasks.length
  const completed = tasks.filter(isTaskDone).length
  return { total, completed, percent: total === 0 ? 0 : Math.round((completed / total) * 100) }
}

export const EMPTY_PROGRESS: ProjectProgress = { total: 0, completed: 0, percent: 0 }

export function filterProjects(projects: Project[], search: string, status: ProjectStatus | 'all'): Project[] {
  const query = normalizeText(search)
  return projects.filter(
    (project) =>
      (status === 'all' || project.status === status) &&
      (!query || normalizeText(`${project.name} ${project.description}`).includes(query)),
  )
}

export function sortProjects(
  projects: Project[],
  sortKey: ProjectSortKey,
  progress: Record<string, ProjectProgress>,
): Project[] {
  const sorted = [...projects]
  switch (sortKey) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name))
    case 'dueDate':
      return sorted.sort((a, b) => (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999'))
    case 'progress':
      return sorted.sort((a, b) => (progress[b.id]?.percent ?? 0) - (progress[a.id]?.percent ?? 0))
    case 'updatedAt':
      return sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
}
