const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = creds.match(/password=([^\r\n]+)/)[1];

const notes104 = `> [!IMPORTANT]
> **⚠️ In-App Auto-Update Notice (Downloading Update 0% Bug in v1.0.4):**
> If you are on version **1.0.4** and click "Update Now" to upgrade to 1.0.5, the in-app updater may stall at **0%** due to differential blockmap range request limitations on GitHub Releases.
> **How to upgrade from 1.0.4:**
> 1. Right-click the AppDock icon in the System Tray or title bar and select **Quit AppDock**.
> 2. Download and run [AppDock Setup 1.0.5.exe](https://github.com/DevlopTecy/AppDock/releases/download/v1.0.5/AppDock.Setup.1.0.5.exe) (or [AppDock-Setup-1.0.5.exe](https://github.com/DevlopTecy/AppDock/releases/download/v1.0.5/AppDock-Setup-1.0.5.exe)).
> 3. It will install cleanly over 1.0.4 in-place, keeping all your groups, apps, custom themes, and settings intact!

## What's Changed in AppDock v1.0.4

### ↕️ Side Group Reordering
- **Right-Click Move Controls**: Added **Move Up** (\`ArrowUp\`) and **Move Down** (\`ArrowDown\`) options when right-clicking on any group icon in the vertical sidebar.
- **Bounds-Aware**: Buttons automatically disable with dimmed styling when an item is already at the top or bottom of the list.
- **Persistent Ordering**: Group order changes are saved to persistent storage immediately and remembered across restarts.

### 🛡️ Card Drag vs File Drop Fixes
- **Internal Card Drag Isolation**: Tagged internal card drag operations with a dedicated MIME type, completely preventing internal reordering from triggering the external \`"Drop files here"\` file drop overlay.
- **Eliminated Dummy "download" Apps**: Added \`draggable={false}\` to app icon images, preventing Chromium from synthesizing virtual image download files during card reordering.

### 🎯 Smooth Edge Handle Positioning
- **Zero Micro-Jitter on Toggle**: Collapsed handle (\`EdgeToggle\`) is now pinned flush against the screen edge (\`position: absolute\`, \`top: 50%\`, \`transform: translateY(-50%)\`).
- **Synchronized Bounds**: Window collapse/expand requests now await Electron's \`setBounds\` completion before toggling React drawer state, eliminating the microsecond position jump on dock open/close.

### 🎨 Elden Ring, One Piece & Candy Themes
- **High-Definition Wallpapers**: Vertical artwork crafted specifically for portrait docks with zero pixelation or stretching.
- **Theme-Specific Accents & Stickers**:
  - Custom straw hat & jolly roger icons for One Piece.
  - Sweet candy bonbon and lollipop stickers for Candy theme.
  - Golden grace and rune accents for Elden Ring.
- **Clean Background Integration**: Clean sea and pirate ship vertical background without overlapping watermark artifacts.

### ⚡ Companion Hub & Performance
- **Ghost Hitbox Elimination**: Dynamic companion width (54px idle / 340px active) prevents background click blocking while keeping transitions smooth.
- **Safe Signal Fallbacks & Deduplication**: Added AbortController timeout guards for weather fetching and true track shuffle deduplication in the music module.

**Full Changelog**: https://github.com/DevlopTecy/AppDock/compare/v1.0.3...v1.0.4`;

const notes105 = `> [!NOTE]
> **📦 Upgrading from v1.0.4 Notice:**
> If upgrading from **v1.0.4** and the in-app updater is stuck at **0%**, simply **Quit AppDock** from the system tray and run [AppDock Setup 1.0.5.exe](https://github.com/DevlopTecy/AppDock/releases/download/v1.0.5/AppDock.Setup.1.0.5.exe) directly to upgrade in place.

## What's Changed in AppDock v1.0.5

### ⚡ Downloading Update & Auto-Updater Fixes
- **Disabled Differential Downloads**: Fixed an issue where \`electron-updater\` stalled at \`Downloading update (0%)...\` due to differential blockmap range-request limits on GitHub Releases. The updater now reliably downloads full installer packages.
- **Auto-Updater Manifest (\`latest.yml\`)**: Published official \`latest.yml\` and blockmaps to release assets so future updates can be verified and downloaded directly in-app.
- **Watchdog Fallback**: Added a 10-second watchdog and \`onUpdateError\` listener in the update notification bar. If a network stall or 0% hang is detected, an instant **"Download Setup Directly (Browser)"** button is revealed.

### 🚫 Disabled Auto-Start on Windows Boot
- **No Unwanted Startup**: Removed forced auto-launch from application lifecycle, ensuring AppDock never opens automatically on PC boot unless explicitly enabled in Settings.
- **Development Safeguard**: Dev mode (\`node_modules/electron\`) is strictly prevented from registering in Windows Startup.
- **Cleaned Windows Registry**: Purged orphan startup registry keys (\`electron.app.Electron\` & \`electron.app.AppDock\`).

### 🌐 Fixed Missing Web URL Favicons & Icons
- **Favicon Detection Fix**: Resolved a critical issue in \`isGenericOrBrokenIcon\` where HTTP and HTTPS web URLs were mistakenly flagged as invalid, causing all web shortcuts to render generic globe icons.
- **Multi-Tier Favicon Fallback**: Added automatic fallback to Google High-Resolution Favicon Service (\`s2/favicons?domain=...&sz=128\`) whenever a web item's icon is missing or fails to load.
- **Startup Auto-Repair**: Existing web bookmarks with missing or broken icons are automatically detected, fetched, and repaired with high-res favicons on app launch.

### ✏️ Edit URL and Name for Web Links & Shortcuts
- **Direct Right-Click Editing**: Right-clicking any web shortcut in the dock now offers an **Edit URL & Name** option.
- **Dedicated Edit Dialog (\`EditItemModal\`)**:
  - Live preview card showing the website's favicon in real time as the address is typed.
  - Custom display name and URL input fields with instant validation.
  - Seamless theme-matching styling for all themes (Death Note, Elden Ring, One Piece, Candy, Aether, etc.).
- **Desktop Shortcut Renaming**: Desktop apps also now support right-click **Edit Name** to customize application titles in the dock.

**Full Changelog**: https://github.com/DevlopTecy/AppDock/compare/v1.0.4...v1.0.5`;

const file104 = path.join(__dirname, '..', 'release', 'release-notes-v1.0.4.md');
const file105 = path.join(__dirname, '..', 'release', 'release-notes-v1.0.5.md');

fs.writeFileSync(file104, notes104, 'utf-8');
fs.writeFileSync(file105, notes105, 'utf-8');

console.log('Updating release v1.0.4 notes on GitHub...');
execSync(`gh release edit v1.0.4 --notes-file "${file104}"`, {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, GH_TOKEN: token },
  stdio: 'inherit'
});

console.log('Updating release v1.0.5 notes on GitHub...');
execSync(`gh release edit v1.0.5 --notes-file "${file105}"`, {
  cwd: path.join(__dirname, '..'),
  env: { ...process.env, GH_TOKEN: token },
  stdio: 'inherit'
});

console.log('Both releases updated successfully!');

