# Custom Theme Studio — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Custom Theme Studio" to AppDock Settings that lets users upload their own background images, set per-zone colors (header, base, sidebar, buttons), and toggle a set of display options — all persisted in localStorage.

**Architecture:** Three layers — (1) new fields in `DockSettings` + `storage.ts` defaults, (2) a new self-contained `CustomThemePanel.tsx` component embedded inside `SettingsView.tsx` beneath the Themes section, and (3) CSS variable injection into `:root` at runtime so the rest of the app consumes custom colors without any per-component changes.

**Tech Stack:** React 18, TypeScript, inline styles + CSS variables (already in `index.css`), `localStorage` via existing `saveDockData`, HTML `<input type="file">` for image upload converted to `base64` data URLs.

**Spec:** User request in conversation (2026-11-01).

## Global Constraints

- DO NOT create a GitHub release or run release scripts without explicit user permission.
- All new fields are optional and backward-compatible (spread-merged with `DEFAULT_SETTINGS` in `loadDockData`).
- No new npm dependencies — use what is already in the project.
- Follow the existing inline-style + CSS-variable pattern; no new CSS files.
- Maximum image stored in settings: convert to JPEG at ≤ 85% quality, cap at 1600×1600px before base64 to keep localStorage under limits.
- Companion area color variables (`--sidebar-bg`, etc.) live as CSS variables so `DockFrame.tsx`/`GroupSidebar.tsx` pick them up automatically.

## Review Focus

- **Very large background images** filling localStorage: image must be downscaled + JPEG-compressed before storage.
- **Custom theme selected but no background uploaded**: dock must still render cleanly (falls back to `--bg-dock` color).
- **Reset Defaults button**: must clear all `customTheme*` fields back to `undefined`/`null`.
- **Background rotation timer**: must be cleared when dock collapses or user switches away from custom theme to avoid memory leaks.
- **Module sidebar color** (weather/calendar/music cards): CSS variable must be applied at a scope that the companion modules actually read.

---

## Task 1: Data Model — New `CustomThemeSettings` fields in `DockSettings`

**Files:**
- Modify: `src/types/dock.ts`
- Modify: `src/utils/storage.ts`

**Interfaces:**
- Produces: `DockTheme` extended with `'custom'` literal; `DockSettings` extended with `CustomThemeSettings` fields listed below.

```ts
// New fields added to DockSettings (all optional):
customThemeBgImages?: string[];          // Up to 5 base64 JPEG data URLs
customThemeBgBlur?: boolean;             // Default false
customThemeBgHide?: boolean;             // Default false — makes bg black
customThemeBgRotation?: boolean;         // Default false
customThemeBgRotationSecs?: 20|30|40|50|60; // Default 30
customThemeHeaderColor?: string;         // CSS hex e.g. '#1a1a2e'
customThemeBaseColor?: string;           // Dock base bg color
customThemeSidebarColor?: string;        // Group sidebar bg
customThemeButtonColor?: string;         // Accent/button color
customThemeSidebarModuleColor?: string;  // Weather/Calendar/Music card bg
customThemeHideALMS?: boolean;           // Hides A,L,M,S ConnectorHub buttons
customThemeConnectorButton?: 'A'|'L'|'M'|'S'; // Last selected before hiding
customThemeHideAppCount?: boolean;       // Hides app count badge in sidebar
customThemeHideSidebar?: boolean;        // Hides entire companion sidebar
```

- [ ] **Step 1: Add `'custom'` to the `DockTheme` union in `src/types/dock.ts`**

  Append `| 'custom'` to the existing `DockTheme` type.

- [ ] **Step 2: Add all `customTheme*` optional fields to `DockSettings` interface in `src/types/dock.ts`**

  Use the exact field names and types from the Interfaces block above.

- [ ] **Step 3: `DEFAULT_SETTINGS` in `src/utils/storage.ts` — no changes needed** (all fields optional, `loadDockData` already spreads defaults). Just verify the compile succeeds.

- [ ] **Step 4: Verify TypeScript compiles**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
  Expected: zero errors.

