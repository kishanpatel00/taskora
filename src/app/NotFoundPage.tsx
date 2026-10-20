import { Compass } from 'lucide-react'
import { Link } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useTranslation } from '@/i18n/useTranslation'

export default function NotFoundPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('error_page_not_found_title'))
  return (
    <PageContainer width="narrow">
      <EmptyState
        icon={<Compass />}
        title={t('error_page_not_found_title')}
        description={t('error_page_not_found_description')}
        action={
          <Link to="/dashboard" className={buttonClasses('primary')}>
            {t('common_back_to_dashboard')}
          </Link>
        }
      />
    </PageContainer>
  )
}
