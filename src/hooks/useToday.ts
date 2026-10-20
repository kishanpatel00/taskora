import { useEffect, useState } from 'react'
import { msUntilMidnight, todayKey } from '@/lib/date'
import type { DateKey } from '@/types/common'

/** Today's date key; re-renders automatically when the date changes at midnight. */
export function useToday(): DateKey {
  const [today, setToday] = useState(todayKey)

  useEffect(() => {
    const timeout = window.setTimeout(() => setToday(todayKey()), msUntilMidnight() + 1000)
    return () => window.clearTimeout(timeout)
  }, [today])

  return today
}
