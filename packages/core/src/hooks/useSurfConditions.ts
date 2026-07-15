import { useState, useEffect, useCallback, useRef } from 'react'
import { Location, SurfPreferences, SurfConditions, ConditionEval } from '../types'
import { fetchSurfConditions, evaluateConditions } from '../services/openMeteo'

const REFRESH_INTERVAL_MS = 60 * 1000

export interface LocationData {
  conditions: SurfConditions | null
  eval: ConditionEval | null
  loading: boolean
}

export function useSurfConditions(locations: Location[], preferences: SurfPreferences) {
  const [locationData, setLocationData] = useState<Record<string, LocationData>>({})
  const dataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchAll = useCallback(async (locs: Location[], prefs: SurfPreferences) => {
    if (locs.length === 0) return

    setLocationData((prev) => {
      const next = { ...prev }
      locs.forEach((loc) => {
        next[loc.id] = { conditions: prev[loc.id]?.conditions ?? null, eval: prev[loc.id]?.eval ?? null, loading: true }
      })
      return next
    })

    const results = await Promise.all(
      locs.map(async (loc) => {
        const conditions = await fetchSurfConditions(loc.lat, loc.lng)
        const evalResult = evaluateConditions(conditions, prefs, loc.beachFacing)
        return { id: loc.id, conditions, eval: evalResult }
      })
    )

    setLocationData((prev) => {
      const next = { ...prev }
      results.forEach(({ id, conditions, eval: evalResult }) => {
        next[id] = { conditions, eval: evalResult, loading: false }
      })
      return next
    })
  }, [])

  useEffect(() => {
    fetchAll(locations, preferences)

    if (dataIntervalRef.current) clearInterval(dataIntervalRef.current)
    dataIntervalRef.current = setInterval(() => fetchAll(locations, preferences), REFRESH_INTERVAL_MS)

    return () => { if (dataIntervalRef.current) clearInterval(dataIntervalRef.current) }
  }, [locations, preferences, fetchAll])

  const refetch = useCallback(
    () => fetchAll(locations, preferences),
    [fetchAll, locations, preferences]
  )

  return { locationData, refetch }
}
