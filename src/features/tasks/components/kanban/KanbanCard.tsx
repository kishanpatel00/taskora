import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { memo, type ReactNode } from 'react'
import { PriorityBadge } from '@/components/shared/PriorityBadge'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import type { DateKey } from '@/types/common'
import type { Task } from '../../taskTypes'
import { TaskMeta } from '../TaskMeta'

interface KanbanCardProps {
  task: Task
  today: DateKey
  onOpen: (taskId: string) => void
}

function CardBody({ task, today, onOpen, handle }: KanbanCardProps & { handle?: ReactNode }) {
  const done = task.status === 'done'
  return (
    <div className="flex flex-col gap-1.5 p-2.5">
      <div className="flex items-start gap-1">
        <button
          type="button"
          onClick={() => onOpen(task.id)}
          className={cn(
            'line-clamp-3 flex-1 rounded-control text-left text-sm leading-[18px] font-medium transition-colors hover:text-brand-ink',
            done ? 'text-fg-2' : 'text-fg',
          )}
        >
          {task.title}
        </button>
        {handle}
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <PriorityBadge priority={task.priority} />
        <TaskMeta task={task} today={today} maxTags={1} />
      </div>
    </div>
  )
}

/** Draggable card. Pointer drags work anywhere on the card; keyboard drags start from the grip handle. */
export const KanbanCard = memo(function KanbanCard({ task, today, onOpen }: KanbanCardProps) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', status: task.status },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      {...listeners}
      className={cn(
        'group touch-manipulation rounded-menu border border-line bg-surface shadow-xs transition-[border-color,box-shadow] hover:border-line-strong',
        isDragging && 'opacity-40',
      )}
    >
      <CardBody
        task={task}
        today={today}
        onOpen={onOpen}
        handle={
          <button
            type="button"
            ref={setActivatorNodeRef}
            {...attributes}
            aria-label={t('kanban_move_task', { title: task.title })}
            className="-mt-0.5 -mr-1 flex size-5 shrink-0 cursor-grab items-center justify-center rounded-control text-fg-3 opacity-40 transition-opacity group-hover:opacity-100 hover:bg-surface-2 hover:text-fg focus-visible:opacity-100 active:cursor-grabbing"
          >
            <GripVertical className="size-3.5" aria-hidden />
          </button>
        }
      />
    </div>
  )
})

/** Static copy rendered in the drag overlay. */
export function KanbanCardPreview({ task, today }: Omit<KanbanCardProps, 'onOpen'>) {
  return (
    <div className="w-64 rotate-1 cursor-grabbing rounded-menu border border-brand/50 bg-surface shadow-pop">
      <CardBody task={task} today={today} onOpen={() => undefined} />
    </div>
  )
}
