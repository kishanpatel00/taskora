import { useTranslation } from '@/i18n/useTranslation'
import { formatNumber } from '@/lib/format'
import { STEPS } from '../data/landingContent'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function HowItWorksSection() {
  const { t } = useTranslation()
  return (
    <section id="how-it-works" aria-labelledby="landing-how-title" className="scroll-mt-16 border-b border-line bg-bg">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <Reveal>
          <SectionHeading id="landing-how-title" eyebrow={t('landing_how_eyebrow')} title={t('landing_how_title')} />
        </Reveal>
        <ol className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-6">
          {/* Connecting line behind the step numbers on wide screens. */}
          <span className="absolute top-5 right-[16%] left-[16%] hidden h-px bg-line-strong md:block" aria-hidden />
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <Reveal as="li" key={step.id} delay={index * 120} className="relative flex gap-4 md:flex-col md:items-center md:text-center">
                <span
                  className="tabular relative flex size-10 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-surface text-sm font-semibold text-brand-ink shadow-xs"
                  aria-hidden
                >
                  {formatNumber(index + 1)}
                </span>
                <div>
                  <p className="sr-only">{t('landing_how_step_label', { number: index + 1 })}</p>
                  <h3 className="flex items-center gap-1.5 text-base font-semibold text-fg md:justify-center">
                    <Icon className="size-4 text-fg-3" aria-hidden />
                    {t(step.titleKey)}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-fg-2 md:mx-auto md:max-w-72">{t(step.descriptionKey)}</p>
                </div>
              </Reveal>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
