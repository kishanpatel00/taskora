import { Database, Keyboard, Languages, ListChecks, Monitor, Moon, Palette, RotateCcw, Sun, Timer, User } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { Button } from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { Kbd } from '@/components/ui/Kbd'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { LanguageSelect } from '@/components/shared/LanguageSelect'
import { pickOption, usePriorityOptions } from '@/features/tasks/hooks/useTaskOptions'
import type { TranslationKey } from '@/i18n/translation.types'
import { useTranslation } from '@/i18n/useTranslation'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { cn } from '@/lib/cn'
import { MOD_KEY_LABEL } from '@/lib/platform'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import type { ThemePreference } from '@/types/common'
import { DataSettings } from './components/DataSettings'
import { MinutesInput, SettingRow } from './components/SettingRow'
import { settingsUpdated } from './settingsSlice'
import { DEFAULT_SETTINGS } from './settingsTypes'

const themes: Array<{ value: ThemePreference; labelKey: TranslationKey; icon: ReactNode }> = [
  { value: 'light', labelKey: 'settings_theme_light', icon: <Sun /> },
  { value: 'dark', labelKey: 'settings_theme_dark', icon: <Moon /> },
  { value: 'system', labelKey: 'settings_theme_system', icon: <Monitor /> },
]
const weekOptions: Array<{ value: string; labelKey: TranslationKey }> = [
  { value: '1', labelKey: 'settings_week_monday' },
  { value: '0', labelKey: 'settings_week_sunday' },
]

const SECTIONS = [
  { id: 'profile', labelKey: 'settings_section_profile', icon: User },
  { id: 'appearance', labelKey: 'settings_section_appearance', icon: Palette },
  { id: 'language', labelKey: 'settings_section_language', icon: Languages },
  { id: 'tasks', labelKey: 'settings_section_tasks', icon: ListChecks },
  { id: 'focus', labelKey: 'settings_section_focus', icon: Timer },
  { id: 'data', labelKey: 'settings_section_data', icon: Database },
  { id: 'shortcuts', labelKey: 'settings_section_shortcuts', icon: Keyboard },
] as const satisfies ReadonlyArray<{ id: string; labelKey: TranslationKey; icon: unknown }>

