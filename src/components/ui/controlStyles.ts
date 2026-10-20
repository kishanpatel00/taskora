/** Shared border/focus/invalid styling for text-like controls. Height and font size come from `controlSizes`. */
export const controlClasses =
  'w-full rounded-control border border-line-strong bg-surface text-fg transition-colors placeholder:text-fg-3 hover:border-fg-3/60 focus:border-brand focus:outline-none focus:ring-2 focus:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-rose-500 aria-[invalid=true]:focus:ring-rose-500/25'

export type ControlSize = 'sm' | 'md' | 'lg'

/** Control heights: sm 28px · md 32px · lg 36px. */
export const controlSizes: Record<ControlSize, string> = {
  sm: 'h-7 text-xs',
  md: 'h-8 text-sm',
  lg: 'h-9 text-base',
}
