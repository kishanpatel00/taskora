import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
  className?: string
}

export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps) {
  const { t } = useTranslation()
  return (
    <div className={cn('w-full sm:w-60', className)}>
      <Input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder ?? t('common_search_placeholder')}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Escape' && value) {
            event.stopPropagation()
            onChange('')
          }
        }}
        leading={<Search />}
        className="[&::-webkit-search-cancel-button]:hidden"
        trailing={
          value ? (
            <button
              type="button"
              onClick={() => onChange('')}
              aria-label={t('common_clear_search')}
              className="rounded-control p-1 text-fg-3 hover:bg-surface-2 hover:text-fg"
            >
              <X className="size-3.5" />
            </button>
          ) : null
        }
      />
    </div>
  )
}
