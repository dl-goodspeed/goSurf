import { SettingsModal, DEFAULT_PREFERENCES, Location, SurfPreferences } from '@gosurf/core'
import { useStorageItem } from '../../hooks/useStorageItem'
import { preferencesItem, locationsItem } from '../../storage'

export default function OptionsApp() {
  const [preferences, setPreferences, prefsLoaded] = useStorageItem<SurfPreferences>(
    preferencesItem,
    DEFAULT_PREFERENCES
  )
  const [locations, setLocations, locsLoaded] = useStorageItem<Location[]>(locationsItem, [])

  if (!prefsLoaded || !locsLoaded) return null

  return (
    <SettingsModal
      preferences={preferences}
      locations={locations}
      onSavePreferences={setPreferences}
      onSaveLocations={setLocations}
      onClose={() => window.close()}
      theme={preferences.theme ?? 'simple-light'}
    />
  )
}
