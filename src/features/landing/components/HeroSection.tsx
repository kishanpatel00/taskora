import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useTranslation } from '@/i18n/useTranslation'
import { ProductPreview } from './ProductPreview'

const delay = (ms: number) => ({ animationDelay: `${ms}ms` })

export function HeroSection() {
  const { t } = useTranslation()
  const points = [t('landing_hero_point_free'), t('landing_hero_point_private'), t('landing_hero_point_languages')]

  return (
    <section aria-labelledby="landing-hero-title" className="relative overflow-hidden border-b border-line bg-surface">
      {/* Quiet grid texture for depth; purely decorative. */}
      <div
        className="pointer-events-none absolute inset-0 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] opacity-60"
        aria-hidden
      />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 sm:px-6 md:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-12 lg:py-20">
        <div className="max-w-xl">
          <p
            className="inline-flex animate-rise items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-2.5 py-1 text-xs font-medium text-brand-ink"
            style={delay(250)}
          >
            <span className="size-1.5 rounded-full bg-accent" aria-hidden />
            {t('landing_hero_eyebrow')}
          </p>
          <h1
            id="landing-hero-title"
            className="mt-4 animate-rise text-[2rem] leading-[1.15] font-semibold tracking-tight text-fg sm:text-[2.5rem] lg:text-[2.75rem]"
            style={delay(380)}
          >
            {t('landing_hero_title')}
          </h1>
          <p className="mt-4 animate-rise text-base leading-relaxed text-fg-2 sm:text-lg" style={delay(480)}>
            {t('landing_hero_subtitle')}
          </p>
          <div className="mt-6 flex animate-rise flex-wrap items-center gap-2" style={delay(560)}>
            <Link to="/dashboard" className={buttonClasses('primary', 'lg', 'group')}>
              {t('landing_cta_open')}
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
            <a href="#features" className={buttonClasses('secondary', 'lg')}>
              {t('landing_cta_explore')}
            </a>
          </div>
          <p className="mt-5 animate-rise text-sm font-medium text-fg" style={delay(620)}>
            {t('landing_hero_support')}
          </p>
          <ul className="mt-2 flex animate-rise flex-wrap gap-x-4 gap-y-1 text-xs text-fg-2" style={delay(660)}>
            {points.map((point) => (
              <li key={point} className="inline-flex items-center gap-1">
                <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden />
                {point}
              </li>
            ))}
          </ul>
        </div>
        <ProductPreview />
      </div>
    </section>
  )
}
