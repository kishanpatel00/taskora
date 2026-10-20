import {
  BookOpen,
  Briefcase,
  CodeXml,
  Dumbbell,
  Folder,
  Globe,
  Heart,
  House,
  Lightbulb,
  Palette,
  Rocket,
  Target,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/cn'
import { PROJECT_COLOR_STYLES } from '../projectStyles'
import type { ProjectColor, ProjectIcon } from '../projectTypes'

export const PROJECT_ICON_COMPONENTS: Record<ProjectIcon, LucideIcon> = {
  folder: Folder,
  code: CodeXml,
  rocket: Rocket,
  book: BookOpen,
  heart: Heart,
  briefcase: Briefcase,
  palette: Palette,
  target: Target,
  globe: Globe,
  dumbbell: Dumbbell,
  house: House,
  lightbulb: Lightbulb,
}

const sizes = {
  sm: 'size-6 rounded-control [&_svg]:size-3.5',
  md: 'size-8 rounded-control [&_svg]:size-4',
  lg: 'size-10 rounded-menu [&_svg]:size-5',
} as const

interface ProjectAvatarProps {
  color: ProjectColor
  icon: ProjectIcon
  size?: keyof typeof sizes
  className?: string
}

export function ProjectAvatar({ color, icon, size = 'md', className }: ProjectAvatarProps) {
  const Icon = PROJECT_ICON_COMPONENTS[icon]
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center', PROJECT_COLOR_STYLES[color].soft, sizes[size], className)}
      aria-hidden
    >
      <Icon />
    </span>
  )
}

export function ProjectDot({ color, className }: { color: ProjectColor; className?: string }) {
  return <span className={cn('size-2 shrink-0 rounded-full', PROJECT_COLOR_STYLES[color].solid, className)} aria-hidden />
}
