import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/store'
import { timerCompleted, timerConfigured, timerPaused, timerReset, timerResumed, timerStarted } from './focusSlice'
import type { TimerState } from './focusTypes'
import { createIdleTimer, getElapsedMs, getRemainingMs, getScheduledEnd, getTimerProgress, hasTimerExpired } from './timer'

const MIN = 60_000

function running(overrides: Partial<TimerState> = {}): TimerState {
  return { ...createIdleTimer('focus', 25), phase: 'running', runningSince: 1_000_000, sessionStartedAt: 1_000_000, ...overrides }
}

describe('timer calculations', () => {
  it('derives remaining time from timestamps, not ticks', () => {
    const timer = running()
    expect(getRemainingMs(timer, 1_000_000)).toBe(25 * MIN)
    expect(getRemainingMs(timer, 1_000_000 + 10 * MIN)).toBe(15 * MIN)
    // A tab asleep for an hour must not go negative.
    expect(getRemainingMs(timer, 1_000_000 + 60 * MIN)).toBe(0)
  })

  it('includes time from earlier segments after a pause', () => {
    const timer = running({ elapsedBeforeMs: 5 * MIN, runningSince: 2_000_000 })
    expect(getElapsedMs(timer, 2_000_000 + 3 * MIN)).toBe(8 * MIN)
    expect(getScheduledEnd(timer)).toBe(2_000_000 + 20 * MIN)
  })

  it('freezes while paused', () => {
    const paused: TimerState = { ...running({ elapsedBeforeMs: 7 * MIN }), phase: 'paused', runningSince: null }
    expect(getRemainingMs(paused, 9_999_999_999)).toBe(18 * MIN)
    expect(getScheduledEnd(paused)).toBeNull()
  })

  it('reports progress and expiry', () => {
    const timer = running()
    expect(getTimerProgress(timer, 1_000_000 + 12.5 * MIN)).toBeCloseTo(0.5)
    expect(hasTimerExpired(timer, 1_000_000 + 25 * MIN)).toBe(true)
    expect(hasTimerExpired(timer, 1_000_000 + 24 * MIN)).toBe(false)
  })
})

describe('focus session lifecycle', () => {
  it('pauses, resumes and records a completed session at its scheduled end', () => {
    const store = createAppStore()
    store.dispatch(timerConfigured({ mode: 'focus', minutes: 25 }))
    store.dispatch(timerStarted(0))
    store.dispatch(timerPaused(10 * MIN))
    store.dispatch(timerResumed(30 * MIN))
    const end = getScheduledEnd(store.getState().focus.timer)
    expect(end).toBe(45 * MIN)

    store.dispatch(timerCompleted(end ?? 0))
    const { sessions, timer } = store.getState().focus
    expect(timer.phase).toBe('finished')
    expect(sessions).toHaveLength(1)
    expect(sessions[0]).toMatchObject({ durationMinutes: 25, status: 'completed', endedAt: new Date(45 * MIN).toISOString() })
  })

  it('records an interrupted session only when at least a minute was focused', () => {
    const store = createAppStore()
    store.dispatch(timerStarted(0))
    store.dispatch(timerReset(30_000))
    expect(store.getState().focus.sessions).toHaveLength(0)

    store.dispatch(timerStarted(0))
    store.dispatch(timerReset(12 * MIN))
    expect(store.getState().focus.sessions[0]).toMatchObject({ status: 'interrupted', durationMinutes: 12 })
    expect(store.getState().focus.timer.phase).toBe('idle')
  })

  it('ignores reconfiguration while a session is running', () => {
    const store = createAppStore()
    store.dispatch(timerStarted(0))
    store.dispatch(timerConfigured({ mode: 'break', minutes: 5 }))
    expect(store.getState().focus.timer).toMatchObject({ mode: 'focus', phase: 'running' })
  })
})
