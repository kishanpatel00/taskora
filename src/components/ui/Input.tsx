import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses, controlSizes, type ControlSize } from './controlStyles'

const padding: Record<ControlSize, { x: string; left: string; right: string }> = {
  sm: { x: 'px-2', left: 'pl-2', right: 'pr-2' },
  md: { x: 'px-2.5', left: 'pl-2.5', right: 'pr-2.5' },
  lg: { x: 'px-3', left: 'pl-3', right: 'pr-3' },
}

interface InputProps extends Omit<ComponentProps<'input'>, 'size'> {
  size?: ControlSize
  leading?: ReactNode
  trailing?: ReactNode
}

export function Input({ className, leading, trailing, size = 'md', ...props }: InputProps) {
  const pad = padding[size]
  if (!leading && !trailing) {
    return <input className={cn(controlClasses, controlSizes[size], pad.x, className)} {...props} />
  }
  return (
    <div className="relative">
      {leading && (
        <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-fg-3 [&_svg]:size-3.5">
          {leading}
        </span>
      )}
      <input
        className={cn(controlClasses, controlSizes[size], leading ? 'pl-8' : pad.left, trailing ? 'pr-8' : pad.right, className)}
        {...props}
      />
      {trailing && <span className="absolute inset-y-0 right-1.5 flex items-center">{trailing}</span>}
    </div>
  )
}
