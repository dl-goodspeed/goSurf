import { useState } from 'react'
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
  ArrowDown,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface LocationCardProps {
  location: Location
  conditions: SurfConditions | null
  eval: ConditionEval | null
  loading: boolean
  useMetric: boolean
}

function LED({ ok, unknown = false }: { ok: boolean; unknown?: boolean }) {
  if (unknown)
    return <span className="w-2.5 h-2.5 rounded-full bg-white/20 inline-block" />
  return (
    <span
      className={`w-2.5 h-2.5 rounded-full inline-block shadow-sm ${
        ok ? 'bg-green-400 shadow-green-400/60' : 'bg-red-500 shadow-red-500/60'
      }`}
    />
  )
}

const stokeCard: Record<string, string> = {
  pumping:  'bg-white/10 border-cyan-400/50',
  decent:   'bg-white/10 border-amber-400/40',
  poor:     'bg-white/8  border-white/15',
  unknown:  'bg-white/8  border-white/10'
}

const stokeBadge: Record<string, string> = {
  pumping: 'bg-cyan-500/80 text-white',
  decent:  'bg-amber-500/80 text-white',
  poor:    'bg-white/20 text-white/70',
  unknown: 'bg-white/10 text-white/40'
}

const stokeBadgeLarge: Record<string, string> = {
  pumping: 'bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/40',
  decent:  'bg-amber-500/90 text-white shadow-lg shadow-amber-500/40',
  poor:    'bg-white/25 text-white/80',
  unknown: 'bg-white/10 text-white/40'
}

const tideArrow: Record<string, string> = {
  High:    'text-blue-300',
  Falling: 'text-amber-300',
  Low:     'text-red-400',
  Rising:  'text-green-400'
}

