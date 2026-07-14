export interface Location {
  id: string
  name: string
  lat: number
  lng: number
  beachFacing: string // e.g. "N", "NE", "E", "SE", "S", "SW", "W", "NW"
  isFavorite?: boolean
}

export type AppTheme = 'simple-light' | 'simple-dark' | 'classic' | 'classic-dark'

export interface SurfPreferences {
  minWaveHeight: number          // ft (internal storage always imperial)
  maxWaveHeight: number          // ft
  minWavePeriod: number          // seconds
  maxWindSpeedOffshore: number   // mph — applied when wind is blowing offshore
  maxWindSpeedOnshore: number    // mph — applied when wind is blowing onshore
  useMetric: boolean
  theme: AppTheme
  slideshowEnabled: boolean
}

export interface TideInfo {
  height: number            // -1 (low) to 1 (high), normalized
  rising: boolean
  tideLabel: 'High' | 'Falling' | 'Low' | 'Rising'
  minutesToNextExtreme: number
  nextExtremeIsHigh: boolean
  isSpring: boolean         // spring vs neap tide
}

export interface SurfConditions {
  waveHeight: number | null       // meters (converted to ft for display)
  wavePeriod: number | null       // seconds
  waveDirection: number | null    // degrees
  windSpeed: number | null        // km/h (converted to mph for display)
  windDirection: number | null    // degrees
  waterTemp: number | null        // celsius (converted to F for display)
  tide: TideInfo | null
  fetchedAt: string | null
  error?: string
}

export interface ConditionEval {
  waveHeightOk: boolean
  wavePeriodOk: boolean
  windOk: boolean         // speed ok given current direction
  windIsOffshore: boolean // true = offshore, false = onshore (for display)
  overallStoke: 'pumping' | 'decent' | 'poor' | 'unknown'
}

export type BeachFacing =
  | 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW'

export const BEACH_FACING_OPTIONS: BeachFacing[] = [
  'N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'
]
