import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix default icon paths broken by bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
})

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void
  selectedLat?: number | null
  selectedLng?: number | null
}

function ClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng)
    }
  })
  return null
}

export default function MapPicker({ onLocationSelect, selectedLat, selectedLng }: MapPickerProps) {
  useEffect(() => {
    // Force leaflet CSS to load
  }, [])

  // MapContainer only applies center/zoom on initial mount (react-leaflet doesn't
  // re-center on prop changes), so this only affects maps that already have a
  // location when they first render — e.g. the edit modal for an existing spot.
  const initialCenter: [number, number] =
    selectedLat != null && selectedLng != null ? [selectedLat, selectedLng] : [20, -157]
  const initialZoom = selectedLat != null && selectedLng != null ? 12 : 3

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-slate-600">
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full"
        style={{ background: '#1e293b' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={19}
        />
        <ClickHandler onLocationSelect={onLocationSelect} />
        {selectedLat != null && selectedLng != null && (
          <Marker position={[selectedLat, selectedLng]}>
            <Popup>Selected location</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  )
}
