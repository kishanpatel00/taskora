import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Logo } from '@/components/shared/Logo'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { LANGUAGES } from '@/i18n/language.config'
import { useTranslation } from '@/i18n/useTranslation'
import { FEATURES, LANDING_SECTIONS } from '../data/landingContent'
import { Reveal } from './Reveal'

/** Closing call to action + footer. Only real links: sections on this page and the app itself. */
export function LandingFooter() {
  const { t, setLanguage } = useTranslation()
  const year = new Date().getFullYear()
  const heading = 'text-xs font-semibold tracking-wider text-fg-3 uppercase'
  const link = 'text-sm text-fg-2 transition-colors hover:text-fg'

  return (
    <>
      <section aria-labelledby="landing-final-title" className="border-b border-line bg-surface">
        <Reveal className="mx-auto flex max-w-6xl flex-col items-start gap-5 px-4 py-12 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 id="landing-final-title" className="text-xl font-semibold tracking-tight text-fg sm:text-2xl">
              {t('landing_final_title')}
            </h2>
            <p className="mt-1 text-sm text-fg-2">{t('landing_final_subtitle')}</p>
          </div>
          <Link to="/dashboard" className={buttonClasses('primary', 'lg', 'group')}>
            {t('landing_cta_open')}
            <ArrowRight className="transition-transform group-hover:translate-x-0.5" aria-hidden />
          </Link>
        </Reveal>
      </section>

      <footer className="bg-bg">
        <Reveal className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-2 max-w-xs text-sm text-fg-2">{t('app_tagline')}</p>
          </div>
          <nav aria-labelledby="footer-product">
            <h2 id="footer-product" className={heading}>
              {t('landing_footer_product')}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {LANDING_SECTIONS.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className={link}>
                    {t(section.labelKey)}
                  </a>
                </li>
              ))}
              <li>
                <Link to="/dashboard" className={link}>
                  {t('landing_footer_open_app')}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-labelledby="footer-features">
            <h2 id="footer-features" className={heading}>
              {t('landing_footer_features')}
            </h2>
            <ul className="mt-3 flex flex-col gap-2">
              {FEATURES.map((feature) => (
                <li key={feature.id}>
                  <a href="#features" className={link}>
                    {t(feature.titleKey)}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className={heading}>{t('landing_footer_languages')}</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {LANGUAGES.map((language) => (
                <li key={language.code}>
                  <button type="button" lang={language.code} onClick={() => setLanguage(language.code)} className={link}>
                    {language.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
        <div className="border-t border-line">
          <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-fg-3 sm:px-6">{t('landing_footer_copyright', { year })}</p>
        </div>
      </footer>
    </>
  )
}
