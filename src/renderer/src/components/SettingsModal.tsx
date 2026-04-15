import { useState } from 'react'
import { X, MapPin, Trash2, Plus, Power } from 'lucide-react'
import { Location, SurfPreferences, BEACH_FACING_OPTIONS } from '../types'
import MapPicker from './MapPicker'

interface SettingsModalProps {
  preferences: SurfPreferences
  locations: Location[]
  onSavePreferences: (prefs: SurfPreferences) => void
  onSaveLocations: (locs: Location[]) => void
  onClose: () => void
}

export default function SettingsModal({
  preferences,
  locations,
  onSavePreferences,
  onSaveLocations,
  onClose
}: SettingsModalProps) {
  const [prefs, setPrefs] = useState<SurfPreferences>(preferences)
  const [locs, setLocs] = useState<Location[]>(locations)

  // New location form state
  const [pendingLat, setPendingLat] = useState<number | null>(null)
  const [pendingLng, setPendingLng] = useState<number | null>(null)
  const [pendingName, setPendingName] = useState('')
  const [pendingFacing, setPendingFacing] = useState<string>('W')

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
      beachFacing: pendingFacing
    }
    setLocs([...locs, newLoc])
    setPendingLat(null)
    setPendingLng(null)
    setPendingName('')
    setPendingFacing('W')
  }

  const handleDeleteLocation = (id: string) => {
    setLocs(locs.filter((l) => l.id !== id))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.close()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-red-400 hover:text-white hover:bg-red-600 border border-red-600/40 hover:border-red-600 transition-all text-sm font-medium"
              title="Quit goSurf"
            >
              <Power className="w-4 h-4" />
              Quit
            </button>
            <button
              onClick={handleSaveAll}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Save & close settings"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Units Toggle */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Units</h3>
          <div className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-xl px-4 py-3">
            <span className="text-sm text-white">Measurement System</span>
            <div className="flex items-center gap-3">
              <span className={`text-sm ${!prefs.useMetric ? 'text-white font-semibold' : 'text-slate-500'}`}>Imperial</span>
              <button
                type="button"
                role="switch"
                aria-checked={prefs.useMetric}
                onClick={() => setPrefs({ ...prefs, useMetric: !prefs.useMetric })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  prefs.useMetric ? 'bg-cyan-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    prefs.useMetric ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`text-sm ${prefs.useMetric ? 'text-white font-semibold' : 'text-slate-500'}`}>Metric</span>
            </div>
          </div>
        </section>

        {/* Surf Preferences */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">Surf Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">
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
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
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
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Min Wave Period (sec)</label>
              <input
                type="number"
                min={0}
                max={30}
                step={1}
                value={prefs.minWavePeriod}
                onChange={(e) => setPrefs({ ...prefs, minWavePeriod: parseInt(e.target.value) || 0 })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">
                Max Wind Speed ({prefs.useMetric ? 'km/h' : 'mph'})
              </label>
              <input
                type="number"
                min={0}
                max={prefs.useMetric ? 160 : 100}
                step={1}
                value={prefs.useMetric ? +(prefs.maxWindSpeed / 0.621371).toFixed(0) : prefs.maxWindSpeed}
                onChange={(e) => {
                  const v = parseInt(e.target.value) || 0
                  setPrefs({ ...prefs, maxWindSpeed: prefs.useMetric ? +(v * 0.621371).toFixed(2) : v })
                }}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        </section>

        {/* Saved Locations */}
        <section className="mb-8">
          <h3 className="text-lg font-semibold text-cyan-400 mb-4">
            Saved Locations ({locs.length}/3)
          </h3>
          {locs.length === 0 && (
            <p className="text-slate-500 text-sm mb-3">No locations saved yet. Click the map below to add one.</p>
          )}
          <div className="space-y-2 mb-4">
            {locs.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <div>
                    <p className="text-white font-medium">{loc.name}</p>
                    <p className="text-slate-400 text-xs">
                      {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)} · Facing {loc.beachFacing}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteLocation(loc.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add new location */}
          {locs.length < 3 && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
              <p className="text-sm text-slate-400 mb-3">
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
                <div className="mt-3 p-3 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-cyan-400 mb-2">
                    Selected: {pendingLat.toFixed(4)}, {pendingLng!.toFixed(4)}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-3 gap-3 mt-3">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-1">Location Name</label>
                  <input
                    type="text"
                    placeholder="e.g. North Beach"
                    value={pendingName}
                    onChange={(e) => setPendingName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Beach Faces</label>
                  <select
                    value={pendingFacing}
                    onChange={(e) => setPendingFacing(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    {BEACH_FACING_OPTIONS.map((dir) => (
                      <option key={dir} value={dir}>{dir}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleAddLocation}
                disabled={!pendingLat || !pendingName.trim()}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold rounded-lg px-4 py-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Location
              </button>
            </div>
          )}
        </section>

        {/* Save Button */}
        <button
          onClick={handleSaveAll}
          className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl py-3 transition-colors text-lg"
        >
          Save & Close
        </button>
      </div>
    </div>
  )
}
