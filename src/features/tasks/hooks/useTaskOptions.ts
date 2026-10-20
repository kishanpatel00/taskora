import { useMemo } from 'react'
import type { SelectOption } from '@/components/ui/Select'
import { useTranslation } from '@/i18n/useTranslation'
import { PRIORITY_LABEL_KEYS, STATUS_LABEL_KEYS, TASK_PRIORITIES, TASK_STATUSES, type TaskPriority, type TaskStatus } from '../taskTypes'

/** Localized select options for task statuses. */
export function useStatusOptions(): Array<SelectOption<TaskStatus>> {
  const { t } = useTranslation()
  return useMemo(() => TASK_STATUSES.map((value) => ({ value, label: t(STATUS_LABEL_KEYS[value]) })), [t])
}

/** Localized select options for task priorities. */
export function usePriorityOptions(): Array<SelectOption<TaskPriority>> {
  const { t } = useTranslation()
  return useMemo(() => TASK_PRIORITIES.map((value) => ({ value, label: t(PRIORITY_LABEL_KEYS[value]) })), [t])
}

/** Finds the typed option value for a raw `<select>` value. */
export function pickOption<T extends string>(options: ReadonlyArray<{ value: T }>, raw: string): T | undefined {
  return options.find((option) => option.value === raw)?.value
}
