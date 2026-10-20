import {
  CalendarCheck,
  ChartColumn,
  ArrowDown,
  ArrowUp,
  CornerDownLeft,
  FolderKanban,
  FolderPlus,
  House,
  LayoutDashboard,
  ListChecks,
  Moon,
  Plus,
  Search,
  Settings,
  Sparkles,
  SquareCheck,
  Timer,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { Kbd } from '@/components/ui/Kbd'
import { ProjectDot } from '@/features/projects/components/ProjectAvatar'
import { selectAllProjects } from '@/features/projects/projectSelectors'
import { useToggleTheme } from '@/features/settings/useTheme'
import { selectAllTasks } from '@/features/tasks/taskSelectors'
import { cn } from '@/lib/cn'
import { trapTabKey } from '@/lib/focus'
import { normalizeText } from '@/lib/format'
import type { TranslationKey } from '@/i18n/translation.types'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppSelector } from '@/store/hooks'

interface Command {
  id: string
  group: CommandGroup
  label: string
  icon: ReactNode
  keywords?: string
  hint?: string
  run: () => void
}

type CommandGroup = 'actions' | 'navigation' | 'projects' | 'tasks'

const GROUP_KEYS: Record<CommandGroup, TranslationKey> = {
  actions: 'palette_group_actions',
  navigation: 'palette_group_navigation',
  projects: 'palette_group_projects',
  tasks: 'palette_group_tasks',
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  if (!open) return null
  return createPortal(<Palette onClose={onClose} />, document.body)
}

function matches(command: Command, words: string[]): boolean {
  const haystack = normalizeText(`${command.label} ${command.keywords ?? ''}`)
  return words.every((word) => haystack.includes(word))
}

const icon = (Icon: LucideIcon) => <Icon className="size-3.5" aria-hidden />

