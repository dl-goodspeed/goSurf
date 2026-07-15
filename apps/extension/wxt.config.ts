import { resolve } from 'node:path'
import { defineConfig } from 'wxt'

export default defineConfig({
  modules: ['@wxt-dev/module-react', '@wxt-dev/auto-icons'],
  manifest: ({ browser }) => ({
    name: 'goSurf',
    description: 'Real-time personalized surf conditions, right in your browser toolbar.',
    permissions: ['storage', 'alarms'],
    host_permissions: [
      'https://marine-api.open-meteo.com/*',
      'https://api.open-meteo.com/*'
    ],
    ...(browser === 'firefox'
      ? {
          browser_specific_settings: {
            gecko: {
              // Permanent add-on ID required by AMO for Manifest V3.
              // Must never change once the extension is first submitted.
              id: 'gosurf@dlgoodspeed.dev',
              strict_min_version: '140.0',
              data_collection_permissions: {
                required: ['none']
              }
            },
            gecko_android: {
              // data_collection_permissions requires 142+ on Android
              strict_min_version: '142.0'
            }
          }
        }
      : {})
  }),
  zip: {
    name: 'gosurf',
    // AMO requires reviewable sources; zip from the monorepo root so
    // packages/core (a workspace dependency) is included.
    sourcesRoot: resolve(__dirname, '../..'),
    excludeSources: [
      'apps/desktop/**',
      'out/**',
      'release/**',
      'resources/**',
      '.claude/**',
      '**/.output/**',
      '**/.wxt/**',
      '**/*.zip'
    ]
  }
})
