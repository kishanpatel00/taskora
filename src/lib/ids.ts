import { nanoid } from '@reduxjs/toolkit'

export type IdPrefix = 'task' | 'project' | 'sub' | 'focus'

/** Creates a collision-resistant, URL-safe id such as `task_V1StGXR8_Z`. */
export function createId(prefix: IdPrefix): string {
  return `${prefix}_${nanoid(10)}`
}
