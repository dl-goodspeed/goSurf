import { useState } from 'react'
import {
  Settings,
  Waves,
  WavesArrowUp,
  WavesArrowDown,
  TimerReset,
  Wind,
  Thermometer,
  RefreshCw,
  Star,
  AlertCircle
} from 'lucide-react'
import {
  useSurfConditions,
  useTimeTheme,
  metersToFeet,
  kmhToMph,
  celsiusToF,
  degreesToCompass,
  formatTideCountdown,
  STOKE_COLORS,
  DEFAULT_PREFERENCES,
  Location,
  SurfPreferences,
  AppTheme,
  SettingsModal
} from '@gosurf/core'
import { useStorageItem } from '../../hooks/useStorageItem'
import { preferencesItem, locationsItem } from '../../storage'

const STOKE_LABEL: Record<string, string> = {
  pumping: 'Pumping',
  decent:  'Decent',
  poor:    'Poor',
  unknown: '—'
}

// Mirrors the desktop app's themeColors() — same 4 themes, same look.
function themeColors(theme: AppTheme) {
  if (theme === 'simple-dark') return { ink: '#ece8df', paper: '#0f0f0f' }
  if (theme === 'classic' || theme === 'classic-dark') return { ink: '#ffffff', paper: 'transparent' }
  return { ink: '#0a0a0a', paper: '#f5f0e8' }
}

