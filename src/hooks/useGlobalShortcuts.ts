import { useEffect, useEffectEvent } from 'react'
import { isTypingTarget } from '@/lib/focus'

interface ShortcutHandlers {
  onCommandPalette: () => void
  onNewTask: () => void
}

/**
 * - Ctrl/⌘ + K toggles the command palette (works everywhere, even while typing).
 * - N opens "New task" — ignored while typing or when a dialog is open.
 */
export function useGlobalShortcuts({ onCommandPalette, onNewTask }: ShortcutHandlers): void {
  const openPalette = useEffectEvent(onCommandPalette)
  const newTask = useEffectEvent(onNewTask)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openPalette()
        return
      }
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey || event.repeat) return
      if (isTypingTarget(event.target) || document.querySelector('[aria-modal="true"]')) return
      if (event.key === 'n' || event.key === 'N') {
        event.preventDefault()
        newTask()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])
}
