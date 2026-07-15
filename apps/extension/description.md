# goSurf — Store Submission Kit

Everything needed to submit goSurf v1.0.0 to the Chrome Web Store, Microsoft Edge Add-ons, and Firefox Add-ons (AMO). Copy each section into the matching field in the store dashboard.

**Packages (in `apps/extension/.output/`):**

| Store | Upload file |
|---|---|
| Chrome Web Store | `gosurf-1.0.0-chrome.zip` |
| Edge Add-ons | `gosurf-1.0.0-chrome.zip` (same package; Edge accepts Chrome MV3 zips) |
| Firefox Add-ons (AMO) | `gosurf-1.0.0-firefox.zip` + `gosurf-1.0.0-sources.zip` (source code upload, required because the code is bundled) |

---

## Store listing

**Name:** goSurf

**Short description / summary** (fits the 132-char Chrome limit):

> Real-time personalized surf conditions, right in your browser toolbar.

**Detailed description:**

> Know at a glance whether it's worth paddling out.
>
> goSurf puts live surf conditions for your favorite spots one click away in your browser toolbar — no accounts, no ads, no tracking.
>
> **Features**
> - Track up to 3 surf spots, picked by clicking anywhere on a world map
> - Live wave height, wave period and direction, wind speed and direction, and water temperature from the free Open-Meteo marine and weather APIs
> - Estimated tide trend with a countdown to the next high or low
> - Set your personal thresholds (wave height range, minimum period, max wind for onshore vs. offshore) and each spot is rated Pumping / Decent / Poor against *your* standards
> - Mark a favorite spot and the toolbar badge changes color with its current rating — green means go surf
> - Imperial or metric units, four visual themes
>
> **Private by design**
> All settings stay on your device. The extension only talks to the Open-Meteo weather API (to fetch conditions for the spots you chose) and loads map images while you're picking a spot. Nothing about you is collected, stored remotely, or sold. No account needed.

**Suggested category:** Chrome: News & Weather (alt: Tools) · Edge: News and weather · AMO: Alerts & Updates (alt: Other)

**Language:** English

**Privacy policy:** host `PRIVACY.md` (same folder) at a public URL — e.g. in the GitHub repo or GitHub Pages — and paste that URL into each store's privacy-policy field.

---

## Single purpose statement (Chrome Web Store requirement)

> goSurf has a single purpose: showing current surf conditions for the user's chosen surf spots. The popup lists live wave, wind, tide and water-temperature readings for up to three user-selected locations, and the toolbar badge color summarizes conditions at the user's favorite spot.

---

## Permission justifications

Paste these into the "Permission justification" fields (Chrome/Edge) or reviewer notes (AMO).

**`storage`**
> Saves the user's surf spots, preference thresholds, units, and theme locally via browser.storage.local so they persist between browser sessions. This data never leaves the device.

**`alarms`**
> A periodic alarm re-fetches conditions for the user's favorite spot and updates the toolbar badge color so it stays current while the popup is closed. Manifest V3 service workers are suspended between events, so chrome.alarms is the supported way to schedule this refresh.

**Host permission `https://marine-api.open-meteo.com/*`**
> Core data source. Fetches marine forecasts (wave height, wave period, wave direction, sea-surface temperature) for the user's chosen surf-spot coordinates from the free, keyless Open-Meteo Marine API. Requests contain only the spot's latitude/longitude — no user identifiers.

**Host permission `https://api.open-meteo.com/*`**
> Fetches the wind speed and direction forecast for the same user-chosen coordinates from the Open-Meteo Forecast API (wind data is not available from the marine endpoint). Requests contain only the spot's latitude/longitude — no user identifiers.

**Remote code declaration (Chrome/Edge: "Are you using remote code?")**
> No. All JavaScript is bundled into the extension package at build time (WXT/Vite). The extension never downloads, evaluates, or injects remote code, and it contains no content scripts. The only remote resources are data (JSON weather responses from Open-Meteo) and images (CARTO basemap tiles shown in the settings map while the user picks a spot).

**Data usage disclosures (Chrome "Privacy practices" tab / Edge certification notes)**
> Declare that the extension does **not** collect or transmit any of the listed user-data categories. It has no analytics, no accounts, and stores settings only on-device. Coordinates sent to the weather API are of user-selected surf spots (map points), not the user's location — the extension never requests geolocation.

---

## Firefox (AMO) specifics

- **Add-on ID:** `gosurf@dlgoodspeed.dev` (set in `browser_specific_settings.gecko.id`; required for MV3). This ID is permanent — never change it after first submission.
- **Data collection:** the manifest declares `data_collection_permissions.required: ["none"]`, matching AMO's required data-collection disclosure: no data is collected or transmitted.
- **Minimum versions:** Firefox 140 (desktop), 142 (Android).
- **Source code upload:** required because the package is bundled/minified. Upload `gosurf-1.0.0-sources.zip` when asked for source code.

**Build instructions for reviewers (paste into "Notes to Reviewer"):**

> This extension is built with WXT (wxt.dev) + Vite + React from an npm-workspaces monorepo. To reproduce the exact package from the submitted sources:
>
> 1. Requirements: Node.js 24.x (built with v24.14.1) and npm 11.x, any OS.
> 2. Unzip the sources, then from the repo root run: `npm install`
> 3. `cd apps/extension`
> 4. `npm run zip:firefox` — output is written to `apps/extension/.output/firefox-mv3/` and `apps/extension/.output/gosurf-1.0.0-firefox.zip`
>
> The shared UI/logic lives in `packages/core` (a workspace dependency); the extension entrypoints are in `apps/extension/entrypoints`.

**Pre-written answer for the addons-linter `UNSAFE_VAR_ASSIGNMENT` warnings (9 hits in `chunks/src-*.js`):**

> These warnings come from the unmodified Leaflet 1.9.4 library (bundled dependency), which is used to render the location-picker map in the settings page. Leaflet uses innerHTML internally for map controls, the attribution line, and marker popups. Every string involved is a static literal shipped inside the extension (e.g. the OpenStreetMap/CARTO attribution text and the "Selected location" popup); no remote or user-supplied HTML is ever assigned. The extension itself contains no innerHTML usage.

---

## Assets checklist (needed before the listings go live)

- [x] Extension icons 16/32/48/128 px, square — generated into the packages
- [ ] Store icon: use `.output/chrome-mv3/icons/128.png` (Chrome/Edge require 128×128; AMO accepts 128×128)
- [ ] Screenshots: at least one; Chrome/Edge want 1280×800 (or 640×400), AMO accepts up to 2400×1800. Suggested shots: popup with 2–3 spots showing ratings, settings with the map picker, badge colors in the toolbar.
- [ ] (Optional, Chrome) Small promo tile 440×280
- [ ] Privacy policy hosted at a public URL (see `PRIVACY.md`)
- [ ] ⚠️ **Icon artwork provenance:** confirm you hold rights to the toolbar icon artwork — the source image contains faint stock-watermark-like traces, and stores reject listings over unlicensed artwork. Replace it if unsure.

## Submission notes per store

- **Chrome Web Store:** one-time $5 developer registration. New-publisher review typically takes a few days; host-permission extensions can take longer. All justification fields above are mandatory.
- **Edge Add-ons:** free registration via Partner Center. Upload the same Chrome zip. Fill the same justifications in the certification notes field.
- **AMO:** free. Upload the Firefox zip, then the sources zip when prompted, and paste the reviewer notes. Automated validation passes with 0 errors (verified with addons-linter; the 9 Leaflet warnings are explained above).
