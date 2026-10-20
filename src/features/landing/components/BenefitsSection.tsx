import { useTranslation } from '@/i18n/useTranslation'
import { formatMinutes, formatNumber } from '@/lib/format'
import { BENEFITS } from '../data/landingContent'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function BenefitsSection() {
  const { t } = useTranslation()
  // Illustrative figures taken from the bundled demo workspace (labelled as such below).
  const stats = [
    { label: t('landing_benefits_stat_completed'), value: formatNumber(18) },
    { label: t('landing_benefits_stat_focus'), value: formatMinutes(13 * 60 + 12) },
    { label: t('landing_benefits_stat_projects'), value: formatNumber(4) },
  ]

  return (
    <section id="benefits" aria-labelledby="landing-benefits-title" className="scroll-mt-16 border-b border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:py-20">
        <Reveal>
          <SectionHeading
            id="landing-benefits-title"
            align="left"
            eyebrow={t('landing_benefits_eyebrow')}
            title={t('landing_benefits_title')}
            subtitle={t('landing_benefits_subtitle')}
          />
          <dl className="mt-6 grid grid-cols-3 gap-px overflow-hidden rounded-panel border border-line bg-line">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse bg-surface px-3 py-3">
                <dt className="mt-0.5 text-xs text-fg-3">{stat.label}</dt>
                <dd className="tabular text-xl font-semibold text-fg">{stat.value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-2 text-xs text-fg-3">{t('landing_benefits_stat_caption')}</p>
        </Reveal>

        <ul className="flex flex-col divide-y divide-line rounded-panel border border-line">
          {BENEFITS.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Reveal as="li" key={benefit.id} delay={index * 70} className="flex gap-3 p-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-menu bg-accent-soft text-accent" aria-hidden>
                  <Icon className="size-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-fg">{t(benefit.titleKey)}</h3>
                  <p className="mt-0.5 text-sm text-fg-2">{t(benefit.descriptionKey)}</p>
                </div>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
