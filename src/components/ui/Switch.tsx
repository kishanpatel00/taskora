import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
  'aria-labelledby'?: string
  'aria-describedby'?: string
  disabled?: boolean
}

export function Switch({ checked, onChange, disabled, ...aria }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-8 shrink-0 cursor-pointer items-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-brand' : 'bg-surface-3 ring-1 ring-line-strong ring-inset',
      )}
      {...aria}
    >
      <span
        className={cn(
          'inline-block size-3.5 rounded-full bg-white shadow-xs transition-transform',
          checked ? 'translate-x-[15px]' : 'translate-x-[3px]',
        )}
        aria-hidden
      />
    </button>
  )
}
