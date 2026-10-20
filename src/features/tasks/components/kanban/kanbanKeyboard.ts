import type { KeyboardCoordinateGetter } from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'

/**
 * Keyboard movement for a multi-column board. The default sortable getter only
 * understands a single list, so Left/Right jump to the neighbouring column here
 * while Up/Down keep the standard within-column behaviour.
 */
export const kanbanKeyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
  if (event.code !== 'ArrowLeft' && event.code !== 'ArrowRight') return sortableKeyboardCoordinates(event, args)

  const { active, collisionRect, droppableRects, droppableContainers } = args.context
  if (!active || !collisionRect) return undefined
  event.preventDefault()

  const columns = droppableContainers
    .getEnabled()
    .filter((container) => container.data.current?.type === 'column')
    .flatMap((container) => {
      const rect = droppableRects.get(container.id)
      return rect ? [rect] : []
    })
    .sort((a, b) => a.left - b.left)

  const centerX = collisionRect.left + collisionRect.width / 2
  const currentIndex = columns.findIndex((rect) => centerX >= rect.left && centerX <= rect.left + rect.width)
  const target = columns[currentIndex + (event.code === 'ArrowRight' ? 1 : -1)]
  if (currentIndex === -1 || !target) return undefined

  return {
    x: target.left + (target.width - collisionRect.width) / 2,
    y: target.top + 8,
  }
}