function LocationRow({
  location,
  useMetric,
  loading,
  conditions,
  evaluation,
  ink
}: {
  location: Location
  useMetric: boolean
  loading: boolean
  conditions: ReturnType<typeof useSurfConditions>['locationData'][string]['conditions']
  evaluation: ReturnType<typeof useSurfConditions>['locationData'][string]['eval']
  ink: string
}) {
  const stoke = evaluation?.overallStoke ?? 'unknown'

  if (!loading && (!conditions || conditions.error)) {
    return (
      <div className="flex items-center gap-2 py-3 px-3" style={{ borderBottom: `1px solid ${ink}12` }}>
        <AlertCircle className="w-4 h-4 shrink-0" style={{ color: `${ink}40` }} />
        <span className="text-sm font-bold truncate">{location.name}</span>
        <span className="text-xs ml-auto" style={{ color: `${ink}40` }}>No data</span>
      </div>
    )
  }

  const waveHeightRaw = conditions?.waveHeight != null ? metersToFeet(conditions.waveHeight) : null
  const waveHeightDisplay = waveHeightRaw != null
    ? useMetric ? `${(waveHeightRaw / 3.28084).toFixed(1)}m` : `${waveHeightRaw.toFixed(1)}ft`
    : '--'

  const waveCompass = conditions?.waveDirection != null ? degreesToCompass(conditions.waveDirection) : ''
  const wavePeriodDisplay = conditions?.wavePeriod != null
    ? `${conditions.wavePeriod.toFixed(0)}s ${waveCompass}`
    : '--'

  const windMph = conditions?.windSpeed != null ? kmhToMph(conditions.windSpeed) : null
  const windDisplay = windMph != null
    ? useMetric ? `${(windMph / 0.621371).toFixed(0)}km/h` : `${windMph.toFixed(0)}mph`
    : '--'
  const windCompass = conditions?.windDirection != null ? degreesToCompass(conditions.windDirection) : ''

  const tide = conditions?.tide
  const tideDisplay = tide
    ? `${tide.nextExtremeIsHigh ? 'High' : 'Low'} ${formatTideCountdown(tide.minutesToNextExtreme)}`
    : '--'

  const waterF = conditions?.waterTemp != null ? celsiusToF(conditions.waterTemp) : null
  const waterDisplay = waterF != null
    ? useMetric ? `${((waterF - 32) * 5 / 9).toFixed(0)}°C` : `${waterF.toFixed(0)}°F`
    : null

  return (
    <div className="py-2.5 px-3" style={{ borderBottom: `1px solid ${ink}12` }}>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-sm font-black uppercase tracking-tight flex items-center gap-1 min-w-0">
          <span className="truncate">{location.name}</span>
          {location.isFavorite && <Star className="w-3 h-3 shrink-0" fill={ink} stroke={ink} />}
          {waterDisplay != null && (
            <span className="flex items-center gap-0.5 text-xs font-semibold normal-case shrink-0" style={{ color: `${ink}70` }}>
              <Thermometer className="w-3 h-3" style={{ color: `${ink}45` }} />
              {waterDisplay}
            </span>
          )}
        </span>
        {loading ? (
          <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" style={{ color: `${ink}40` }} />
        ) : (
          <span
            className="text-xs font-black uppercase tracking-wide shrink-0"
            style={{ color: stoke === 'unknown' ? `${ink}40` : STOKE_COLORS[stoke] }}
          >
            {STOKE_LABEL[stoke]}
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs" style={{ color: `${ink}70` }}>
        <span className="flex items-center gap-1">
          <Waves className="w-3.5 h-3.5" style={{ color: `${ink}45` }} />
          {waveHeightDisplay}
        </span>
        <span className="flex items-center gap-1">
          <TimerReset className="w-3.5 h-3.5" style={{ color: `${ink}45` }} />
          {wavePeriodDisplay}
        </span>
        <span className="flex items-center gap-1">
          <Wind className="w-3.5 h-3.5" style={{ color: `${ink}45` }} />
          {windCompass} {windDisplay}
        </span>
        <span className="flex items-center gap-1">
          {tide?.rising
            ? <WavesArrowUp className="w-3.5 h-3.5" style={{ color: `${ink}45` }} />
            : <WavesArrowDown className="w-3.5 h-3.5" style={{ color: `${ink}45` }} />}
          {tideDisplay}
        </span>
      </div>
    </div>
  )
}

export default function PopupApp() {
  const [preferences, setPreferences, prefsLoaded] = useStorageItem<SurfPreferences>(
    preferencesItem,
    DEFAULT_PREFERENCES
  )
  const [locations, setLocations, locsLoaded] = useStorageItem<Location[]>(locationsItem, [])
  const { locationData, refetch } = useSurfConditions(locations, preferences)
  const [showSettings, setShowSettings] = useState(false)

  const { gradientStyle } = useTimeTheme()
  const theme = preferences.theme ?? 'simple-light'
  const { ink, paper } = themeColors(theme)
  const isClassic = theme === 'classic' || theme === 'classic-dark'
  const bgStyle = theme === 'classic'      ? gradientStyle
                : theme === 'classic-dark' ? { backgroundColor: '#000000' }
                : { backgroundColor: paper }

  if (showSettings && prefsLoaded && locsLoaded) {
    return (
      <div style={{ width: 480 }}>
        <SettingsModal
          embedded
          preferences={preferences}
          locations={locations}
          onSavePreferences={setPreferences}
          onSaveLocations={setLocations}
          onClose={() => {
            setShowSettings(false)
            refetch()
          }}
          theme={theme}
        />
      </div>
    )
  }

  return (
    <div style={{ width: 390, color: ink, position: 'relative', overflow: 'hidden', ...bgStyle }}>
      {theme === 'classic' && (
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundColor: 'rgba(0,0,0,0.2)' }} />
      )}
      <div className="relative">
        <div
          className="flex items-center justify-between px-3 py-2.5"
          style={{ borderBottom: `2px solid ${isClassic ? 'rgba(255,255,255,0.10)' : ink}` }}
        >
          <span className="text-base font-black tracking-tight uppercase" style={{ color: '#a8a8d8' }}>
            goSurf
          </span>
          <button
            onClick={() => setShowSettings(true)}
            className="opacity-40 hover:opacity-100 transition-opacity"
            aria-label="Open settings"
          >
            <Settings className="w-4 h-4" style={{ color: ink }} />
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="flex flex-col items-center text-center px-4 py-8">
            <p className="text-sm font-bold mb-1">No locations yet</p>
            <p className="text-xs mb-4" style={{ color: `${ink}50` }}>
              Add up to 3 surf spots in Settings.
            </p>
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-black uppercase tracking-wide"
              style={{ border: `2px solid ${ink}`, color: ink }}
            >
              <Settings className="w-3.5 h-3.5" />
              Open Settings
            </button>
          </div>
        ) : (
          <div>
            {locations.map((loc) => (
              <LocationRow
                key={loc.id}
                location={loc}
                useMetric={preferences.useMetric}
                loading={locationData[loc.id]?.loading ?? true}
                conditions={locationData[loc.id]?.conditions ?? null}
                evaluation={locationData[loc.id]?.eval ?? null}
                ink={ink}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
