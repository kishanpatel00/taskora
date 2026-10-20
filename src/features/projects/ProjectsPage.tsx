import { FolderPlus, LayoutGrid, List, Plus, SearchX } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { PageContainer } from '@/components/layout/PageContainer'
import { PageHeader } from '@/components/shared/PageHeader'
import { SearchInput } from '@/components/shared/SearchInput'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { Select } from '@/components/ui/Select'
import { Tabs } from '@/components/ui/Tabs'
import { settingsUpdated } from '@/features/settings/settingsSlice'
import type { ProjectsLayout } from '@/features/settings/settingsTypes'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useToday } from '@/hooks/useToday'
import { useTranslation } from '@/i18n/useTranslation'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { DeleteProjectDialog } from './components/DeleteProjectDialog'
import { ProjectCard, ProjectRow } from './components/ProjectCard'
import { selectAllProjects, selectProjectProgressMap } from './projectSelectors'
import { PROJECT_STATUS_LABEL_KEYS, PROJECT_STATUSES, type Project, type ProjectSortKey, type ProjectStatus } from './projectTypes'
import { EMPTY_PROGRESS, filterProjects, sortProjects } from './projectUtils'


function parseStatus(value: string | null): ProjectStatus | 'all' {
  return PROJECT_STATUSES.find((status) => status === value) ?? 'all'
}

export default function ProjectsPage() {
  const { t } = useTranslation()
  useDocumentTitle(t('projects_title'))
  const statusOptions = useMemo(
    () => [
      { value: 'all' as const, label: t('projects_filter_all_statuses') },
      ...PROJECT_STATUSES.map((value) => ({ value, label: t(PROJECT_STATUS_LABEL_KEYS[value]) })),
    ],
    [t],
  )
  const sortOptions = useMemo<ReadonlyArray<{ value: ProjectSortKey; label: string }>>(
    () => [
      { value: 'updatedAt', label: t('projects_sort_updated') },
      { value: 'name', label: t('projects_sort_name') },
      { value: 'dueDate', label: t('projects_sort_due') },
      { value: 'progress', label: t('projects_sort_progress') },
    ],
    [t],
  )
  const layoutTabs = useMemo(
    () =>
      [
        { value: 'grid', label: t('projects_layout_grid'), icon: <LayoutGrid /> },
        { value: 'list', label: t('projects_layout_list'), icon: <List /> },
      ] as const,
    [t],
  )
  const today = useToday()
  const dispatch = useAppDispatch()
  const { openCreateProject } = useDialogs()
  const [searchParams, setSearchParams] = useSearchParams()
  const projects = useAppSelector(selectAllProjects)
  const progress = useAppSelector(selectProjectProgressMap)
  const layout = useAppSelector((state) => state.settings.projectsLayout)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<ProjectSortKey>('updatedAt')
  const [deleting, setDeleting] = useState<Project | null>(null)
  const status = parseStatus(searchParams.get('status'))

  const visible = useMemo(
    () => sortProjects(filterProjects(projects, search, status), sort, progress),
    [projects, search, status, sort, progress],
  )

  const setStatus = (value: string) => {
    const next = parseStatus(value)
    setSearchParams(next === 'all' ? {} : { status: next }, { replace: true })
  }

  return (
    <PageContainer>
      <PageHeader
        title={t('projects_title')}
        description={t('projects_description', { count: projects.length })}
        actions={
          <Button leftIcon={<Plus />} onClick={openCreateProject}>
            {t('projects_new')}
          </Button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} label={t('projects_search')} placeholder={t('projects_search_placeholder')} />
        <div className="flex flex-1 gap-2">
          <Select aria-label={t('filter_by_status')} options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} className="flex-1 sm:w-40 sm:flex-none" />
          <Select
            aria-label={t('projects_sort_label')}
            options={sortOptions}
            value={sort}
            onChange={(event) => {
              const next = sortOptions.find((option) => option.value === event.target.value)?.value
              if (next) setSort(next)
            }}
            className="flex-1 sm:w-44 sm:flex-none"
          />
        </div>
        <Tabs<ProjectsLayout>
          label={t('projects_layout')}
          items={layoutTabs}
          value={layout}
          onChange={(value) => dispatch(settingsUpdated({ projectsLayout: value }))}
          compactOnMobile
          className="self-start sm:self-auto"
        />
      </div>

      {projects.length === 0 ? (
        <Card>
          <EmptyState
            icon={<FolderPlus />}
            title={t('projects_empty_title')}
            description={t('projects_empty_description')}
            action={
              <Button leftIcon={<Plus />} onClick={openCreateProject}>
                {t('projects_new')}
              </Button>
            }
          />
        </Card>
      ) : visible.length === 0 ? (
        <Card>
          <EmptyState
            icon={<SearchX />}
            title={t('projects_no_match_title')}
            description={t('projects_no_match_description')}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setSearch('')
                  setStatus('all')
                }}
              >
                {t('filter_clear_all')}
              </Button>
            }
          />
        </Card>
      ) : layout === 'grid' ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" aria-label={t('projects_list_label')}>
          {visible.map((project) => (
            <li key={project.id} className="flex">
              <div className="flex-1 [&>article]:h-full">
                <ProjectCard project={project} progress={progress[project.id] ?? EMPTY_PROGRESS} today={today} onDelete={setDeleting} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden h-8 grid-cols-[minmax(0,2.4fr)_100px_minmax(0,1.2fr)_70px_110px_28px] items-center gap-x-4 border-b border-line bg-surface-2 px-3 text-xs font-medium text-fg-3 md:grid" aria-hidden>
            <span>{t('projects_column_project')}</span>
            <span>{t('projects_column_status')}</span>
            <span>{t('projects_column_progress')}</span>
            <span>{t('projects_column_tasks')}</span>
            <span>{t('projects_column_due')}</span>
            <span />
          </div>
          <ul className="divide-y divide-line" aria-label={t('projects_list_label')}>
            {visible.map((project) => (
              <li key={project.id}>
                <ProjectRow project={project} progress={progress[project.id] ?? EMPTY_PROGRESS} today={today} onDelete={setDeleting} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      <DeleteProjectDialog project={deleting} onClose={() => setDeleting(null)} />
    </PageContainer>
  )
}
