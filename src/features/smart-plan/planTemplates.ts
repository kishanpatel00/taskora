import type { TaskPriority } from '@/features/tasks/taskTypes'
import type { TranslationKey } from '@/i18n/translation.types'

/** Step and template texts are translation keys so plans are generated in the user's language. */
export interface TemplateStep {
  titleKey: TranslationKey
  descriptionKey: TranslationKey
  priority: TaskPriority
  estimatedMinutes: number
  /** Suggested due date, in days after the plan's start date. */
  dayOffset: number
  tags: string[]
}

export interface PlanTemplate {
  id: string
  labelKey: TranslationKey
  descriptionKey: TranslationKey
  /** Matched against the goal text; includes English, Hindi and Gujarati terms. */
  keywords: string[]
  exampleKey: TranslationKey
  steps: TemplateStep[]
}

const step = (
  titleKey: TranslationKey,
  descriptionKey: TranslationKey,
  priority: TaskPriority,
  estimatedMinutes: number,
  dayOffset: number,
  tags: string[],
): TemplateStep => ({ titleKey, descriptionKey, priority, estimatedMinutes, dayOffset, tags })

export const PLAN_TEMPLATES: PlanTemplate[] = [
  {
    id: 'website',
    labelKey: 'plan_template_website_label',
    descriptionKey: 'plan_template_website_description',
    keywords: ['website', 'portfolio', 'site', 'landing page', 'blog', 'web app', 'webpage', 'homepage', 'वेबसाइट', 'पोर्टफोलियो', 'ब्लॉग', 'વેબસાઇટ', 'પોર્ટફોલિયો', 'બ્લોગ'],
    exampleKey: 'plan_template_website_example',
    steps: [
      step('plan_website_step1_title', 'plan_website_step1_description', 'high', 60, 0, ['planning']),
      step('plan_website_step2_title', 'plan_website_step2_description', 'medium', 90, 1, ['design']),
      step('plan_website_step3_title', 'plan_website_step3_description', 'high', 180, 3, ['frontend']),
      step('plan_website_step4_title', 'plan_website_step4_description', 'high', 180, 5, ['frontend', 'content']),
      step('plan_website_step5_title', 'plan_website_step5_description', 'medium', 60, 6, ['content']),
      step('plan_website_step6_title', 'plan_website_step6_description', 'medium', 120, 8, ['frontend']),
      step('plan_website_step7_title', 'plan_website_step7_description', 'medium', 90, 9, ['quality']),
      step('plan_website_step8_title', 'plan_website_step8_description', 'urgent', 60, 10, ['deploy']),
    ],
  },
  {
    id: 'product-launch',
    labelKey: 'plan_template_product_launch_label',
    descriptionKey: 'plan_template_product_launch_description',
    keywords: ['launch', 'release', 'product', 'ship', 'mvp', 'app store', 'go-to-market', 'beta', 'लॉन्च', 'प्रोडक्ट', 'रिलीज़', 'લૉન્ચ', 'લોન્ચ', 'પ્રોડક્ટ', 'રિલીઝ'],
    exampleKey: 'plan_template_product_launch_example',
    steps: [
      step('plan_product_launch_step1_title', 'plan_product_launch_step1_description', 'high', 60, 0, ['strategy']),
      step('plan_product_launch_step2_title', 'plan_product_launch_step2_description', 'high', 45, 1, ['planning']),
      step('plan_product_launch_step3_title', 'plan_product_launch_step3_description', 'urgent', 180, 4, ['qa']),
      step('plan_product_launch_step4_title', 'plan_product_launch_step4_description', 'medium', 150, 5, ['design', 'marketing']),
      step('plan_product_launch_step5_title', 'plan_product_launch_step5_description', 'high', 90, 6, ['writing', 'marketing']),
      step('plan_product_launch_step6_title', 'plan_product_launch_step6_description', 'medium', 60, 6, ['analytics']),
      step('plan_product_launch_step7_title', 'plan_product_launch_step7_description', 'urgent', 120, 8, ['launch']),
      step('plan_product_launch_step8_title', 'plan_product_launch_step8_description', 'low', 45, 12, ['review']),
    ],
  },
  {
    id: 'learning',
    labelKey: 'plan_template_learning_label',
    descriptionKey: 'plan_template_learning_description',
    keywords: ['learn', 'study', 'course', 'master', 'exam', 'certification', 'language', 'understand', 'practice', 'सीखना', 'सीखें', 'पढ़ाई', 'कोर्स', 'परीक्षा', 'શીખવું', 'શીખો', 'અભ્યાસ', 'કોર્સ', 'પરીક્ષા'],
    exampleKey: 'plan_template_learning_example',
    steps: [
      step('plan_learning_step1_title', 'plan_learning_step1_description', 'high', 30, 0, ['planning']),
      step('plan_learning_step2_title', 'plan_learning_step2_description', 'medium', 45, 1, ['research']),
      step('plan_learning_step3_title', 'plan_learning_step3_description', 'medium', 15, 1, ['planning']),
      step('plan_learning_step4_title', 'plan_learning_step4_description', 'high', 240, 7, ['study']),
      step('plan_learning_step5_title', 'plan_learning_step5_description', 'high', 300, 14, ['practice']),
      step('plan_learning_step6_title', 'plan_learning_step6_description', 'medium', 120, 18, ['study']),
      step('plan_learning_step7_title', 'plan_learning_step7_description', 'low', 60, 21, ['writing']),
    ],
  },
  {
    id: 'fitness',
    labelKey: 'plan_template_fitness_label',
    descriptionKey: 'plan_template_fitness_description',
    keywords: ['run', 'marathon', '5k', '10k', 'fitness', 'gym', 'weight', 'health', 'workout', 'exercise', 'train', 'दौड़', 'फिटनेस', 'जिम', 'वजन', 'स्वास्थ्य', 'દોડ', 'ફિટનેસ', 'જિમ', 'વજન', 'સ્વાસ્થ્ય'],
    exampleKey: 'plan_template_fitness_example',
    steps: [
      step('plan_fitness_step1_title', 'plan_fitness_step1_description', 'high', 20, 0, ['planning']),
      step('plan_fitness_step2_title', 'plan_fitness_step2_description', 'medium', 30, 1, ['planning']),
      step('plan_fitness_step3_title', 'plan_fitness_step3_description', 'low', 60, 3, ['purchase']),
      step('plan_fitness_step4_title', 'plan_fitness_step4_description', 'high', 150, 7, ['health']),
      step('plan_fitness_step5_title', 'plan_fitness_step5_description', 'medium', 60, 7, ['health']),
      step('plan_fitness_step6_title', 'plan_fitness_step6_description', 'medium', 30, 14, ['review']),
    ],
  },
  {
    id: 'event',
    labelKey: 'plan_template_event_label',
    descriptionKey: 'plan_template_event_description',
    keywords: ['event', 'party', 'wedding', 'conference', 'birthday', 'meetup', 'trip', 'vacation', 'workshop', 'कार्यक्रम', 'पार्टी', 'शादी', 'यात्रा', 'जन्मदिन', 'કાર્યક્રમ', 'પાર્ટી', 'લગ્ન', 'પ્રવાસ', 'જન્મદિવસ'],
    exampleKey: 'plan_template_event_example',
    steps: [
      step('plan_event_step1_title', 'plan_event_step1_description', 'high', 45, 0, ['planning']),
      step('plan_event_step2_title', 'plan_event_step2_description', 'urgent', 90, 2, ['booking']),
      step('plan_event_step3_title', 'plan_event_step3_description', 'high', 45, 4, ['communication']),
      step('plan_event_step4_title', 'plan_event_step4_description', 'medium', 90, 8, ['logistics']),
      step('plan_event_step5_title', 'plan_event_step5_description', 'medium', 60, 9, ['planning']),
      step('plan_event_step6_title', 'plan_event_step6_description', 'high', 30, 12, ['logistics']),
    ],
  },
  {
    id: 'job-search',
    labelKey: 'plan_template_job_search_label',
    descriptionKey: 'plan_template_job_search_description',
    keywords: ['job', 'interview', 'resume', 'cv', 'career', 'apply', 'hiring', 'offer', 'internship', 'नौकरी', 'इंटरव्यू', 'रिज़्यूमे', 'करियर', 'નોકરી', 'ઇન્ટરવ્યૂ', 'રિઝ્યુમ', 'કારકિર્દી'],
    exampleKey: 'plan_template_job_search_example',
    steps: [
      step('plan_job_search_step1_title', 'plan_job_search_step1_description', 'high', 60, 0, ['planning']),
      step('plan_job_search_step2_title', 'plan_job_search_step2_description', 'urgent', 120, 2, ['resume']),
      step('plan_job_search_step3_title', 'plan_job_search_step3_description', 'high', 180, 4, ['portfolio']),
      step('plan_job_search_step4_title', 'plan_job_search_step4_description', 'high', 150, 6, ['applications']),
      step('plan_job_search_step5_title', 'plan_job_search_step5_description', 'medium', 180, 9, ['interview']),
      step('plan_job_search_step6_title', 'plan_job_search_step6_description', 'low', 30, 13, ['applications']),
    ],
  },
  {
    id: 'moving',
    labelKey: 'plan_template_moving_label',
    descriptionKey: 'plan_template_moving_description',
    keywords: ['move', 'moving', 'relocate', 'apartment', 'new home', 'house', 'घर बदलना', 'शिफ्ट', 'नया घर', 'ઘર બદલવું', 'શિફ્ટ', 'નવું ઘર'],
    exampleKey: 'plan_template_moving_example',
    steps: [
      step('plan_moving_step1_title', 'plan_moving_step1_description', 'high', 45, 0, ['planning']),
      step('plan_moving_step2_title', 'plan_moving_step2_description', 'urgent', 60, 2, ['booking']),
      step('plan_moving_step3_title', 'plan_moving_step3_description', 'medium', 180, 5, ['home']),
      step('plan_moving_step4_title', 'plan_moving_step4_description', 'medium', 300, 10, ['home']),
      step('plan_moving_step5_title', 'plan_moving_step5_description', 'high', 60, 12, ['admin']),
      step('plan_moving_step6_title', 'plan_moving_step6_description', 'high', 45, 12, ['admin']),
    ],
  },
  {
    id: 'content',
    labelKey: 'plan_template_content_label',
    descriptionKey: 'plan_template_content_description',
    keywords: ['write', 'article', 'book', 'newsletter', 'youtube', 'video', 'podcast', 'content', 'post', 'लिखना', 'लेख', 'किताब', 'वीडियो', 'लिखें', 'લખવું', 'લેખ', 'પુસ્તક', 'વિડિયો', 'લખો'],
    exampleKey: 'plan_template_content_example',
    steps: [
      step('plan_content_step1_title', 'plan_content_step1_description', 'high', 30, 0, ['planning']),
      step('plan_content_step2_title', 'plan_content_step2_description', 'medium', 90, 1, ['research']),
      step('plan_content_step3_title', 'plan_content_step3_description', 'high', 45, 2, ['writing']),
      step('plan_content_step4_title', 'plan_content_step4_description', 'high', 150, 4, ['writing']),
      step('plan_content_step5_title', 'plan_content_step5_description', 'medium', 90, 6, ['editing']),
      step('plan_content_step6_title', 'plan_content_step6_description', 'medium', 45, 7, ['marketing']),
    ],
  },
]

export const GENERAL_TEMPLATE: PlanTemplate = {
  id: 'general',
  labelKey: 'plan_template_general_label',
  descriptionKey: 'plan_template_general_description',
  keywords: [],
  exampleKey: 'plan_template_general_example',
  steps: [
    step('plan_general_step1_title', 'plan_general_step1_description', 'high', 30, 0, ['planning']),
    step('plan_general_step2_title', 'plan_general_step2_description', 'high', 45, 1, ['planning']),
    step('plan_general_step3_title', 'plan_general_step3_description', 'medium', 45, 2, ['research']),
    step('plan_general_step4_title', 'plan_general_step4_description', 'high', 120, 5, ['execution']),
    step('plan_general_step5_title', 'plan_general_step5_description', 'medium', 30, 7, ['review']),
    step('plan_general_step6_title', 'plan_general_step6_description', 'low', 30, 14, ['review']),
  ],
}

export const ALL_TEMPLATES: PlanTemplate[] = [...PLAN_TEMPLATES, GENERAL_TEMPLATE]
