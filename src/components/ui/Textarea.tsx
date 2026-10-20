import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'
import { controlClasses } from './controlStyles'

export function Textarea({ className, rows = 3, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(controlClasses, 'resize-y px-2.5 py-1.5 text-sm leading-relaxed', className)} {...props} />
}
