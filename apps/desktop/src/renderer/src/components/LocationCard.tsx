import {
  Location,
  SurfConditions,
  ConditionEval,
  AppTheme,
  STOKE_COLORS,
  metersToFeet,
  kmhToMph,
  celsiusToF,
  degreesToCompass,
  formatTideCountdown
} from '@gosurf/core'
import {
  Waves,
  TimerReset,
  Wind,
  Thermometer,
  Clock,
  AlertCircle,
  RefreshCw,
  WavesArrowUp,
  WavesArrowDown
} from 'lucide-react'

interface LocationCardProps {
  location: Location
  conditions: SurfConditions | null
  eval: ConditionEval | null
  loading: boolean
  useMetric: boolean
  theme: AppTheme
}

function inkFor(theme: AppTheme) {
  if (theme === 'simple-dark')                        return '#ece8df'
  if (theme === 'classic' || theme === 'classic-dark') return '#ffffff'
  return '#0a0a0a'
}

function paperFor(theme: AppTheme) {
  if (theme === 'simple-dark') return '#0f0f0f'
  return '#f5f0e8'
}

function Indicator({ ok, unknown = false, ink, classic }: {
  ok: boolean; unknown?: boolean; ink: string; classic: boolean
}) {
  const base = 'w-6 h-6 rounded-full inline-block shrink-0 border-2'
  if (unknown)
    return <span className={base} style={{ borderColor: classic ? 'rgba(255,255,255,0.25)' : `${ink}30` }} />
  if (classic)
    return <span className={base + ' border-transparent'} style={{ backgroundColor: ok ? '#4ade80' : '#f87171' }} />
  return (
    <span className={base} style={{ borderColor: ink, backgroundColor: ok ? ink : 'transparent' }} />
  )
}

function stokeDotColor(stoke: ConditionEval['overallStoke']): string {
  return STOKE_COLORS[stoke]
}

// Per-row icon colors for Classic theme
const CLASSIC_ICON: Record<string, string> = {
  waveHeight: '#67e8f9',  // cyan-300
  wavePeriod: '#93c5fd',  // blue-300
  wind:       '#6ee7b7',  // emerald-300
  tide:   '#fcd34d',  // amber-300
  temp:       '#fb923c',  // orange-400
}

const stokeLabel: Record<string, string> = {
  pumping: 'PUMPING',
  decent:  'DECENT',
  poor:    'POOR',
  unknown: '· · ·'
}

