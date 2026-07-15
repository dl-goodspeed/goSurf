import { useState, useEffect, useCallback, useRef } from 'react'
import { Settings, ChevronLeft, ChevronRight } from 'lucide-react'
import { useLocalStorage } from './hooks/useLocalStorage'
import {
  useTimeTheme,
  useSurfConditions,
  Location,
  SurfPreferences,
  AppTheme,
  SettingsModal,
  DEFAULT_PREFERENCES
} from '@gosurf/core'
import LocationCard from './components/LocationCard'

const SLIDESHOW_INTERVAL_MS = 20 * 1000

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

function themeColors(t: AppTheme) {
  if (t === 'simple-dark')  return { ink: '#ece8df', paper: '#0f0f0f' }
  if (t === 'classic' || t === 'classic-dark') return { ink: '#ffffff', paper: 'transparent' }
  return { ink: '#0a0a0a', paper: '#f5f0e8' }
}

export default function App() {
  const [preferences, setPreferences] = useLocalStorage<SurfPreferences>(
    'gosurf:preferences',
    DEFAULT_PREFERENCES
  )
  const [locations, setLocations] = useLocalStorage<Location[]>('gosurf:locations', [])
  const [showSettings, setShowSettings] = useState(false)
  const { locationData, refetch } = useSurfConditions(locations, preferences)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [prevIndex, setPrevIndex] = useState<number | null>(null)
  const [animating, setAnimating] = useState(false)

  const currentIndexRef = useRef(0)
  const animatingRef = useRef(false)
  currentIndexRef.current = currentIndex
  animatingRef.current = animating

  const slideshowRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const slideshowResetRef = useRef(0)

  // Always call — only applied when theme === 'classic'
  const { gradientStyle, period } = useTimeTheme()

  const theme: AppTheme = preferences.theme ?? 'simple-light'
  const { ink, paper } = themeColors(theme)
  const isClassic = theme === 'classic' || theme === 'classic-dark'
  const bgStyle = theme === 'classic'      ? gradientStyle
                : theme === 'classic-dark' ? { backgroundColor: '#000000' }
                : { backgroundColor: paper }
  const headerInk = isClassic ? '#ffffff' : ink
  const accentClass = isClassic ? (PERIOD_ACCENT[period] ?? 'text-cyan-400') : ''

  const slideshowActive = (preferences.slideshowEnabled ?? false) && locations.length > 1

  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, Math.max(0, locations.length - 1)))
  }, [locations.length])

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

  const handleNavigate = useCallback((nextIdx: number) => {
    navigate(nextIdx)
    slideshowResetRef.current += 1
  }, [navigate])

  useEffect(() => {
    if (slideshowRef.current) clearInterval(slideshowRef.current)
    if (!slideshowActive) return

    slideshowRef.current = setInterval(() => {
      const next = (currentIndexRef.current + 1) % locations.length
      navigate(next)
    }, SLIDESHOW_INTERVAL_MS)

    return () => { if (slideshowRef.current) clearInterval(slideshowRef.current) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slideshowActive, locations.length, navigate, slideshowResetRef.current])

  const handleCloseSettings = () => {
    setShowSettings(false)
    refetch()
  }

  const currentLocation = locations[currentIndex]
  const multiLocation = locations.length > 1

  const cardProps = (loc: Location) => ({
    location: loc,
    conditions: locationData[loc.id]?.conditions ?? null,
    eval: locationData[loc.id]?.eval ?? null,
    loading: locationData[loc.id]?.loading ?? true,
    useMetric: preferences.useMetric,
    theme
  })

  return (
    <div
      className="w-screen h-screen overflow-hidden flex flex-col relative transition-all duration-[3000ms]"
      style={bgStyle}
    >
      {/* Classic overlay — only on gradient variant */}
      {theme === 'classic' && <div className="absolute inset-0 bg-black/20 pointer-events-none z-0" />}

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-8 py-4 shrink-0 transition-colors duration-300"
        style={{ borderBottom: `2px solid ${isClassic ? 'rgba(255,255,255,0.10)' : ink}`, color: headerInk }}
      >
        <span className="text-2xl font-black tracking-tight uppercase" style={{ color: '#a8a8d8' }}>
          {isClassic
            ? <>go<span className={`${accentClass} transition-colors duration-[3000ms]`}>Surf</span></>
            : 'goSurf'
          }
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
      <main className="relative z-10 flex-1 flex overflow-hidden">
        {locations.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8" style={{ color: headerInk }}>
            <div className="text-7xl mb-8 select-none opacity-20">〰</div>
            <h2 className="text-4xl font-black tracking-tight uppercase mb-3">No Locations Yet</h2>
            <p className="mb-10 max-w-sm text-base leading-relaxed opacity-40">
              Click Settings in the top right to add up to 3 surf spots and configure your preferences.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-2 border-2 px-8 py-3 font-black uppercase tracking-widest text-sm transition-colors duration-200"
              style={{ borderColor: headerInk, color: headerInk }}
              onMouseEnter={(e) => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.backgroundColor = headerInk
                b.style.color = isClassic ? '#0a0a0a' : paper
              }}
              onMouseLeave={(e) => {
                const b = e.currentTarget as HTMLButtonElement
                b.style.backgroundColor = 'transparent'
                b.style.color = headerInk
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
                className="flex items-center justify-center w-16 shrink-0 opacity-25 hover:opacity-70 transition-opacity"
                style={{ color: headerInk }}
                aria-label="Previous location"
              >
                <ChevronLeft className="w-9 h-9" />
              </button>
            )}

            {/* Card area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="relative overflow-hidden flex-1">
                {animating && prevIndex !== null && locations[prevIndex] && (
                  <div className="absolute inset-0 slide-out-left">
                    <LocationCard {...cardProps(locations[prevIndex])} loading={false} />
                  </div>
                )}
                <div className={`absolute inset-0 ${animating ? 'slide-in-right' : ''}`}>
                  {currentLocation && <LocationCard {...cardProps(currentLocation)} />}
                </div>
              </div>

              {/* Dot navigation */}
              {multiLocation && (
                <div
                  className="flex items-center justify-center gap-4 py-3 shrink-0"
                  style={{ borderTop: `1px solid ${isClassic ? 'rgba(255,255,255,0.10)' : `${ink}15`}` }}
                >
                  {locations.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => handleNavigate(i)}
                      className="w-3 h-3 rounded-full border-2 transition-all"
                      style={{
                        borderColor: headerInk,
                        backgroundColor: i === currentIndex ? headerInk : 'transparent'
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
                className="flex items-center justify-center w-16 shrink-0 opacity-25 hover:opacity-70 transition-opacity"
                style={{ color: headerInk }}
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
          theme={theme}
          onQuit={() => window.close()}
        />
      )}
    </div>
  )
}
