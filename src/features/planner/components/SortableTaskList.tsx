import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import type { ReactNode } from 'react'
import type { Task } from '@/features/tasks/taskTypes'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'

interface SortableTaskListProps {
  tasks: Task[]
  /** Disable dragging (e.g. while filters hide part of the list). */
  disabled?: boolean
  onReorder: (orderedIds: string[]) => void
  renderTask: (task: Task, handle: ReactNode) => ReactNode
}

/** Vertical list reorderable by mouse, touch or keyboard (Space to lift, arrows to move). */
export function SortableTaskList({ tasks, disabled = false, onReorder, renderTask }: SortableTaskListProps) {
  const { t } = useTranslation()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const titles = new Map(tasks.map((task) => [task.id, task.title]))
  const title = (id: string | number) => titles.get(String(id)) ?? t('dnd_fallback_task')

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const ids = tasks.map((task) => task.id)
    const from = ids.indexOf(String(active.id))
    const to = ids.indexOf(String(over.id))
    if (from === -1 || to === -1) return
    onReorder(arrayMove(ids, from, to))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        announcements: {
          onDragStart: ({ active }) => t('dnd_picked_up', { title: title(active.id) }),
          onDragOver: ({ active, over }) => (over ? t('dnd_is_over', { title: title(active.id), target: title(over.id) }) : undefined),
          onDragEnd: ({ active, over }) =>
            over ? t('dnd_moved', { title: title(active.id) }) : t('dnd_dropped', { title: title(active.id) }),
          onDragCancel: ({ active }) => t('dnd_cancelled', { title: title(active.id) }),
        },
        screenReaderInstructions: { draggable: t('dnd_instructions') },
      }}
    >
      <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy} disabled={disabled}>
        <ul className="flex flex-col">
          {tasks.map((task) => (
            <SortableItem key={task.id} task={task} disabled={disabled} renderTask={renderTask} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function SortableItem({
  task,
  disabled,
  renderTask,
}: {
  task: Task
  disabled: boolean
  renderTask: SortableTaskListProps['renderTask']
}) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled,
  })

  const handle = disabled ? null : (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      aria-label={t('dnd_reorder_task', { title: task.title })}
      className="mt-0.5 -ml-1.5 flex size-5 shrink-0 cursor-grab touch-none items-center justify-center rounded-control text-fg-3 opacity-60 transition-opacity group-hover:opacity-100 hover:text-fg focus-visible:opacity-100 active:cursor-grabbing"
    >
      <GripVertical className="size-4" aria-hidden />
    </button>
  )

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('relative', isDragging && 'z-10 rounded-menu bg-surface shadow-pop ring-1 ring-line')}
    >
      {renderTask(task, handle)}
    </li>
  )
}
