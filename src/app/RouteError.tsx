import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { PageContainer } from '@/components/layout/PageContainer'
import { ErrorState } from '@/components/shared/ErrorState'
import { buttonClasses } from '@/components/ui/buttonStyles'
import { useTranslation } from '@/i18n/useTranslation'

/** Router-level error boundary: shown instead of a blank screen if a page throws. */
export function RouteError() {
  const { t } = useTranslation()
  const error = useRouteError()
  const notFound = isRouteErrorResponse(error) && error.status === 404
  return (
    <PageContainer width="narrow">
      <ErrorState
        title={notFound ? t('error_page_not_found_title') : t('common_error_title')}
        description={
          notFound
            ? t('error_route_not_found_description')
            : t('error_route_crash_description')
        }
        action={
          <Link to="/dashboard" className={buttonClasses('primary')}>
            {t('common_back_to_dashboard')}
          </Link>
        }
      />
    </PageContainer>
  )
}
