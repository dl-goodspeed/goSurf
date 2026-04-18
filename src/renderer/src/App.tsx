import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTimeTheme } from './hooks/useTimeTheme'
import { Location, SurfPreferences, SurfConditions, ConditionEval } from './types'
import { fetchSurfConditions, evaluateConditions } from './services/openMeteo'
import SettingsModal from './components/SettingsModal'
import LocationCard from './components/LocationCard'

const DEFAULT_PREFERENCES: SurfPreferences = {
  minWaveHeight: 2,
  maxWaveHeight: 8,
  minWavePeriod: 10,
  maxWindSpeed: 15,
  useMetric: false
}

const REFRESH_INTERVAL_MS = 60 * 1000 // 1 minute

interface LocationData {
  conditions: SurfConditions | null
  eval: ConditionEval | null
  loading: boolean
}

// Accent color for the logo based on time of day
const PERIOD_ACCENT: Record<string, string> = {
  night:     'text-cyan-400',
  dawn:      'text-orange-400',
  morning:   'text-sky-300',
  day:       'text-sky-200',
  afternoon: 'text-sky-300',
  sunset:    'text-orange-400',
  dusk:      'text-amber-400',
  evening:   'text-indigo-300'
}

export default function App() {
  const [preferences, setPreferences] = useLocalStorage<SurfPreferences>(
    'gosurf:preferences',
    DEFAULT_PREFERENCES
  )
  const [locations, setLocations] = useLocalStorage<Location[]>('gosurf:locations', [])
  const [showSettings, setShowSettings] = useState(false)
  const [locationData, setLocationData] = useState<Record<string, LocationData>>({})
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const { gradientStyle, period } = useTimeTheme()
  const accentClass = PERIOD_ACCENT[period] ?? 'text-cyan-400'

  const fetchAll = useCallback(async (locs: Location[], prefs: SurfPreferences) => {
    if (locs.length === 0) return

    setLocationData((prev) => {
      const next = { ...prev }
      locs.forEach((loc) => {
        next[loc.id] = {
          conditions: prev[loc.id]?.conditions ?? null,
          eval: prev[loc.id]?.eval ?? null,
          loading: true
        }
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

    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      fetchAll(locations, preferences)
    }, REFRESH_INTERVAL_MS)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [locations, preferences, fetchAll])

  const handleCloseSettings = () => {
    setShowSettings(false)
    fetchAll(locations, preferences)
  }

  return (
    <div
      className="relative w-screen h-screen overflow-hidden flex flex-col transition-all duration-[3000ms] ease-in-out"
      style={gradientStyle}
    >
      {/* Subtle overlay to soften the gradient and improve card contrast */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-extrabold tracking-tight drop-shadow" style={{ color: '#dcdcf5' }}>
            goSurf
          </span>
        </div>

        <button
          onClick={() => setShowSettings(true)}
          className="p-2.5 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Open settings"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 overflow-auto px-8 py-8">
        {locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="text-6xl mb-6">🏄</div>
            <h2 className="text-2xl font-bold text-white mb-2">No Locations Yet</h2>
            <p className="text-white/50 mb-6 max-w-sm">
              Click the gear icon in the top right to add up to 3 surf spots and set your preferences.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold rounded-xl px-6 py-3 transition-colors backdrop-blur-sm border border-white/20"
            >
              <Settings className="w-5 h-5" />
              Open Settings
            </button>
          </div>
        ) : (
          <div
            className={`grid gap-6 h-full ${
              locations.length === 1
                ? 'grid-cols-1 max-w-xl mx-auto'
                : locations.length === 2
                ? 'grid-cols-2 max-w-4xl mx-auto'
                : 'grid-cols-3'
            }`}
          >
            {locations.map((loc) => {
              const data = locationData[loc.id]
              return (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  conditions={data?.conditions ?? null}
                  eval={data?.eval ?? null}
                  loading={data?.loading ?? true}
                  useMetric={preferences.useMetric}
                />
              )
            })}
          </div>
        )}
      </main>

      {showSettings && (
        <SettingsModal
          preferences={preferences}
          locations={locations}
          onSavePreferences={setPreferences}
          onSaveLocations={setLocations}
          onClose={handleCloseSettings}
        />
      )}
    </div>
  )
}
