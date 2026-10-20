import { useEffect, useEffectEvent } from 'react'
import { toast } from 'sonner'
import i18n from '@/i18n'
import { playChime } from '@/lib/sound'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { timerCompleted } from './focusSlice'
import { getScheduledEnd } from './timer'

/**
 * Mounted once in the layout. Completes the running session at its scheduled
 * end — on any page, after background-tab throttling, or right after a reload
 * if the session ended while the app was closed. Renders nothing.
 */
export function FocusTimerWatcher() {
  const dispatch = useAppDispatch()
  const timer = useAppSelector((state) => state.focus.timer)
  const soundEnabled = useAppSelector((state) => state.settings.focusSoundEnabled)

  const complete = useEffectEvent((endedAt: number) => {
    dispatch(timerCompleted(endedAt))
    const missed = Date.now() - endedAt > 60_000
    toast.success(i18n.t(timer.mode === 'focus' ? 'toast_focus_complete' : 'toast_break_finished'), {
      id: 'focus-complete',
      description: i18n.t(missed ? 'toast_focus_missed' : timer.mode === 'focus' ? 'toast_focus_take_break' : 'toast_break_next'),
    })
    if (soundEnabled && !missed) playChime()
  })

  useEffect(() => {
    const end = getScheduledEnd(timer)
    if (end === null) return
    const check = () => {
      if (Date.now() >= end) complete(end)
    }
    const timeout = window.setTimeout(check, Math.max(0, end - Date.now()))
    // Timers are throttled in background tabs; re-check as soon as the tab is visible again.
    const onVisibility = () => {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.clearTimeout(timeout)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [timer])

  return null
}
