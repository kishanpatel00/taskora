import { useContext } from 'react'
import { DialogsContext, type DialogsApi } from './dialogsContext'

/** Opens the app-wide task and project dialogs from anywhere inside the layout. */
export function useDialogs(): DialogsApi {
  const api = useContext(DialogsContext)
  if (!api) throw new Error('useDialogs must be used inside <DialogsProvider>')
  return api
}
