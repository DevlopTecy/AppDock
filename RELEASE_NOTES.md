# AppDock Release Documentation & Staging Notes

> **Purpose**: This living document tracks all features, bug fixes, UI enhancements, and architectural improvements implemented in AppDock. When preparing a new release (e.g. for GitHub Releases or internal milestones), extract the staged items into the release changelog and increment the staging header for the next iteration.

---

## 📋 Quick Staging Summary for v1.0.7

| Category | Highlights |
| :--- | :--- |
| **New Features** | Sound FX Engine (7 Web Audio packs), Live Running Process Indicators with "Bring to Front" / "Close", Smart Window Dodge on maximized windows, Audio Output Switcher & CoreAudio Volume sync in Settings. |
| **Critical Fixes** | Zombie process & single instance lock resolution; ELECTRON_RUN_AS_NODE respawn wrapper; Guaranteed dock visibility; Right-dock DWM displacement elimination; OneDrive desktop shortcut auto-healing. |
| **UX & Aesthetics** | Ultra-smooth fluid motion system (compositor transitions, button micro-press, modal entrances); High-contrast pill buttons in Dark/Minimal themes; Compact responsive header; Sub-options clipping fixes. |
| **Test Suites** | 19 automated test suites passing 100% green (98 test suites / 150+ assertions across audio, native ops, process monitoring, and layout geometry). |

---

## 🚀 Release: v1.0.7 (2026-11-02)

### 🐛 Critical Bug Fixes
- **OneDrive Desktop Shortcut Misidentification & Auto-Healing (BUG-30)**:
  - **Issue**: Desktop shortcuts located in OneDrive-synchronized folders (such as `C:\Users\<user>\OneDrive\Desktop\<App>.lnk`) were mistakenly identified as "OneDrive", overwriting their titles with "OneDrive" and showing the blue OneDrive cloud icon.
  - **Root Cause**: In `electron/main.cjs`, `findStartApp` performed a reverse substring match (`cleanId.includes(a.Name.toLowerCase())`). For any file path containing the folder name "onedrive", `cleanId.includes('onedrive')` evaluated to `true`, falsely matching the Windows StartApp entry for OneDrive. In turn, `App.tsx` item resolution and deduplication cascades caused existing desktop items to be renamed to OneDrive.
  - **Resolution**:
    1. **Path-Safe `findStartApp`**: Local file paths that exist on disk now bypass StartApp matching entirely. For unresolved file paths, only the base filename without extension is compared. Removed the inverted `cleanId.includes(a.Name)` substring match so parent folder names are never matched against app names.
    2. **Local Shortcut Priority in `app:resolve-item`**: When a target already exists on disk, `resolve-item` resolves it directly and extracts its native icon. If an item was previously corrupted to have the name "OneDrive" or target "OneDrive.lnk", it is automatically healed back to its real shortcut path and title (e.g. restoring ManorLords, CapCut, etc.).
    3. **Startup Pre-Healing in `src/App.tsx`**: Added pre-deduplication healing pass so that any corrupted items are restored to their true application names before deduplication runs, preventing duplicate removal.
    4. **AUMID Mismatch Refinement**: Adjusted `isMismatchedAumid` so ordinary file paths with extensions (`.lnk`, `.exe`) are not mistakenly treated as mismatched AUMIDs.
  - **Verification**: Verified with automated test `BUG-30` in `tests/bug-fixes-verification.test.cjs` and full test suite passing 100% green.

### ⚙️ Settings Defaults & Migration Preset (Download & Update)
- **Configured Initial Toggle States**:
  - **Background Rotation**: **ON** (`customThemeBgRotation: true`)
  - **Start with Windows**: **ON** (`autoStartWithWindows: true`)
  - **Smart Window Dodge**: **OFF** (`smartWindowDodge: false`)
  - **Acoustic Feedback**: **OFF** (`soundEnabled: false`)
  - *All other settings (themes, custom colors, wallpapers, drawer dimensions, density, clean dock, and items) remain strictly unchanged.*
