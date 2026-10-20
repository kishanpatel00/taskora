import { z } from 'zod'
import { isDateKey } from './date'

export const dateKeySchema = z.string().refine(isDateKey, { message: 'Expected a yyyy-MM-dd date' })

export const timestampSchema = z
  .string()
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Expected an ISO timestamp' })

export const idSchema = z.string().min(1).max(100)

/** Returns a short, human-readable description of the first validation issue. */
export function describeZodError(error: z.ZodError): string {
  const issue = error.issues[0]
  if (!issue) return 'Unknown validation error'
  const path = issue.path.length > 0 ? issue.path.join('.') : 'root'
  return `${path}: ${issue.message}`
}
