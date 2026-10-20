import { ChevronRight } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { selectProjectEntities } from '@/features/projects/projectSelectors'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'
import { ALL_NAV_ITEMS } from './navigation'

interface Crumb {
  label: string
  to?: string
}

function useCrumbs(): Crumb[] {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const projects = useAppSelector(selectProjectEntities)
  const projectMatch = /^\/projects\/([^/]+)/.exec(pathname)
  if (projectMatch?.[1]) {
    const project = projects[projectMatch[1]]
    return [{ label: t('navigation_projects'), to: '/projects' }, { label: project?.name ?? t('navigation_project_not_found') }]
  }
  const item = ALL_NAV_ITEMS.find((nav) => pathname.startsWith(nav.to))
  return [{ label: item ? t(item.labelKey) : t('app_name') }]
}

export function Breadcrumbs() {
  const { t } = useTranslation()
  const crumbs = useCrumbs()
  return (
    <nav aria-label={t('navigation_breadcrumb')} className="min-w-0">
      <ol className="flex min-w-0 items-center gap-1 text-sm">
        {crumbs.map((crumb, index) => {
          const last = index === crumbs.length - 1
          return (
            <li key={crumb.label} className="flex min-w-0 items-center gap-1">
              {crumb.to && !last ? (
                <Link to={crumb.to} className="truncate text-fg-3 transition-colors hover:text-fg">
                  {crumb.label}
                </Link>
              ) : (
                <span className="truncate font-medium text-fg" aria-current={last ? 'page' : undefined}>
                  {crumb.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0 text-fg-3" aria-hidden />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
