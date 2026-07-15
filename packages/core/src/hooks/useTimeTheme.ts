import { useState, useEffect } from 'react'

type RGB = [number, number, number]

interface ColorStop {
  hour: number
  from: RGB
  to: RGB
}

// Each stop defines the gradient at that hour.
// Colors are dark enough to keep white text readable at all times.
const COLOR_STOPS: ColorStop[] = [
  { hour: 0,    from: [2,   6,   23],  to: [15,  23,  42]  }, // midnight   — deep slate
  { hour: 4,    from: [7,   12,  45],  to: [12,  28,  72]  }, // pre-dawn   — dark indigo
  { hour: 5.5,  from: [20,  40,  110], to: [110, 38,  8]   }, // dawn       — blue→burnt orange
  { hour: 7,    from: [6,   72,  120], to: [8,   55,  100] }, // morning    — ocean blue
  { hour: 10,   from: [4,   95,  138], to: [2,   72,  105] }, // daytime    — teal/cyan
  { hour: 15,   from: [3,   88,  155], to: [2,   68,  100] }, // afternoon  — deeper blue
  { hour: 17,   from: [18,  44,  132], to: [130, 58,  8]   }, // pre-sunset — blue→amber
  { hour: 19,   from: [16,  14,  68],  to: [118, 42,  6]   }, // dusk       — purple→dark orange
  { hour: 21,   from: [4,   6,   28],  to: [16,  14,  68]  }, // evening    — near-black→indigo
  { hour: 24,   from: [2,   6,   23],  to: [15,  23,  42]  }, // back to midnight
]

function lerp(a: number, b: number, t: number): number {
  return Math.round(a + (b - a) * t)
}

function lerpRGB(a: RGB, b: RGB, t: number): RGB {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]
}

function toRgb([r, g, b]: RGB): string {
  return `rgb(${r},${g},${b})`
}

export interface TimeTheme {
  gradientStyle: React.CSSProperties
  // Descriptive label for the current time window (used for the header glow etc.)
  period: 'night' | 'dawn' | 'morning' | 'day' | 'afternoon' | 'sunset' | 'dusk' | 'evening'
}

function getPeriod(hour: number): TimeTheme['period'] {
  if (hour < 4)  return 'night'
  if (hour < 6)  return 'dawn'
  if (hour < 9)  return 'morning'
  if (hour < 15) return 'day'
  if (hour < 17) return 'afternoon'
  if (hour < 19) return 'sunset'
  if (hour < 21) return 'dusk'
  return 'evening'
}

function getThemeForHour(hour: number): TimeTheme {
  const h = hour % 24

  let stopA = COLOR_STOPS[COLOR_STOPS.length - 2]
  let stopB = COLOR_STOPS[COLOR_STOPS.length - 1]

  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    if (h >= COLOR_STOPS[i].hour && h < COLOR_STOPS[i + 1].hour) {
      stopA = COLOR_STOPS[i]
      stopB = COLOR_STOPS[i + 1]
      break
    }
  }

  const t = (h - stopA.hour) / (stopB.hour - stopA.hour)
  const from = lerpRGB(stopA.from, stopB.from, t)
  const to   = lerpRGB(stopA.to,   stopB.to,   t)

  return {
    gradientStyle: {
      background: `linear-gradient(135deg, ${toRgb(from)} 0%, ${toRgb(to)} 100%)`
    },
    period: getPeriod(h)
  }
}

export function useTimeTheme(): TimeTheme {
  const [theme, setTheme] = useState<TimeTheme>(() => {
    const now = new Date()
    return getThemeForHour(now.getHours() + now.getMinutes() / 60)
  })

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTheme(getThemeForHour(now.getHours() + now.getMinutes() / 60))
    }

    // Align the first tick to the next whole minute
    const now = new Date()
    const msToNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()
    const timeout = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 60_000)
      return () => clearInterval(interval)
    }, msToNextMinute)

    return () => clearTimeout(timeout)
  }, [])

  return theme
}
