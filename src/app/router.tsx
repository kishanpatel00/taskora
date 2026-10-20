import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import LandingPage from '@/features/landing/LandingPage'
import {
  DashboardPage,
  FocusPage,
  InsightsPage,
  MyDayPage,
  MyTasksPage,
  NotFoundPage,
  ProjectsPage,
  ProjectWorkspacePage,
  SettingsPage,
  SmartPlanPage,
} from './pages'
import { RouteError } from './RouteError'

/**
 * `/` is the public landing page. It is bundled eagerly (not lazy) so a hard
 * refresh paints it immediately. Every application route lives under the
 * pathless AppLayout route, so refreshing any app URL keeps the user there.
 */
export const router = createBrowserRouter([
  { path: '/', element: <LandingPage />, errorElement: <RouteError /> },
  {
    element: <AppLayout />,
    errorElement: <RouteError />,
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'today', element: <MyDayPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'projects/:projectId', element: <ProjectWorkspacePage /> },
      { path: 'tasks', element: <MyTasksPage /> },
      { path: 'focus', element: <FocusPage /> },
      { path: 'smart-plan', element: <SmartPlanPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
