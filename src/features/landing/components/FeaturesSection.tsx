import { useTranslation } from '@/i18n/useTranslation'
import { FEATURES } from '../data/landingContent'
import { Reveal } from './Reveal'
import { SectionHeading } from './SectionHeading'

export function FeaturesSection() {
  const { t } = useTranslation()
  return (
    <section id="features" aria-labelledby="landing-features-title" className="scroll-mt-16 border-b border-line bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-20">
        <Reveal>
          <SectionHeading
            id="landing-features-title"
            eyebrow={t('landing_features_eyebrow')}
            title={t('landing_features_title')}
            subtitle={t('landing_features_subtitle')}
          />
        </Reveal>
        <ul className="mt-10 grid gap-px overflow-hidden rounded-panel border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Reveal as="li" key={feature.id} delay={(index % 3) * 80} className="group bg-surface p-5 transition-colors hover:bg-surface-2">
                <span className="flex size-9 items-center justify-center rounded-menu border border-line bg-brand-soft text-brand-ink transition-colors group-hover:border-brand/30">
                  <Icon className="size-[18px]" aria-hidden />
                </span>
                <h3 className="mt-3 text-base font-semibold text-fg">{t(feature.titleKey)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-fg-2">{t(feature.descriptionKey)}</p>
              </Reveal>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