export default function LocationCard({
  location,
  conditions,
  eval: condEval,
  loading,
  useMetric
}: LocationCardProps) {
  const stoke = condEval?.overallStoke ?? 'unknown'
  const [collapsed, setCollapsed] = useState(false)

  if (!loading && (!conditions || conditions.error)) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-white/8 p-6 flex items-center justify-center min-h-[320px] backdrop-blur-sm">
        <div className="flex flex-col items-center gap-3">
          <AlertCircle className="w-8 h-8 text-red-400" />
          <p className="font-semibold text-white">{location.name}</p>
          <p className="text-sm text-red-300">{conditions?.error ?? 'No data available'}</p>
          <p className="text-xs text-white/40">Facing: {location.beachFacing}</p>
        </div>
      </div>
    )
  }

  // Wave height
  const waveHeightRaw = conditions?.waveHeight != null ? metersToFeet(conditions.waveHeight) : null
  const waveHeightDisplay = waveHeightRaw != null
    ? useMetric
      ? `${(waveHeightRaw / 3.28084).toFixed(1)} m`
      : `${waveHeightRaw.toFixed(1)} ft`
    : '--'

  // Wind speed
  const windMph = conditions?.windSpeed != null ? kmhToMph(conditions.windSpeed) : null
  const windDisplay = windMph != null
    ? useMetric
      ? `${(windMph / 0.621371).toFixed(0)} km/h`
      : `${windMph.toFixed(0)} mph`
    : '--'

  // Water temp
  const waterF = conditions?.waterTemp != null ? celsiusToF(conditions.waterTemp) : null
  const waterDisplay = waterF != null
    ? useMetric
      ? `${((waterF - 32) * 5 / 9).toFixed(0)}°C`
      : `${waterF.toFixed(0)}°F`
    : null

  const windCompass =
    conditions?.windDirection != null ? degreesToCompass(conditions.windDirection) : '--'
  const waveCompass =
    conditions?.waveDirection != null ? degreesToCompass(conditions.waveDirection) : '--'
  const fetchTime = conditions?.fetchedAt
    ? new Date(conditions.fetchedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
      })
    : null

  const tide = conditions?.tide
  const tideColor = tide ? tideArrow[tide.tideLabel] : 'text-white/40'

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className={`rounded-2xl border ${stokeCard[stoke]} p-6 flex flex-col items-center justify-center gap-4 backdrop-blur-md transition-all duration-300 hover:brightness-110 cursor-pointer w-full`}
      >
        <h2 className="text-3xl font-extrabold text-white drop-shadow text-center leading-tight">
          {location.name}
        </h2>
        <span
          className={`text-xl font-bold px-6 py-2 rounded-full uppercase tracking-widest backdrop-blur-sm ${stokeBadgeLarge[stoke]}`}
        >
          {stoke === 'pumping'
            ? '🏄 Pumping'
            : stoke === 'decent'
            ? 'Decent'
            : stoke === 'poor'
            ? 'Flat / Blown'
            : '...'}
        </span>
        <ChevronDown className="w-5 h-5 text-white/30 mt-1" />
      </button>
    )
  }

  return (
    <div
      className={`rounded-2xl border ${stokeCard[stoke]} p-6 min-h-[320px] flex flex-col justify-between backdrop-blur-md transition-all duration-500`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-white drop-shadow">{location.name}</h2>
          <p className="text-xs text-white/40 mt-0.5">Beach faces {location.beachFacing}</p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider backdrop-blur-sm ${stokeBadge[stoke]}`}
          >
            {stoke === 'pumping'
              ? '🏄 Pumping'
              : stoke === 'decent'
              ? 'Decent'
              : stoke === 'poor'
              ? 'Flat/Blown'
              : '...'}
          </span>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-lg text-white/30 hover:text-white/70 hover:bg-white/10 transition-all"
            aria-label="Collapse card"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-2.5 flex-1">
        {/* Wave Height */}
        <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-cyan-300" />
            <span className="text-sm text-white/70">Wave Height</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">{waveHeightDisplay}</span>
            <LED ok={condEval?.waveHeightOk ?? false} unknown={condEval === null} />
          </div>
        </div>

        {/* Wave Period */}
        <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-blue-300" />
            <span className="text-sm text-white/70">Wave Period</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">
              {conditions?.wavePeriod != null
                ? `${conditions.wavePeriod.toFixed(0)}s`
                : '--'}{' '}
              <span className="text-white/40 text-xs">{waveCompass}</span>
            </span>
            <LED ok={condEval?.wavePeriodOk ?? false} unknown={condEval === null} />
          </div>
        </div>

        {/* Wind Speed */}
        <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-emerald-300" />
            <span className="text-sm text-white/70">Wind Speed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold">
              {windDisplay}{' '}
              <span className="text-white/40 text-xs">{windCompass}</span>
            </span>
            <LED ok={condEval?.windSpeedOk ?? false} unknown={condEval === null} />
          </div>
        </div>

        {/* Offshore Wind */}
        <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            <Wind className="w-4 h-4 text-violet-300" />
            <span className="text-sm text-white/70">Offshore Wind</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white font-semibold text-sm">
              {condEval?.windDirectionOk ? 'Yes' : 'No'}
            </span>
            <LED
              ok={condEval?.windDirectionOk ?? false}
              unknown={condEval === null}
            />
          </div>
        </div>

        {/* Tide */}
        <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
          <div className="flex items-center gap-2">
            {tide?.rising ? (
              <ArrowUp className="w-4 h-4 text-green-400" />
            ) : (
              <ArrowDown className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-sm text-white/70">
              Tide <span className="text-white/30 text-xs">(est.)</span>
            </span>
          </div>
          {tide ? (
            <div className="flex items-center gap-2 text-right">
              <div>
                <span className={`font-semibold text-sm ${tideColor}`}>
                  {tide.tideLabel}
                </span>
                <span className="text-white/40 text-xs ml-1.5">
                  {tide.nextExtremeIsHigh ? 'High' : 'Low'} in{' '}
                  {formatTideCountdown(tide.minutesToNextExtreme)}
                </span>
              </div>
              {tide.isSpring && (
                <span className="text-xs bg-blue-500/30 text-blue-200 px-1.5 py-0.5 rounded-full">
                  Spring
                </span>
              )}
            </div>
          ) : (
            <span className="text-white/30 text-sm">--</span>
          )}
        </div>

        {/* Water Temp */}
        {waterDisplay != null && (
          <div className="flex items-center justify-between bg-black/20 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-300" />
              <span className="text-sm text-white/70">Water Temp</span>
            </div>
            <span className="text-white font-semibold">{waterDisplay}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center gap-1 mt-4 text-xs text-white/25">
        {loading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : fetchTime ? (
          <>
            <Clock className="w-3 h-3" />
            <span>Updated {fetchTime}</span>
          </>
        ) : null}
      </div>
    </div>
  )
}
