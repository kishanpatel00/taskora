import { Hash, X } from 'lucide-react'
import { useState, type KeyboardEvent } from 'react'
import { controlClasses } from '@/components/ui/controlStyles'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'

interface TagInputProps {
  id: string
  value: string[]
  onChange: (tags: string[]) => void
  max: number
  invalid?: boolean
  describedBy?: string
}

function normalizeTag(raw: string): string {
  return raw.trim().toLowerCase().replace(/^#/, '').replace(/\s+/g, '-').slice(0, 24)
}

/** Chips input: Enter or comma adds a tag, Backspace on empty removes the last one. */
export function TagInput({ id, value, onChange, max, invalid, describedBy }: TagInputProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  const commit = () => {
    const tag = normalizeTag(draft)
    setDraft('')
    if (!tag || value.includes(tag) || value.length >= max) return
    onChange([...value, tag])
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      commit()
    } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  return (
    <div
      className={cn(
        controlClasses,
        'flex min-h-8 text-sm flex-wrap items-center gap-1 px-1.5 py-1 focus-within:border-brand focus-within:ring-2 focus-within:ring-ring/30',
      )}
      aria-invalid={invalid || undefined}
    >
      {value.map((tag) => (
        <span key={tag} className="inline-flex h-5 items-center gap-0.5 rounded-[3px] bg-surface-3 pr-0.5 pl-1 text-xs text-fg-2">
          <Hash className="size-3 text-fg-3" aria-hidden />
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            className="rounded-control p-0.5 text-fg-3 hover:bg-surface-3 hover:text-fg"
            aria-label={t('tags_remove', { tag })}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={onKeyDown}
        onBlur={commit}
        disabled={value.length >= max}
        placeholder={value.length >= max ? t('tags_placeholder_max', { max }) : value.length === 0 ? t('tags_placeholder_empty') : ''}
        aria-describedby={describedBy}
        className="h-5 min-w-24 flex-1 bg-transparent px-1 text-sm text-fg outline-none placeholder:text-fg-3"
      />
    </div>
  )
}
