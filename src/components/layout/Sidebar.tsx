import { settingsUpdated } from '@/features/settings/settingsSlice'
import { cn } from '@/lib/cn'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { SidebarContent } from './SidebarContent'

/** Desktop sidebar (lg and up). Collapsed state is persisted with settings. */
export function Sidebar() {
  const dispatch = useAppDispatch()
  const collapsed = useAppSelector((state) => state.settings.sidebarCollapsed)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-dvh shrink-0 border-r border-line bg-surface transition-[width] duration-200 lg:block',
        collapsed ? 'w-14' : 'w-[220px]',
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onToggleCollapsed={() => dispatch(settingsUpdated({ sidebarCollapsed: !collapsed }))}
      />
    </aside>
  )
}
