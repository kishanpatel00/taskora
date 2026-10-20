export const LANGUAGES = [
  { code: 'en', name: 'English', locale: 'en-IN', dir: 'ltr' },
  { code: 'hi', name: 'हिन्दी', locale: 'hi-IN', dir: 'ltr' },
  { code: 'gu', name: 'ગુજરાતી', locale: 'gu-IN', dir: 'ltr' },
] as const

export type LanguageCode = (typeof LANGUAGES)[number]['code']
export type LanguageOption = (typeof LANGUAGES)[number]

export const DEFAULT_LANGUAGE: LanguageCode = 'en'
export const LANGUAGE_STORAGE_KEY = 'taskora.language'

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGES.some((language) => language.code === value)
}

export function getLanguage(code: LanguageCode): LanguageOption {
  return LANGUAGES.find((language) => language.code === code) ?? LANGUAGES[0]
}

/** Reads the saved language; anything missing or invalid falls back to English. */
export function readStoredLanguage(): LanguageCode {
  try {
    const stored = typeof window === 'undefined' ? null : window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
    return isLanguageCode(stored) ? stored : DEFAULT_LANGUAGE
  } catch {
    return DEFAULT_LANGUAGE
  }
}

export function storeLanguage(code: LanguageCode): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, code)
  } catch {
    // Storage may be unavailable (private mode); the choice still applies for this session.
  }
}
