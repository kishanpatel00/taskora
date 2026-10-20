import { useEffect } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { BenefitsSection } from './components/BenefitsSection'
import { FAQSection } from './components/FAQSection'
import { FeaturesSection } from './components/FeaturesSection'
import { HeroSection } from './components/HeroSection'
import { HowItWorksSection } from './components/HowItWorksSection'
import { LandingFooter } from './components/LandingFooter'
import { LandingNavbar } from './components/LandingNavbar'
import { ProductShowcase } from './components/ProductShowcase'

/** Public landing page at `/`. Sections are self-contained; this file only orders them. */
export default function LandingPage() {
  const { t } = useTranslation()

  // Title and description follow the selected language.
  useEffect(() => {
    document.title = t('landing_meta_title')
    document.querySelector('meta[name="description"]')?.setAttribute('content', t('landing_meta_description'))
  }, [t])

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
