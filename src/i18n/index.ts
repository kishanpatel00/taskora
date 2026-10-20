import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from '@/locales/en.json'
import gu from '@/locales/gu.json'
import hi from '@/locales/hi.json'
import { DEFAULT_LANGUAGE, getLanguage, isLanguageCode, readStoredLanguage, storeLanguage, type LanguageCode } from './language.config'
import type { TranslationKey } from './translation.types'
import './translation.types'

/**
 * Single i18next instance — the one authoritative source of the UI language.
 * All three flat JSON files are bundled, so switching is instant and offline.
 */
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en }, hi: { translation: hi }, gu: { translation: gu } },
  lng: readStoredLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: ['en', 'hi', 'gu'],
  interpolation: { escapeValue: false },
  returnNull: false,
  initAsync: false,
})

function applyDocumentLanguage(code: string) {
  if (typeof document === 'undefined' || !isLanguageCode(code)) return
  document.documentElement.lang = code
  document.documentElement.dir = getLanguage(code).dir
}

applyDocumentLanguage(i18n.language)
i18n.on('languageChanged', (code) => {
  applyDocumentLanguage(code)
  if (isLanguageCode(code)) storeLanguage(code)
})

export function currentLanguage(): LanguageCode {
  return isLanguageCode(i18n.language) ? i18n.language : DEFAULT_LANGUAGE
}

/** BCP 47 locale for Intl formatting (en-IN, hi-IN, gu-IN). */
export function currentLocale(): string {
  return getLanguage(currentLanguage()).locale
}

export function isTranslationKey(value: string): value is TranslationKey {
  return Object.hasOwn(en, value) || Object.hasOwn(en, `${value}_one`)
}

/**
 * Translates a key that is only known at runtime (e.g. a validation message
 * produced by a schema). Unknown strings are returned unchanged.
 */
export function translateMessage(message: string | undefined): string | undefined {
  if (message === undefined) return undefined
  return isTranslationKey(message) ? i18n.t(message) : message
}

export default i18n