- **Update Migration**:
  - Implemented one-time preset migration in `loadDockData` ensuring these states take effect when existing users update, while leaving all user customization intact.
  - Verified with test `BUG-31` in `tests/bug-fixes-verification.test.cjs`.

### 💫 Ultra-Smooth Fluid Motion System Across AppDock (BUG-32)
- **Smooth Open & Close Dock Transitions**:
  - **Problem**: Previously, expanding or collapsing the dock abruptly mounted or unmounted the React tree, causing the drawer to snap into and out of existence instantly.
  - **Solution**: Implemented hardware-accelerated, compositor-only slide transitions (`translate3d`, `opacity`, `will-change`) using luxury easing curves (`cubic-bezier(0.16, 1, 0.3, 1)` for entrance over 240ms; `cubic-bezier(0.2, 0, 0.4, 1)` for exit over 210ms).
  - **Bounds Synchronization**: `App.tsx` coordinates an `isClosing` state, allowing the full exit slide to complete smoothly before notifying Electron to shrink the window bounds to the collapsed handle. `main.cjs` handles tray and external collapse events via IPC notifications and a fallback timer.
  - **Handle Entrance Fade**: The collapsed `EdgeToggle` enters smoothly via `dock-handle-enter` with `handleFadeIn` to eliminate edge pop.
- **Universal Smooth Button Micro-Interactions**:
  - Added tactile active-press micro-interactions (`:active { transform: scale(0.93) !important; }`) and fluid spring release across all buttons: Quick Header Actions (Search, Clean Dock, Maximize, Settings, Close), Group icons, Quick Icons bar, EdgeToggle, Settings switches/sliders, and modal buttons.
  - Replaced non-compositor `transition: all` with dedicated `transform`, `box-shadow`, and `opacity` transitions to prevent layout thrashing and maintain constant 60/120fps.
- **Smooth Menu & Modal Entrances**:
  - Upgraded `SettingsView`, `AddToQuickIconsModal`, `NewGroupModal`, `EditGroupModal`, and `SearchBar` with `modalSlideUpFade` (starts at `translate3d(0, 10px, 0) scale(0.97)` and glides to rest).
  - Added `contextMenuSlideIn` for group and app card right-click context menus.
  - Added `dialogScaleIn` and `dialogBackdropFade` for confirmation dialogs (Reset Custom Theme warning, Delete Group confirmation).
- **Smooth App Drag and Place**:
  - Enhanced App Grid cards with active drag ghosting (`opacity: 0.38`, `transform: scale(0.92)`), elevated drag-over target indicator (`transform: scale(1.06) translateY(-4px)` with glowing accent border), and smooth settling animation on drop.
  - Upgraded "Drop files here" external drop overlay with `dropOverlayFadeIn` (`scale(0.96)` &rarr; `scale(1)`).
- **Zero Layout Thrashing & Compositor Performance**:
  - Strictly adheres to the `fixing-motion-performance` skill: animates only compositor properties (`transform`, `opacity`), never animates layout triggers (`width`, `height`, `left`, `top`), and uses surgical `will-change`.
  - Verified with automated test `BUG-32` in `tests/bug-fixes-verification.test.cjs`.

---

## 🚀 Release: v1.0.6 (2026-11-01)

### 1. New Features

