import { createAction } from '@reduxjs/toolkit'
import type { PersistedData } from '@/services/persistedData'

/** Replaces all application data at once (import, reset to demo data). Every slice handles it. */
export const dataReplaced = createAction<PersistedData>('app/dataReplaced')
