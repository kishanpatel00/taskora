import { TriangleAlert } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { useTranslation } from '@/i18n/useTranslation'
import { Button } from './Button'
import { Modal, ModalBody, ModalFooter } from './Modal'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'primary'
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

/** Explains a consequential action and only runs it after explicit confirmation. */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  cancelLabel,
  tone = 'danger',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useTranslation()
  const [busy, setBusy] = useState(false)

  const handleConfirm = async () => {
    setBusy(true)
    try {
      await onConfirm()
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => undefined : onCancel} title={title} size="sm">
      <ModalBody className="flex gap-3">
        {tone === 'danger' && (
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
            <TriangleAlert className="size-4" aria-hidden />
          </span>
        )}
        <div className="text-sm leading-relaxed text-fg-2">{description}</div>
      </ModalBody>
      <ModalFooter>
        <Button variant="secondary" onClick={onCancel} disabled={busy}>
          {cancelLabel ?? t('common_cancel')}
        </Button>
        <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={() => void handleConfirm()} loading={busy} data-autofocus>
          {confirmLabel ?? t('common_confirm')}
        </Button>
      </ModalFooter>
    </Modal>
  )
}
