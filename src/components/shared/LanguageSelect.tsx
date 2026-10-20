import { Languages } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { isLanguageCode } from '@/i18n/language.config'
import { useTranslation } from '@/i18n/useTranslation'
import { cn } from '@/lib/cn'

interface LanguageSelectProps {
  id?: string
  className?: string
  size?: 'sm' | 'md'
  /** Show a globe-style icon before the select (compact headers). */
  withIcon?: boolean
  'aria-describedby'?: string
}

/** Language picker shared by Settings and the public landing page. Options are shown in their own script. */
export function LanguageSelect({ id, className, size = 'md', withIcon = false, ...aria }: LanguageSelectProps) {
  const { t, language, setLanguage, languages } = useTranslation()
  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      {withIcon && <Languages className="size-4 shrink-0 text-fg-3" aria-hidden />}
      <Select
        id={id}
        size={size}
        aria-label={t('settings_language')}
        value={language}
        onChange={(event) => {
          if (isLanguageCode(event.target.value)) setLanguage(event.target.value)
        }}
        options={languages.map((option) => ({ value: option.code, label: option.name }))}
        className="min-w-28 flex-1"
        {...aria}
      />
    </div>
  )
}
