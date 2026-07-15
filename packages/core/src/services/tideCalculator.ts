import { TideInfo } from '../types'

// M2 (principal lunar semidiurnal) tidal period: 12h 25min 14s
const M2_PERIOD_S = 44714

// Lunar synodic period: 29.53059 days
const LUNAR_SYNODIC_S = 2551443

// Known new moon reference: January 6, 2000, 18:14 UTC
const KNOWN_NEW_MOON_S = 947182440

export function calculateTide(): TideInfo {
  const nowS = Date.now() / 1000

  // Lunar phase: 0 = new moon, 0.5 = full moon
  const lunarAgeS =
    ((nowS - KNOWN_NEW_MOON_S) % LUNAR_SYNODIC_S + LUNAR_SYNODIC_S) %
    LUNAR_SYNODIC_S
  const lunarPhase = lunarAgeS / LUNAR_SYNODIC_S

  // Spring/neap: cos(4π·phase) peaks at new moon (0) and full moon (0.5)
  const springFactor = (Math.cos(4 * Math.PI * lunarPhase) + 1) / 2
  const isSpring = springFactor > 0.65

  // Amplitude scales between neap (0.6) and spring (1.0)
  const amplitude = 0.6 + 0.4 * springFactor

  // M2 tide height — cos gives 1 at high, -1 at low
  const tidePhaseRaw = (2 * Math.PI * nowS) / M2_PERIOD_S
  const normalizedPhase = tidePhaseRaw % (2 * Math.PI)
  const height = Math.cos(normalizedPhase) * amplitude

  // d/dt cos(x) = -sin(x) — tide rises when sin < 0 (phase in π..2π)
  const rising = Math.sin(normalizedPhase) < 0

  // Tide state label
  let tideLabel: TideInfo['tideLabel']
  if (height > 0.65) tideLabel = 'High'
  else if (height < -0.65) tideLabel = 'Low'
  else if (rising) tideLabel = 'Rising'
  else tideLabel = 'Falling'

  // Seconds to next high tide (normalizedPhase → 2π)
  const phaseToNextHigh =
    normalizedPhase === 0
      ? 2 * Math.PI
      : (2 * Math.PI - normalizedPhase) % (2 * Math.PI) || 2 * Math.PI
  const secondsToNextHigh = (phaseToNextHigh / (2 * Math.PI)) * M2_PERIOD_S

  // Seconds to next low tide (normalizedPhase → π)
  const phaseToNextLow =
    normalizedPhase < Math.PI
      ? Math.PI - normalizedPhase
      : 3 * Math.PI - normalizedPhase
  const secondsToNextLow = (phaseToNextLow / (2 * Math.PI)) * M2_PERIOD_S

  const nextExtremeIsHigh = secondsToNextHigh <= secondsToNextLow
  const secondsToNext = nextExtremeIsHigh ? secondsToNextHigh : secondsToNextLow

  return {
    height,
    rising,
    tideLabel,
    minutesToNextExtreme: Math.round(secondsToNext / 60),
    nextExtremeIsHigh,
    isSpring
  }
}

export function formatTideCountdown(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}
