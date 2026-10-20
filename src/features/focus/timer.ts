import type { TimerMode, TimerState } from './focusTypes'

export const MINUTE_MS = 60_000
/** Interrupted sessions shorter than this are not recorded. */
export const MIN_RECORDED_SESSION_MS = MINUTE_MS

export function createIdleTimer(mode: TimerMode, minutes: number, taskId: string | null = null): TimerState {
  return {
    mode,
    phase: 'idle',
    durationMs: Math.round(minutes * MINUTE_MS),
    runningSince: null,
    elapsedBeforeMs: 0,
    sessionStartedAt: null,
    taskId,
  }
}

/** Total elapsed time, computed from timestamps — never from counting interval ticks. */
export function getElapsedMs(timer: TimerState, now: number): number {
  const running = timer.phase === 'running' && timer.runningSince !== null ? Math.max(0, now - timer.runningSince) : 0
  return Math.min(timer.durationMs, timer.elapsedBeforeMs + running)
}

export function getRemainingMs(timer: TimerState, now: number): number {
  if (timer.phase === 'finished') return 0
  return Math.max(0, timer.durationMs - getElapsedMs(timer, now))
}

/** Fraction complete, 0–1. */
export function getTimerProgress(timer: TimerState, now: number): number {
  if (timer.phase === 'finished') return 1
  return timer.durationMs === 0 ? 0 : getElapsedMs(timer, now) / timer.durationMs
}

/** The exact moment a running timer reaches zero (useful when the tab was asleep or reloaded). */
export function getScheduledEnd(timer: TimerState): number | null {
  if (timer.phase !== 'running' || timer.runningSince === null) return null
  return timer.runningSince + (timer.durationMs - timer.elapsedBeforeMs)
}

export function hasTimerExpired(timer: TimerState, now: number): boolean {
  const end = getScheduledEnd(timer)
  return end !== null && now >= end
}
