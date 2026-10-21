import { useEffect } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { appUrl } from '@/lib/appConfig'
import { BenefitsSection } from './components/BenefitsSection'
import { FAQSection } from './components/FAQSection'
import { FeaturesSection } from './components/FeaturesSection'
import { HeroSection } from './components/HeroSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { LandingFooter } from './components/LandingFooter'
import { LandingNavbar } from './components/LandingNavbar'
import { ProductShowcase } from './components/ProductShowcase'

/** Creates or updates a single <link>/<meta> tag in <head>, keyed by one attribute. */
function setHeadTag(tag: 'link' | 'meta', keyAttr: string, keyValue: string, valueAttr: string, value: string) {
  let element = document.head.querySelector(`${tag}[${keyAttr}="${keyValue}"]`)
  if (!element) {
    element = document.createElement(tag)
    element.setAttribute(keyAttr, keyValue)
    document.head.append(element)
  }
  element.setAttribute(valueAttr, value)
}

/** Public landing page at `/`. Sections are self-contained; this file only orders them. */
export default function LandingPage() {
  const { t } = useTranslation()

  // Title and description follow the selected language.
  useEffect(() => {
    document.title = t('landing_meta_title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('landing_meta_description'))
  }, [t])

  // Canonical and share URL come from VITE_APP_URL (.env), so previews and mirrors point at the real site.
  useEffect(() => {
    setHeadTag('link', 'rel', 'canonical', 'href', appUrl('/'))
    setHeadTag('meta', 'property', 'og:url', 'content', appUrl('/'))
  }, [])

  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#landing-main"
        className="sr-only z-[80] rounded-control bg-brand px-4 py-2 text-sm font-medium text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        {t('landing_skip_to_content')}
      </a>
      <LandingNavbar />
      <main id="landing-main" tabIndex={-1} className="outline-none">
        <HeroSection />
        <ProductShowcase />
        <FeaturesSection />
        <HowItWorksSection />
        <BenefitsSection />
        <FAQSection />
      </main>
      <LandingFooter />
    </div>
  )
}
