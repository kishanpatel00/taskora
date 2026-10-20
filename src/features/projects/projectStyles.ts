import type { TranslationKey } from '@/i18n/translation.types'
import type { ProjectColor } from './projectTypes'

interface ColorStyle {
  /** Translation key of the color name. */
  labelKey: TranslationKey
  /** Solid dot / bar color. */
  solid: string
  /** Soft tile background + foreground. */
  soft: string
  /** Hex value for charts. */
  hex: string
}

export const PROJECT_COLOR_STYLES: Record<ProjectColor, ColorStyle> = {
  indigo: { labelKey: 'project_color_indigo', solid: 'bg-indigo-500', soft: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300', hex: '#6366f1' },
  violet: { labelKey: 'project_color_violet', solid: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300', hex: '#8b5cf6' },
  sky: { labelKey: 'project_color_sky', solid: 'bg-sky-500', soft: 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300', hex: '#0ea5e9' },
  emerald: { labelKey: 'project_color_emerald', solid: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300', hex: '#10b981' },
  amber: { labelKey: 'project_color_amber', solid: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300', hex: '#f59e0b' },
  rose: { labelKey: 'project_color_rose', solid: 'bg-rose-500', soft: 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300', hex: '#f43f5e' },
  teal: { labelKey: 'project_color_teal', solid: 'bg-teal-500', soft: 'bg-teal-50 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300', hex: '#14b8a6' },
  slate: { labelKey: 'project_color_slate', solid: 'bg-slate-500', soft: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-300', hex: '#64748b' },
}
