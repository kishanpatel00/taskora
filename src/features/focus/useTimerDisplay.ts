import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store/hooks'
import { getRemainingMs, getTimerProgress } from './timer'

const TICK_MS = 250

/**
 * Remaining time for display. Ticks only while running; the value is always
 * recomputed from timestamps, so a late or skipped tick never drifts the timer.
 */
export function useTimerDisplay() {
  const timer = useAppSelector((state) => state.focus.timer)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (timer.phase !== 'running') return
    const interval = window.setInterval(() => setNow(Date.now()), TICK_MS)
    const onVisibility = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [timer.phase])

  // `now` may predate a start/resume that just happened; never read time before the segment began.
  const effectiveNow = timer.runningSince === null ? now : Math.max(now, timer.runningSince)
  return {
    timer,
    remainingMs: getRemainingMs(timer, effectiveNow),
    progress: getTimerProgress(timer, effectiveNow),
  }
}
