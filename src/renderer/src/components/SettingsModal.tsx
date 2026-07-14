import { useState } from 'react'
import { X, MapPin, Trash2, Pencil, Plus, Power, Star } from 'lucide-react'
import { Location, SurfPreferences, BEACH_FACING_OPTIONS, AppTheme } from '../types'
import MapPicker from './MapPicker'
import EditLocationModal from './EditLocationModal'

interface SettingsModalProps {
  preferences: SurfPreferences
  locations: Location[]
  onSavePreferences: (prefs: SurfPreferences) => void
  onSaveLocations: (locs: Location[]) => void
  onClose: () => void
  theme: AppTheme
}

const THEME_LABELS: Record<AppTheme, string> = {
  'simple-light': 'Simple — Light',
  'simple-dark':  'Simple — Dark',
  'classic':      'Classic',
  'classic-dark': 'Classic — Dark'
}

export default function SettingsModal({
  preferences,
  locations,
  onSavePreferences,
  onSaveLocations,
  onClose,
  theme
}: SettingsModalProps) {
  const [prefs, setPrefs] = useState<SurfPreferences>(preferences)
  const [locs, setLocs] = useState<Location[]>(locations)

  const [pendingLat, setPendingLat] = useState<number | null>(null)
  const [pendingLng, setPendingLng] = useState<number | null>(null)
  const [pendingName, setPendingName] = useState('')
  const [pendingFacing, setPendingFacing] = useState<string>('W')
  const [pendingFavorite, setPendingFavorite] = useState(false)

  const [editingLocation, setEditingLocation] = useState<Location | null>(null)

  // Modal always uses a neutral dark appearance so it's readable over any background
  const ink   = theme === 'simple-light' ? '#0a0a0a' : '#ece8df'
  const paper = theme === 'simple-light' ? '#f5f0e8' : '#0f0f0f'

  const handleSaveAll = () => {
    onSavePreferences(prefs)
    onSaveLocations(locs)
    onClose()
  }

  const handleAddLocation = () => {
    if (!pendingLat || !pendingLng || !pendingName.trim()) return
    if (locs.length >= 3) return

    const newLoc: Location = {
      id: crypto.randomUUID(),
      name: pendingName.trim(),
      lat: pendingLat,
      lng: pendingLng,
      beachFacing: pendingFacing,
      isFavorite: pendingFavorite
    }
    const nextLocs = pendingFavorite ? locs.map((l) => ({ ...l, isFavorite: false })) : locs
    setLocs([...nextLocs, newLoc])
    setPendingLat(null)
    setPendingLng(null)
    setPendingName('')
    setPendingFacing('W')
    setPendingFavorite(false)
  }

  const handleDeleteLocation = (id: string) => {
    setLocs(locs.filter((l) => l.id !== id))
  }

  const handleUpdateLocation = (updated: Location) => {
    setLocs(locs.map((l) => {
      if (l.id === updated.id) return updated
      return updated.isFavorite ? { ...l, isFavorite: false } : l
    }))
    setEditingLocation(null)
  }

  const inputClass = "w-full px-3 py-2 font-semibold focus:outline-none"
  const inputStyle = {
    backgroundColor: 'transparent',
    border: `2px solid ${ink}28`,
    color: ink
  }
  const inputFocusStyle = { borderColor: ink }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: `${ink}55` }}>
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8"
        style={{ backgroundColor: paper, border: `2px solid ${ink}`, color: ink }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-8 pb-5"
          style={{ borderBottom: `2px solid ${ink}` }}
        >
          <h2 className="text-3xl font-black tracking-tight uppercase">Settings</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1.5 px-3 py-1.5 font-black uppercase tracking-wide text-sm transition-colors"
              style={{ border: `2px solid ${ink}`, color: ink }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = ink
                ;(e.currentTarget as HTMLButtonElement).style.color = paper
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = ink
              }}
              title="Quit goSurf"
            >
              <Power className="w-4 h-4" />
              Quit
            </button>
            <button
              onClick={handleSaveAll}
              className="p-2 transition-colors"
              style={{ border: `2px solid ${ink}`, color: ink }}
              onMouseEnter={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = ink
                ;(e.currentTarget as HTMLButtonElement).style.color = paper
              }}
              onMouseLeave={(e) => {
                ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                ;(e.currentTarget as HTMLButtonElement).style.color = ink
              }}
              title="Save & close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Display */}
        <section className="mb-8">
          <h3
            className="text-xs font-black uppercase tracking-[0.2em] mb-4"
            style={{ color: `${ink}45` }}
          >
            Display
          </h3>

          {/* Theme */}
          <div className="mb-3">
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: `${ink}45` }}>Theme</p>
            <div className="grid grid-cols-2 gap-2">
              {(['simple-light', 'simple-dark', 'classic', 'classic-dark'] as AppTheme[]).map((t) => {
                const active = (prefs.theme ?? 'simple-light') === t
                return (
                  <button
                    key={t}
                    onClick={() => setPrefs({ ...prefs, theme: t })}
                    className="py-2.5 px-2 text-xs font-black uppercase tracking-wide transition-colors"
                    style={active
                      ? { backgroundColor: ink, color: paper, border: `2px solid ${ink}` }
                      : { backgroundColor: 'transparent', color: ink, border: `2px solid ${ink}30` }
                    }
                  >
                    {THEME_LABELS[t]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Slideshow */}
          <div
            className="flex items-center justify-between px-4 py-3 mb-3"
            style={{ border: `1px solid ${ink}22` }}
          >
            <div className="flex flex-col">
              <span className="text-base font-semibold">Slideshow</span>
              <span className="text-xs" style={{ color: `${ink}45` }}>Auto-advance locations every 20s</span>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={prefs.slideshowEnabled ?? false}
              onClick={() => setPrefs({ ...prefs, slideshowEnabled: !(prefs.slideshowEnabled ?? false) })}
              className="relative inline-flex h-6 w-12 items-center transition-colors"
              style={{
                border: `2px solid ${ink}`,
                backgroundColor: (prefs.slideshowEnabled ?? false) ? ink : 'transparent'
              }}
            >
              <span
                className="inline-block h-4 w-4 transition-transform"
                style={{
                  backgroundColor: (prefs.slideshowEnabled ?? false) ? paper : ink,
                  transform: (prefs.slideshowEnabled ?? false) ? 'translateX(24px)' : 'translateX(4px)'
                }}
              />
            </button>
          </div>

          {/* Units */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ border: `1px solid ${ink}22` }}
          >
            <span className="text-base font-semibold">Measurement System</span>
            <div className="flex items-center gap-4">
              <span
                className="text-sm font-bold"
                style={{ color: !prefs.useMetric ? ink : `${ink}28` }}
              >
                Imperial
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.useMetric}
                onClick={() => setPrefs({ ...prefs, useMetric: !prefs.useMetric })}
                className="relative inline-flex h-6 w-12 items-center transition-colors"
                style={{
                  border: `2px solid ${ink}`,
                  backgroundColor: prefs.useMetric ? ink : 'transparent'
                }}
              >
                <span
                  className="inline-block h-4 w-4 transition-transform"
                  style={{
                    backgroundColor: prefs.useMetric ? paper : ink,
                    transform: prefs.useMetric ? 'translateX(24px)' : 'translateX(4px)'
                  }}
                />
              </button>
              <span
                className="text-sm font-bold"
                style={{ color: prefs.useMetric ? ink : `${ink}28` }}
              >
                Metric
              </span>
            </div>
          </div>
        </section>

        {/* Surf Preferences */}
        <section className="mb-8">
          <h3
            className="text-xs font-black uppercase tracking-[0.2em] mb-4"
            style={{ color: `${ink}45` }}
          >
            Surf Preferences
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Min Wave Height ({prefs.useMetric ? 'm' : 'ft'})
              </label>
              <input
                type="number"
                min={0}
                max={prefs.useMetric ? 9 : 30}
                step={prefs.useMetric ? 0.1 : 0.5}
                value={prefs.useMetric ? +(prefs.minWaveHeight / 3.28084).toFixed(2) : prefs.minWaveHeight}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0
                  setPrefs({ ...prefs, minWaveHeight: prefs.useMetric ? +(v * 3.28084).toFixed(2) : v })
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Max Wave Height ({prefs.useMetric ? 'm' : 'ft'})
              </label>
              <input
                type="number"
                min={0}
                max={prefs.useMetric ? 9 : 30}
                step={prefs.useMetric ? 0.1 : 0.5}
                value={prefs.useMetric ? +(prefs.maxWaveHeight / 3.28084).toFixed(2) : prefs.maxWaveHeight}
                onChange={(e) => {
                  const v = parseFloat(e.target.value) || 0
                  setPrefs({ ...prefs, maxWaveHeight: prefs.useMetric ? +(v * 3.28084).toFixed(2) : v })
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div>
            {/* <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Min Wave Period (sec)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={1}
                value={prefs.minWavePeriod}
                onChange={(e) => setPrefs({ ...prefs, minWavePeriod: parseInt(e.target.value) || 0 })}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div> */}
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Max Onshore Wind ({prefs.useMetric ? 'km/h' : 'mph'})
              </label>
              <input
                type="number"
                min={0}
                max={prefs.useMetric ? 160 : 100}
                step={1}
                value={prefs.useMetric ? +((prefs.maxWindSpeedOnshore ?? 20) / 0.621371).toFixed(0) : (prefs.maxWindSpeedOnshore ?? 20)}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0
                  setPrefs({ ...prefs, maxWindSpeedOnshore: prefs.useMetric ? +(v * 0.621371).toFixed(2) : v })
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div>
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Max Offshore Wind ({prefs.useMetric ? 'km/h' : 'mph'})
              </label>
              <input
                type="number"
                min={0}
                max={prefs.useMetric ? 160 : 100}
                step={1}
                value={prefs.useMetric ? +((prefs.maxWindSpeedOffshore ?? 15) / 0.621371).toFixed(0) : (prefs.maxWindSpeedOffshore ?? 15)}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0
                  setPrefs({ ...prefs, maxWindSpeedOffshore: prefs.useMetric ? +(v * 0.621371).toFixed(2) : v })
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div>
            <div className="col-span-2">
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Min Wave Period (sec)
              </label>
              <input
                type="number"
                min={0}
                max={30}
                step={1}
                value={prefs.minWavePeriod}
                onChange={(e) => setPrefs({ ...prefs, minWavePeriod: parseInt(e.target.value) || 0 })}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div>
            {/* <div className="col-span-2">
              <label
                className="block text-xs font-bold uppercase tracking-wide mb-1"
                style={{ color: `${ink}45` }}
              >
                Max Onshore Wind ({prefs.useMetric ? 'km/h' : 'mph'})
              </label>
              <input
                type="number"
                min={0}
                max={prefs.useMetric ? 160 : 100}
                step={1}
                value={prefs.useMetric ? +((prefs.maxWindSpeedOnshore ?? 20) / 0.621371).toFixed(0) : (prefs.maxWindSpeedOnshore ?? 20)}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0
                  setPrefs({ ...prefs, maxWindSpeedOnshore: prefs.useMetric ? +(v * 0.621371).toFixed(2) : v })
                }}
                className={inputClass}
                style={inputStyle}
                onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
              />
            </div> */}
          </div>
        </section>

        {/* Saved Locations */}
        <section className="mb-8">
          <h3
            className="text-xs font-black uppercase tracking-[0.2em] mb-4"
            style={{ color: `${ink}45` }}
          >
            Saved Locations ({locs.length}/3)
          </h3>
          {locs.length === 0 && (
            <p className="text-sm mb-3" style={{ color: `${ink}38` }}>
              No locations saved yet. Click the map below to add one.
            </p>
          )}
          <div className="space-y-2 mb-4">
            {locs.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ border: `1px solid ${ink}22` }}
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 shrink-0" style={{ color: `${ink}40` }} />
                  <div>
                    <p className="font-bold flex items-center gap-1.5">
                      {loc.name}
                      {loc.isFavorite && (
                        <Star className="w-3.5 h-3.5" fill={ink} stroke={ink} />
                      )}
                    </p>
                    <p className="text-xs" style={{ color: `${ink}38` }}>
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} · Faces {loc.beachFacing}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setEditingLocation(loc)}
                    className="p-1.5 transition-opacity opacity-30 hover:opacity-100"
                    title="Edit location"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1.5 transition-opacity opacity-30 hover:opacity-100"
                    title="Delete location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {locs.length < 3 && (
            <div className="p-4" style={{ border: `1px solid ${ink}22` }}>
              <p className="text-sm mb-3" style={{ color: `${ink}40` }}>
                Click on the map to select a location, then fill in the details below.
              </p>
              <MapPicker
                onLocationSelect={(lat, lng) => {
                  setPendingLat(lat)
                  setPendingLng(lng)
                }}
                selectedLat={pendingLat}
                selectedLng={pendingLng}
              />
              {pendingLat != null && (
                <div className="mt-3 p-3" style={{ border: `1px solid ${ink}18` }}>
                  <p className="text-xs" style={{ color: `${ink}50` }}>
                    Selected: {pendingLat.toFixed(4)}, {pendingLng!.toFixed(4)}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="col-span-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wide mb-1"
                    style={{ color: `${ink}45` }}
                  >
                    Location Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. North Beach"
                    value={pendingName}
                    onChange={(e) => setPendingName(e.target.value)}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ ...inputStyle }}
                    onFocus={(e) => Object.assign((e.target as HTMLInputElement).style, inputFocusStyle)}
                    onBlur={(e) => Object.assign((e.target as HTMLInputElement).style, { borderColor: `${ink}28` })}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-bold uppercase tracking-wide mb-1"
                    style={{ color: `${ink}45` }}
                  >
                    Beach Faces
                  </label>
                  <select
                    value={pendingFacing}
                    onChange={(e) => setPendingFacing(e.target.value)}
                    className="w-full px-3 py-2 text-sm focus:outline-none"
                    style={{ ...inputStyle, backgroundColor: paper }}
                  >
                    {BEACH_FACING_OPTIONS.map((dir) => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPendingFavorite(!pendingFavorite)}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 text-xs font-black uppercase tracking-widest transition-colors"
                style={pendingFavorite
                  ? { border: `2px solid ${ink}`, backgroundColor: ink, color: paper }
                  : { border: `2px solid ${ink}28`, backgroundColor: 'transparent', color: ink }
                }
              >
                <Star className="w-3.5 h-3.5" fill={pendingFavorite ? paper : 'none'} stroke={pendingFavorite ? paper : ink} />
                {pendingFavorite ? 'Favorite Location' : 'Set as Favorite'}
              </button>
              <button
                onClick={handleAddLocation}
                disabled={!pendingLat || !pendingName.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 font-black uppercase tracking-widest px-4 py-2.5 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                style={{ border: `2px solid ${ink}`, color: ink, backgroundColor: 'transparent' }}
                onMouseEnter={(e) => {
                  if (!(e.currentTarget as HTMLButtonElement).disabled) {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = ink
                    ;(e.currentTarget as HTMLButtonElement).style.color = paper
                  }
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
                  ;(e.currentTarget as HTMLButtonElement).style.color = ink
                }}
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
          )}
        </section>

        {/* Save */}
        <button
          onClick={handleSaveAll}
          className="w-full font-black uppercase tracking-widest py-4 text-base transition-opacity hover:opacity-80"
          style={{ backgroundColor: ink, color: paper }}
        >
          Save & Close
        </button>
      </div>

      {editingLocation && (
        <EditLocationModal
          location={editingLocation}
          onSave={handleUpdateLocation}
          onCancel={() => setEditingLocation(null)}
          ink={ink}
          paper={paper}
        />
      )}
    </div>
  )
}
