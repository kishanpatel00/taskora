import { ChevronDown } from 'lucide-react'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses, controlSizes, type ControlSize } from './controlStyles'

export interface SelectOption<T extends string = string> {
  value: T
  label: string
}

interface SelectProps<T extends string> extends Omit<ComponentProps<'select'>, 'children' | 'size'> {
  options: ReadonlyArray<SelectOption<T>>
  size?: Exclude<ControlSize, 'lg'>
}

/** Styled native select — best accessibility and mobile behavior for free. */
export function Select<T extends string>({ options, className, size = 'md', ...props }: SelectProps<T>) {
  return (
    <div className={cn('relative', className)}>
      <select
        className={cn(controlClasses, controlSizes[size], 'cursor-pointer appearance-none pr-7', size === 'sm' ? 'pl-2' : 'pl-2.5')}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-2 size-3.5 -translate-y-1/2 text-fg-3"
        aria-hidden
      />
    </div>
  )
}
