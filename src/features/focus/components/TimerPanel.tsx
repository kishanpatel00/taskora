import { Coffee, Maximize2, Pause, Play, RotateCcw, Target } from 'lucide-react'
import { useId, useState } from 'react'
import { Button, IconButton } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { selectOpenTasks } from '@/features/tasks/taskSelectors'
import { cn } from '@/lib/cn'
import { formatClock } from '@/lib/format'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { timerConfigured, timerPaused, timerReset, timerResumed, timerStarted, timerTaskSelected } from '../focusSlice'
import type { TimerMode } from '../focusTypes'
import { MINUTE_MS } from '../timer'
import { useTimerDisplay } from '../useTimerDisplay'
import { SessionComplete } from './SessionComplete'

const PRESETS: Record<TimerMode, number[]> = { focus: [15, 25, 50], break: [5, 10, 15] }

interface TimerPanelProps {
  /** Large, minimal presentation used in zen mode. */
  zen?: boolean
  onEnterZen?: () => void
}

export function TimerPanel({ zen = false, onEnterZen }: TimerPanelProps) {
  const { t } = useTranslation()
  const modeTabs = [
    { value: 'focus', label: t('focus_mode_focus'), icon: <Target /> },
    { value: 'break', label: t('focus_mode_break'), icon: <Coffee /> },
  ] as const
  const id = useId()
  const dispatch = useAppDispatch()
  const { timer, remainingMs, progress } = useTimerDisplay()
  const openTasks = useAppSelector(selectOpenTasks)
  const settings = useAppSelector((state) => state.settings)
  const [customMinutes, setCustomMinutes] = useState('')

  const active = timer.phase === 'running' || timer.phase === 'paused'
  const minutes = Math.round(timer.durationMs / MINUTE_MS)
  const configure = (mode: TimerMode, value: number) => dispatch(timerConfigured({ mode, minutes: value }))

  const size = zen ? 320 : 240
  const stroke = zen ? 8 : 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const isBreak = timer.mode === 'break'

  if (timer.phase === 'finished') return <SessionComplete />

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="flex w-full items-center justify-between gap-3">
        <Tabs
          label={t('focus_mode_label')}
          items={modeTabs}
          value={timer.mode}
          onChange={(mode) => configure(mode, mode === 'focus' ? settings.defaultFocusMinutes : settings.defaultBreakMinutes)}
          className={cn(active && 'pointer-events-none opacity-50')}
        />
        {onEnterZen && (
          <IconButton label={t('focus_enter_zen')} onClick={onEnterZen}>
            <Maximize2 />
          </IconButton>
        )}
      </div>

      <div className="relative aspect-square" style={{ width: size, maxWidth: '100%' }}>
        <svg viewBox={`0 0 ${size} ${size}`} className="size-full -rotate-90" aria-hidden>
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-surface-3" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            className={cn('transition-[stroke-dashoffset] duration-300 ease-linear', isBreak ? 'stroke-emerald-500' : 'stroke-brand')}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] font-semibold tracking-[0.18em] text-fg-3 uppercase">
            {timer.phase === 'paused' ? t('focus_paused') : isBreak ? t('focus_mode_break') : t('focus_mode_focus')}
          </span>
          <span
            className={cn('tabular font-semibold tracking-tight text-fg', zen ? 'text-6xl' : 'text-5xl')}
            role="timer"
            aria-live="off"
            aria-label={t('focus_remaining', { time: formatClock(remainingMs) })}
          >
            {formatClock(remainingMs)}
          </span>
          <span className="mt-0.5 text-xs text-fg-3">{t('focus_session_length', { minutes })}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {timer.phase === 'idle' && (
          <Button size="lg" leftIcon={<Play />} onClick={() => dispatch(timerStarted())} className="min-w-32">
            {t('focus_start')}
          </Button>
        )}
        {timer.phase === 'running' && (
          <Button size="lg" leftIcon={<Pause />} onClick={() => dispatch(timerPaused())} className="min-w-32">
            {t('focus_pause')}
          </Button>
        )}
        {timer.phase === 'paused' && (
          <Button size="lg" leftIcon={<Play />} onClick={() => dispatch(timerResumed())} className="min-w-32">
            {t('focus_resume')}
          </Button>
        )}
        <IconButton
          label={active ? t('focus_stop_reset') : t('focus_reset')}
          variant="secondary"
          size="lg"
          onClick={() => dispatch(timerReset())}
          disabled={timer.phase === 'idle'}
        >
          <RotateCcw />
        </IconButton>
      </div>

      {!zen && (
        <div className="flex w-full flex-col gap-3 border-t border-line pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-task`} className="text-xs font-medium text-fg-2">
              {t('focus_working_on')}
            </label>
            <Select
              id={`${id}-task`}
              options={[{ value: '', label: t('focus_no_task') }, ...openTasks.map((task) => ({ value: task.id, label: task.title }))]}
              value={timer.taskId ?? ''}
              onChange={(event) => dispatch(timerTaskSelected(event.target.value || null))}
            />
          </div>
          <fieldset disabled={active} className="flex flex-col gap-1.5 disabled:opacity-50">
            <legend className="mb-1 text-xs font-medium text-fg-2">{isBreak ? t('focus_length_break') : t('focus_length_focus')}</legend>
            <div className="flex flex-wrap items-center gap-1.5">
              {PRESETS[timer.mode].map((preset) => (
                <Button
                  key={preset}
                  size="sm"
                  variant={minutes === preset ? 'soft' : 'secondary'}
                  aria-pressed={minutes === preset}
                  onClick={() => configure(timer.mode, preset)}
                >
                  {t('focus_preset_minutes', { minutes: preset })}
                </Button>
              ))}
              <form
                className="flex items-center gap-1.5"
                onSubmit={(event) => {
                  event.preventDefault()
                  const value = Number(customMinutes)
                  if (Number.isInteger(value) && value >= 1 && value <= 180) {
                    configure(timer.mode, value)
                    setCustomMinutes('')
                  }
                }}
              >
                <Input
                  aria-label={t('focus_custom_label')}
                  inputMode="numeric"
                  placeholder={t('focus_custom_placeholder')}
                  value={customMinutes}
                  onChange={(event) => setCustomMinutes(event.target.value.replace(/\D/g, '').slice(0, 3))}
                  size="sm"
                  className="w-20"
                />
                <Button type="submit" size="sm" variant="ghost" disabled={!customMinutes}>
                  {t('focus_custom_set')}
                </Button>
              </form>
            </div>
          </fieldset>
        </div>
      )}
    </div>
  )
}
