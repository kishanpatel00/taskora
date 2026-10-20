import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { STATUS_DOT_COLORS } from '@/components/shared/badgeStyles'
import { IconButton } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { DateKey } from '@/types/common'
import { useTranslation } from '@/i18n/useTranslation'
import { STATUS_LABEL_KEYS, type Task, type TaskStatus } from '../../taskTypes'
import { KanbanCard } from './KanbanCard'
import { columnDroppableId } from './kanbanUtils'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  today: DateKey
  onOpenTask: (taskId: string) => void
  onAddTask: (status: TaskStatus) => void
}

export function KanbanColumn({ status, tasks, today, onOpenTask, onAddTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(status), data: { type: 'column', status } })
  const { t } = useTranslation()
  const label = t(STATUS_LABEL_KEYS[status])

  return (
    <section
      aria-label={t('kanban_column_label', { status: label, count: tasks.length })}
      className="flex w-[78vw] max-w-72 shrink-0 snap-start flex-col rounded-panel border border-line bg-surface-2 sm:w-64 lg:w-0 lg:max-w-none lg:min-w-56 lg:flex-1"
    >
      <header className="flex h-9 items-center gap-2 border-b border-line pr-1 pl-2.5">
        <span className={cn('size-2 rounded-full', STATUS_DOT_COLORS[status])} aria-hidden />
        <h3 className="text-xs font-semibold tracking-wide text-fg-2 uppercase">{label}</h3>
        <span className="tabular rounded-control bg-surface-3 px-1 text-[11px] leading-4 font-medium text-fg-2">{tasks.length}</span>
        <IconButton label={t('kanban_add_task', { status: label })} size="xs" className="ml-auto" onClick={() => onAddTask(status)}>
          <Plus />
        </IconButton>
      </header>
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={cn(
            'flex min-h-24 flex-1 flex-col gap-1.5 rounded-b-panel p-1.5 transition-colors',
            isOver && 'bg-brand-soft ring-2 ring-brand/40 ring-inset',
          )}
        >
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} today={today} onOpen={onOpenTask} />
          ))}
          {tasks.length === 0 && (
            <div className="flex flex-1 items-center justify-center rounded-menu border border-dashed border-line-strong py-4 text-xs text-fg-3">
              {t('kanban_drop_here')}
            </div>
          )}
        </div>
      </SortableContext>
    </section>
  )
}
