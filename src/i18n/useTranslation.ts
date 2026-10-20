import { useCallback } from 'react'
import { useTranslation as useI18nextTranslation } from 'react-i18next'
import { isTranslationKey } from './index'
import { DEFAULT_LANGUAGE, getLanguage, isLanguageCode, LANGUAGES, type LanguageCode } from './language.config'

/**
 * Thin wrapper over react-i18next. Components re-render when the language
 * changes because `t` changes identity. `t` keys are typed against en.json.
 */
export function useTranslation() {
  const { t, i18n } = useI18nextTranslation()
  const language: LanguageCode = isLanguageCode(i18n.language) ? i18n.language : DEFAULT_LANGUAGE
  const setLanguage = useCallback((code: LanguageCode) => void i18n.changeLanguage(code), [i18n])
  return { t, language, setLanguage, languages: LANGUAGES, locale: getLanguage(language).locale }
}

/**
 * Returns a function that translates runtime messages such as schema
 * validation errors (which are stored as translation keys). Unknown text is
 * returned unchanged.
 */
export function useTranslateMessage(): (message: string | undefined) => string | undefined {
  const { t } = useI18nextTranslation()
  return useCallback((message) => (message !== undefined && isTranslationKey(message) ? t(message) : message), [t])
}
