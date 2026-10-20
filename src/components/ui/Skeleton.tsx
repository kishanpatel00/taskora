import { cn } from '@/lib/cn'

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-shimmer rounded-control bg-surface-3', className)} aria-hidden />
}
