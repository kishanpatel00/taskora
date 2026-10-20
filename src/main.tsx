import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { toast } from 'sonner'
import { App } from '@/app/App'
import i18n from '@/i18n'
import { bootstrap } from '@/app/bootstrap'
import { startPersistence } from '@/store/persistence'
import '@/styles/index.css'

const { store, storage, notice } = bootstrap()

startPersistence(store, {
  storage,
  onError: (result) => {
    const message = i18n.t(result.reason === 'quota' ? 'storage_full' : 'storage_save_failed')
    toast.error(message, { id: 'save-error' })
  },
})

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root not found')

createRoot(container).render(
  <StrictMode>
    <App store={store} notice={notice} />
  </StrictMode>,
)