export default function SettingsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('settings_title'))
  const priorityOptions = usePriorityOptions()
  const dispatch = useAppDispatch()
  const settings = useAppSelector((state) => state.settings)
  const { hash } = useLocation()
  const [name, setName] = useState(settings.displayName)
  const [confirmingReset, setConfirmingReset] = useState(false)

  // Support deep links such as /settings#data.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  const update = (changes: Parameters<typeof settingsUpdated>[0]) => dispatch(settingsUpdated(changes))

  return (
    <PageContainer>
      <PageHeader
        title={t('settings_title')}
        description={t('settings_description')}
        actions={
          <Button variant="secondary" leftIcon={<RotateCcw />} onClick={() => setConfirmingReset(true)}>
            {t('settings_reset_preferences')}
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[176px_minmax(0,760px)]">
      <nav aria-label={t('settings_sections')} className="lg:sticky lg:top-16 lg:self-start">
        <ul className="flex gap-1 overflow-x-auto scrollbar-thin lg:flex-col lg:gap-0.5">
          {SECTIONS.map((section) => {
            const Icon = section.icon
            return (
              <li key={section.id} className="shrink-0">
                <a
                  href={`#${section.id}`}
                  aria-current={hash === `#${section.id}` ? 'location' : undefined}
                  className="flex h-8 items-center gap-2 rounded-control px-2 text-sm text-fg-2 transition-colors hover:bg-surface-3/60 hover:text-fg aria-[current=location]:bg-brand-soft aria-[current=location]:font-medium aria-[current=location]:text-brand-ink"
                >
                  <Icon className="size-4" aria-hidden />
                  {t(section.labelKey)}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="flex min-w-0 flex-col gap-3">
      <Card id="profile" className="scroll-mt-16">
        <CardHeader title={t('settings_section_profile')} icon={<User />} className="border-b border-line" />
        <CardBody className="pt-3">
          <SettingRow label={t('settings_display_name')} description={t('settings_display_name_hint')}>
            {({ controlId, descriptionId }) => (
              <Input
                id={controlId}
                aria-describedby={descriptionId}
                value={name}
                maxLength={40}
                onChange={(event) => setName(event.target.value)}
                onBlur={() => update({ displayName: name.trim() })}
                className="w-full sm:w-56"
              />
            )}
          </SettingRow>
        </CardBody>
      </Card>

      <Card id="appearance" className="scroll-mt-16">
        <CardHeader title={t('settings_section_appearance')} icon={<Palette />} className="border-b border-line" />
        <CardBody className="pt-3">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-fg">{t('settings_theme')}</legend>
            <div className="grid max-w-md grid-cols-3 gap-2">
              {themes.map((theme) => (
                <label key={theme.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="theme"
                    value={theme.value}
                    checked={settings.theme === theme.value}
                    onChange={() => update({ theme: theme.value })}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'flex h-9 items-center justify-center gap-2 rounded-control border text-sm font-medium transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring [&_svg]:size-4',
                      settings.theme === theme.value
                        ? 'border-brand bg-brand-soft text-brand-ink'
                        : 'border-line text-fg-2 hover:border-line-strong hover:text-fg',
                    )}
                  >
                    {theme.icon}
                    {t(theme.labelKey)}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
        </CardBody>
      </Card>

      <Card id="language" className="scroll-mt-16">
        <CardHeader title={t('settings_section_language')} icon={<Languages />} className="border-b border-line" />
        <CardBody className="pt-3">
          <SettingRow label={t('settings_language')} description={t('settings_language_hint')}>
            {({ controlId, descriptionId }) => <LanguageSelect id={controlId} aria-describedby={descriptionId} className="w-full sm:w-48" />}
          </SettingRow>
        </CardBody>
      </Card>

      <Card id="tasks" className="scroll-mt-16">
        <CardHeader title={t('settings_section_tasks')} icon={<ListChecks />} className="border-b border-line" />
        <CardBody className="divide-y divide-line pt-0">
          <SettingRow label={t('settings_week_start')} description={t('settings_week_start_hint')}>
            {({ controlId, descriptionId }) => (
              <Select
                id={controlId}
                aria-describedby={descriptionId}
                options={weekOptions.map((option) => ({ value: option.value, label: t(option.labelKey) }))}
                value={String(settings.weekStartsOn)}
                onChange={(event) => update({ weekStartsOn: event.target.value === '0' ? 0 : 1 })}
                className="w-40"
              />
            )}
          </SettingRow>
          <SettingRow label={t('settings_default_priority')} description={t('settings_default_priority_hint')}>
            {({ controlId, descriptionId }) => (
              <Select
                id={controlId}
                aria-describedby={descriptionId}
                options={priorityOptions}
                value={settings.defaultPriority}
                onChange={(event) => {
                  const priority = pickOption(priorityOptions, event.target.value)
                  if (priority) update({ defaultPriority: priority })
                }}
                className="w-40"
              />
            )}
          </SettingRow>
          <SettingRow label={t('settings_show_completed')} description={t('settings_show_completed_hint')}>
            {({ controlId, labelId }) => (
              <Switch id={controlId} aria-labelledby={labelId} checked={settings.showCompletedTasks} onChange={(value) => update({ showCompletedTasks: value })} />
            )}
          </SettingRow>
        </CardBody>
      </Card>

      <Card id="focus" className="scroll-mt-16">
        <CardHeader title={t('settings_section_focus')} icon={<Timer />} className="border-b border-line" />
        <CardBody className="divide-y divide-line pt-0">
          <SettingRow label={t('settings_focus_length')} description={t('settings_focus_length_hint')}>
            {({ controlId, descriptionId }) => (
              <MinutesInput id={controlId} describedBy={descriptionId} value={settings.defaultFocusMinutes} min={1} max={180} onCommit={(value) => update({ defaultFocusMinutes: value })} />
            )}
          </SettingRow>
          <SettingRow label={t('settings_break_length')} description={t('settings_break_length_hint')}>
            {({ controlId, descriptionId }) => (
              <MinutesInput id={controlId} describedBy={descriptionId} value={settings.defaultBreakMinutes} min={1} max={60} onCommit={(value) => update({ defaultBreakMinutes: value })} />
            )}
          </SettingRow>
          <SettingRow label={t('settings_chime')} description={t('settings_chime_hint')}>
            {({ controlId, labelId }) => (
              <Switch id={controlId} aria-labelledby={labelId} checked={settings.focusSoundEnabled} onChange={(value) => update({ focusSoundEnabled: value })} />
            )}
          </SettingRow>
        </CardBody>
      </Card>

      <DataSettings />

      <Card id="shortcuts" className="scroll-mt-16">
        <CardHeader title={t('settings_shortcuts_title')} icon={<Keyboard />} className="border-b border-line" />
        <CardBody className="pt-3">
          <dl className="grid gap-1.5 text-sm sm:grid-cols-2">
            {[
              { keys: [MOD_KEY_LABEL, 'K'], label: t('settings_shortcut_palette') },
              { keys: ['N'], label: t('settings_shortcut_new_task') },
              { keys: ['Esc'], label: t('settings_shortcut_close') },
              { keys: [t('settings_key_space'), t('settings_key_arrows')], label: t('settings_shortcut_kanban') },
            ].map((shortcut) => (
              <div key={shortcut.label} className="flex h-8 items-center justify-between gap-3 rounded-control bg-surface-2 px-2.5">
                <dt className="text-fg-2">{shortcut.label}</dt>
                <dd className="flex gap-1">
                  {shortcut.keys.map((key) => (
                    <Kbd key={key}>{key}</Kbd>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </CardBody>
      </Card>
      </div>
      </div>

      <ConfirmDialog
        open={confirmingReset}
        tone="primary"
        title={t('settings_reset_title')}
        confirmLabel={t('settings_reset_preferences')}
        description={t('settings_reset_description')}
        onCancel={() => setConfirmingReset(false)}
        onConfirm={() => {
          dispatch(settingsUpdated({ ...DEFAULT_SETTINGS, displayName: settings.displayName }))
          setConfirmingReset(false)
          toast.success(t('settings_reset_done'))
        }}
      />
    </PageContainer>
  )
}
