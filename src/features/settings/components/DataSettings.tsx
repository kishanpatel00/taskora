import { Database, Download, RotateCcw, Upload } from 'lucide-react'
import { useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { createDemoData } from '@/data/demoData'
import i18n from '@/i18n'
import { useTranslation } from '@/i18n/useTranslation'
import { downloadData, parseImportText } from '@/services/export.service'
import type { PersistedData } from '@/services/persistedData'
import { dataFromState } from '@/store'
import { useAppDispatch, useAppSelector, useAppStore } from '@/store/hooks'
import { dataReplaced } from '@/store/sharedActions'

function describe(data: Pick<PersistedData, 'projects' | 'tasks' | 'focusSessions'>) {
  return i18n.t('data_summary', {
    projects: i18n.t('count_projects', { count: data.projects.length }),
    tasks: i18n.t('count_tasks', { count: data.tasks.length }),
    sessions: i18n.t('count_focus_sessions', { count: data.focusSessions.length }),
  })
}

export function DataSettings() {
  const { t } = useTranslation()
  const store = useAppStore()
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const fileRef = useRef<HTMLInputElement>(null)
  const [pendingImport, setPendingImport] = useState<{ data: PersistedData; fileName: string } | null>(null)
  const [importError, setImportError] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)

  const exportData = () => {
    const data = dataFromState(store.getState())
    try {
      downloadData(data)
      toast.success(t('toast_export_ready'), { description: t('toast_export_detail', { summary: describe(data) }) })
    } catch {
      toast.error(t('toast_export_failed'), { description: t('toast_export_blocked') })
    }
  }

  const onFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImportError(null)
    let text: string
    try {
      text = await file.text()
    } catch {
      setImportError(t('data_import_unreadable'))
      return
    }
    const result = parseImportText(text)
    if (!result.ok) {
      const message = t(result.error, { detail: result.detail ?? '' })
      setImportError(message)
      toast.error(t('toast_import_failed'), { description: message })
      return
    }
    setPendingImport({ data: result.data, fileName: file.name })
  }

  const current = dataFromState(store.getState())

  return (
    <Card id="data" className="scroll-mt-16">
      <CardHeader title={t('data_title')} description={t('data_description')} icon={<Database />} className="border-b border-line" />
      <CardBody className="flex flex-col gap-3 pt-3">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="flex flex-col gap-2 rounded-menu border border-line p-3">
            <p className="text-sm font-medium text-fg">{t('data_export_title')}</p>
            <p className="flex-1 text-xs text-fg-3">{t('data_export_description')}</p>
            <Button variant="secondary" size="sm" leftIcon={<Download />} onClick={exportData}>
              {t('data_export_button')}
            </Button>
          </div>
          <div className="flex flex-col gap-2 rounded-menu border border-line p-3">
            <p className="text-sm font-medium text-fg">{t('data_import_title')}</p>
            <p className="flex-1 text-xs text-fg-3">{t('data_import_description')}</p>
            <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" tabIndex={-1} onChange={(event) => void onFileSelected(event)} aria-label={t('data_import_file')} />
            <Button variant="secondary" size="sm" leftIcon={<Upload />} onClick={() => fileRef.current?.click()}>
              {t('data_import_button')}
            </Button>
          </div>
          <div className="flex flex-col gap-2 rounded-menu border border-rose-200 p-3 dark:border-rose-500/25">
            <p className="text-sm font-medium text-fg">{t('data_reset_title')}</p>
            <p className="flex-1 text-xs text-fg-3">{t('data_reset_description')}</p>
            <Button
              variant="danger-ghost"
              size="sm"
              leftIcon={<RotateCcw />}
              onClick={() => setConfirmReset(true)}
              className="border border-rose-200 dark:border-rose-500/25"
            >
              {t('data_reset_button')}
            </Button>
          </div>
        </div>
        {importError && (
          <p role="alert" className="rounded-control bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
            {t('data_import_error_prefix', { error: importError })}
          </p>
        )}
      </CardBody>

      <ConfirmDialog
        open={pendingImport !== null}
        title={t('data_import_confirm_title')}
        confirmLabel={t('data_import_confirm_button')}
        onCancel={() => setPendingImport(null)}
        onConfirm={() => {
          if (!pendingImport) return
          dispatch(dataReplaced(pendingImport.data))
          toast.success(t('toast_data_imported'), { description: describe(pendingImport.data) })
          setPendingImport(null)
        }}
        description={
          pendingImport && (
            <>
              <p>
                {t('data_import_confirm_valid', { file: pendingImport.fileName, summary: describe(pendingImport.data) })}
              </p>
              <p className="mt-2">
                {t('data_import_confirm_replace', { summary: describe(current) })}
              </p>
            </>
          )
        }
      />
      <ConfirmDialog
        open={confirmReset}
        title={t('data_reset_confirm_title')}
        confirmLabel={t('data_reset_confirm_button')}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          dispatch(dataReplaced({ ...createDemoData(), settings }))
          setConfirmReset(false)
          toast.success(t('toast_demo_restored'))
        }}
        description={t('data_reset_confirm_description', { summary: describe(current) })}
      />
    </Card>
  )
}
