import { createSelector } from '@reduxjs/toolkit'
import { selectTasksByProject } from '@/features/tasks/taskSelectors'
import type { RootState } from '@/store'
import { projectsAdapter } from './projectSlice'
import type { ProjectProgress } from './projectTypes'
import { computeProgress } from './projectUtils'

const adapterSelectors = projectsAdapter.getSelectors((state: RootState) => state.projects)

export const selectAllProjects = adapterSelectors.selectAll
export const selectProjectEntities = adapterSelectors.selectEntities
export const selectProjectById = adapterSelectors.selectById

/** Projects sorted alphabetically, for selects and navigation. */
export const selectProjectsSorted = createSelector([selectAllProjects], (projects) =>
  [...projects].sort((a, b) => a.name.localeCompare(b.name)),
)

/** Progress per project, derived from tasks (never stored). */
export const selectProjectProgressMap = createSelector(
  [selectAllProjects, selectTasksByProject],
  (projects, tasksByProject) => {
    const map: Record<string, ProjectProgress> = {}
    for (const project of projects) map[project.id] = computeProgress(tasksByProject[project.id] ?? [])
    return map
  },
)

export const selectActiveProjects = createSelector([selectAllProjects], (projects) =>
  projects.filter((project) => project.status === 'active' || project.status === 'planning'),
)
