import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { taskDeleted } from '@/features/tasks/taskSlice'
import { dataReplaced } from '@/store/sharedActions'
import type { DateKey } from '@/types/common'
import { MAX_PINNED_PRIORITIES, type PlannerState } from './plannerTypes'

const initialState: PlannerState = { pinned: {}, order: {} }

const plannerSlice = createSlice({
  name: 'planner',
  initialState,
  reducers: {
    /** Pins or unpins a task as one of the day's top priorities (max three). */
    priorityPinToggled(state, action: PayloadAction<{ date: DateKey; taskId: string }>) {
      const { date, taskId } = action.payload
      const pinned = state.pinned[date] ?? []
      if (pinned.includes(taskId)) {
        state.pinned[date] = pinned.filter((id) => id !== taskId)
      } else if (pinned.length < MAX_PINNED_PRIORITIES) {
        state.pinned[date] = [...pinned, taskId]
      }
    },
    dayOrderChanged(state, action: PayloadAction<{ date: DateKey; taskIds: string[] }>) {
      state.order[action.payload.date] = action.payload.taskIds
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(taskDeleted, (state, action) => {
        for (const record of [state.pinned, state.order]) {
          for (const [date, ids] of Object.entries(record)) {
            if (ids.includes(action.payload)) record[date] = ids.filter((id) => id !== action.payload)
          }
        }
      })
      .addCase(dataReplaced, (_state, action) => action.payload.planner)
  },
})

export const { priorityPinToggled, dayOrderChanged } = plannerSlice.actions
export default plannerSlice.reducer
