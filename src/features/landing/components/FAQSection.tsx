import { ChevronDown } from 'lucide-react'
import { useTranslation } from '@/i18n/useTranslation'
import { FAQS } from '../data/landingContent'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

/** Native <details> accordion: keyboard and screen-reader support for free. */
export function FAQSection() {
  const { t } = useTranslation()
  return (
    <section id="faq" aria-labelledby="landing-faq-title" className="scroll-mt-16 border-b border-line bg-bg">
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:py-20">
        <Reveal>
          <SectionHeading id="landing-faq-title" eyebrow={t('landing_faq_eyebrow')} title={t('landing_faq_title')} />
        </Reveal>
        <Reveal delay={100} className="mt-8 divide-y divide-line overflow-hidden rounded-panel border border-line bg-surface">
          {FAQS.map((faq) => (
            <details key={faq.id} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3.5 text-left text-sm font-semibold text-fg transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
                {t(faq.questionKey)}
                <ChevronDown className="size-4 shrink-0 text-fg-3 transition-transform group-open:rotate-180" aria-hidden />
              </summary>
              <p className="px-4 pb-4 text-sm leading-relaxed text-fg-2">{t(faq.answerKey)}</p>
            </details>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
