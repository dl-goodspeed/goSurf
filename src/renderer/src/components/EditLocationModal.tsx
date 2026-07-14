import { useState } from 'react'
import { X } from 'lucide-react'
import { Location, BEACH_FACING_OPTIONS } from '../types'
import MapPicker from './MapPicker'

interface EditLocationModalProps {
  location: Location
  onSave: (updated: Location) => void
  onCancel: () => void
  ink: string
  paper: string
}

export default function EditLocationModal({ location, onSave, onCancel, ink, paper }: EditLocationModalProps) {
  const [name, setName] = useState(location.name)
  const [lat, setLat] = useState(location.lat)
  const [lng, setLng] = useState(location.lng)
  const [facing, setFacing] = useState(location.beachFacing)

  const commitAndClose = () => {
    onSave({
      ...location,
      name: name.trim() || location.name,
      lat,
      lng,
      beachFacing: facing
    })
  }

  const inputClass = 'w-full px-3 py-2 text-sm font-semibold focus:outline-none'
  const inputStyle = {
    backgroundColor: 'transparent',
    border: `2px solid ${ink}28`,
    color: ink
  }
  const inputFocusStyle = { borderColor: ink }

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: `${ink}55` }}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6"
        style={{ backgroundColor: paper, border: `2px solid ${ink}`, color: ink }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between mb-6 pb-4"
          style={{ borderBottom: `2px solid ${ink}` }}
        >
          <h3 className="text-xl font-black tracking-tight uppercase">Edit Location</h3>
          <button
            onClick={commitAndClose}
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
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm mb-3" style={{ color: `${ink}40` }}>
          Click on the map to change this spot's coordinates.
        </p>
        <MapPicker
          onLocationSelect={(newLat, newLng) => {
            setLat(newLat)
            setLng(newLng)
          }}
          selectedLat={lat}
          selectedLng={lng}
        />
        <div className="mt-3 p-3" style={{ border: `1px solid ${ink}18` }}>
          <p className="text-xs" style={{ color: `${ink}50` }}>
            Selected: {lat.toFixed(4)}, {lng.toFixed(4)}
          </p>
        </div>

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
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              Beach Faces
            </label>
            <select
              value={facing}
              onChange={(e) => setFacing(e.target.value)}
              className={inputClass}
              style={{ ...inputStyle, backgroundColor: paper }}
            >
              {BEACH_FACING_OPTIONS.map((dir) => (
                <option key={dir} value={dir}>{dir}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCancel}
            className="py-2.5 font-black uppercase tracking-widest text-sm transition-colors"
            style={{ border: `2px solid ${ink}30`, color: ink, backgroundColor: 'transparent' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = `${ink}12` }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent' }}
          >
            Cancel
          </button>
          <button
            onClick={commitAndClose}
            disabled={!name.trim()}
            className="py-2.5 font-black uppercase tracking-widest text-sm transition-opacity hover:opacity-80 disabled:opacity-25 disabled:cursor-not-allowed"
            style={{ backgroundColor: ink, color: paper }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
