import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { useMemo, useState } from 'react'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch } from '@/store/hooks'
import type { DateKey } from '@/types/common'
import { taskMoved } from '../../taskSlice'
import { STATUS_LABEL_KEYS, TASK_STATUSES, type Task, type TaskStatus } from '../../taskTypes'
import { KanbanCardPreview } from './KanbanCard'
import { KanbanColumn } from './KanbanColumn'
import { kanbanKeyboardCoordinates } from './kanbanKeyboard'
import { buildColumns, findColumn, toFullColumnIndex, type Columns } from './kanbanUtils'

interface KanbanBoardProps {
  /** Tasks shown on the board (after search/filters). */
  tasks: Task[]
  /** Every task of the project, used to keep hidden tasks' order intact. */
  allProjectTasks: Task[]
  projectId: string | null
  today: DateKey
}

export function KanbanBoard({ tasks, allProjectTasks, projectId, today }: KanbanBoardProps) {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const { openTask, openCreateTask } = useDialogs()
  const [activeId, setActiveId] = useState<string | null>(null)
  // While dragging, a local copy of the columns gives instant cross-column feedback.
  const [dragColumns, setDragColumns] = useState<Columns | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: kanbanKeyboardCoordinates }),
  )

  const byId = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks])
  const baseColumns = useMemo(() => buildColumns(tasks), [tasks])
  const columns = dragColumns ?? baseColumns
  const activeTask = activeId ? byId.get(activeId) : undefined

  const title = (id: string | number) => byId.get(String(id))?.title ?? t('dnd_fallback_task')
  const columnLabel = (id: string | number) => {
    const status = findColumn(dragColumns ?? baseColumns, String(id))
    return status ? t(STATUS_LABEL_KEYS[status]) : t('dnd_fallback_board')
  }
  const announcements: Announcements = {
    onDragStart: ({ active }) => t('dnd_picked_up_from', { title: title(active.id), column: columnLabel(active.id) }),
    onDragOver: ({ active, over }) => (over ? t('dnd_is_in', { title: title(active.id), column: columnLabel(over.id) }) : undefined),
    onDragEnd: ({ active, over }) =>
      over
        ? t('dnd_dropped_in', { title: title(active.id), column: columnLabel(over.id) })
        : t('dnd_returned', { title: title(active.id) }),
    onDragCancel: ({ active }) => t('dnd_cancelled', { title: title(active.id) }),
  }

  const onDragStart = ({ active }: DragStartEvent) => {
    setActiveId(String(active.id))
    setDragColumns(baseColumns)
  }

  const onDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || !dragColumns) return
    const id = String(active.id)
    const from = findColumn(dragColumns, id)
    const to = findColumn(dragColumns, String(over.id))
    if (!from || !to || from === to) return
    const target = dragColumns[to].filter((item) => item !== id)
    const overIndex = target.indexOf(String(over.id))
    const insertAt = overIndex === -1 ? target.length : overIndex
    target.splice(insertAt, 0, id)
    setDragColumns({ ...dragColumns, [from]: dragColumns[from].filter((item) => item !== id), [to]: target })
  }

  const reset = () => {
    setActiveId(null)
    setDragColumns(null)
  }

  const onDragEnd = ({ active, over }: DragEndEvent) => {
    const id = String(active.id)
    const current = dragColumns
    reset()
    if (!over || !current) return
    const status = findColumn(current, id)
    const task = byId.get(id)
    if (!status || !task) return

    let column = current[status]
    const overIndex = column.indexOf(String(over.id))
    const activeIndex = column.indexOf(id)
    if (overIndex !== -1 && overIndex !== activeIndex) column = arrayMove(column, activeIndex, overIndex)

    const unchanged = status === task.status && column.join() === baseColumns[status].join()
    if (unchanged) return

    const fullColumn = allProjectTasks
      .filter((item) => item.status === status)
      .sort((a, b) => a.order - b.order)
      .map((item) => item.id)
    dispatch(taskMoved({ id, toStatus: status, toIndex: toFullColumnIndex(column, id, fullColumn) }))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={reset}
      accessibility={{ announcements, screenReaderInstructions: { draggable: t('dnd_instructions') } }}
    >
      <div className="relative -mx-4 flex snap-x snap-mandatory items-start gap-2 overflow-x-auto px-4 pb-2 scrollbar-thin sm:-mx-5 sm:px-5 lg:mx-0 lg:snap-none lg:px-0">
        {TASK_STATUSES.map((status: TaskStatus) => (
          <KanbanColumn
            key={status}
            status={status}
            today={today}
            tasks={columns[status].map((taskId) => byId.get(taskId)).filter((task): task is Task => task !== undefined)}
            onOpenTask={openTask}
            onAddTask={(taskStatus) => openCreateTask({ projectId, status: taskStatus })}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {activeTask ? <KanbanCardPreview task={activeTask} today={today} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
