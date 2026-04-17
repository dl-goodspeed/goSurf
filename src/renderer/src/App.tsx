import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import { Location, SurfPreferences, SurfConditions, ConditionEval } from './types'
import { fetchSurfConditions, evaluateConditions } from './services/openMeteo'
import SettingsModal from './components/SettingsModal'
import LocationCard from './components/LocationCard'

const DEFAULT_PREFERENCES: SurfPreferences = {
  minWaveHeight: 2,
  maxWaveHeight: 8,
  minWavePeriod: 10,
  maxWindSpeedOffshore: 15,
  maxWindSpeedOnshore: 20,
  useMetric: false,
  darkMode: false,
  slideshowEnabled: false
}

const REFRESH_INTERVAL_MS = 60 * 1000
const SLIDESHOW_INTERVAL_MS = 20 * 1000

interface LocationData {
  conditions: SurfConditions | null
  eval: ConditionEval | null
  loading: boolean
}

export default function App() {
  const [preferences, setPreferences] = useLocalStorage<SurfPreferences>(
    'gosurf:preferences',
    DEFAULT_PREFERENCES
  )
  const [locations, setLocations] = useLocalStorage<Location[]>('gosurf:locations', [])
  const [showSettings, setShowSettings] = useState(false)
  const [locationData, setLocationData] = useState<Record<string, LocationData>>({})

  // Current displayed index + animation state
  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  // Refs so interval callbacks always see latest values
  const currentIndexRef = useRef(0)
  const animatingRef = useRef(false)
  currentIndexRef.current = currentIndex
  animatingRef.current = animating

  const dataIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const slideshowRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const slideshowResetRef = useRef(0) // increment to restart timer

  const dark = preferences.darkMode ?? false
  const paper = dark ? '#0f0f0f' : '#f5f0e8'
  const ink   = dark ? '#ece8df' : '#0a0a0a'

  const slideshowActive = (preferences.slideshowEnabled ?? false) && locations.length > 1

  // Clamp index when location count changes
  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, Math.max(0, locations.length - 1)))
  }, [locations.length])

  // Navigate with slide animation
  const navigate = useCallback((nextIdx: number) => {
    if (animatingRef.current) return
    const cur = currentIndexRef.current
    if (nextIdx === cur) return

    setPrevIndex(cur)
    setCurrentIndex(nextIdx)
    setAnimating(true)
    animatingRef.current = true

    setTimeout(() => {
      setPrevIndex(null)
      setAnimating(false)
      animatingRef.current = false
    }, 400)
  }, [])

  // Manual navigation resets the slideshow timer
  const handleNavigate = useCallback((nextIdx: number) => {
    navigate(nextIdx)
    slideshowResetRef.current += 1
  }, [navigate])

  // Slideshow interval — resets when enabled state, locations, or slideshowResetRef changes
  useEffect(() => {
    if (slideshowRef.current) clearInterval(slideshowRef.current)
    if (!slideshowActive) return

    slideshowRef.current = setInterval(() => {
      const next = (currentIndexRef.current + 1) % locations.length
      navigate(next)
    }, SLIDESHOW_INTERVAL_MS)

    return () => {
      if (slideshowRef.current) clearInterval(slideshowRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideshowActive, locations.length, navigate, slideshowResetRef.current])

  // Data fetching
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

    if (dataIntervalRef.current) clearInterval(dataIntervalRef.current)
    dataIntervalRef.current = setInterval(() => {
      fetchAll(locations, preferences)
    }, REFRESH_INTERVAL_MS)

    return () => {
      if (dataIntervalRef.current) clearInterval(dataIntervalRef.current)
    }
  }, [locations, preferences, fetchAll])

  const handleCloseSettings = () => {
    setShowSettings(false)
    fetchAll(locations, preferences)
  }

  const currentLocation = locations[currentIndex]
  const multiLocation = locations.length > 1

  const cardProps = (loc: Location) => ({
    location: loc,
    conditions: locationData[loc.id]?.conditions ?? null,
    eval: locationData[loc.id]?.eval ?? null,
    loading: locationData[loc.id]?.loading ?? true,
    useMetric: preferences.useMetric,
    darkMode: dark
  })

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col transition-colors duration-300"
      style={{ backgroundColor: paper, color: ink }}
    >
      {/* Header */}
      <header
        className="flex items-center justify-between px-8 py-4 shrink-0 border-b-2 transition-colors duration-300"
        style={{ borderColor: ink }}
      >
        <span className="text-2xl font-black tracking-tight uppercase">
          go<span className="font-extralight">Surf</span>
        </span>
        <button
          onClick={() => setShowSettings(true)}
          className="flex items-center gap-2 opacity-40 hover:opacity-100 transition-opacity"
          aria-label="Open settings"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-black tracking-widest uppercase">Settings</span>
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 flex overflow-hidden">
        {locations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
            <div className="text-7xl mb-8 select-none opacity-20">〰</div>
            <h2 className="text-4xl font-black tracking-tight uppercase mb-3">No Locations Yet</h2>
            <p className="mb-10 max-w-sm text-base leading-relaxed opacity-40">
              Click Settings in the top right to add up to 3 surf spots and configure your preferences.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 border-2 px-8 py-3 font-black uppercase tracking-widest text-sm transition-colors duration-200"
              style={{ borderColor: ink }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = ink
                ;(e.currentTarget as HTMLButtonElement).style.color = paper
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = ink
              }}
            >
              <Settings className="w-4 h-4" />
              Open Settings
            </button>
          </div>
        ) : (
          <>
            {/* Left arrow */}
            {multiLocation && (
              <button
                onClick={() => handleNavigate((currentIndex - 1 + locations.length) % locations.length)}
                className="flex items-center justify-center w-16 transition-colors duration-200 shrink-0 opacity-25 hover:opacity-70"
                style={{ borderRight: `1px solid ${ink}22` }}
                aria-label="Previous location"
              >
                <ChevronLeft className="w-9 h-9" />
              </button>
            )}

            {/* Card area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Animated card container */}
              <div className="relative overflow-hidden flex-1">
                {/* Exiting card */}
                {animating && prevIndex !== null && locations[prevIndex] && (
                  <div className="absolute inset-0 slide-out-left">
                    <LocationCard {...cardProps(locations[prevIndex])} loading={false} />
                  </div>
                )}
                {/* Current card */}
                <div className={`absolute inset-0 ${animating ? 'slide-in-right' : ''}`}>
                  {currentLocation && <LocationCard {...cardProps(currentLocation)} />}
                </div>
              </div>

              {/* Dot navigation */}
              {multiLocation && (
                <div
                  className="flex items-center justify-center gap-4 py-3 shrink-0"
                  style={{ borderTop: `1px solid ${ink}15` }}
                >
                  {locations.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigate(i)}
                      className="w-3 h-3 rounded-full border-2 transition-all"
                      style={{
                        borderColor: ink,
                        backgroundColor: i === currentIndex ? ink : 'transparent'
                      }}
                      aria-label={`Location ${i + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right arrow */}
            {multiLocation && (
              <button
                onClick={() => handleNavigate((currentIndex + 1) % locations.length)}
                className="flex items-center justify-center w-16 transition-colors duration-200 shrink-0 opacity-25 hover:opacity-70"
                style={{ borderLeft: `1px solid ${ink}22` }}
                aria-label="Next location"
              >
                <ChevronRight className="w-9 h-9" />
              </button>
            )}
          </>
        )}
      </main>

      {showSettings && (
        <SettingsModal
          preferences={preferences}
          locations={locations}
          onSavePreferences={setPreferences}
          onSaveLocations={setLocations}
          onClose={handleCloseSettings}
          darkMode={dark}
        />
      )}
    </div>
  )
}
