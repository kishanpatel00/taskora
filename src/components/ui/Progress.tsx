import { cn } from '@/lib/cn'

interface ProgressProps {
  value: number
  label: string
  className?: string
  /** Tailwind background class for the filled bar. */
  barClassName?: string
  size?: 'xs' | 'sm' | 'md'
}

export function Progress({ value, label, className, barClassName = 'bg-brand', size = 'sm' }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
      className={cn(
        'w-full overflow-hidden rounded-full bg-surface-3',
        size === 'xs' ? 'h-1' : size === 'sm' ? 'h-1.5' : 'h-2',
        className,
      )}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500 ease-out', barClassName)}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}

interface ProgressRingProps {
  value: number
  size?: number
  stroke?: number
  label: string
  className?: string
  trackClassName?: string
  showValue?: boolean
}

export function ProgressRing({
  value,
  size = 44,
  stroke = 4,
  label,
  className = 'text-brand',
  trackClassName = 'text-surface-3',
  showValue = true,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <div
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} stroke="currentColor" className={trackClassName} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke="currentColor"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          className={cn('transition-[stroke-dashoffset] duration-500 ease-out', className)}
        />
      </svg>
      {showValue && (
        <span className="tabular absolute text-[10px] font-semibold text-fg">{Math.round(clamped)}%</span>
      )}
    </div>
  )
}
