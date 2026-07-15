import { storage } from '@wxt-dev/storage'
import { Location, SurfPreferences, DEFAULT_PREFERENCES } from '@gosurf/core/types'

export const preferencesItem = storage.defineItem<SurfPreferences>('local:preferences', {
  fallback: DEFAULT_PREFERENCES
})

export const locationsItem = storage.defineItem<Location[]>('local:locations', {
  fallback: []
})
