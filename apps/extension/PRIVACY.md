# goSurf Privacy Policy

**Effective date:** July 14, 2026

goSurf is a browser extension that shows surf conditions for locations you choose. It is built to collect nothing about you.

## What we collect

**Nothing.** goSurf does not collect, store remotely, transmit, share, or sell any personal information. It contains no analytics, no advertising, no crash reporting, and no user accounts.

## What stays on your device

Your settings — the surf spots you add (name, map coordinates, beach facing, favorite flag), your condition thresholds, unit preference, and theme — are stored locally in your browser's extension storage (`browser.storage.local`). They never leave your device, are not synced to any server operated by us, and are deleted by your browser when you uninstall the extension.

## Network requests the extension makes

goSurf talks to exactly two third-party services, and only for the extension to function:

1. **Open-Meteo weather API** (`marine-api.open-meteo.com` and `api.open-meteo.com`). To display conditions, the extension requests forecasts for the latitude/longitude of each surf spot **you** added. These coordinates are map points you picked — goSurf never asks for or uses your device's location, and requests carry no account identifiers. Like any web request, your IP address is visible to the service. Open-Meteo's privacy terms: https://open-meteo.com/en/terms

2. **CARTO basemap tiles** (`basemaps.cartocdn.com`), map data © OpenStreetMap contributors. Only while you have the location-picker map open in Settings, your browser loads map images for the area you are viewing, which necessarily reveals that map area and your IP address to the tile server — the same as viewing any online map. CARTO's privacy notice: https://carto.com/privacy

No other network connections are made.

## Permissions goSurf uses

- **storage** — to save your spots and preferences on your device.
- **alarms** — to periodically refresh the toolbar badge color for your favorite spot.
- **Access to open-meteo.com domains** — to fetch the weather and marine forecasts described above.

## Children

goSurf does not knowingly collect information from anyone, including children.

## Changes to this policy

If a future version of goSurf changes any of the above (for example, adds a new data source), this policy will be updated and the change will be noted in the extension's release notes before it ships.

## Contact

Questions about this policy: **dlgoodspeed@gmail.com**
