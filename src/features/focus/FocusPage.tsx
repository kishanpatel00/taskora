import { Minimize2 } from 'lucide-react'
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { selectOpenTasks } from '@/features/tasks/taskSelectors'
import type { Task } from '@/features/tasks/taskTypes'
import { sortTasks } from '@/features/tasks/taskUtils'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { trapTabKey } from '@/lib/focus'
import { formatClock } from '@/lib/format'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'
import { FocusPriorities, FocusStats, SessionHistory } from './components/FocusSidebar'
import { TimerPanel } from './components/TimerPanel'
import { useTimerDisplay } from './useTimerDisplay'

const EMPTY: string[] = []

export default function FocusPage() {
  const { t } = useTranslation()
  const today = useToday()
  const [zen, setZen] = useState(false)
  const { timer, remainingMs } = useTimerDisplay()
  const openTasks = useAppSelector(selectOpenTasks)
  const pinned = useAppSelector((state) => state.planner.pinned[today] ?? EMPTY)

  const active = timer.phase === 'running' || timer.phase === 'paused'
  useDocumentTitle(
    active
      ? t('focus_document_title', { time: formatClock(remainingMs), mode: t(timer.mode === 'focus' ? 'focus_mode_focus' : 'focus_mode_break') })
      : t('focus_title'),
  )

  const priorities = useMemo(() => {
    const byId = new Map(openTasks.map((task) => [task.id, task]))
    const pinnedTasks = pinned.map((id) => byId.get(id)).filter((task): task is Task => task !== undefined)
    const dueSoon = sortTasks(
      openTasks.filter((task) => !pinned.includes(task.id) && task.dueDate !== null && task.dueDate <= today),
      'priority',
    )
    return [...pinnedTasks, ...dueSoon].slice(0, 5)
  }, [openTasks, pinned, today])

  return (
    <PageContainer>
      <PageHeader
        title={t('focus_title')}
        description={t('focus_description')}
      />
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="p-4 sm:p-6">
          <TimerPanel onEnterZen={() => setZen(true)} />
        </Card>
        <div className="flex flex-col gap-3">
          <FocusStats today={today} />
          <FocusPriorities tasks={priorities} selectedId={timer.taskId} locked={active} />
          <SessionHistory />
        </div>
      </div>
      {zen && <ZenMode onExit={() => setZen(false)} />}
    </PageContainer>
  )
}

/** Full-screen, distraction-free timer. Escape exits. */
function ZenMode({ onExit }: { onExit: () => void }) {
  const { t } = useTranslation()
  const exit = useEffectEvent(onExit)
  const panelRef = useRef<HTMLDivElement>(null)
  const taskTitle = useAppSelector((state) =>
    state.focus.timer.taskId ? state.tasks.entities[state.focus.timer.taskId]?.title : undefined,
  )

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') exit()
      if (event.key === 'Tab') trapTabKey(event, panelRef.current)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [])

  return createPortal(
    <div ref={panelRef} role="dialog" aria-modal="true" aria-label={t('focus_zen_label')} className="fixed inset-0 z-[60] flex animate-fade-in flex-col items-center justify-center gap-6 bg-bg px-4">
      <Button variant="ghost" leftIcon={<Minimize2 />} onClick={onExit} className="absolute top-4 right-4" autoFocus>
        {t('focus_exit_zen')}
      </Button>
      {taskTitle && <p className="max-w-md text-center text-lg font-medium text-fg-2">{taskTitle}</p>}
      <div className="w-full max-w-md">
        <TimerPanel zen />
      </div>
    </div>,
    document.body,
  )
}
