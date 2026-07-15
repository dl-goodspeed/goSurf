import { defineBackground } from '#imports'
import { setupBadgeUpdates } from '../badge'

export default defineBackground(() => {
  setupBadgeUpdates()
})
