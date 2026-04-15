# goSurf

A full-screen desktop app that shows real-time surf conditions for up to 3 saved locations. Runs on Windows, macOS, and Linux. Data is pulled from the free [Open-Meteo](https://open-meteo.com/) Marine and Forecast APIs — no account or API key required.

## Features

- **Live surf conditions** — wave height, wave period, wind speed & direction, water temperature, tide estimate
- **Stoke indicators** — green/red LED next to each metric shows whether it meets your preferences
- **Offshore wind check** — evaluates whether wind is offshore based on your beach's facing direction
- **Tide estimate** — rising/falling state, time to next high/low, spring vs. neap indicator
- **Time-of-day theme** — background gradient shifts from deep navy at night through orange at dawn/dusk to teal/cyan during the day
- **Interactive map** — click anywhere on the map to drop a pin and save a location
- **Up to 3 locations** — view all your spots side-by-side on one screen
- **Auto-refresh** — data updates every minute, and immediately when you close Settings
- **Persistent settings** — preferences and locations are saved locally and survive restarts

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
3. You may need to mark it as executable first. Open a terminal in the folder and run:
   ```bash
   chmod +x goSurf
   ./goSurf
   ```
4. On some distributions you can also right-click the file in a file manager and choose **Run as Program** or **Execute**.

---

## Saving Your Data

Your locations and preferences are saved automatically to your local app data folder the moment you click **Save & Close** in Settings. They persist across restarts. Each person's data is stored on their own machine and is completely independent.

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
- Windows Developer Mode enabled (required for macOS cross-compilation — `Settings → System → For developers → Developer Mode`)

### Installation

```bash
cd goSurf
npm install
```

### Running in Development

Starts the app with hot reload:

```bash
npm run dev
```

### Building

Compiles TypeScript and bundles the renderer into `out/`:

```bash
npm run build
```

### Packaging & Zipping

Each `zip:*` command builds the app, packages it for the target platform, and produces a ready-to-share zip in the `release/` folder.

| Command | Output zip | Notes |
|---|---|---|
| `npm run zip:win` | `release/goSurf-win-x64.zip` | |
| `npm run zip:mac` | `release/goSurf-mac-x64.zip` | Requires Developer Mode or admin terminal |
| `npm run zip:linux` | `release/goSurf-linux-x64.zip` | |
| `npm run zip:all` | All three | Builds once, packages all three platforms |

If you only want the unpacked output without zipping:

```bash
npm run dist:win
npm run dist:mac
npm run dist:linux
```

> **Why `@electron/packager` and not `electron-builder`?** `electron-builder` downloads a code-signing toolkit that contains macOS symlinks. Windows blocks symlink creation without Developer Mode, causing the build to fail. `@electron/packager` produces equivalent output without that requirement.

---

## Using the App

1. **Launch the app** — it opens full-screen automatically.
2. **Open Settings** — click the gear icon in the top-right corner.
3. **Set your preferences:**
   - Min/Max wave height (ft)
   - Min wave period (seconds)
   - Max wind speed (mph)
4. **Add a location:**
   - Click anywhere on the map to drop a pin
   - Enter a name (e.g. "North Beach")
   - Select the direction the beach faces (used to calculate offshore wind)
   - Click **Add Location**
   - Repeat for up to 3 spots
5. **Save & Close** — the dashboard loads and conditions refresh immediately.
6. **To quit** — open Settings and click the **Quit** button (power icon, top-right of the settings panel).

Each location card shows:
- Wave height and period with a compass direction
- Wind speed and direction
- Whether wind is offshore (Yes/No)
- Tide state (High/Rising/Low/Falling), time to next extreme, and Spring/Neap indicator
- Water temperature
- A color-coded **Stoke** badge: `Pumping`, `Decent`, or `Flat/Blown`

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
│           ├── App.tsx                 # Root component, state, auto-refresh logic
│           ├── index.css               # Tailwind + global styles
│           ├── main.tsx                # React entry point
│           ├── components/
│           │   ├── LocationCard.tsx    # Per-spot card with LED indicators
│           │   ├── MapPicker.tsx       # react-leaflet map for coordinate selection
│           │   └── SettingsModal.tsx   # Preferences + location management + quit
│           ├── hooks/
│           │   ├── useLocalStorage.ts  # Typed localStorage hook
│           │   └── useTimeTheme.ts     # Time-of-day gradient hook
│           ├── services/
│           │   ├── openMeteo.ts        # API fetching + stoke evaluation logic
│           │   └── tideCalculator.ts   # Lunar M2 tide estimate (no API required)
│           └── types/
│               └── index.ts            # Shared TypeScript types
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
| Icons | lucide-react |
| Map | react-leaflet + OpenStreetMap |
| Data | Open-Meteo Marine & Forecast APIs |
| Tide estimate | Lunar M2 harmonic calculation (local, no API) |
| Storage | LocalStorage (persisted to disk by Electron) |
| Packaging | @electron/packager |
