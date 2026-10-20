import { useEffect, useRef, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Stagger delay in ms. */
  delay?: number
  as?: 'div' | 'li' | 'section'
}

/**
 * Fades content in the first time it scrolls into view. The observer only
 * hides elements that are below the fold, disconnects after revealing, and
 * never re-animates. Without IntersectionObserver content is simply shown.
 */
export function Reveal({ children, className, delay = 0, as: Tag = 'div' }: RevealProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const element = ref.current
    if (!element || typeof IntersectionObserver === 'undefined') return
    // Already visible on load (e.g. after a refresh mid-page): show immediately, no animation.
    if (element.getBoundingClientRect().top < window.innerHeight) return
    element.dataset.reveal = 'pending'
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        element.dataset.reveal = 'shown'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag
      ref={(node: HTMLElement | null) => {
        ref.current = node
      }}
      className={cn(className)}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  )
}
