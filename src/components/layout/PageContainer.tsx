import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface PageContainerProps {
  children: ReactNode
  /** `wide` lets boards and calendars use the full viewport width. */
  width?: 'default' | 'wide' | 'narrow'
  className?: string
}

const widths = { default: 'max-w-[1440px]', wide: 'max-w-none', narrow: 'max-w-[960px]' } as const

/** Standard page frame: 16px padding on phones, 20–24px on desktop, 16px between sections. */
export function PageContainer({ children, width = 'default', className }: PageContainerProps) {
  return (
    <div className={cn('mx-auto flex w-full flex-col gap-4 px-4 py-4 sm:px-5 lg:px-6 lg:py-5', widths[width], className)}>
      {children}
    </div>
  )
}