function Palette({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation()
  const id = useId()
  const navigate = useNavigate()
  const dialogs = useDialogs()
  const toggleTheme = useToggleTheme()
  const tasks = useAppSelector(selectAllTasks)
  const projects = useAppSelector(selectAllProjects)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const staticCommands = useMemo<Command[]>(() => {
    const go = (path: string) => () => void navigate(path)
    return [
      { id: 'new-task', group: 'actions', label: t('palette_create_task'), icon: icon(Plus), keywords: 'add new todo', hint: 'N', run: () => dialogs.openCreateTask() },
      { id: 'new-project', group: 'actions', label: t('palette_create_project'), icon: icon(FolderPlus), keywords: 'add new', run: dialogs.openCreateProject },
      { id: 'theme', group: 'actions', label: t('palette_toggle_theme'), icon: icon(Moon), keywords: 'dark light mode appearance', run: toggleTheme },
      { id: 'start-focus', group: 'actions', label: t('palette_start_focus'), icon: icon(Timer), keywords: 'pomodoro timer', run: go('/focus') },
      { id: 'nav-dashboard', group: 'navigation', label: t('palette_go_overview'), icon: icon(LayoutDashboard), keywords: 'home dashboard', run: go('/dashboard') },
      { id: 'nav-today', group: 'navigation', label: t('palette_go_my_day'), icon: icon(CalendarCheck), keywords: 'today planner', run: go('/today') },
      { id: 'nav-projects', group: 'navigation', label: t('palette_go_projects'), icon: icon(FolderKanban), run: go('/projects') },
      { id: 'nav-tasks', group: 'navigation', label: t('palette_go_my_tasks'), icon: icon(ListChecks), keywords: 'all tasks table list', run: go('/tasks') },
      { id: 'nav-focus', group: 'navigation', label: t('palette_go_focus'), icon: icon(Timer), keywords: 'pomodoro', run: go('/focus') },
      { id: 'nav-smart', group: 'navigation', label: t('palette_go_smart_planner'), icon: icon(Sparkles), keywords: 'breakdown template goal', run: go('/smart-plan') },
      { id: 'nav-insights', group: 'navigation', label: t('palette_go_insights'), icon: icon(ChartColumn), keywords: 'analytics stats charts', run: go('/insights') },
      { id: 'nav-settings', group: 'navigation', label: t('palette_go_settings'), icon: icon(Settings), keywords: 'preferences export import language', run: go('/settings') },
      { id: 'nav-landing', group: 'navigation', label: t('palette_go_landing'), icon: icon(House), keywords: 'landing home website', run: go('/') },
    ]
  }, [navigate, dialogs, toggleTheme, t])

  const results = useMemo(() => {
    const words = normalizeText(query).split(' ').filter(Boolean)
    const commandResults = staticCommands.filter((command) => matches(command, words))
    if (words.length === 0) return commandResults

    const projectResults: Command[] = projects
      .map((project) => ({
        id: `project-${project.id}`,
        group: 'projects' as const,
        label: project.name,
        icon: <ProjectDot color={project.color} className="mx-1" />,
        keywords: project.description,
        run: () => void navigate(`/projects/${project.id}`),
      }))
      .filter((command) => matches(command, words))
      .slice(0, 4)

    const taskResults: Command[] = tasks
      .map((task) => ({
        id: `task-${task.id}`,
        group: 'tasks' as const,
        label: task.title,
        icon: icon(SquareCheck),
        keywords: task.tags.join(' '),
        hint: task.status === 'done' ? t('palette_task_done') : undefined,
        run: () => dialogs.openTask(task.id),
      }))
      .filter((command) => matches(command, words))
      .slice(0, 6)

    return [...commandResults, ...projectResults, ...taskResults]
  }, [query, staticCommands, projects, tasks, navigate, dialogs, t])

  const safeIndex = Math.min(activeIndex, Math.max(0, results.length - 1))
  const activeCommand = results[safeIndex]

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return () => {
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [])

  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [safeIndex])

  const execute = (command: Command | undefined) => {
    if (!command) return
    onClose()
    command.run()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (results.length === 0) return
      const delta = event.key === 'ArrowDown' ? 1 : -1
      setActiveIndex((safeIndex + delta + results.length) % results.length)
    } else if (event.key === 'Enter') {
      event.preventDefault()
      execute(activeCommand)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
    } else if (event.key === 'Tab') {
      trapTabKey(event.nativeEvent, panelRef.current)
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center px-3 pt-[10vh]">
      <div className="absolute inset-0 animate-fade-in bg-overlay backdrop-blur-[2px]" onMouseDown={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t('palette_label')}
        onKeyDown={onKeyDown}
        className="relative w-full max-w-[560px] animate-scale-in overflow-hidden rounded-panel border border-line bg-surface shadow-modal"
      >
        <div className="flex items-center gap-2.5 border-b border-line px-3">
          <Search className="size-4 shrink-0 text-fg-3" aria-hidden />
          <input
            autoFocus
            role="combobox"
            aria-expanded="true"
            aria-controls={`${id}-list`}
            aria-activedescendant={activeCommand ? `${id}-${activeCommand.id}` : undefined}
            aria-autocomplete="list"
            aria-label={t('palette_search_label')}
            placeholder={t('palette_search_placeholder')}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setActiveIndex(0)
            }}
            className="h-11 flex-1 bg-transparent text-base text-fg outline-none placeholder:text-fg-3"
          />
          <Kbd>Esc</Kbd>
        </div>
        <ul ref={listRef} id={`${id}-list`} role="listbox" aria-label={t('palette_results')} className="max-h-[min(60vh,24rem)] overflow-y-auto p-1 scrollbar-thin">
          {results.length === 0 && (
            <li className="px-3 py-8 text-center text-sm text-fg-3" role="presentation">
              {t('palette_no_results', { query })}
            </li>
          )}
          {results.map((command, index) => {
            const showGroup = command.group !== results[index - 1]?.group
            const active = index === safeIndex
            return (
              <li key={command.id} role="presentation">
                {showGroup && (
                  <div className="px-2 pt-2 pb-1 text-[10px] font-semibold tracking-wider text-fg-3 uppercase" role="presentation">
                    {t(GROUP_KEYS[command.group])}
                  </div>
                )}
                <div
                  id={`${id}-${command.id}`}
                  role="option"
                  aria-selected={active}
                  onMouseMove={() => setActiveIndex(index)}
                  onClick={() => execute(command)}
                  className={cn(
                    'flex h-8 cursor-pointer items-center gap-2.5 rounded-control px-2 text-sm',
                    active ? 'bg-brand text-white' : 'text-fg',
                  )}
                >
                  <span className={cn('flex w-4 justify-center', active ? 'text-white' : 'text-fg-3')}>{command.icon}</span>
                  <span className="flex-1 truncate">{command.label}</span>
                  {command.hint && <Kbd tone={active ? 'inverted' : 'default'}>{command.hint}</Kbd>}
                  {active && <CornerDownLeft className="size-3.5 opacity-60" aria-hidden />}
                </div>
              </li>
            )
          })}
        </ul>
        <div className="hidden items-center gap-4 border-t border-line bg-surface-2 px-3 py-1.5 text-[11px] text-fg-3 sm:flex">
          <span className="flex items-center gap-1">
            <Kbd>
              <ArrowUp aria-label={t('palette_key_up')} />
            </Kbd>
            <Kbd>
              <ArrowDown aria-label={t('palette_key_down')} />
            </Kbd>
            {t('palette_hint_navigate')}
          </span>
          <span className="flex items-center gap-1">
            <Kbd>
              <CornerDownLeft aria-label={t('palette_key_enter')} />
            </Kbd>
            {t('palette_hint_select')}
          </span>
          <span className="flex items-center gap-1">
            <Kbd>Esc</Kbd> {t('palette_hint_close')}
          </span>
        </div>
      </div>
    </div>
  )
}
