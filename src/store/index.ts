import { combineReducers, configureStore } from '@reduxjs/toolkit'
import focusReducer from '@/features/focus/focusSlice'
import plannerReducer from '@/features/planner/plannerSlice'
import projectsReducer, { projectsAdapter } from '@/features/projects/projectSlice'
import settingsReducer from '@/features/settings/settingsSlice'
import tasksReducer, { tasksAdapter } from '@/features/tasks/taskSlice'
import { STORAGE_VERSION, type PersistedData } from '@/services/persistedData'

const rootReducer = combineReducers({
  tasks: tasksReducer,
  projects: projectsReducer,
  planner: plannerReducer,
  focus: focusReducer,
  settings: settingsReducer,
})

export type RootState = ReturnType<typeof rootReducer>

export function createAppStore(preloadedState?: RootState) {
  return configureStore({ reducer: rootReducer, preloadedState })
}

export type AppStore = ReturnType<typeof createAppStore>
export type AppDispatch = AppStore['dispatch']

export function stateFromData(data: PersistedData): RootState {
  return {
    tasks: tasksAdapter.setAll(tasksAdapter.getInitialState(), data.tasks),
    projects: projectsAdapter.setAll(projectsAdapter.getInitialState(), data.projects),
    planner: data.planner,
    focus: { sessions: data.focusSessions, timer: data.timer },
    settings: data.settings,
  }
}

export function dataFromState(state: RootState): PersistedData {
  return {
    version: STORAGE_VERSION,
    tasks: Object.values(state.tasks.entities),
    projects: Object.values(state.projects.entities),
    focusSessions: state.focus.sessions,
    timer: state.focus.timer,
    planner: state.planner,
    settings: state.settings,
  }
}
