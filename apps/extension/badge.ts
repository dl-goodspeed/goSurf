import { browser } from '#imports'
import { fetchSurfConditions, evaluateConditions } from '@gosurf/core/services/openMeteo'
import { STOKE_COLORS } from '@gosurf/core/types'
import { locationsItem, preferencesItem } from './storage'

const ALARM_NAME = 'gosurf-favorite-refresh'

async function updateBadge() {
  const [locations, preferences] = await Promise.all([
    locationsItem.getValue(),
    preferencesItem.getValue()
  ])

  const favorite = locations.find((l) => l.isFavorite)
  if (!favorite) {
    await browser.action.setBadgeText({ text: '' })
    return
  }

  const conditions = await fetchSurfConditions(favorite.lat, favorite.lng)
  const evaluation = evaluateConditions(conditions, preferences, favorite.beachFacing)
  const stoke = evaluation.overallStoke

  if (stoke === 'unknown') {
    await browser.action.setBadgeText({ text: '' })
    return
  }

  await browser.action.setBadgeBackgroundColor({ color: STOKE_COLORS[stoke] })
  await browser.action.setBadgeText({ text: ' ' })
}

export function setupBadgeUpdates() {
  browser.runtime.onInstalled.addListener(() => {
    browser.alarms.create(ALARM_NAME, { periodInMinutes: 1 })
    updateBadge()
  })

  browser.runtime.onStartup.addListener(() => {
    updateBadge()
  })

  browser.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) updateBadge()
  })

  locationsItem.watch(() => updateBadge())
  preferencesItem.watch(() => updateBadge())
}
