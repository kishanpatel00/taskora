import { useId } from 'react'
import { cn } from '@/lib/cn'
import { MARK_ARROW, MARK_RING, MARK_VIEWBOX, WORDMARK_LETTERS, WORDMARK_O, WORDMARK_VIEWBOX } from './logoPaths'

type Gradient = { x1: number; y1: number; x2: number; y2: number }

function LinearGradient({ id, gradient, from, to }: { id: string; gradient: Gradient; from: string; to: string }) {
  return (
    <linearGradient id={id} gradientUnits="userSpaceOnUse" {...gradient}>
      <stop offset="0" stopColor={from} />
      <stop offset="1" stopColor={to} />
    </linearGradient>
  )
}

/** Taskora mark: a progress ring with a rising arrow, blue to teal. Gradient ids are unique per instance. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox={MARK_VIEWBOX} className={cn('size-6 shrink-0', className)} aria-hidden focusable="false">
      <defs>
        <LinearGradient id={`${id}-ring`} gradient={MARK_RING.gradient} from="#2045b7" to="#2ee0b4" />
        <LinearGradient id={`${id}-arrow`} gradient={MARK_ARROW.gradient} from="#2045b7" to="#2ee0b4" />
      </defs>
      <path fill={`url(#${id}-ring)`} d={MARK_RING.d} />
      <path fill={`url(#${id}-arrow)`} d={MARK_ARROW.d} />
    </svg>
  )
}

/** "Taskora" wordmark in brand blue (lighter in dark mode) with the teal-gradient "o". */
export function LogoWordmark({ className }: { className?: string }) {
  const id = useId()
  return (
    <svg viewBox={WORDMARK_VIEWBOX} className={cn('h-4 w-auto shrink-0 text-logo', className)} aria-hidden focusable="false">
      <defs>
        <LinearGradient id={`${id}-o`} gradient={WORDMARK_O.gradient} from="#1c6fb0" to="#22d6b3" />
      </defs>
      {WORDMARK_LETTERS.map((d) => (
        <path key={d.slice(0, 24)} fill="currentColor" d={d} />
      ))}
      <path fill={`url(#${id}-o)`} d={WORDMARK_O.d} />
    </svg>
  )
}

export function Logo({ collapsed = false, size = 'md' }: { collapsed?: boolean; size?: 'md' | 'lg' }) {
  const large = size === 'lg'
  return (
    <span className="flex items-center gap-2">
      <LogoMark className={large ? 'size-8' : 'size-7'} />
      {!collapsed && (
        <>
          <LogoWordmark className={large ? 'h-5' : 'h-[15px]'} />
          <span className="sr-only">Taskora</span>
        </>
      )}
    </span>
  )
}
