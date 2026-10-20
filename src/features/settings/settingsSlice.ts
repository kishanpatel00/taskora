import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { dataReplaced } from '@/store/sharedActions'
import { DEFAULT_SETTINGS, type AppSettings } from './settingsTypes'

const settingsSlice = createSlice({
  name: 'settings',
  initialState: DEFAULT_SETTINGS,
  reducers: {
    settingsUpdated(state, action: PayloadAction<Partial<AppSettings>>) {
      Object.assign(state, action.payload)
    },
  },
  extraReducers: (builder) => {
    builder.addCase(dataReplaced, (_state, action) => action.payload.settings)
  },
})

export const { settingsUpdated } = settingsSlice.actions
export default settingsSlice.reducer
