import { SurfConditions, SurfPreferences, ConditionEval, BeachFacing } from '../types'
import { calculateTide } from './tideCalculator'

const MARINE_API = 'https://marine-api.open-meteo.com/v1/marine'
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast'

// Conversion helpers
export const metersToFeet = (m: number): number => m * 3.28084
export const kmhToMph = (kmh: number): number => kmh * 0.621371
export const celsiusToF = (c: number): number => (c * 9) / 5 + 32

export async function fetchSurfConditions(lat: number, lng: number): Promise<SurfConditions> {
  try {
    const marineParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: [
        'wave_height',
        'wave_period',
        'wave_direction',
        'sea_surface_temperature'
      ].join(','),
      forecast_days: '1',
      timezone: 'auto'
    })

    const forecastParams = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lng.toString(),
      hourly: ['wind_speed_10m', 'wind_direction_10m'].join(','),
      forecast_days: '1',
      timezone: 'auto'
    })

    const [marineRes, forecastRes] = await Promise.all([
      fetch(`${MARINE_API}?${marineParams}`),
      fetch(`${FORECAST_API}?${forecastParams}`)
    ])

    if (!marineRes.ok || !forecastRes.ok) {
      throw new Error('API request failed')
    }

    const [marineData, forecastData] = await Promise.all([
      marineRes.json(),
      forecastRes.json()
    ])

    // Get the current hour index
    const now = new Date()
    const currentHour = now.getHours()

    // Marine data
    const waveHeights: number[] = marineData.hourly?.wave_height ?? []
    const wavePeriods: number[] = marineData.hourly?.wave_period ?? []
    const waveDirections: number[] = marineData.hourly?.wave_direction ?? []
    const waterTemps: number[] = marineData.hourly?.sea_surface_temperature ?? []

    // Forecast data
    const windSpeeds: number[] = forecastData.hourly?.wind_speed_10m ?? []
    const windDirections: number[] = forecastData.hourly?.wind_direction_10m ?? []

    const idx = currentHour

    return {
      waveHeight: waveHeights[idx] ?? null,
      wavePeriod: wavePeriods[idx] ?? null,
      waveDirection: waveDirections[idx] ?? null,
      windSpeed: windSpeeds[idx] ?? null,
      windDirection: windDirections[idx] ?? null,
      waterTemp: waterTemps[idx] ?? null,
      tide: calculateTide(),
      fetchedAt: new Date().toISOString()
    }
  } catch (err) {
    return {
      waveHeight: null,
      wavePeriod: null,
      waveDirection: null,
      windSpeed: null,
      windDirection: null,
      waterTemp: null,
      tide: calculateTide(),
      fetchedAt: new Date().toISOString(),
      error: err instanceof Error ? err.message : 'Unknown error'
    }
  }
}

// Map cardinal direction string to degrees (center of that quadrant)
const facingToDegrees: Record<BeachFacing, number> = {
  N: 0,
  NE: 45,
  E: 90,
  SE: 135,
  S: 180,
  SW: 225,
  W: 270,
  NW: 315
}

/**
 * Offshore wind check:
 * Wind direction in Open-Meteo is the direction the wind is COMING FROM.
 * For wind to be offshore it must be blowing FROM the land side,
 * i.e., FROM the opposite direction the beach is facing.
 * If a beach faces West, land is to the East, so offshore wind comes from ~East (90°).
 * We allow ±67.5° (3 octants) tolerance.
 */
function isOffshoreWind(windDirectionDeg: number, beachFacing: string): boolean {
  const facingDeg = facingToDegrees[beachFacing as BeachFacing]
  if (facingDeg === undefined) return false
  // Opposite of beach facing = offshore direction
  const offshoreDeg = (facingDeg + 180) % 360
  let diff = Math.abs(windDirectionDeg - offshoreDeg)
  if (diff > 180) diff = 360 - diff
  return diff <= 67.5
}

export function evaluateConditions(
  conditions: SurfConditions,
  prefs: SurfPreferences,
  beachFacing: string
): ConditionEval {
  if (conditions.error || conditions.waveHeight === null) {
    return {
      waveHeightOk: false,
      wavePeriodOk: false,
      windSpeedOk: false,
      windDirectionOk: false,
      overallStoke: 'unknown'
    }
  }

  const waveHeightFt = metersToFeet(conditions.waveHeight)
  const windMph = conditions.windSpeed !== null ? kmhToMph(conditions.windSpeed) : null

  const waveHeightOk =
    waveHeightFt >= prefs.minWaveHeight && waveHeightFt <= prefs.maxWaveHeight

  const wavePeriodOk =
    conditions.wavePeriod !== null && conditions.wavePeriod >= prefs.minWavePeriod

  const windSpeedOk = windMph !== null && windMph <= prefs.maxWindSpeed

  const windDirectionOk =
    conditions.windDirection !== null
      ? isOffshoreWind(conditions.windDirection, beachFacing)
      : false

  const passCount = [waveHeightOk, wavePeriodOk, windSpeedOk, windDirectionOk].filter(Boolean).length

  let overallStoke: ConditionEval['overallStoke']
  if (passCount === 4) overallStoke = 'pumping'
  else if (passCount >= 2) overallStoke = 'decent'
  else overallStoke = 'poor'

  return { waveHeightOk, wavePeriodOk, windSpeedOk, windDirectionOk, overallStoke }
}

// Convert meteorological wind direction degrees to a compass label
export function degreesToCompass(deg: number): string {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
                'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
  return dirs[Math.round(deg / 22.5) % 16]
}
