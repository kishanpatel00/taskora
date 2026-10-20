import { PanelLeftClose, PanelLeftOpen, Plus } from 'lucide-react'
import { useMemo } from 'react'
import { NavLink } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { Logo } from '@/components/shared/Logo'
import { IconButton } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { ProjectDot } from '@/features/projects/components/ProjectAvatar'
import { selectProjectsSorted } from '@/features/projects/projectSelectors'
import { selectAttentionTasks, selectTasksByProject } from '@/features/tasks/taskSelectors'
import { isTaskDone } from '@/features/tasks/taskUtils'
import { useToday } from '@/hooks/useToday'
import { cn } from '@/lib/cn'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'
import { NAV_GROUPS, type NavItem } from './navigation'

interface SidebarContentProps {
  collapsed?: boolean
  onToggleCollapsed?: () => void
  /** Called after navigating (closes the mobile drawer). */
  onNavigate?: () => void
}

const itemBase = 'relative flex h-8 items-center gap-2.5 rounded-control text-sm transition-colors'
const itemIdle = 'text-fg-2 hover:bg-surface-3/60 hover:text-fg'
const itemActive = 'bg-brand-soft font-medium text-brand-ink'

interface NavEntryProps {
  item: NavItem
  collapsed: boolean
  badge?: number
  indicator?: boolean
  onNavigate?: () => void
}

/** One navigation link. Collapsed: icon only, with a tooltip and an accessible name. */
function NavEntry({ item, collapsed, badge, indicator, onNavigate }: NavEntryProps) {
  const { t } = useTranslation()
  const Icon = item.icon
  const label = t(item.labelKey)
  return (
    <Tooltip content={label} side="right" enabled={collapsed}>
      <NavLink
        to={item.to}
        onClick={onNavigate}
        aria-label={collapsed ? label : undefined}
        className={({ isActive }) => cn(itemBase, collapsed ? 'w-8 justify-center' : 'w-full px-2', isActive ? itemActive : itemIdle)}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        {!collapsed && <span className="flex-1 truncate">{label}</span>}
        {!collapsed && badge !== undefined && badge > 0 && (
          <span className="tabular rounded-control bg-surface-3 px-1 text-[11px] leading-4 font-medium text-fg-2">{badge}</span>
        )}
        {indicator && (
          <span
            className={cn('size-1.5 rounded-full bg-violet-500', collapsed && 'absolute top-1 right-1')}
            role="status"
            aria-label={t('navigation_focus_running')}
          />
        )}
      </NavLink>
    </Tooltip>
  )
}

export function SidebarContent({ collapsed = false, onToggleCollapsed, onNavigate }: SidebarContentProps) {
  const { t } = useTranslation()
  const today = useToday()
  const { openCreateProject } = useDialogs()
  const attentionCount = useAppSelector((state) => selectAttentionTasks(state, today).length)
  const timerActive = useAppSelector((state) => state.focus.timer.phase === 'running' || state.focus.timer.phase === 'paused')
  const projects = useAppSelector(selectProjectsSorted)
  const tasksByProject = useAppSelector(selectTasksByProject)

  const visibleProjects = useMemo(
    () =>
      projects
        .filter((project) => project.status !== 'completed')
        .map((project) => ({
          project,
          open: (tasksByProject[project.id] ?? []).filter((task) => !isTaskDone(task)).length,
        })),
    [projects, tasksByProject],
  )

  return (
    <div className="flex h-full flex-col">
      <div className={cn('flex h-12 shrink-0 items-center border-b border-line', collapsed ? 'justify-center' : 'px-3.5')}>
        <NavLink to="/dashboard" onClick={onNavigate} aria-label={t('navigation_home')} className="rounded-control">
          <Logo collapsed={collapsed} />
        </NavLink>
      </div>

      <nav
        aria-label={t('navigation_main')}
        className={cn('flex flex-1 flex-col gap-4 py-3', collapsed ? 'items-center px-2' : 'overflow-y-auto px-2 scrollbar-thin')}
      >
        {NAV_GROUPS.map((group) => (
          <div key={group.labelKey} className="flex w-full flex-col gap-0.5">
            {collapsed ? (
              <span className="mx-auto mb-1 h-px w-5 bg-line first:hidden" aria-hidden />
            ) : (
              <h2 className="mb-1 px-2 text-[11px] font-medium tracking-wide text-fg-3 uppercase">{t(group.labelKey)}</h2>
            )}
            <ul className={cn('flex flex-col gap-0.5', collapsed && 'items-center')} aria-label={collapsed ? t(group.labelKey) : undefined}>
              {group.items.map((item) => (
                <li key={item.to} className={cn(!collapsed && 'w-full')}>
                  <NavEntry
                    item={item}
                    collapsed={collapsed}
                    onNavigate={onNavigate}
                    badge={item.to === '/today' ? attentionCount : undefined}
                    indicator={item.to === '/focus' && timerActive}
                  />
                </li>
              ))}
            </ul>
          </div>
        ))}

        {!collapsed && (
          <section aria-labelledby="sidebar-projects" className="flex flex-col gap-0.5">
            <div className="mb-0.5 flex items-center justify-between pr-1 pl-2">
              <h2 id="sidebar-projects" className="text-[11px] font-medium tracking-wide text-fg-3 uppercase">
                {t('navigation_active_projects')}
              </h2>
              <IconButton label={t('navigation_new_project')} size="xs" onClick={openCreateProject}>
                <Plus />
              </IconButton>
            </div>
            <ul className="flex flex-col gap-0.5">
              {visibleProjects.map(({ project, open }) => (
                <li key={project.id}>
                  <NavLink
                    to={`/projects/${project.id}`}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(itemBase, 'h-7 w-full px-2', isActive ? 'bg-surface-3/70 font-medium text-fg' : itemIdle)
                    }
                  >
                    <ProjectDot color={project.color} className="mx-1" />
                    <span className="flex-1 truncate">{project.name}</span>
                    {open > 0 && <span className="tabular text-[11px] text-fg-3">{open}</span>}
                  </NavLink>
                </li>
              ))}
              {visibleProjects.length === 0 && <li className="px-2 py-1 text-xs text-fg-3">{t('navigation_no_active_projects')}</li>}
            </ul>
          </section>
        )}
      </nav>

      {onToggleCollapsed && (
        <div className={cn('flex h-11 shrink-0 items-center border-t border-line', collapsed ? 'justify-center' : 'px-2')}>
          <Tooltip content={t('navigation_expand_sidebar')} side="right" enabled={collapsed}>
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={collapsed ? t('navigation_expand_sidebar') : t('navigation_collapse_sidebar')}
              className={cn(itemBase, itemIdle, collapsed ? 'w-8 justify-center' : 'w-full px-2')}
            >
              {collapsed ? <PanelLeftOpen className="size-4" aria-hidden /> : <PanelLeftClose className="size-4" aria-hidden />}
              {!collapsed && <span>{t('navigation_collapse')}</span>}
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
