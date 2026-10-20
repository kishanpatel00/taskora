import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { DialogsProvider } from '@/app/dialogs/DialogsProvider'
import { createAppStore, type AppStore } from '@/store'

/** Renders UI with the store, a router and the global dialogs, like the real app shell. */
export function renderWithProviders(ui: ReactElement, { store = createAppStore(), route = '/' }: { store?: AppStore; route?: string } = {}) {
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[route]}>
          <DialogsProvider>{ui}</DialogsProvider>
        </MemoryRouter>
      </Provider>,
    ),
  }
}
