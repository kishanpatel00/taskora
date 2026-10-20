import { cn } from '@/lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost' | 'soft'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export const base =
  'inline-flex shrink-0 select-none items-center justify-center gap-1.5 whitespace-nowrap rounded-control font-medium transition-colors duration-100 disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring'

export const variants: Record<ButtonVariant, string> = {
  primary: 'bg-brand text-white hover:bg-brand-hover',
  secondary: 'border border-line-strong bg-surface text-fg hover:bg-surface-2',
  ghost: 'text-fg-2 hover:bg-surface-3/70 hover:text-fg',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
  'danger-ghost': 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10',
  soft: 'bg-brand-soft text-brand-ink hover:bg-brand-soft/70',
}

/** Control heights: xs 24px · sm 28px · md 32px · lg 36px. */
export const sizes: Record<ButtonSize, string> = {
  xs: 'h-6 px-2 text-xs [&_svg]:size-3',
  sm: 'h-7 px-2.5 text-xs [&_svg]:size-3.5',
  md: 'h-8 px-3 text-sm [&_svg]:size-4',
  lg: 'h-9 px-4 text-sm [&_svg]:size-4',
}

export const iconSizes: Record<ButtonSize, string> = {
  xs: 'size-6 [&_svg]:size-3.5',
  sm: 'size-7 [&_svg]:size-4',
  md: 'size-8 [&_svg]:size-4',
  lg: 'size-9 [&_svg]:size-[18px]',
}

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className?: string) {
  return cn(base, variants[variant], sizes[size], className)
}
