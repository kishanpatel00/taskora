import { Skeleton } from '@/components/ui/Skeleton'
import { useTranslation } from '@/i18n/useTranslation'

/** Skeleton shown while a lazily loaded page chunk downloads. */
export function PageSkeleton() {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col gap-4" role="status" aria-label={t('common_loading_page')}>
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 rounded-panel" />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-3">
        <Skeleton className="h-60 rounded-panel lg:col-span-2" />
        <Skeleton className="h-60 rounded-panel" />
      </div>
    </div>
  )
}
