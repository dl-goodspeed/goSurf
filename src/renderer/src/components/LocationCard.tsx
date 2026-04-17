import { Location, SurfConditions, ConditionEval } from '../types'
import {
  metersToFeet,
  kmhToMph,
  celsiusToF,
  degreesToCompass
} from '../services/openMeteo'
import { formatTideCountdown } from '../services/tideCalculator'
import {
  Waves,
  Wind,
  Thermometer,
  Clock,
  AlertCircle,
  RefreshCw,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface LocationCardProps {
  location: Location
  conditions: SurfConditions | null
  eval: ConditionEval | null
  loading: boolean
  useMetric: boolean
  darkMode: boolean
}

function theme(dark: boolean) {
  const ink   = dark ? '#ece8df' : '#0a0a0a'
  const paper = dark ? '#0f0f0f' : '#f5f0e8'
  return { ink, paper }
}

function Indicator({ ok, unknown = false, ink }: { ok: boolean; unknown?: boolean; ink: string }) {
  const base = 'w-6 h-6 rounded-full inline-block shrink-0 border-2'
  if (unknown)
    return <span className={base} style={{ borderColor: `${ink}30` }} />
  return (
    <span
      className={base}
      style={{
        borderColor: ink,
        backgroundColor: ok ? ink : 'transparent'
      }}
    />
  )
}

const stokeLabel: Record<string, string> = {
  pumping: 'PUMPING',
  decent:  'DECENT',
  poor:    'POOR / BLOWN',
  unknown: '· · ·'
}

export default function LocationCard({
  location,
  conditions,
  eval: condEval,
  loading,
  useMetric,
  darkMode
}: LocationCardProps) {
  const { ink, paper } = theme(darkMode)
  const stoke = condEval?.overallStoke ?? 'unknown'

  if (!loading && (!conditions || conditions.error)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center">
          <AlertCircle className="w-14 h-14" style={{ color: `${ink}40` }} />
          <p className="text-4xl font-black tracking-tight uppercase" style={{ color: ink }}>
            {location.name}
          </p>
          <p className="text-lg" style={{ color: `${ink}50` }}>
            {conditions?.error ?? 'No data available'}
          </p>
        </div>
      </div>
    )
  }

  const waveHeightRaw = conditions?.waveHeight != null ? metersToFeet(conditions.waveHeight) : null
  const waveHeightDisplay = waveHeightRaw != null
    ? useMetric
      ? `${(waveHeightRaw / 3.28084).toFixed(1)} m`
      : `${waveHeightRaw.toFixed(1)} ft`
    : '--'

  const windMph = conditions?.windSpeed != null ? kmhToMph(conditions.windSpeed) : null
  const windDisplay = windMph != null
    ? useMetric
      ? `${(windMph / 0.621371).toFixed(0)} km/h`
      : `${windMph.toFixed(0)} mph`
    : '--'

  const waterF = conditions?.waterTemp != null ? celsiusToF(conditions.waterTemp) : null
  const waterDisplay = waterF != null
    ? useMetric
      ? `${((waterF - 32) * 5 / 9).toFixed(0)}°C`
      : `${waterF.toFixed(0)}°F`
    : null

  const windCompass = conditions?.windDirection != null ? degreesToCompass(conditions.windDirection) : '--'
  const waveCompass = conditions?.waveDirection != null ? degreesToCompass(conditions.waveDirection) : '--'
  const fetchTime = conditions?.fetchedAt
    ? new Date(conditions.fetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null

  const tide = conditions?.tide

  // Stoke badge styling
  const badgeStyle: React.CSSProperties =
    stoke === 'pumping'
      ? { backgroundColor: ink, color: paper, borderColor: ink }
      : stoke === 'decent'
      ? { backgroundColor: `${ink}14`, color: ink, borderColor: ink }
      : { backgroundColor: 'transparent', color: `${ink}45`, borderColor: `${ink}30` }

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ color: ink }}>
      {/* Location name + stoke */}
      <div
        className="text-center pt-10 pb-8 px-8 shrink-0"
        style={{ borderBottom: `2px solid ${ink}12` }}
      >
        <h1 className="text-7xl font-black tracking-tight uppercase mb-2 leading-none">
          {location.name}
        </h1>
        <p className="text-sm uppercase tracking-[0.2em] mb-7" style={{ color: `${ink}40` }}>
          Beach faces {location.beachFacing}
        </p>
        <div
          className="inline-block border-4 px-14 py-4"
          style={badgeStyle}
        >
          <span className="text-3xl font-black tracking-[0.15em] uppercase">
            {stokeLabel[stoke]}
          </span>
        </div>
      </div>

      {/* Conditions rows */}
      <div className="flex-1 overflow-hidden flex flex-col justify-center px-20 py-2">
        {/* Wave Height */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: `1px solid ${ink}12` }}
        >
          <div className="flex items-center gap-5">
            <Waves className="w-8 h-8 shrink-0" style={{ color: `${ink}45` }} />
            <span className="text-2xl font-semibold">Wave Height</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-3xl font-black">{waveHeightDisplay}</span>
            <Indicator ok={condEval?.waveHeightOk ?? false} unknown={condEval === null} ink={ink} />
          </div>
        </div>

        {/* Wave Period */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: `1px solid ${ink}12` }}
        >
          <div className="flex items-center gap-5">
            <Waves className="w-8 h-8 shrink-0" style={{ color: `${ink}45` }} />
            <span className="text-2xl font-semibold">Wave Period</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-3xl font-black">
              {conditions?.wavePeriod != null ? `${conditions.wavePeriod.toFixed(0)}s` : '--'}
              <span className="text-lg font-normal ml-2" style={{ color: `${ink}40` }}>{waveCompass}</span>
            </span>
            <Indicator ok={condEval?.wavePeriodOk ?? false} unknown={condEval === null} ink={ink} />
          </div>
        </div>

        {/* Wind */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: `1px solid ${ink}12` }}
        >
          <div className="flex items-center gap-5">
            <Wind className="w-8 h-8 shrink-0" style={{ color: `${ink}45` }} />
            <span className="text-2xl font-semibold">Wind</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="text-3xl font-black">
              <span className="text-lg font-normal mr-2" style={{ color: `${ink}40` }}>
                {condEval ? (condEval.windIsOffshore ? 'Offshore' : 'Onshore') : ''}
              </span>
              <span className="text-lg font-normal mr-3" style={{ color: `${ink}40` }}>{windCompass}</span>
              {windDisplay}
            </span>
            <Indicator ok={condEval?.windOk ?? false} unknown={condEval === null} ink={ink} />
          </div>
        </div>

        {/* Tide */}
        <div
          className="flex items-center justify-between py-6"
          style={{ borderBottom: waterDisplay != null ? `1px solid ${ink}12` : undefined }}
        >
          <div className="flex items-center gap-5">
            {tide?.rising ? (
              <ArrowUp className="w-8 h-8 shrink-0" style={{ color: `${ink}45` }} />
            ) : (
              <ArrowDown className="w-8 h-8 shrink-0" style={{ color: `${ink}45` }} />
            )}
            <span className="text-2xl font-semibold">
              Tide{' '}
              <span className="text-base font-normal" style={{ color: `${ink}30` }}>(est.)</span>
            </span>
          </div>
          {tide ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end gap-1">
                <span className="text-lg" style={{ color: `${ink}40` }}>
                  {tide.nextExtremeIsHigh ? 'High' : 'Low'} in{' '}
                  {formatTideCountdown(tide.minutesToNextExtreme)}
                </span>
                {tide.isSpring && (
                  <span
                    className="text-xs border px-2 py-0.5 uppercase tracking-wider"
                    style={{ borderColor: `${ink}35`, color: `${ink}60` }}
                  >
                    Spring
                  </span>
                )}
              </div>
              <span className="text-3xl font-black">{tide.tideLabel}</span>
            </div>
          ) : (
            <span className="text-3xl font-black" style={{ color: `${ink}20` }}>--</span>
          )}
        </div>

        {/* Water Temp */}
        {waterDisplay != null && (
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-5">
              <Thermometer className="w-8 h-8 shrink-0" style={{ color: `${ink}45` }} />
              <span className="text-2xl font-semibold">Water Temp</span>
            </div>
            <span className="text-3xl font-black">{waterDisplay}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-center gap-2 py-3 text-sm shrink-0"
        style={{ color: `${ink}25` }}
      >
        {loading ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Fetching conditions…</span>
          </>
        ) : fetchTime ? (
          <>
            <Clock className="w-4 h-4" />
            <span>Updated {fetchTime}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}
