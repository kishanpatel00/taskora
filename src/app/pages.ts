import { lazy } from 'react'

// Route-level code splitting: each page is downloaded on first visit.
export const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
export const MyDayPage = lazy(() => import('@/features/planner/MyDayPage'))
export const ProjectsPage = lazy(() => import('@/features/projects/ProjectsPage'))
export const ProjectWorkspacePage = lazy(() => import('@/features/projects/ProjectWorkspacePage'))
export const MyTasksPage = lazy(() => import('@/features/tasks/MyTasksPage'))
export const FocusPage = lazy(() => import('@/features/focus/FocusPage'))
export const SmartPlanPage = lazy(() => import('@/features/smart-plan/SmartPlanPage'))
export const InsightsPage = lazy(() => import('@/features/insights/InsightsPage'))
export const SettingsPage = lazy(() => import('@/features/settings/SettingsPage'))
export const NotFoundPage = lazy(() => import('./NotFoundPage'))
