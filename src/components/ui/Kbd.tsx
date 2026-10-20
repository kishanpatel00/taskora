import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  default: 'border-line bg-surface-2 text-fg-3',
  /** For use on a brand-colored (selected) background. */
  inverted: 'border-white/30 bg-white/15 text-white',
} as const

interface KbdProps {
  children: ReactNode
  className?: string
  tone?: keyof typeof tones
}

export function Kbd({ children, className, tone = 'default' }: KbdProps) {
  return (
    <kbd
      className={cn(
        'inline-flex h-[18px] min-w-[18px] items-center justify-center gap-0.5 rounded-[3px] border px-1 font-sans text-[10px] leading-none font-medium [&_svg]:size-2.5',
        tones[tone],
        className,
      )}
    >
      {children}
    </kbd>
  )
}
