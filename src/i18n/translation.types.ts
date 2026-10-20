import type en from '@/locales/en.json'

/** `en.json` is the canonical schema: every other language must provide the same flat keys. */
export type TranslationResources = typeof en

/** Keys as written in the files, including plural suffixes such as `_one` / `_other`. */
export type TranslationFileKey = keyof TranslationResources

type StripPlural<K> = K extends `${infer Base}_one` | `${infer Base}_other` ? Base : K

/** Keys accepted by `t()`: plural keys are referenced by their base name with a `count` option. */
export type TranslationKey = StripPlural<TranslationFileKey>

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation'
    resources: { translation: TranslationResources }
  }
}
