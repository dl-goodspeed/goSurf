# goSurf

A full-screen desktop surf conditions dashboard for up to 3 saved locations. Runs on Windows, macOS, and Linux. Data is pulled from the free [Open-Meteo](https://open-meteo.com/) Marine and Forecast APIs — no account or API key required.

## Features

- **Live surf conditions** — wave height, wave period, wind speed & direction, water temperature, tide estimate
- **Smart wind evaluation** — separate acceptable speed thresholds for offshore vs. onshore wind, since offshore speed matters more for wave quality
- **Single-location full-screen display** — one spot fills the entire screen at a time; navigate between locations with left/right arrows or dot indicators
- **Slideshow mode** — automatically cycles through your saved locations every 20 seconds with a slide animation
- **Stoke verdict** — `PUMPING`, `DECENT`, or `POOR / BLOWN` badge based on whether your wave height, period, and wind preferences are all met
- **Condition indicators** — filled circle = meets your preference, empty circle = does not (Classic theme uses green/red)
- **Offshore wind check** — evaluates wind direction against the beach's facing to determine offshore vs. onshore
- **Tide estimate** — rising/falling state with `WavesArrowUp` / `WavesArrowDown` icons, time to next high/low, spring vs. neap indicator
- **Three themes:**
  - **Simple — Light** — e-ink inspired, warm paper white background with near-black ink
  - **Simple — Dark** — inverted e-ink, near-black background with warm off-white text
  - **Classic** — time-of-day gradient background (deep navy at night → orange at dawn/dusk → teal/cyan midday) with colored indicators and glassy overlays
- **Interactive map** — click anywhere on a Leaflet map to pin a location
- **Up to 3 locations** — add, name, and delete spots at any time
- **Auto-refresh** — conditions update every minute, and immediately when Settings is closed
- **Persistent settings** — all preferences and locations are saved locally and survive restarts

---

## For End Users (No Development Setup Required)

If someone has sent you a zip of goSurf, follow the instructions for your operating system below. You do not need Node.js or any other software installed.

### Windows

1. Extract the zip — you'll get a folder called `goSurf-win32-x64`.
2. Open the folder and double-click `goSurf.exe`.
3. If Windows shows a "Windows protected your PC" SmartScreen warning, click **More info** → **Run anyway**. This appears because the app is not commercially code-signed.

### macOS

1. Extract the zip — you'll get a folder called `goSurf-darwin-x64`.
2. Inside it, find `goSurf.app`.
3. **Do not double-click it yet.** Right-click (or Control-click) `goSurf.app` → **Open**.
4. A dialog will ask if you're sure — click **Open**. You only need to do this once.
5. After the first launch it will open normally like any other app.

> The one-time right-click step is required because the app is not signed with an Apple Developer certificate. macOS Gatekeeper blocks unsigned apps on a standard double-click but allows them through a manual right-click Open.

**If you see "goSurf is damaged and can't be opened"**, run this once in Terminal:
```bash
xattr -cr /path/to/goSurf-darwin-x64/goSurf.app
```
Then try right-click → Open again.

### Linux

1. Extract the zip — you'll get a folder called `goSurf-linux-x64`.
2. The executable is simply named `goSurf` inside that folder.
3. You may need to mark it as executable first:
   ```bash
   chmod +x goSurf
   ./goSurf
   ```
4. On some distributions you can also right-click the file in a file manager and choose **Run as Program**.

---

## Saving Your Data

Locations and preferences are saved automatically when you click **Save & Close** in Settings. They persist across restarts and are stored entirely on your local machine.

| OS | Storage location |
|---|---|
| Windows | `%AppData%\goSurf\Local Storage\` |
| macOS | `~/Library/Application Support/goSurf/Local Storage/` |
| Linux | `~/.config/goSurf/Local Storage/` |

---

## For Developers

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- npm (comes with Node.js)
- Windows Developer Mode enabled if cross-compiling for macOS (`Settings → System → For developers → Developer Mode`)

### Installation

```bash
cd goSurf
npm install
```

### Running in Development

```bash
npm run dev
```

### Building

```bash
npm run build
```

### Packaging & Zipping

Each `zip:*` command builds, packages, and produces a ready-to-share zip in `release/`.

| Command | Output zip |
|---|---|
| `npm run zip:win` | `release/goSurf-win-x64.zip` |
| `npm run zip:mac` | `release/goSurf-mac-x64.zip` |
| `npm run zip:linux` | `release/goSurf-linux-x64.zip` |
| `npm run zip:all` | All three |

Unpacked output only (no zip):

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

> **Why `@electron/packager` and not `electron-builder`?** `electron-builder` downloads a code-signing toolkit that contains macOS symlinks. Windows blocks symlink creation without Developer Mode, causing the build to fail. `@electron/packager` avoids this entirely.

---

## Using the App

### First Launch

1. Open Settings (gear icon, top-right).
2. Configure your surf preferences (see below).
3. Add at least one location using the map.
4. Click **Save & Close** — conditions load immediately.

### Settings

| Setting | Description |
|---|---|
| **Theme** | `Simple — Light`, `Simple — Dark`, or `Classic` (time-of-day gradient) |
| **Slideshow** | Auto-advances locations every 20 seconds when enabled |
| **Measurement System** | Imperial (ft, mph) or Metric (m, km/h) |
| **Min Wave Height** | Minimum acceptable wave height |
| **Max Wave Height** | Maximum acceptable wave height |
| **Min Wave Period** | Minimum acceptable wave period (seconds) |
| **Max Offshore Wind** | Speed threshold applied when wind is blowing offshore |
| **Max Onshore Wind** | Speed threshold applied when wind is blowing onshore |

### Adding a Location

1. Click anywhere on the map to drop a pin.
2. Enter a name (e.g. "North Beach").
3. Select the direction the beach faces — used to determine whether wind is offshore or onshore.
4. Click **Add Location**. Repeat for up to 3 spots.

### Navigating Locations

- **Left / Right arrows** on the screen edges — step through locations one at a time
- **Dot indicators** at the bottom — jump directly to any saved location
- **Slideshow** (toggle in Settings) — auto-advances every 20 seconds; manual navigation resets the timer

### Reading the Display

Each location screen shows:

| Row | What it tells you |
|---|---|
| **Stoke badge** | `PUMPING` (all criteria met) · `DECENT` (two of three) · `POOR / BLOWN` (one or none) |
| **Wave Height** | Current swell height with pass/fail indicator |
| **Wave Period** | Swell period in seconds and compass direction with pass/fail indicator |
| **Wind** | Speed, compass direction, and Offshore/Onshore label; indicator checks speed against the appropriate threshold for the current wind direction |
| **Tide** | Current state (Rising/Falling/High/Low), time to next extreme, Spring tide note if applicable |
| **Water Temp** | Sea surface temperature |

The **pass/fail indicator** next to each metric is a filled circle (meets preference) or empty circle (does not). In Classic theme it is green (pass) or red (fail).

To quit the app, open Settings and click the **Quit** button (top-right of the panel).

---

## Project Structure

```
goSurf/
├── src/
│   ├── main/
│   │   └── index.ts                    # Electron main process (full-screen window)
│   ├── preload/
│   │   └── index.ts                    # Context bridge preload script
│   └── renderer/
│       ├── index.html
│       └── src/
│           ├── App.tsx                 # Root component, navigation, slideshow, auto-refresh
│           ├── index.css               # Tailwind + slide animation keyframes
│           ├── main.tsx                # React entry point
│           ├── components/
│           │   ├── LocationCard.tsx    # Full-screen location display with theme support
│           │   ├── MapPicker.tsx       # react-leaflet map for coordinate selection
│           │   └── SettingsModal.tsx   # Preferences, theme picker, location management
│           ├── hooks/
│           │   ├── useLocalStorage.ts  # Typed localStorage hook
│           │   └── useTimeTheme.ts     # Time-of-day gradient hook (used by Classic theme)
│           ├── services/
│           │   ├── openMeteo.ts        # API fetching + stoke evaluation logic
│           │   └── tideCalculator.ts   # Lunar M2 tide estimate (no API required)
│           └── types/
│               └── index.ts            # Shared TypeScript types (AppTheme, SurfPreferences, etc.)
├── electron.vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── tsconfig.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop framework | Electron 31 |
| Build tooling | electron-vite |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS |
| Icons | lucide-react 1.8.0 |
| Map | react-leaflet + OpenStreetMap |
| Data | Open-Meteo Marine & Forecast APIs |
| Tide estimate | Lunar M2 harmonic calculation (local, no API) |
| Storage | LocalStorage (persisted to disk by Electron) |
| Packaging | @electron/packager |
