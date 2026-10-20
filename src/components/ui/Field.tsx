import type { ReactNode } from 'react'
import { useTranslateMessage } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'
import { fieldMessageId } from './fieldIds'

interface FieldProps {
  label: string
  htmlFor: string
  error?: string
  hint?: string
  required?: boolean
  className?: string
  children: ReactNode
}

/** Label + control + hint/error wrapper. Pass `aria-describedby={fieldMessageId(id)}` to the control. */
export function Field({ label, htmlFor, error, hint, required, className, children }: FieldProps) {
  const translate = useTranslateMessage()
  const errorText = translate(error)
  const message = errorText ?? hint
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-fg-2">
        {label}
        {required && (
          <span className="ml-0.5 text-rose-500" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {message && (
        <p
          id={fieldMessageId(htmlFor)}
          className={cn('text-xs', error ? 'text-rose-600 dark:text-rose-400' : 'text-fg-3')}
          role={error ? 'alert' : undefined}
        >
          {message}
        </p>
      )}
    </div>
  )
}
