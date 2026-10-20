import type { Timestamp } from '@/types/common'

export type FocusSessionStatus = 'completed' | 'interrupted'

export interface FocusSession {
  id: string
  taskId: string | null
  startedAt: Timestamp
  endedAt: Timestamp
  durationMinutes: number
  status: FocusSessionStatus
}

export type TimerMode = 'focus' | 'break'
export type TimerPhase = 'idle' | 'running' | 'paused' | 'finished'

/**
 * Persisted timer state. Remaining time is never stored directly; it is derived
 * from wall-clock timestamps so it stays correct across throttled intervals,
 * background tabs and page refreshes.
 */
export interface TimerState {
  mode: TimerMode
  phase: TimerPhase
  durationMs: number
  /** Epoch ms when the current running segment began; `null` unless running. */
  runningSince: number | null
  /** Time accumulated in earlier running segments (before pauses). */
  elapsedBeforeMs: number
  /** Epoch ms when the session was first started. */
  sessionStartedAt: number | null
  taskId: string | null
}
