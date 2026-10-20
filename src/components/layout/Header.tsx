import { Bell, CalendarCheck, Download, Menu, Moon, Plus, Search, Settings, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { DueDate } from '@/components/shared/DateDisplay'
import { Button, IconButton } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/Dropdown'
import { Kbd } from '@/components/ui/Kbd'
import { Popover } from '@/components/ui/Popover'
import { useToggleTheme } from '@/features/settings/useTheme'
import { selectAttentionTasks } from '@/features/tasks/taskSelectors'
import { useToday } from '@/hooks/useToday'
import { useTranslation } from '@/i18n/useTranslation'
import { MOD_KEY_LABEL } from '@/lib/platform'
import { useAppSelector } from '@/store/hooks'
import { Breadcrumbs } from './Breadcrumbs'

interface HeaderProps {
  onOpenMenu: () => void
  onOpenCommandPalette: () => void
}


function NotificationsMenu() {
  const { t } = useTranslation()
  const today = useToday()
  const navigate = useNavigate()
  const { openTask } = useDialogs()
  const tasks = useAppSelector((state) => selectAttentionTasks(state, today))
  const overdue = tasks.filter((task) => task.dueDate !== null && task.dueDate < today).length

  return (
    <Popover
      label={t('header_notifications')}
      className="w-[min(22rem,calc(100vw-1.5rem))] p-0"
      trigger={(props) => (
        <IconButton {...props} size="sm" label={tasks.length > 0 ? t('header_notifications_count', { count: tasks.length }) : t('header_notifications')} className="relative">
          <Bell />
          {tasks.length > 0 && (
            <span className="tabular absolute top-0.5 right-0.5 flex min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] leading-3.5 font-semibold text-white ring-2 ring-surface">
              {tasks.length > 9 ? '9+' : tasks.length}
            </span>
          )}
        </IconButton>
      )}
    >
      {(close) => (
        <div>
          <div className="border-b border-line px-3 py-2.5">
            <p className="text-sm font-semibold text-fg">{t('header_needs_attention')}</p>
            <p className="text-xs text-fg-3">
              {tasks.length === 0 ? t('header_all_caught_up') : t('header_attention_summary', { overdue, today: tasks.length - overdue })}
            </p>
          </div>
          {tasks.length > 0 && (
            <ul className="max-h-80 overflow-y-auto p-1 scrollbar-thin">
              {tasks.slice(0, 8).map((task) => (
                <li key={task.id}>
                  <button
                    type="button"
                    className="flex w-full flex-col items-start gap-0.5 rounded-control px-2.5 py-1.5 text-left hover:bg-surface-2 focus-visible:bg-surface-2"
                    onClick={() => {
                      close(false)
                      openTask(task.id)
                    }}
                  >
                    <span className="line-clamp-1 text-sm text-fg">{task.title}</span>
                    {task.dueDate && <DueDate date={task.dueDate} today={today} />}
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line p-1">
            <button
              type="button"
              onClick={() => {
                close(false)
                void navigate('/today')
              }}
              className="flex w-full items-center justify-center gap-1.5 rounded-control py-1.5 text-sm font-medium text-brand-ink hover:bg-surface-2"
            >
              <CalendarCheck className="size-3.5" aria-hidden />
              {t('header_open_my_day')}
            </button>
          </div>
        </div>
      )}
    </Popover>
  )
}

function ProfileMenu() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const toggleTheme = useToggleTheme()
  const name = useAppSelector((state) => state.settings.displayName)
  const initials =
    name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || 'U'

  return (
    <DropdownMenu
      label={t('header_account_menu')}
      trigger={(props) => (
        <button
          type="button"
          {...props}
          aria-label={t('header_account_menu')}
          className="ml-0.5 flex size-7 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-[11px] font-semibold text-white transition hover:opacity-90"
        >
          {initials}
        </button>
      )}
      items={[
        { label: t('navigation_settings'), icon: <Settings />, onSelect: () => void navigate('/settings') },
        { label: t('header_toggle_theme'), icon: <Moon />, onSelect: toggleTheme },
        { label: t('header_export_data'), icon: <Download />, onSelect: () => void navigate('/settings#data') },
      ]}
    />
  )
}

export function Header({ onOpenMenu, onOpenCommandPalette }: HeaderProps) {
  const { t } = useTranslation()
  const { openCreateTask } = useDialogs()
  const toggleTheme = useToggleTheme()

  return (
    <header className="sticky top-0 z-30 flex h-12 shrink-0 items-center gap-2 border-b border-line bg-surface px-3 sm:px-4">
      <IconButton label={t('navigation_open_menu')} size="sm" className="-ml-1 lg:hidden" onClick={onOpenMenu}>
        <Menu />
      </IconButton>
      <div className="min-w-0 flex-1">
        <Breadcrumbs />
      </div>
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden h-8 w-64 items-center gap-2 rounded-control border border-line bg-surface-2 px-2.5 text-sm text-fg-3 transition-colors hover:border-line-strong hover:text-fg-2 md:flex lg:w-72"
        aria-label={t('header_search_label')}
      >
        <Search className="size-3.5" aria-hidden />
        <span className="flex-1 truncate text-left whitespace-nowrap">{t('header_search_placeholder')}</span>
        <span className="flex gap-0.5" aria-hidden>
          <Kbd>{MOD_KEY_LABEL}</Kbd>
          <Kbd>K</Kbd>
        </span>
      </button>
      <div className="flex items-center gap-1">
        <IconButton label={t('header_search_label')} size="sm" className="md:hidden" onClick={onOpenCommandPalette}>
          <Search />
        </IconButton>
        <Button size="sm" className="max-sm:hidden" leftIcon={<Plus />} onClick={() => openCreateTask()} title={t('header_new_task_shortcut')}>
          {t('header_create')}
        </Button>
        <IconButton label={t('common_new_task')} variant="primary" size="sm" className="sm:hidden" onClick={() => openCreateTask()}>
          <Plus />
        </IconButton>
        <NotificationsMenu />
        <IconButton label={t('header_toggle_theme')} size="sm" onClick={toggleTheme}>
          <Sun className="hidden dark:block" />
          <Moon className="dark:hidden" />
        </IconButton>
        <ProfileMenu />
      </div>
    </header>
  )
}
