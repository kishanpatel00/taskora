import { Ellipsis, Pencil, Trash } from 'lucide-react'
import { useDialogs } from '@/app/dialogs/useDialogs'
import { IconButton } from '@/components/ui/Button'
import { DropdownMenu } from '@/components/ui/Dropdown'
import { useTranslation } from '@/i18n/useTranslation'
import type { Project } from '../projectTypes'

interface ProjectMenuProps {
  project: Project
  onDelete: (project: Project) => void
  className?: string
}

export function ProjectMenu({ project, onDelete, className }: ProjectMenuProps) {
  const { t } = useTranslation()
  const { openEditProject } = useDialogs()
  return (
    <DropdownMenu
      label={t('projects_actions_menu', { name: project.name })}
      trigger={(props) => (
        <IconButton {...props} label={t('projects_actions', { name: project.name })} size="sm" className={className}>
          <Ellipsis />
        </IconButton>
      )}
      items={[
        { label: t('projects_edit'), icon: <Pencil />, onSelect: () => openEditProject(project.id) },
        { label: t('projects_delete'), icon: <Trash />, danger: true, onSelect: () => onDelete(project) },
      ]}
    />
  )
}