- [ ] **Step 5: Commit**

  ```
  git add src/types/dock.ts
  git commit -m "feat(types): add custom theme fields to DockSettings"
  ```

---

## Task 2: CSS Variable Injection — `useCustomThemeVars` hook

**Files:**
- Create: `src/hooks/useCustomThemeVars.ts`

**Interfaces:**
- Consumes: `settings: DockSettings` (theme + all `customTheme*` color fields)
- Produces: a `useCustomThemeVars(settings)` React hook that writes/removes CSS custom properties on `document.documentElement` whenever settings change.

Variables to set when `settings.theme === 'custom'`:

| CSS Variable | Source field | Fallback |
|---|---|---|
| `--bg-header` | `customThemeHeaderColor` | `#111111` |
| `--bg-dock` | `customThemeBaseColor` | `#0d0d0d` |
| `--bg-footer` | `customThemeBaseColor` | `#0d0d0d` |
| `--bg-surface` | sidebar derived (lighten 8%) | `#1a1a1a` |
| `--sidebar-bg-custom` | `customThemeSidebarColor` | `#161616` |
| `--accent` | `customThemeButtonColor` | `#ffffff` |
| `--btn-border` | `customThemeButtonColor` at 40% opacity | |
| `--module-bg-custom` | `customThemeSidebarModuleColor` | `#1a1a1a` |

When theme is NOT `'custom'`, remove these overrides so built-in themes take over.

- [ ] **Step 1: Create `src/hooks/useCustomThemeVars.ts`**

  Export `useCustomThemeVars(settings: DockSettings): void`.
  Inside: a `useEffect` that loops over the variable map, calling `document.documentElement.style.setProperty(varName, value)` when theme is `'custom'`, and `removeProperty` otherwise.
  Dependency array: all referenced settings fields.

- [ ] **Step 2: Call the hook in `src/App.tsx`**

  Import `useCustomThemeVars` and call `useCustomThemeVars(data.settings)` near the top of the component body (after existing `useEffect` for theme data-attribute).

- [ ] **Step 3: Verify TypeScript compiles**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
  Expected: zero errors.

- [ ] **Step 4: Commit**

  ```
  git add src/hooks/useCustomThemeVars.ts src/App.tsx
  git commit -m "feat: CSS variable injection hook for custom theme"
  ```

---

## Task 3: Background Image Utility

**Files:**
- Create: `src/utils/imageUtils.ts`

**Interfaces:**
- Produces: `compressImageToBase64(file: File, maxSizePx?: number, quality?: number): Promise<string>`
  - Downscales to `maxSizePx` (default 1600) keeping aspect ratio, then encodes as JPEG at `quality` (default 0.82).
  - Returns a `data:image/jpeg;base64,...` string.

- [ ] **Step 1: Create `src/utils/imageUtils.ts`**

  Implementation outline:
  ```ts
  export async function compressImageToBase64(file, maxSizePx = 1600, quality = 0.82): Promise<string> {
    // 1. createObjectURL(file) → load into Image
    // 2. Draw onto canvas scaled to fit maxSizePx
    // 3. canvas.toDataURL('image/jpeg', quality)
    // 4. revokeObjectURL
  }
  ```

- [ ] **Step 2: TypeScript compile check**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```
  git add src/utils/imageUtils.ts
  git commit -m "feat: image compression utility for custom theme backgrounds"
  ```

---

## Task 4: `CustomThemePanel` Component

**Files:**
- Create: `src/components/CustomThemePanel.tsx`

**Interfaces:**
- Consumes: `settings: DockSettings`, `onUpdateSettings: (p: Partial<DockSettings>) => void`
- Produces: a rendered panel shown inside SettingsView when theme is `'custom'`; renders two sub-sections: **Appearance** and **Display Options**.

### Section A — Appearance (colors + backgrounds)

Render as a vertical stack of labeled rows:

| Row label | Control | Setting field |
|---|---|---|
| Background Images | Up to 5 thumbnail chips + `+` upload button (calls `compressImageToBase64`) | `customThemeBgImages` |
| Header Color | `<input type="color">` pill | `customThemeHeaderColor` |
| Base Color | `<input type="color">` pill | `customThemeBaseColor` |
| Sidebar Color | `<input type="color">` pill | `customThemeSidebarColor` |
| Button / Accent Color | `<input type="color">` pill | `customThemeButtonColor` |
| Module Sidebar Color | `<input type="color">` pill | `customThemeSidebarModuleColor` |

Each `<input type="color">` updates the setting on `onChange`.

Background image thumbnails show a small preview (40×40px); clicking one sets it as current; an `×` button removes it.

### Section B — Display Options (toggle list)

Render each row as: `[label]` — `[toggle switch]`

| Label | Field |
|---|---|
| Background Blur | `customThemeBgBlur` |
| Hide Background | `customThemeBgHide` |
| Hide Sidebar (Weather/Calendar/Music) | `customThemeHideSidebar` |
| Hide A/L/M/S Buttons | `customThemeHideALMS` |
| Hide App Count | `customThemeHideAppCount` |
| Background Rotation | `customThemeBgRotation` |

When **Background Rotation** is toggled ON, show a row of 5 time buttons: `20s`, `30s`, `40s`, `50s`, `60s` (updates `customThemeBgRotationSecs`).

When **Hide A/L/M/S Buttons** is toggled ON, first show a "Keep which button?" picker (`A`, `L`, `M`, `S`) that sets `customThemeConnectorButton`; only then save `customThemeHideALMS = true`.

Toggle switch is a small styled `<button>` (not a native checkbox) — follow existing `settings-opt-btn` class pattern. When ON: `background: var(--accent)`, when OFF: `background: var(--bg-surface)`.

- [ ] **Step 1: Create `src/components/CustomThemePanel.tsx`** with both Section A and B.

- [ ] **Step 2: TypeScript compile check**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
  Expected: zero errors.

- [ ] **Step 3: Commit**

  ```
  git add src/components/CustomThemePanel.tsx
  git commit -m "feat: CustomThemePanel component for appearance and display options"
  ```

---

## Task 5: Wire `CustomThemePanel` into `SettingsView.tsx`

**Files:**
- Modify: `src/components/SettingsView.tsx`

**Interfaces:**
- Consumes: `CustomThemePanel` (Task 4); existing `DEFAULT_THEMES` / `CUSTOM_THEMES` arrays.

Changes:
1. Add `'custom'` as a new third group under **Themes & Styles** — a single button labelled **"🎨 Custom Theme"** with `accentColor: '#a78bfa'`. Clicking it calls `handleThemeChange('custom')`.
2. When `currentTheme === 'custom'`, render `<CustomThemePanel settings={settings} onUpdateSettings={onUpdateSettings} />` directly below the theme picker grid (inside the same section `<div>`).
3. Add a **Reset Custom Theme** small text-link button inside the panel header that calls `onUpdateSettings({ customThemeBgImages: undefined, customThemeBgBlur: false, ... })` clearing all `customTheme*` fields.

- [ ] **Step 1: Add `'custom'` theme button to the Custom Themes group in `SettingsView.tsx`**

  It should have `id: 'custom'`, `name: 'My Theme'`, icon `Palette`, `accentColor: '#a78bfa'`.

- [ ] **Step 2: Render `<CustomThemePanel>` below the theme grid when `currentTheme === 'custom'`**

- [ ] **Step 3: TypeScript compile check**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npx tsc --noEmit`
  Expected: zero errors.

- [ ] **Step 4: Full build**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm run build`
  Expected: zero errors.

- [ ] **Step 5: Commit**

  ```
  git add src/components/SettingsView.tsx
  git commit -m "feat: wire CustomThemePanel into SettingsView"
  ```

---

## Task 6: Runtime Background Rotation + Display Option Effects

**Files:**
- Modify: `src/components/DockFrame.tsx`
- Modify: `src/components/GroupSidebar.tsx` (apply `--sidebar-bg-custom`)
- Modify: `src/components/DockFrame.tsx` (header color, blur overlay, hide sidebar)