export default function LocationCard({
  location,
  conditions,
  eval: condEval,
  loading,
  useMetric,
  theme
}: LocationCardProps) {
  const ink    = inkFor(theme)
  const isClassic = theme === 'classic' || theme === 'classic-dark'
  const stoke  = condEval?.overallStoke ?? 'unknown'

  const muted  = isClassic ? 'rgba(255,255,255,0.50)' : `${ink}45`
  const faint  = isClassic ? 'rgba(255,255,255,0.25)' : `${ink}25`
  const divider = isClassic ? 'rgba(255,255,255,0.10)' : `${ink}12`
  const labelColor = isClassic ? 'rgba(255,255,255,0.75)' : ink

  const icon = (type: keyof typeof CLASSIC_ICON) =>
    isClassic ? CLASSIC_ICON[type] : muted

  if (!loading && (!conditions || conditions.error)) {
    return (
      <div className="h-full flex items-center justify-center" style={{ color: ink }}>
        <div className="flex flex-col items-center gap-5 text-center">
          <AlertCircle className="w-14 h-14" style={{ color: faint }} />
          <p className="text-4xl font-black tracking-tight uppercase">{location.name}</p>
          <p className="text-lg" style={{ color: muted }}>{conditions?.error ?? 'No data available'}</p>
        </div>
      </div>
    )
  }

  const waveHeightRaw = conditions?.waveHeight != null ? metersToFeet(conditions.waveHeight) : null
  const waveHeightDisplay = waveHeightRaw != null
    ? useMetric ? `${(waveHeightRaw / 3.28084).toFixed(1)} m` : `${waveHeightRaw.toFixed(1)} ft`
    : '--'

  const windMph = conditions?.windSpeed != null ? kmhToMph(conditions.windSpeed) : null
  const windDisplay = windMph != null
    ? useMetric ? `${(windMph / 0.621371).toFixed(0)} km/h` : `${windMph.toFixed(0)} mph`
    : '--'

  const waterF = conditions?.waterTemp != null ? celsiusToF(conditions.waterTemp) : null
  const waterDisplay = waterF != null
    ? useMetric ? `${((waterF - 32) * 5 / 9).toFixed(0)}°C` : `${waterF.toFixed(0)}°F`
    : null

  const windCompass = conditions?.windDirection != null ? degreesToCompass(conditions.windDirection) : '--'
  const waveCompass = conditions?.waveDirection != null ? degreesToCompass(conditions.waveDirection) : '--'
  const fetchTime = conditions?.fetchedAt
    ? new Date(conditions.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  const tide = conditions?.tide
  const tideIconColor = isClassic
    ? CLASSIC_ICON.tide
    : muted

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ color: ink }}>
      {/* Location name + stoke + water temp */}
      <div
        className="pt-10 pb-8 px-8 shrink-0"
        style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', borderBottom: `2px solid ${divider}` }}
      >
        {/* left balance spacer */}
        <div />
        {/* center: title + stoke */}
        <div className="text-center">
          <h1 className="text-7xl font-black tracking-tight uppercase mb-4 leading-none">
            {location.name}
          </h1>
          <p className="text-sm uppercase tracking-[0.2em] mb-6" style={{ color: muted }}>
            Beach faces {location.beachFacing}
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {/* <span className="w-4 h-4 rounded-full shrink-0" style={{ backgroundColor: stokeDotColor(stoke) }} /> */}
            <span className="text-3xl font-black tracking-widest uppercase" style={{ color: stokeDotColor(stoke)}}>
              {stokeLabel[stoke]}
            </span>
          </div>
        </div>
        {/* right: water temp, 20px from title edge */}
        <div className="flex items-start" style={{ paddingLeft: '20px' }}>
          {waterDisplay != null && (
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <Thermometer className="w-24 h-24 shrink-0" style={{ color: icon('temp') }} />
                <span style={{ color: labelColor, fontSize: '1rem', fontWeight: 'normal' }}>Water Temp</span>
              </div>
              <span className="text-3xl font-black" style={{ marginTop: '1.5rem' }}>{waterDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Conditions rows */}
      <div className="flex-1 overflow-hidden flex flex-col justify-center px-8 py-0">

        {/* Wave Height */}
        <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${divider}` }}>
          <div className="flex items-center gap-5">
            <Waves className="w-24 h-24 shrink-0" style={{ color: icon('waveHeight') }} />
            <span className="text-xs font-semibold" style={{ color: labelColor }}>Wave Height</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-3xl font-black">{waveHeightDisplay}</span>
            <Indicator ok={condEval?.waveHeightOk ?? false} unknown={condEval === null} ink={ink} classic={isClassic} />
          </div>
        </div>

        {/* Wave Period */}
        <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${divider}` }}>
          <div className="flex items-center gap-5">
            <TimerReset className="w-24 h-24 shrink-0" style={{ color: icon('wavePeriod') }} />
            <span className="text-xs font-semibold" style={{ color: labelColor }}>Wave Period</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-3xl font-black">
              {conditions?.wavePeriod != null ? `${conditions.wavePeriod.toFixed(0)}s` : '--'}
              <span className="text-lg font-normal ml-2" style={{ color: muted }}>{waveCompass}</span>
            </span>
            <Indicator ok={condEval?.wavePeriodOk ?? false} unknown={condEval === null} ink={ink} classic={isClassic} />
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center justify-between py-2" style={{ borderBottom: `1px solid ${divider}` }}>
          <div className="flex items-center gap-5">
            <Wind className="w-24 h-24 shrink-0" style={{ color: icon('wind') }} />
            <span className="text-xs font-semibold" style={{ color: labelColor }}>Wind</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-3xl font-black">
              <span className="text-lg font-normal mr-2" style={{ color: muted }}>
                {condEval ? (condEval.windIsOffshore ? 'Offshore' : 'Onshore') : ''}
              </span>
              <span className="text-lg font-normal mr-3" style={{ color: muted }}>{windCompass}</span>
              {windDisplay}
            </span>
            <Indicator ok={condEval?.windOk ?? false} unknown={condEval === null} ink={ink} classic={isClassic} />
          </div>
        </div>

        {/* Tide */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-5">
            {tide?.rising
              ? <WavesArrowUp   className="w-24 h-24 shrink-0" style={{ color: tideIconColor }} />
              : <WavesArrowDown className="w-24 h-24 shrink-0" style={{ color: tideIconColor }} />
            }
            <span className="text-xs font-semibold" style={{ color: labelColor }}>
              Tide <span className="text-base font-normal" style={{ color: faint }}>(est.)</span>
            </span>
          </div>
          {tide ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <span className="text-lg" style={{ color: muted }}>
                  {tide.nextExtremeIsHigh ? 'High' : 'Low'} in {formatTideCountdown(tide.minutesToNextExtreme)}
                </span>
                {tide.isSpring && (
                  <span className="text-xs border px-2 py-0.5 uppercase tracking-wider" style={{ borderColor: `${ink}35`, color: `${ink}60` }}>
                    Spring
                  </span>
                )}
              </div>
              <span className="text-3xl font-black">{tide.tideLabel}</span>
            </div>
          ) : (
            <span className="text-3xl font-black" style={{ color: faint }}>--</span>
          )}
        </div>

      </div>

      {/* Footer */}
      <div className="flex items-center justify-center gap-2 py-3 text-sm shrink-0" style={{ color: faint }}>
        {loading ? (
          <><RefreshCw className="w-4 h-4 animate-spin" /><span>Fetching conditions…</span></>
        ) : fetchTime ? (
          <><Clock className="w-4 h-4" /><span>Updated {fetchTime}</span></>
        ) : null}
      </div>
    </div>
  )
}
