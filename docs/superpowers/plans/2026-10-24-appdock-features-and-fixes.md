# AppDock Multi-Feature & Bugfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement 8 user-requested enhancements: Windows media auto-detection in Music player, real weather with up to 5 configurable cities, country calendar with searchable holiday selector, group deletion confirmation modal, accurate icon resolution for shortcuts and drag-drop, A/L/M/S density buttons, auto-close on background click, and 5 distinct themes.

**Architecture:**
- **Execution / Electron Layer**: Fast PowerShell Windows GSMTC querying for media session/artwork + robust shortcut (.lnk/.url) target resolution before icon extraction + blur auto-collapse.
- **Persistence Layer**: Extend `DockSettings` schema with weather cities, active city, calendar country, and 5 theme types.
- **UI / Presentation Layer**: Live media sync in Music module, Open-Meteo API in Weather module, Public Holiday service in Calendar module, confirmation modal in GroupSidebar, and 5-theme switcher in Settings.

**Tech Stack:** Electron 32, React 19, TypeScript 5.7, Windows GSMTC (WinRT), Open-Meteo API, Nager.Date API, Vanilla CSS tokens.

---

### Task 1: Accurate Icon Extraction & Shortcut Target Resolution (Requirement 5)
- [ ] In `electron/main.cjs`:
  - Enhance `extractNativeIcon(filePath)` to resolve `.lnk` via `shell.readShortcutLink(filePath)` to the true `.exe` target.
  - Parse `.url` files for `IconFile` or URL.
  - Fix desktop directory detection using `app.getPath('desktop')` (handles OneDrive Desktop properly) plus public and user start menu dirs.
  - Use `app.getFileIcon(resolvedTarget, { size: 'large' })` with PowerShell `[System.Drawing.Icon]::ExtractAssociatedIcon` fallback.
- [ ] In `electron/main.cjs` `app:scan-system`: resolve shortcut targets before extracting icons so icons are never blank.

### Task 2: Windows Media Auto-Detection in Music Module (Requirement 1)
- [ ] Create `electron/media-helper.ps1` to query `Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager`:
  - Extracts title, artist, albumTitle, playback status ("Playing"/"Paused"), and base64 album artwork thumbnail.
  - Supports playback control actions (`Toggle`, `Next`, `Previous`).
- [ ] In `electron/main.cjs`:
  - Add IPC handlers `media:get-state` and `media:control`.
- [ ] In `electron/preload.cjs`:
  - Expose `getMediaState()` and `controlMedia(action)` to renderer.
- [ ] In `src/components/modules/MusicModule.tsx`:
  - Poll media state when module is open.
  - If Windows media is playing, display real track title, artist, and embed album thumbnail inside top disc and card mini-disc.
  - Spin disc only when `status === 'Playing'`.
  - Connect media controls to Windows GSMTC.

### Task 3: Real Weather Data & Up to 5 Configurable Cities (Requirement 2)
- [ ] In `src/types/dock.ts`:
  - Add `weatherCities: string[]` and `activeWeatherCity: string` to `DockSettings`.
- [ ] In `src/utils/storage.ts`:
  - Update `DEFAULT_SETTINGS` with `weatherCities: ['London', 'New York', 'Tokyo']` and `activeWeatherCity: 'London'`.
- [ ] In `src/components/modules/WeatherModule.tsx`:
  - Fetch real weather from Open-Meteo (Geocoding API + Forecast API).
  - Map WMO weather codes to temperature, condition, icons, humidity, wind.
  - Provide a city switcher pill/tab bar on the weather card to switch between saved cities.
- [ ] In `src/components/SettingsView.tsx`:
  - Add Weather section with text input and "Add City" button (enforce max 5 cities).
  - Display saved cities list with remove (X) buttons.

### Task 4: Country-Specific Holidays & Festivals Calendar (Requirement 3)
- [ ] In `src/types/dock.ts`:
  - Add `calendarCountry: string` to `DockSettings` (defaults to `'US'`).
- [ ] Create `src/utils/holidays.ts`:
  - Searchable list of countries (name + ISO code).
  - Public holiday fetcher with caching and offline fallback for key holidays.
- [ ] In `src/components/SettingsView.tsx`:
  - Add Calendar Country selector with search filter dropdown.
- [ ] In `src/components/modules/CalendarModule.tsx`:
  - Highlight holiday dates on calendar grid.
  - Display holiday/festival name when date is selected and in footer event entry.

### Task 5: Group Deletion Warning Confirmation (Requirement 4)
- [ ] In `src/components/GroupSidebar.tsx`:
  - Instead of immediate deletion, prompt with a confirmation warning modal:
    "Delete '{group.name}'? This group contains {count} apps. This action cannot be undone."
  - Provide [Cancel] and [Delete Group] buttons.

### Task 6: Density Buttons to A, L, M, S & Remove Extra Indicator (Requirement 6)
- [ ] In `src/components/AppGrid.tsx`:
  - Update density button labels to `'A'`, `'L'`, `'M'`, `'S'`.
  - Remove the auto indicator badge (`<Sparkles /> Big icons`) beside the app count.

### Task 7: Auto-Close on Click Outside & Background Priority (Requirement 7)
- [ ] In `src/utils/storage.ts`:
  - Set `DEFAULT_SETTINGS.closeOnBlur = true`.
- [ ] In `electron/main.cjs`:
  - Ensure window blur reliably dispatches `dock:blur` and collapses dock to give immediate priority to desktop/background apps.
- [ ] In `src/App.tsx`:
  - Ensure blur event handler calls `handleToggle(false)`.

### Task 8: 5 Distinct Themes in Settings (Requirement 8)
- [ ] In `src/types/dock.ts`:
  - Update `theme: 'dark' | 'light' | 'cyberpunk' | 'midnight' | 'emerald'`.
- [ ] In `src/index.css`:
  - Define CSS tokens for all 5 themes with rich aesthetics (backgrounds, surfaces, borders, shadows, text, accents).
- [ ] In `src/components/SettingsView.tsx`:
  - Replace 2-button selector with a 5-theme grid featuring color swatch previews, labels, and active selection state.

### Task 9: Verification & Integration Testing
- [ ] Run `npm test` to verify all test suites pass.
- [ ] Run `npm run build` to ensure TypeScript compilation and Vite bundle pass with 0 errors.
- [ ] Verify runtime behavior in Electron.