#### A. Quick Icons Bar (Fast 1-Click Launch Rail)
- **What It Does**: Provides an ultra-fast launch rail pinned to the companion anchor column for apps and URLs you need at your fingertips.
- **Strict Boundary Geometry**: Dynamically locked strictly below the dock handle at `top: calc(50% + 42px)`, ensuring it never overlaps or touches the handle across any display resolution or UI scale (Large, Medium, Small).
- **Drag-and-Drop Pinning**: Directly drag any app or web link from your group grids and drop it onto the Quick Icons rail to pin it immediately.
- **Themed Disguised Add Button**: The `+` Add button is styled with custom theme emblems and stickers (e.g. Ryuk silhouette in Death Note, Straw Hat in One Piece, lollipop in Candy) that subtly morph to reveal the `+` icon on hover.
- **Add to Quick Icons Modal**: Dedicated modal allowing you to search and select any existing app across all groups with clean typography and real-time filtering.
- **Sub-Option Toggle**: Added "Hide Quick Icons" toggle inside Settings &rarr; Theme Sub-Options to hide the bar when a distraction-free aesthetic is preferred.
- **Key Files**: [`src/components/QuickIconsBar.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/QuickIconsBar.tsx), [`src/components/AddToQuickIconsModal.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/AddToQuickIconsModal.tsx), [`src/components/DockFrame.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/DockFrame.tsx), [`src/types/dock.ts`](file:///d:/Projects/projects/Project%205_AppDock/src/types/dock.ts).

#### B. Custom Group Icons: Custom Pictures & Composite 2–4 Icon Grids
- **Custom Picture Upload with Discord-Style Crop**:
  - In the "New Group" / "Edit Group" modal, users can upload any JPG, PNG, or WebP picture.
  - Opens a custom crop dialog with zoom and pan controls to select the exact circular/square icon framing.
  - Automatically compressed and stored locally in local storage.
- **Dynamic Composite 2–4 Icon Grid**:
  - Groups can be set to "Icon Grid" mode.
  - Automatically combines the icons of the first 2, 3, or 4 apps inside that group into a unified mini-grid icon matching modern mobile/desktop operating system folders (iOS, macOS Launchpad, Android).
  - Scaled to fill 100% of the group icon container without margins or awkward clipping.
- **Key Files**: [`src/components/GroupSidebar.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/GroupSidebar.tsx), [`src/components/ImageCropModal.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/ImageCropModal.tsx), [`src/utils/imageUtils.ts`](file:///d:/Projects/projects/Project%205_AppDock/src/utils/imageUtils.ts).

#### C. Custom Theme Studio & Reactive Font Color Picker
- **Custom Wallpapers & Rotation**:
  - Upload up to 5 custom background wallpapers with real-time rotation timer options (20s, 30s, 40s, 50s, 60s).
  - Background opacity slider (10% to 100%) and solid color fallback toggle.
- **Reactive Font Color Picker**:
  - Added dedicated **Font Color** selector in the Custom Theme Studio.
  - Dynamically updates `--text-primary-custom`, `--text-secondary-custom`, and `--text-muted-custom` in real time without reloading.
- **Key Files**: [`src/components/CustomThemePanel.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/CustomThemePanel.tsx), [`src/hooks/useCustomThemeVars.ts`](file:///d:/Projects/projects/Project%205_AppDock/src/hooks/useCustomThemeVars.ts).

#### D. Multi-Wallpaper Background Rotation Across Built-In Themes
- **Built-in Theme Rotation**: Extended background rotation beyond Custom Theme to built-in aesthetic themes (Death Note, Kawaii, Aether, Elden Ring).
- **HD Community Artworks**: Integrated 4 external high-definition user artworks for Death Note (Kira, L Investigation, Ryuk Tokyo, Death Note book), Kawaii gamer room wallpapers, and Aether sky scenes.
- **Timer & Reset**: Rotation operates on configurable intervals and cleanly resets index when toggled off.
- **Key Files**: [`src/components/DockFrame.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/DockFrame.tsx).

---

### 2. Critical Bug Fixes & Stability Improvements

#### A. Delete App Group Modal Trapped Behind UI
- **Issue**: Clicking "Delete Group" previously rendered the confirmation dialog inside an overflow-hidden sidebar container, causing the confirmation card to be cut off or obscured behind other dock elements.
- **Fix**: Re-architected the confirmation modal using React's `createPortal(..., document.body)` with `zIndex: 100000`, a dark frosted glass backdrop (`backdropFilter: blur(8px)`), and <kbd>Esc</kbd> key dismissal.
- **Key File**: [`src/components/GroupSidebar.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/GroupSidebar.tsx).

#### B. Internal vs External Drag-and-Drop Artifacts
- **Issue**: Dragging an icon within AppDock to reorder or move between groups triggered the desktop file drop receiver, causing generic "Google" or browser link artifacts to spawn.
- **Fix**: Added explicit drag data signatures (`application/x-appdock-item`). Internal drags now skip external Windows shell file parsing, while genuine external drops from the desktop or Explorer are validated with fallback icon extractors.
- **Key Files**: [`src/components/AppGrid.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/AppGrid.tsx), [`src/components/DockFrame.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/DockFrame.tsx).

#### C. Modern Windows App & Start Menu AUMID Execution Error
- **Issue**: Dragging pinned modern apps from the Windows Taskbar/Start Menu (such as `Google.AntigravityIDE` or UWP packages) triggered an error popup: *"Windows cannot find 'Google.AntigravityIDE'. Make sure you typed the name correctly"*.
- **Fix**: Updated shortcut resolution to inspect `AppUserModelId` and raw target paths. When an AUMID is detected without an absolute filesystem path, AppDock launches the application natively via PowerShell `Start-Process "shell:AppsFolder\<AUMID>"`.
- **Key Files**: [`electron/main.cjs`](file:///d:/Projects/projects/Project%205_AppDock/electron/main.cjs), [`electron/icon-helper.ps1`](file:///d:/Projects/projects/Project%205_AppDock/electron/icon-helper.ps1).

#### D. Background Blur Ineffective in Theme Sub-Options
- **Issue**: Toggling "Background Blur" in Theme Sub-Options had no visible effect because the CSS filter string included an invalid nested `scale()` function (`filter: blur(45px) scale(1.15)`).
- **Fix**: Separated geometry transforms into standard CSS `transform: scale(1.15)` and applied clean `backdrop-filter: blur(45px)` / `filter: blur(45px)`. Made the toggle row clickable across its entire bounding box.
- **Key Files**: [`src/components/DockFrame.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/DockFrame.tsx), [`src/components/CustomThemePanel.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/CustomThemePanel.tsx).

#### E. Auto-Updater Differential Download Stall & Fallback Watchdog
- **Issue**: Users experiencing stalls during automatic update downloads due to missing blockmaps or network proxies on differential chunk streams.
- **Fix**: Disabled differential downloads in `electron-builder` configuration in favor of clean single-file package streaming. Added an IPC watchdog fallback that initiates a direct browser download if an update download exceeds the timeout threshold.
- **Key Files**: [`electron/main.cjs`](file:///d:/Projects/projects/Project%205_AppDock/electron/main.cjs), [`package.json`](file:///d:/Projects/projects/Project%205_AppDock/package.json).

---

### 3. UI/UX & High-End Design Polish

#### A. "Reset Custom Theme" Confirmation Modal & Dark Theme Revert
- **Feature**: Clicking "Reset custom theme" in settings now opens a confirmation dialog instead of instantly resetting settings.
- **Modal Design**:
  - Glowing red circular badge with `<AlertTriangle size={24} />`.
  - Clear heading and reassurance text.
  - "Cancel" and "Reset & Revert" buttons with keyboard <kbd>Esc</kbd> support.
- **Dark Theme Reversion**: Confirming the reset clears all custom background images and color customizations, and immediately switches `settings.theme` back to `'dark'`.
- **Key File**: [`src/components/CustomThemePanel.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/CustomThemePanel.tsx).

#### B. Clean Modal Aesthetics (No Glow Dots, Refined Typography)
- Removed glowing colored indicator dots beside modal titles and removed extraneous header zap icons from `AddToQuickIconsModal`.
- Polished padding, typography contrast, and theme-matching borders for a consistent design across all light, dark, and fancy themes.
- Keyframe animations (`@keyframes scaleIn` and `@keyframes fadeIn`) centralized in [`src/index.css`](file:///d:/Projects/projects/Project%205_AppDock/src/index.css).

#### C. Inner Edge Handle for Hidden Sidebar
- When the companion sidebar is hidden via Sub-Options, the dock's expanded edge handle dynamically shifts to the inner edge facing the desktop, keeping dock navigation comfortable and natural.

#### D. Comprehensive Visual Showcase in Documentation
- Updated `README.md` with side-by-side screenshots showing:
  - Dark vs. Light default themes.
  - Large, Medium, and Small density comparisons.
  - Quick Icons companion rail and search modal.
  - High-resolution previews for Fancy Themes (Death Note, Kawaii, Aether, Elden Ring, One Piece, Candy).

#### E. Elden Ring Sidebar Proportion & Size Refinement
- **Optimization**: Decreased the dimensions of the Elden Ring companion module sidebar and banners to feel harmonious, compact, and balanced with the rest of the dock.
- **Adjustments**:
  - Reduced container width from 50px to 42px.
  - Reduced button height from 72px to 54px.
  - Reduced banner image height from 68px to 50px (maxWidth 34px), preserving full texture detail and aspect ratio without taking excessive vertical screen space.
- **Key Files**: [`src/components/connectors/ConnectorHub.tsx`](file:///d:/Projects/projects/Project%205_AppDock/src/components/connectors/ConnectorHub.tsx), [`src/index.css`](file:///d:/Projects/projects/Project%205_AppDock/src/index.css).

---

## 🧪 Automated Verification & Test Coverage

All 14 test suites in `tests/` pass with zero failures:
1. `scaffold.test.cjs`: File structure and build artifact integrity.
2. `storage.test.cjs`: LocalStorage schema migrations, settings serialization, URL normalizers.
3. `dock-bounds.test.cjs`: Edge snapping math, multi-monitor coordinates, scale factor adjustments.
4. `native-ops.test.cjs`: Native shell execution, argument escaping, PowerShell script bridges.
5. `integration.test.cjs`: End-to-end dock event flows and window lifecycle.
6. `update-logic.test.cjs`: GitHub release API parsing, version semver comparison, download simulation.
7. `icon-extraction-deep.test.cjs`: Windows shortcut `.lnk`, `.url`, AUMID, and exe icon extraction.
8. `assets-integrity.test.cjs`: Verifies all theme wallpapers, stickers, and sound clips exist on disk.
9. `autolaunch.test.cjs`: Startup with Windows registry/login item bridge validation.
10. `interactions.test.cjs`: Drag-and-drop event handling and modal interactions.
11. `bug-fixes-verification.test.cjs`: Regression tests for all 28 logged bug fixes.
12. `custom-theme-studio.test.cjs`: Verifies custom themes, rotation, font color, and reset modal flow.
13. `launch.test.cjs`: Real Electron process launch and 4-second stability check.
14. `quick-icons.test.cjs`: Quick Icons storage, rendering, geometry bounds, and sub-options.

---

## 📦 Previous Releases History

### v1.0.5 (Released 2026-11-01)
- **One-Click Quick Update**: Real-time progress bar and instant "Restart & Update" flow.
- **Auto Setup / Start with Windows**: Automated launch upon Windows startup with system tray toggle.
- **High-Resolution Wallpapers**: Added HD vertical assets for Kawaii, Death Note, and Aether themes.
- **Audio Effects**: Integrated custom SFX for click, launch, and error feedback.

### v1.0.4 (Released 2026-10-31)
- **Fancy Themes Debut**: Added Elden Ring, Death Note, One Piece, Kawaii, and Candy themes.
- **Desktop Snapping & Edge Tabs**: Smooth edge pinning to top, bottom, left, and right screen borders.
- **ALMS Density Controls**: Fast switching between Auto, Large, Medium, and Small icon sizes.

---

## 📝 How to Update This Document for Future Changes

Whenever you build a new feature or resolve a bug:
1. **Identify the Category**: New Feature, Bug Fix, UI/UX Polish, or Architecture.
2. **Add a Bullet Entry**: Include what the change does, why it was made, and the key files modified.
3. **Run Tests**: Verify with `npm test` and note any new test cases added.
4. **On Release**: Move the staged notes into a new version header (e.g. `## v1.0.6`) and create a fresh `## 🚀 Upcoming Release: v1.0.7` staging block.
