import { cn } from '@/lib/cn'

/** Taskora mark: a "T" built from two strokes with a violet completion dot. Pure CSS. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn('relative flex size-6 shrink-0 items-center justify-center rounded-[5px] bg-gradient-to-br from-indigo-500 to-violet-600', className)}
      aria-hidden
    >
      <span className="absolute top-[26%] left-[22%] h-[14%] w-[56%] rounded-full bg-white" />
      <span className="absolute top-[26%] left-[43%] h-[50%] w-[14%] rounded-full bg-white" />
      <span className="absolute right-[13%] bottom-[13%] size-[19%] rounded-full bg-violet-200" />
    </span>
  )
}

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <LogoMark />
      {!collapsed && <span className="text-[15px] font-semibold tracking-tight text-fg">Taskora</span>}
    </span>
  )
}
