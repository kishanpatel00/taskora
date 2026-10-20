#!/usr/bin/env node
/**
 * Validates the flat translation files in src/locales:
 * valid JSON, flat string values only, no duplicate or empty keys/values,
 * identical key sets across languages and matching {{placeholders}}.
 * Exits with code 1 when any problem is found. Run with `npm run i18n:check`.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const LOCALES_DIR = fileURLToPath(new URL('../src/locales/', import.meta.url))
const LANGUAGES = ['en', 'hi', 'gu']
const REFERENCE = 'en'
const KEY_PATTERN = /^[a-z][a-z0-9]*(?:_[a-z0-9]+)+$/

const problems = []
const report = (language, message) => problems.push(`${language}.json: ${message}`)
const placeholders = (value) => [...value.matchAll(/{{\s*(\w+)\s*}}/g)].map((match) => match[1]).sort().join(',')

/** JSON.parse silently keeps the last duplicate, so scan the raw text for repeated top-level keys. */
function findDuplicateKeys(raw) {
  const seen = new Set()
  const duplicates = new Set()
  for (const [, key] of raw.matchAll(/^\s*"((?:[^"\\]|\\.)*)"\s*:/gm)) {
    if (seen.has(key)) duplicates.add(key)
    seen.add(key)
  }
  return [...duplicates]
}

const dictionaries = {}
for (const language of LANGUAGES) {
  let raw
  let data
  try {
    raw = readFileSync(`${LOCALES_DIR}${language}.json`, 'utf8')
    data = JSON.parse(raw)
  } catch (error) {
    report(language, `cannot be read or parsed (${error.message})`)
    continue
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    report(language, 'must contain a single flat JSON object')
    continue
  }
  for (const key of findDuplicateKeys(raw)) report(language, `duplicate key "${key}"`)
  for (const [key, value] of Object.entries(data)) {
    if (!KEY_PATTERN.test(key)) report(language, `key "${key}" does not follow category_feature_element naming`)
    if (typeof value !== 'string') report(language, `"${key}" must be a string (nested objects and other types are not allowed)`)
    else if (value.trim() === '') report(language, `"${key}" is empty`)
  }
  dictionaries[language] = data
}

const reference = dictionaries[REFERENCE]
if (reference) {
  const referenceKeys = Object.keys(reference)
  for (const language of LANGUAGES) {
    const dictionary = dictionaries[language]
    if (!dictionary || language === REFERENCE) continue
    for (const key of referenceKeys) {
      if (!(key in dictionary)) report(language, `missing key "${key}"`)
      else if (typeof dictionary[key] === 'string' && typeof reference[key] === 'string' && placeholders(dictionary[key]) !== placeholders(reference[key])) {
        report(language, `"${key}" placeholders {${placeholders(dictionary[key])}} do not match English {${placeholders(reference[key])}}`)
      }
    }
    for (const key of Object.keys(dictionary)) if (!(key in reference)) report(language, `extra key "${key}" not present in en.json`)
  }
}

if (problems.length > 0) {
  console.error(`Translation check failed with ${problems.length} problem(s):\n${problems.map((problem) => `  - ${problem}`).join('\n')}`)
  process.exit(1)
}
console.log(`Translation check passed: ${LANGUAGES.join(', ')} each have ${Object.keys(reference).length} flat keys with matching placeholders.`)
