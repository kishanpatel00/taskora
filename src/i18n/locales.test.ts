import { afterEach, describe, expect, it } from 'vitest'
import { PLAN_TEMPLATES } from '@/features/smart-plan/planTemplates'
import en from '@/locales/en.json'
import gu from '@/locales/gu.json'
import hi from '@/locales/hi.json'
import { detectTemplate } from '@/services/task-planner.service'
import i18n, { currentLocale } from './index'
import { DEFAULT_LANGUAGE, LANGUAGE_STORAGE_KEY, readStoredLanguage } from './language.config'

type Dictionary = Record<string, unknown>

const LOCALES: Record<string, Dictionary> = { en, hi, gu }
const EN_KEYS = Object.keys(en).sort()
const KEY_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/

const placeholders = (value: string) =>
  [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort()

/** Every non-test source file, as raw text, so key usages can be checked statically. */
const SOURCES = import.meta.glob<string>(['/src/**/*.{ts,tsx}', '!/src/**/*.test.{ts,tsx}', '!/src/test/**', '!/src/data/**'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

describe.each(Object.entries(LOCALES))('%s.json', (code, dictionary) => {
  it('is flat with non-empty string values only', () => {
    for (const [key, value] of Object.entries(dictionary)) {
      expect(typeof value, `${code}:${key}`).toBe('string')
      expect((value as string).trim(), `${code}:${key}`).not.toBe('')
    }
  })

  it('uses category_feature_element keys', () => {
    const invalid = Object.keys(dictionary).filter((key) => !KEY_PATTERN.test(key))
    expect(invalid).toEqual([])
  })

  it('has exactly the same keys as English', () => {
    expect(Object.keys(dictionary).sort()).toEqual(EN_KEYS)
  })

  it('keeps the same {{placeholders}} as English', () => {
    const mismatched = EN_KEYS.filter(
      (key) => placeholders(en[key as keyof typeof en]).join() !== placeholders(dictionary[key] as string).join(),
    )
    expect(mismatched).toEqual([])
  })

  it.skipIf(code === 'en')('is actually translated, not copied from English', () => {
    const identical = EN_KEYS.filter((key) => dictionary[key] === en[key as keyof typeof en])
    // Brand names, keyboard keys and numeric-only strings may legitimately stay the same.
    expect(identical.length).toBeLessThan(EN_KEYS.length * 0.03)
  })
})

describe('translation keys used in code', () => {
  const categories = new Set(EN_KEYS.map((key) => key.split('_')[0]))
  const exists = (key: string) => Object.hasOwn(en, key) || Object.hasOwn(en, `${key}_one`)
  // Snake-case strings that are not translation keys (third-party event names).
  const NOT_KEYS = new Set(['data_failed'])

  it('all exist in en.json', () => {
    const missing = new Set<string>()
    for (const [file, source] of Object.entries(SOURCES)) {
      for (const [, key] of source.matchAll(/['"`]([a-z][a-z0-9]*(?:_[a-z0-9]+)+)['"`]/g)) {
        if (key && !NOT_KEYS.has(key) && categories.has(key.split('_')[0] ?? '') && !exists(key)) missing.add(`${key} (${file})`)
      }
    }
    expect([...missing]).toEqual([])
  })

  it('finds a meaningful number of usages', () => {
    const used = new Set<string>()
    for (const source of Object.values(SOURCES)) {
      for (const [, key] of source.matchAll(/['"`]([a-z][a-z0-9]*(?:_[a-z0-9]+)+)['"`]/g)) if (key && exists(key)) used.add(key)
    }
    expect(used.size).toBeGreaterThan(500)
  })
})

describe('language switching', () => {
  afterEach(async () => {
    await i18n.changeLanguage(DEFAULT_LANGUAGE)
  })

  it('translates, interpolates and persists the chosen language', async () => {
    await i18n.changeLanguage('hi')
    expect(i18n.t('navigation_settings')).toBe(hi.navigation_settings)
    expect(i18n.t('focus_preset_minutes', { minutes: 25 })).toContain('25')
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('hi')
    expect(readStoredLanguage()).toBe('hi')
    expect(document.documentElement.lang).toBe('hi')
    expect(currentLocale()).toBe('hi-IN')

    await i18n.changeLanguage('gu')
    expect(i18n.t('count_tasks', { count: 3 })).toBe('3 કાર્યો')
    expect(currentLocale()).toBe('gu-IN')
  })

  it('falls back to English for missing or invalid stored values', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'fr')
    expect(readStoredLanguage()).toBe('en')
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
    expect(readStoredLanguage()).toBe('en')
  })
})

describe('localized Smart Planner examples', () => {
  it.each(['en', 'hi', 'gu'] as const)('%s example goals map to their own template', (code) => {
    for (const template of PLAN_TEMPLATES) {
      const example = LOCALES[code]?.[template.exampleKey] as string
      expect(detectTemplate(example).template.id, `${code}: ${example}`).toBe(template.id)
    }
  })
})
