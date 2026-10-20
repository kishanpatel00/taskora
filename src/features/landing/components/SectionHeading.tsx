import { cn } from '@/lib/cn'

interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  subtitle?: string
  align?: 'left' | 'center'
}

/** Eyebrow + title + subtitle used by every landing section. `id` labels the section. */
export function SectionHeading({ id, eyebrow, title, subtitle, align = 'center' }: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className="text-xs font-semibold tracking-wider text-brand-ink uppercase">{eyebrow}</p>
      <h2 id={id} className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-[1.75rem] sm:leading-9">
        {title}
      </h2>
      {subtitle && <p className="mt-2 text-base text-fg-2">{subtitle}</p>}
    </div>
  )
}
