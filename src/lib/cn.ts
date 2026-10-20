type ClassValue = string | false | null | undefined

/** Joins truthy class names. Intentionally tiny — no conflict resolution needed. */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