**Interfaces:**
- Consumes: `theme`, `customThemeBg*` fields from `DockFrameProps` (already passed via `settings`).
- `DockFrame` needs new optional props from `DockFrameProps`:

```ts
customTheme?: {
  bgImages?: string[];
  bgBlur?: boolean;
  bgHide?: boolean;
  bgRotation?: boolean;
  bgRotationSecs?: number;
  hideALMS?: boolean;
  connectorButton?: string;
  hideAppCount?: boolean;
  hideSidebar?: boolean;
}
```

Changes to `DockFrame.tsx`:
1. **Background layer** for `theme === 'custom'`: render background image (current index from rotation state, or `bgImages[0]`). If `bgBlur`, apply `filter: blur(12px) scale(1.06)`. If `bgHide`, skip image entirely (base color only).
2. **Background rotation**: `useEffect` — when `bgRotation && bgImages.length > 1`, set interval of `bgRotationSecs * 1000` ms, cycling index. Clear on unmount or when rotation disabled.
3. **Hide sidebar**: when `hideSidebar`, pass `isCleanDock = true` to companion area logic (or simply don't render the companion divs).
4. Pass `hideALMS` / `connectorButton` down to `ConnectorHub`.
5. Pass `hideAppCount` to `GroupSidebar`.

Changes to `GroupSidebar.tsx`:
- When `hideAppCount` is true, do not render the app count badge.
- Apply `background: var(--sidebar-bg-custom)` when theme is `'custom'`.

Changes to `ConnectorHub.tsx` (or wherever A/L/M/S buttons are rendered):
- When `hideALMS`, render only the button matching `connectorButton` (skip the others).

- [ ] **Step 1: Extend `DockFrameProps` with `customTheme` prop in `DockFrame.tsx`**

- [ ] **Step 2: Add custom background layer rendering + blur/hide logic in `DockFrame.tsx`**

- [ ] **Step 3: Add background rotation `useEffect` in `DockFrame.tsx`**

- [ ] **Step 4: Pass `hideALMS`/`connectorButton` to `ConnectorHub`; add filtering in ConnectorHub**

  Locate the component that renders the A/L/M/S mini-buttons (`ConnectorHub`). Add optional `hideALMS?: boolean; keepButton?: string` props. Filter the rendered buttons list: `if (hideALMS) buttons.filter(b => b.id === keepButton)`.

- [ ] **Step 5: Pass `hideAppCount` to `GroupSidebar`; conditionally hide count badge**

- [ ] **Step 6: Pass `customTheme` from `App.tsx` into `<DockFrame>`**

  In `App.tsx`, derive the `customTheme` object from `data.settings` and pass as a prop.

- [ ] **Step 7: TypeScript compile + full build**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm run build`
  Expected: zero errors.

- [ ] **Step 8: Run full test suite**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm test`
  Expected: all tests pass.

- [ ] **Step 9: Commit**

  ```
  git add src/components/DockFrame.tsx src/components/GroupSidebar.tsx src/components/CustomThemePanel.tsx src/App.tsx
  git commit -m "feat: custom theme background rotation, blur, hide sidebar and ALMS options"
  ```

---

## Task 7: Verification

- [ ] **Step 1: Run full test suite**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && npm test`
  Expected: all tests pass (no release).

- [ ] **Step 2: Verify asset integrity**

  Run: `cd "d:\Projects\projects\Project 5_AppDock" && node tests/assets-integrity.test.cjs`
  Expected: 10/10 pass.

- [ ] **Step 3: Manual smoke checklist (describe to user)**

  1. Switch to Custom Theme → dock goes to base color `#0d0d0d`.
  2. Upload a background image → appears as dock wallpaper.
  3. Toggle Background Blur ON → image blurs.
  4. Set Header Color to `#1a1a2e` → header reflects it.
  5. Toggle Hide A/L/M/S → picker appears, select `M`, toggle confirmed → only M button visible.
  6. Toggle Background Rotation ON, pick 20s → image cycles every 20s.
  7. Switch back to Dark theme → all custom overrides removed, dock reverts.

- [ ] **Step 4: Confirm with user before any release**

