import { useId, useState, type ReactNode } from 'react'
import { Input } from '@/components/ui/Input'
import { useTranslation } from '@/i18n/useTranslation'

interface SettingRowProps {
  label: string
  description?: string
  /** Receives ids to wire the control's accessible name/description. */
  children: (ids: { labelId: string; descriptionId: string; controlId: string }) => ReactNode
}

export function SettingRow({ label, description, children }: SettingRowProps) {
  const id = useId()
  const ids = { labelId: `${id}-label`, descriptionId: `${id}-description`, controlId: `${id}-control` }
  return (
    <div className="flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="min-w-0">
        <label id={ids.labelId} htmlFor={ids.controlId} className="text-sm font-medium text-fg">
          {label}
        </label>
        {description && (
          <p id={ids.descriptionId} className="mt-0.5 text-xs text-fg-3">
            {description}
          </p>
        )}
      </div>
      <div className="shrink-0">{children(ids)}</div>
    </div>
  )
}

interface MinutesInputProps {
  id: string
  value: number
  min: number
  max: number
  onCommit: (value: number) => void
  describedBy?: string
}

/** Number field that only commits valid values (on blur or Enter) and shows a message otherwise. */
export function MinutesInput({ id, value, min, max, onCommit, describedBy }: MinutesInputProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<string | null>(null)
  const text = draft ?? String(value)
  const parsed = Number(text)
  const valid = /^\d+$/.test(text) && parsed >= min && parsed <= max

  const commit = () => {
    if (draft === null) return
    if (valid) onCommit(parsed)
    setDraft(null)
  }

  return (
    <div className="flex flex-col items-start gap-1 sm:items-end">
      <Input
        id={id}
        inputMode="numeric"
        value={text}
        onChange={(event) => setDraft(event.target.value.replace(/\D/g, '').slice(0, 3))}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') commit()
        }}
        aria-invalid={!valid}
        aria-describedby={describedBy}
        trailing={<span className="text-xs text-fg-3">{t('settings_minutes_suffix')}</span>}
        className="w-28"
      />
      {!valid && (
        <p className="text-xs text-rose-600 dark:text-rose-400" role="alert">
          {t('settings_minutes_range_error', { min, max })}
        </p>
      )}
    </div>
  )
}
