import type { DateKey } from '@/types/common'

export const MAX_PINNED_PRIORITIES = 3

export interface PlannerState {
  /** Up to three pinned "top priority" task ids per day. */
  pinned: Record<DateKey, string[]>
  /** Manual ordering of the day's task list, by task id. */
  order: Record<DateKey, string[]>
}
