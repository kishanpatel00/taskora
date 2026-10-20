import {
  CalendarCheck,
  ChartNoAxesCombined,
  FolderKanban,
  Kanban,
  ListTodo,
  Shuffle,
  Sparkles,
  Sun,
  Target,
  Timer,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import type { ProjectColor } from '@/features/projects/projectTypes'
import type { TaskPriority, TaskStatus } from '@/features/tasks/taskTypes'
import type { TranslationKey } from '@/i18n/translation.types'

/** All landing copy is referenced by translation key; this file only holds structure. */
export interface IconCopy {
  id: string
  icon: LucideIcon
  titleKey: TranslationKey
  descriptionKey: TranslationKey
}

export const LANDING_SECTIONS = [
  { id: 'features', labelKey: 'landing_nav_features' },
  { id: 'how-it-works', labelKey: 'landing_nav_how' },
  { id: 'benefits', labelKey: 'landing_nav_benefits' },
  { id: 'faq', labelKey: 'landing_nav_faq' },
] as const satisfies ReadonlyArray<{ id: string; labelKey: TranslationKey }>

export const FEATURES: IconCopy[] = [
  { id: 'projects', icon: FolderKanban, titleKey: 'landing_feature_projects_title', descriptionKey: 'landing_feature_projects_description' },
  { id: 'kanban', icon: Kanban, titleKey: 'landing_feature_kanban_title', descriptionKey: 'landing_feature_kanban_description' },
  { id: 'my-day', icon: CalendarCheck, titleKey: 'landing_feature_my_day_title', descriptionKey: 'landing_feature_my_day_description' },
  { id: 'focus', icon: Timer, titleKey: 'landing_feature_focus_title', descriptionKey: 'landing_feature_focus_description' },
  { id: 'smart', icon: Sparkles, titleKey: 'landing_feature_smart_title', descriptionKey: 'landing_feature_smart_description' },
  { id: 'insights', icon: ChartNoAxesCombined, titleKey: 'landing_feature_insights_title', descriptionKey: 'landing_feature_insights_description' },
]

export const STEPS: IconCopy[] = [
  { id: 'organize', icon: FolderKanban, titleKey: 'landing_how_step1_title', descriptionKey: 'landing_how_step1_description' },
  { id: 'prioritize', icon: ListTodo, titleKey: 'landing_how_step2_title', descriptionKey: 'landing_how_step2_description' },
  { id: 'focus', icon: Target, titleKey: 'landing_how_step3_title', descriptionKey: 'landing_how_step3_description' },
]

export const BENEFITS: IconCopy[] = [
  { id: 'organized', icon: FolderKanban, titleKey: 'landing_benefit_organized_title', descriptionKey: 'landing_benefit_organized_description' },
  { id: 'today', icon: Sun, titleKey: 'landing_benefit_today_title', descriptionKey: 'landing_benefit_today_description' },
  { id: 'switching', icon: Shuffle, titleKey: 'landing_benefit_switching_title', descriptionKey: 'landing_benefit_switching_description' },
  { id: 'progress', icon: TrendingUp, titleKey: 'landing_benefit_progress_title', descriptionKey: 'landing_benefit_progress_description' },
  { id: 'habits', icon: Timer, titleKey: 'landing_benefit_habits_title', descriptionKey: 'landing_benefit_habits_description' },
]

export const FAQS = [
  { id: 'what', questionKey: 'landing_faq_what_question', answerKey: 'landing_faq_what_answer' },
  { id: 'features', questionKey: 'landing_faq_features_question', answerKey: 'landing_faq_features_answer' },
  { id: 'backend', questionKey: 'landing_faq_backend_question', answerKey: 'landing_faq_backend_answer' },
  { id: 'focus', questionKey: 'landing_faq_focus_question', answerKey: 'landing_faq_focus_answer' },
  { id: 'languages', questionKey: 'landing_faq_languages_question', answerKey: 'landing_faq_languages_answer' },
] as const satisfies ReadonlyArray<{ id: string; questionKey: TranslationKey; answerKey: TranslationKey }>

/* ---------- Sample data for the static product previews (mirrors the demo workspace) ---------- */

export const PREVIEW_PROJECTS: Array<{ id: string; nameKey: TranslationKey; color: ProjectColor; percent: number }> = [
  { id: 'portfolio', nameKey: 'landing_preview_project_portfolio', color: 'indigo', percent: 40 },
  { id: 'launch', nameKey: 'landing_preview_project_launch', color: 'violet', percent: 50 },
  { id: 'learning', nameKey: 'landing_preview_project_learning', color: 'sky', percent: 56 },
]

export const PREVIEW_TASKS: Array<{ id: string; titleKey: TranslationKey; priority: TaskPriority; status: TaskStatus }> = [
  { id: 'hero', titleKey: 'landing_preview_task_hero', priority: 'high', status: 'in_progress' },
  { id: 'qa', titleKey: 'landing_preview_task_qa', priority: 'urgent', status: 'todo' },
  { id: 'budget', titleKey: 'landing_preview_task_budget', priority: 'medium', status: 'todo' },
  { id: 'notes', titleKey: 'landing_preview_task_notes', priority: 'low', status: 'done' },
]

export const SHOWCASE_COLUMNS: Array<{ status: TaskStatus; cards: Array<{ titleKey: TranslationKey; priority: TaskPriority }> }> = [
  { status: 'todo', cards: [{ titleKey: 'landing_showcase_task_research', priority: 'medium' }, { titleKey: 'landing_showcase_task_copy', priority: 'high' }] },
  { status: 'in_progress', cards: [{ titleKey: 'landing_showcase_task_wireframes', priority: 'urgent' }, { titleKey: 'landing_showcase_task_api', priority: 'high' }] },
  { status: 'done', cards: [{ titleKey: 'landing_showcase_task_brief', priority: 'medium' }, { titleKey: 'landing_showcase_task_logo', priority: 'low' }] },
]
