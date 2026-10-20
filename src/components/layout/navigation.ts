import {
  CalendarCheck,
  ChartNoAxesCombined,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Settings,
  Sparkles,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import type { TranslationKey } from '@/i18n/translation.types'

export interface NavItem {
  to: string
  labelKey: TranslationKey
  icon: LucideIcon
}

export interface NavGroup {
  labelKey: TranslationKey
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    labelKey: 'navigation_group_workspace',
    items: [
      { to: '/dashboard', labelKey: 'navigation_overview', icon: LayoutDashboard },
      { to: '/today', labelKey: 'navigation_my_day', icon: CalendarCheck },
      { to: '/projects', labelKey: 'navigation_projects', icon: FolderKanban },
      { to: '/tasks', labelKey: 'navigation_my_tasks', icon: ListChecks },
    ],
  },
  {
    labelKey: 'navigation_group_productivity',
    items: [
      { to: '/focus', labelKey: 'navigation_focus', icon: Timer },
      { to: '/smart-plan', labelKey: 'navigation_smart_planner', icon: Sparkles },
      { to: '/insights', labelKey: 'navigation_insights', icon: ChartNoAxesCombined },
    ],
  },
  {
    labelKey: 'navigation_group_personal',
    items: [{ to: '/settings', labelKey: 'navigation_settings', icon: Settings }],
  },
]

export const ALL_NAV_ITEMS: NavItem[] = NAV_GROUPS.flatMap((group) => group.items)
