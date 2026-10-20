import { Check } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

interface CheckboxProps extends Omit<ComponentProps<'input'>, 'type' | 'size'> {
  size?: 'sm' | 'md'
  /** Round style for task completion. */
  round?: boolean
}

/** Native checkbox (keyboard + screen reader friendly) with a custom visual. */
export function Checkbox({ className, size = 'md', round = false, ...props }: CheckboxProps) {
  return (
    <span className={cn('relative inline-flex shrink-0', size === 'sm' ? 'size-3.5' : 'size-4', className)}>
      <input
        type="checkbox"
        className={cn(
          'peer absolute inset-0 m-0 cursor-pointer appearance-none border-[1.5px] border-line-strong bg-surface transition-colors hover:border-brand checked:border-brand checked:bg-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
          round ? 'rounded-full' : 'rounded-[3px]',
        )}
        {...props}
      />
      <Check
        className="pointer-events-none absolute inset-0 m-auto size-2.5 scale-50 stroke-[3.5] text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
        aria-hidden
      />
    </span>
  )
}
