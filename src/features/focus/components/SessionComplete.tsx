import { CheckCheck, Coffee, PartyPopper, RotateCcw, Target } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { selectTaskById } from '@/features/tasks/taskSelectors'
import { useTaskActions } from '@/features/tasks/hooks/useTaskActions'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { timerConfigured, timerReset, timerStarted } from '../focusSlice'
import { MINUTE_MS } from '../timer'

/** Shown when a session reaches zero: celebrate, then offer the natural next step. */
export function SessionComplete() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const timer = useAppSelector((state) => state.focus.timer)
  const task = useAppSelector((state) => (timer.taskId ? selectTaskById(state, timer.taskId) : undefined))
  const { defaultFocusMinutes, defaultBreakMinutes } = useAppSelector((state) => state.settings)
  const { toggleComplete } = useTaskActions()
  const wasFocus = timer.mode === 'focus'

  const startNext = (mode: 'focus' | 'break') => {
    dispatch(timerConfigured({ mode, minutes: mode === 'focus' ? defaultFocusMinutes : defaultBreakMinutes }))
    dispatch(timerStarted())
  }

  return (
    <div className="flex animate-scale-in flex-col items-center gap-4 py-6 text-center" role="status">
      <div className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand-ink">
        {wasFocus ? <PartyPopper className="size-6" aria-hidden /> : <Coffee className="size-6" aria-hidden />}
      </div>
      <div>
        <h2 className="text-xl font-semibold text-fg">{wasFocus ? t('focus_complete_title') : t('focus_break_over_title')}</h2>
        <p className="mt-1 text-sm text-fg-2">
          {wasFocus
            ? task
              ? t('focus_complete_message_task', { minutes: Math.round(timer.durationMs / MINUTE_MS), title: task.title })
              : t('focus_complete_message', { minutes: Math.round(timer.durationMs / MINUTE_MS) })
            : t('focus_break_over_message')}
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-1.5">
        {wasFocus ? (
          <>
            <Button leftIcon={<Coffee />} onClick={() => startNext('break')}>
              {t('focus_start_break', { minutes: defaultBreakMinutes })}
            </Button>
            <Button variant="secondary" leftIcon={<Target />} onClick={() => startNext('focus')}>
              {t('focus_another_session')}
            </Button>
          </>
        ) : (
          <Button leftIcon={<Target />} onClick={() => startNext('focus')}>
            {t('focus_start_session')}
          </Button>
        )}
        <Button variant="ghost" leftIcon={<RotateCcw />} onClick={() => dispatch(timerReset())}>
          {t('focus_done_for_now')}
        </Button>
      </div>
      {wasFocus && task && task.status !== 'done' && (
        <Button variant="soft" size="sm" leftIcon={<CheckCheck />} onClick={() => toggleComplete(task)}>
          {t('focus_mark_task_complete', { title: task.title })}
        </Button>
      )}
    </div>
  )
}
