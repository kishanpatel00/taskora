import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { taskDeleted } from '@/features/tasks/taskSlice'
import { createId } from '@/lib/ids'
import { dataReplaced } from '@/store/sharedActions'
import type { FocusSession, TimerMode, TimerState } from './focusTypes'
import { createIdleTimer, getElapsedMs, MIN_RECORDED_SESSION_MS, MINUTE_MS } from './timer'

export interface FocusState {
  sessions: FocusSession[]
  timer: TimerState
}

const initialState: FocusState = {
  sessions: [],
  timer: createIdleTimer('focus', 25),
}

/** Adds the current time (overridable for tests) and an id for any session the action records. */
function withNow<T extends object>(payload: T, now: number = Date.now()) {
  return { payload: { ...payload, now, sessionId: createId('focus') } }
}

type TimedPayload = { now: number; sessionId: string }

function recordSession(state: FocusState, sessionId: string, endedAt: number, elapsedMs: number, completed: boolean) {
  const { timer } = state
  if (timer.mode !== 'focus' || timer.sessionStartedAt === null) return
  state.sessions.push({
    id: sessionId,
    taskId: timer.taskId,
    startedAt: new Date(timer.sessionStartedAt).toISOString(),
    endedAt: new Date(endedAt).toISOString(),
    durationMinutes: Math.round(elapsedMs / MINUTE_MS),
    status: completed ? 'completed' : 'interrupted',
  })
}

const focusSlice = createSlice({
  name: 'focus',
  initialState,
  reducers: {
    /** Changes mode/duration. Ignored while a session is in progress. */
    timerConfigured(state, action: PayloadAction<{ mode: TimerMode; minutes: number }>) {
      if (state.timer.phase === 'running' || state.timer.phase === 'paused') return
      state.timer = createIdleTimer(action.payload.mode, action.payload.minutes, state.timer.taskId)
    },
    timerTaskSelected(state, action: PayloadAction<string | null>) {
      state.timer.taskId = action.payload
    },
    timerStarted: {
      reducer(state, action: PayloadAction<TimedPayload>) {
        if (state.timer.phase === 'running' || state.timer.phase === 'paused') return
        state.timer.phase = 'running'
        state.timer.runningSince = action.payload.now
        state.timer.elapsedBeforeMs = 0
        state.timer.sessionStartedAt = action.payload.now
      },
      prepare: (now?: number) => withNow({}, now),
    },
    timerPaused: {
      reducer(state, action: PayloadAction<TimedPayload>) {
        const { timer } = state
        if (timer.phase !== 'running') return
        timer.elapsedBeforeMs = getElapsedMs(timer, action.payload.now)
        timer.runningSince = null
        timer.phase = 'paused'
      },
      prepare: (now?: number) => withNow({}, now),
    },
    timerResumed: {
      reducer(state, action: PayloadAction<TimedPayload>) {
        if (state.timer.phase !== 'paused') return
        state.timer.phase = 'running'
        state.timer.runningSince = action.payload.now
      },
      prepare: (now?: number) => withNow({}, now),
    },
    /** Marks the session as finished. `endedAt` may be in the past if the tab was asleep or reloaded. */
    timerCompleted: {
      reducer(state, action: PayloadAction<TimedPayload & { endedAt: number }>) {
        if (state.timer.phase !== 'running') return
        recordSession(state, action.payload.sessionId, action.payload.endedAt, state.timer.durationMs, true)
        state.timer.phase = 'finished'
        state.timer.elapsedBeforeMs = state.timer.durationMs
        state.timer.runningSince = null
      },
      prepare: (endedAt: number, now?: number) => withNow({ endedAt }, now),
    },
    /** Stops the current session. Focus time of at least a minute is kept as an interrupted session. */
    timerReset: {
      reducer(state, action: PayloadAction<TimedPayload>) {
        const { timer } = state
        if (timer.phase === 'running' || timer.phase === 'paused') {
          const elapsed = getElapsedMs(timer, action.payload.now)
          if (elapsed >= MIN_RECORDED_SESSION_MS) {
            recordSession(state, action.payload.sessionId, action.payload.now, elapsed, false)
          }
        }
        state.timer = createIdleTimer(timer.mode, timer.durationMs / MINUTE_MS, timer.taskId)
      },
      prepare: (now?: number) => withNow({}, now),
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(taskDeleted, (state, action) => {
        if (state.timer.taskId === action.payload) state.timer.taskId = null
      })
      .addCase(dataReplaced, (_state, action) => ({
        sessions: action.payload.focusSessions,
        timer: action.payload.timer,
      }))
  },
})

export const { timerConfigured, timerTaskSelected, timerStarted, timerPaused, timerResumed, timerCompleted, timerReset } =
  focusSlice.actions
export default focusSlice.reducer
