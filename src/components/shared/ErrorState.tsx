import { CircleAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui/EmptyState'
import { useTranslation } from '@/i18n/useTranslation'

interface ErrorStateProps {
  title?: string
  description?: string
  action?: ReactNode
}

export function ErrorState({ title, description, action }: ErrorStateProps) {
  const { t } = useTranslation()
  return (
    <div role="alert">
      <EmptyState icon={<CircleAlert className="text-rose-500" />} title={title ?? t('common_error_title')} description={description ?? t('common_error_description')} action={action} />
    </div>
  )
}
