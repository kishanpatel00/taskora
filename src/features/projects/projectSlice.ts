import { createEntityAdapter, createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { createId } from '@/lib/ids'
import { dataReplaced } from '@/store/sharedActions'
import type { Timestamp } from '@/types/common'
import type { Project, ProjectInput } from './projectTypes'

export const projectsAdapter = createEntityAdapter<Project>()

function trimInput<T extends Partial<ProjectInput>>(input: T): T {
  return {
    ...input,
    ...(input.name !== undefined && { name: input.name.trim() }),
    ...(input.description !== undefined && { description: input.description.trim() }),
  }
}

const projectSlice = createSlice({
  name: 'projects',
  initialState: projectsAdapter.getInitialState(),
  reducers: {
    projectCreated: {
      reducer(state, action: PayloadAction<{ id: string; now: Timestamp; input: ProjectInput }>) {
        const { id, now, input } = action.payload
        projectsAdapter.addOne(state, { ...input, id, createdAt: now, updatedAt: now })
      },
      prepare(input: ProjectInput, options: { id?: string; now?: Timestamp } = {}) {
        return {
          payload: {
            id: options.id ?? createId('project'),
            now: options.now ?? new Date().toISOString(),
            input: trimInput(input),
          },
        }
      },
    },
    projectUpdated: {
      reducer(state, action: PayloadAction<{ id: string; changes: Partial<ProjectInput>; now: Timestamp }>) {
        const { id, changes, now } = action.payload
        projectsAdapter.updateOne(state, { id, changes: { ...changes, updatedAt: now } })
      },
      prepare(id: string, changes: Partial<ProjectInput>, now: Timestamp = new Date().toISOString()) {
        return { payload: { id, changes: trimInput(changes), now } }
      },
    },
    projectDeleted: {
      reducer(state, action: PayloadAction<{ id: string; now: Timestamp }>) {
        projectsAdapter.removeOne(state, action.payload.id)
      },
      prepare(id: string, now: Timestamp = new Date().toISOString()) {
        return { payload: { id, now } }
      },
    },
  },
  extraReducers: (builder) => {
    builder.addCase(dataReplaced, (state, action) => {
      projectsAdapter.setAll(state, action.payload.projects)
    })
  },
})

export const { projectCreated, projectUpdated, projectDeleted } = projectSlice.actions
export default projectSlice.reducer
