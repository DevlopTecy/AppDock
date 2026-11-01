const { app, BrowserWindow, ipcMain, screen, shell, dialog, Tray, Menu, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs');
const https = require('https');
const { exec, execFile } = require('child_process');

let autoUpdater = null;
try {
  const updaterModule = require('electron-updater');
  autoUpdater = updaterModule.autoUpdater;
  if (autoUpdater) {
    autoUpdater.autoDownload = false;
    autoUpdater.autoInstallOnAppQuit = true;
    autoUpdater.disableDifferentialDownload = true; // Disable delta downloads to prevent stalling on GitHub range requests
  }
} catch (e) {
  console.log('[AutoUpdater] electron-updater not initialized:', e.message);
}

// Global error handlers to prevent unhandled rejections from terminating the app
process.on('uncaughtException', (err) => {
  console.error('[AppDock Main uncaughtException]:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('[AppDock Main unhandledRejection]:', reason);
});

// Enforce single instance lock so duplicate docks don't collide or double-poll
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
let tray = null;
let isQuitting = false;
let currentPosition = 'right';
let isExpanded = false;
let drawerWidth = 320;
let drawerHeight = 580;
let moduleWidth = 0;
let verticalRatio = 0.5;
let isProgrammaticBounds = false;
let isSkipTaskbar = false;

function calculateBounds(position, expanded, workArea, vertRatio = verticalRatio) {
  const tabW = 22;
  const tabH = 64;
  const h = Math.min(drawerHeight, workArea.height);
  const safeRatio = Math.max(0.02, Math.min(0.98, typeof vertRatio === 'number' ? vertRatio : 0.5));
  const centerY = Math.round(workArea.y + (workArea.height - h) * safeRatio);
  // Position collapsed tab so its screen center matches expanded drawer handle center (centerY + h / 2)
  const tabCenterY = Math.round(centerY + (h - tabH) / 2);

  // Dynamic companion width: 340px when companion module is active, 54px when idle (ConnectorHub handles), 0 in Clean Dock mode (moduleWidth < 0)
  // Prevents oversized ghost hitbox from blocking background apps/clicks when no module is open.
  const companionW = expanded ? (moduleWidth < 0 ? 0 : (moduleWidth > 54 ? 340 : 54)) : 0;
  const totalExpandedWidth = drawerWidth + companionW;

  if (position === 'left') {
    if (!expanded) {
      return { x: workArea.x, y: tabCenterY, width: tabW, height: tabH };
    }
    return { x: workArea.x, y: centerY, width: totalExpandedWidth, height: h };
  } else if (position === 'right') {
    if (!expanded) {
      return { x: workArea.x + workArea.width - tabW, y: tabCenterY, width: tabW, height: tabH };
    }
    return { x: workArea.x + workArea.width - totalExpandedWidth, y: centerY, width: totalExpandedWidth, height: h };
  } else if (position === 'top') {
    const topTabW = 64;
    const topTabH = 22;
    const companionH = (moduleWidth > 54) ? 220 : 0;
    const totalH = Math.min(workArea.height - 40, h + topTabH + companionH);
    const totalW = Math.max(drawerWidth, 360);
    const centerX = Math.round(workArea.x + (workArea.width - totalW) / 2);
    const tabCenterX = Math.round(workArea.x + (workArea.width - topTabW) / 2);
    if (!expanded) {
      return { x: tabCenterX, y: workArea.y, width: topTabW, height: topTabH };
    }
    return { x: centerX, y: workArea.y, width: totalW, height: totalH };
  }

  return { x: workArea.x, y: tabCenterY, width: tabW, height: tabH };
}

function updateWindowBounds() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  isProgrammaticBounds = true;
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;
  const bounds = calculateBounds(currentPosition, isExpanded, workArea);
  mainWindow.setBounds(bounds);
  setTimeout(() => {
    isProgrammaticBounds = false;
  }, 50);
}

function resolveAsset(...segments) {
  const primary = path.join(__dirname, ...segments);
  if (fs.existsSync(primary)) return primary;
  if (segments[0] === '../public') {
    const distFallback = path.join(__dirname, '../dist', ...segments.slice(1));
    if (fs.existsSync(distFallback)) return distFallback;
  }
  return primary;
}

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;
  const initialBounds = calculateBounds(currentPosition, false, workArea);

  const appIconPath = resolveAsset('../public/app-logo.png');

  mainWindow = new BrowserWindow({
    ...initialBounds,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: isSkipTaskbar,
    icon: appIconPath,
    resizable: false, // Prevents OS window borders from fighting with programmatic in-app resize
    show: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // When user closes or minimizes dock, collapse to edge handle on screen rather than hiding completely
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      collapseDockWindow();
      return false;
    }
  });

  // Always keep on top across desktop workspaces
  mainWindow.setAlwaysOnTop(true);

  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production' && !process.env.SERVE_DIST;
  if (isDev) {
    const port = process.env.VITE_PORT || 5178;
    const devUrl = `http://localhost:${port}`;
    let isLoaded = false;

    const loadWithRetry = async () => {
      if (isLoaded || !mainWindow || mainWindow.isDestroyed()) return;
      try {
        await mainWindow.loadURL(devUrl);
        isLoaded = true;
      } catch (err) {
        // Dev server may still be compiling; retry smoothly after 300ms
        setTimeout(loadWithRetry, 300);
      }
    };

    loadWithRetry();

    mainWindow.webContents.on('did-fail-load', (event, errorCode) => {
      // ERR_CONNECTION_REFUSED (-102) -> retry
      if (errorCode === -102 && !isLoaded) {
        setTimeout(loadWithRetry, 350);
      }
    });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')).catch(() => {});
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    updateWindowBounds();
  });

  mainWindow.on('blur', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:blur');
    }
  });
}

function showDockWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }
  isExpanded = true;
  updateWindowBounds();
  mainWindow.focus();
  mainWindow.webContents.send('dock:expand');
}

function collapseDockWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  if (!mainWindow.isVisible()) {
    mainWindow.show();
  }
  isExpanded = false;
  updateWindowBounds();
  mainWindow.webContents.send('dock:collapse');
}

function toggleDockVisibility() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  if (!mainWindow.isVisible()) {
    showDockWindow();
    return;
  }
  // Toggle dock between expanded and collapsed on screen without ever destroying or removing window
  if (isExpanded) {
    collapseDockWindow();
  } else {
    showDockWindow();
  }
}

function getAutoLaunchSetting() {
  try {
    const settings = app.getLoginItemSettings();
    return !!settings.openAtLogin;
  } catch (err) {
    console.warn('[AutoLaunch] getLoginItemSettings error:', err.message);
    return false;
  }
}

function setAutoLaunchSetting(enable) {
  try {
    const openAtLogin = !!enable;
    // In dev mode (node_modules/electron), never register auto-launch to avoid opening dev electron on PC boot
    if (!app.isPackaged && openAtLogin) {
      console.log('[AutoLaunch] Skipping auto-launch registration in development mode');
      return { success: true, openAtLogin: false };
    }
    app.setLoginItemSettings({
      openAtLogin,
      path: process.execPath,
      args: []
    });
    updateTrayMenu();
    return { success: true, openAtLogin };
  } catch (err) {
    console.warn('[AutoLaunch] setLoginItemSettings error:', err.message);
    return { success: false, error: err.message };
  }
}

function updateTrayMenu() {
  if (!tray || tray.isDestroyed()) return;
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Open AppDock',
      click: () => showDockWindow()
    },
    {
      label: 'Collapse to Handle',
      click: () => collapseDockWindow()
    },
    { type: 'separator' },
    {
      label: 'Hide from Windows Taskbar',
      type: 'checkbox',
      checked: isSkipTaskbar,
      click: (menuItem) => {
        isSkipTaskbar = menuItem.checked;
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.setSkipTaskbar(isSkipTaskbar);
        }
      }
    },
    {
      label: 'Start with Windows',
      type: 'checkbox',
      checked: getAutoLaunchSetting(),
      click: (menuItem) => {
        setAutoLaunchSetting(menuItem.checked);
      }
    },
    { type: 'separator' },
    {
      label: 'Quit AppDock',
      click: () => {
        isQuitting = true;
        app.quit();
      }
    }
  ]);
  tray.setContextMenu(contextMenu);
}

function createTray() {
  if (tray && !tray.isDestroyed()) return;
  try {
    const trayIconPath = resolveAsset('../public/tray-icon.png');
    const icon = nativeImage.createFromPath(trayIconPath);
    tray = new Tray(icon);
    tray.setToolTip('AppDock - Desktop Dock Launcher');

    updateTrayMenu();

    tray.on('click', () => {
      toggleDockVisibility();
    });

    tray.on('double-click', () => {
      showDockWindow();
    });
  } catch (err) {
    console.error('[AppDock Tray Init Error]:', err);
  }
}

// ----------------- IPC HANDLERS -----------------

ipcMain.handle('dock:set-state', (event, expanded) => {
  isExpanded = !!expanded;
  if (!isExpanded) {
    moduleWidth = 0;
  }
  updateWindowBounds();
  return { success: true, isExpanded };
});

ipcMain.handle('dock:set-module-width', (event, width) => {
  moduleWidth = typeof width === 'number' ? Math.round(width) : 0;
  if (isExpanded) {
    updateWindowBounds();
  }
  return { success: true, moduleWidth };
});

ipcMain.handle('dock:set-position', (event, position) => {
  if (['left', 'right', 'top'].includes(position)) {
    currentPosition = position;
    updateWindowBounds();
    return { success: true, position: currentPosition };
  }
  return { success: false, error: 'Invalid position' };
});

ipcMain.handle('dock:set-dimensions', (event, { width, height }) => {
  if (typeof width === 'number' && width >= 140 && width <= 1000) {
    drawerWidth = Math.round(width);
  }
  if (typeof height === 'number' && height >= 200 && height <= 3000) {
    drawerHeight = Math.round(height);
  }
  if (isExpanded) {
    updateWindowBounds();
  }
  return { success: true, width: drawerWidth, height: drawerHeight };
});

ipcMain.handle('dock:set-vertical-position', (event, ratio) => {
  if (typeof ratio === 'number' && !isNaN(ratio)) {
    verticalRatio = Math.max(0.02, Math.min(0.98, ratio));
    updateWindowBounds();
    return { success: true, verticalRatio };
  }
  return { success: false, error: 'Invalid vertical ratio' };
});

ipcMain.handle('dock:get-workarea', () => {
  return screen.getPrimaryDisplay().workArea;
});

ipcMain.handle('dock:close', () => {
  isQuitting = true;
  app.quit();
});

ipcMain.handle('dock:hide-to-tray', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    isSkipTaskbar = true;
    mainWindow.setSkipTaskbar(true);
    updateTrayMenu();
    // Collapse to edge handle on screen - keep window and handle fully visible and usable on screen!
    collapseDockWindow();
  }
  return { success: true, isSkipTaskbar: true };
});

ipcMain.handle('dock:show-from-tray', () => {
  showDockWindow();
  return { success: true };
});

ipcMain.handle('dock:set-skip-taskbar', (event, skip) => {
  isSkipTaskbar = !!skip;
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.setSkipTaskbar(isSkipTaskbar);
    updateTrayMenu();
  }
  return { success: true, isSkipTaskbar };
});

ipcMain.handle('dock:get-skip-taskbar', () => {
  return isSkipTaskbar;
});

ipcMain.handle('dock:get-auto-launch', () => {
  return getAutoLaunchSetting();
});

ipcMain.handle('dock:set-auto-launch', (event, enable) => {
  return setAutoLaunchSetting(enable);
});

ipcMain.handle('app:launch-path', async (event, targetPath) => {
  try {
    if (!targetPath || typeof targetPath !== 'string') {
      return { success: false, error: 'Empty or invalid path' };
    }
    const trimmed = targetPath.trim();

    // 1. Handle Windows AUMID / StartApp / shell:AppsFolder items
    if (trimmed.toLowerCase().startsWith('shell:') || (!fs.existsSync(trimmed) && (trimmed.includes('.') || trimmed.includes('!')))) {
      const startApp = findStartApp(trimmed);
      const appTarget = trimmed.toLowerCase().startsWith('shell:appsfolder\\')
        ? trimmed
        : startApp
          ? `shell:AppsFolder\\${startApp.AppID}`
          : `shell:AppsFolder\\${trimmed}`;

      // If we can resolve to a physical .lnk or .exe on disk, launch that directly
      const physical = resolveShortcutPath(startApp?.Name || trimmed);
      if (physical && fs.existsSync(physical)) {
        const err = await shell.openPath(physical);
        if (!err) return { success: true };
      }

      // Otherwise launch via Windows shell:AppsFolder
      return new Promise((resolve) => {
        exec(`cmd /c start "" "${appTarget}"`, (err) => {
          if (err) {
            resolve({ success: false, error: err.message });
          } else {
            resolve({ success: true });
          }
        });
      });
    }

    const resolvedPath = resolveShortcutPath(trimmed) || trimmed;
    const openErr = await shell.openPath(resolvedPath);
    if (!openErr) {
      return { success: true };
    }
    // Fallback: spawn via cmd /c start
    return new Promise((resolve) => {
      exec(`cmd /c start "" "${resolvedPath}"`, (err) => {
        if (err) {
          resolve({ success: false, error: err.message });
        } else {
          resolve({ success: true });
        }
      });
    });
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('app:launch-url', async (event, url) => {
  try {
    if (!url || typeof url !== 'string') {
      return { success: false, error: 'Empty URL' };
    }
    let target = url.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    await shell.openExternal(target);
    return { success: true, url: target };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('app:browse-file', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Application or Shortcut',
    properties: ['openFile'],
    filters: [
      { name: 'Applications & Shortcuts', extensions: ['exe', 'lnk', 'bat', 'cmd', 'url'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const filePath = result.filePaths[0];
  const name = path.basename(filePath, path.extname(filePath));
  return { path: filePath, name };
});

ipcMain.handle('app:browse-image', async () => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    title: 'Select Picture / Icon Image',
    properties: ['openFile'],
    filters: [
      { name: 'Images (JPG, PNG, WebP, ICO, SVG)', extensions: ['jpg', 'jpeg', 'png', 'webp', 'ico', 'svg', 'gif'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }
  const filePath = result.filePaths[0];
  try {
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const mimeMap = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
      ico: 'image/x-icon',
      svg: 'image/svg+xml',
      gif: 'image/gif'
    };
    const mime = mimeMap[ext] || 'image/png';
    const buffer = fs.readFileSync(filePath);
    const dataUrl = `data:${mime};base64,${buffer.toString('base64')}`;
    return { path: filePath, dataUrl };
  } catch (err) {
    console.error('[browse-image] Failed to read image file:', err);
    return null;
  }
});

ipcMain.handle('app:show-item-in-folder', async (event, targetPath) => {
  try {
    if (!targetPath || typeof targetPath !== 'string') return false;
    let resolved = resolveShortcutPath(targetPath) || targetPath.trim();
    if (fs.existsSync(resolved)) {
      shell.showItemInFolder(resolved);
      return true;
    }
    if (fs.existsSync(targetPath)) {
      shell.showItemInFolder(targetPath);
      return true;
    }
    const dir = path.dirname(resolved);
    if (fs.existsSync(dir)) {
      await shell.openPath(dir);
      return true;
    }
    return false;
  } catch (err) {
    console.error('[app:show-item-in-folder] Error:', err);
    return false;
  }
});

const iconMemoryCache = new Map();

function getSearchDirectories() {
  const dirs = [
    path.join(process.env.USERPROFILE || '', 'OneDrive', 'Desktop'),
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop'),
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];
  try {
    const d = app.getPath('desktop');
    if (d && !dirs.includes(d)) dirs.unshift(d);
  } catch (e) {}
  return dirs.filter(Boolean);
}

let startAppsCache = null;
let lastStartAppsFetch = 0;

function getStartAppsList() {
  const now = Date.now();
  if (startAppsCache && (now - lastStartAppsFetch < 300000)) {
    return startAppsCache;
  }
  try {
    const { execSync } = require('child_process');
    const jsonStr = execSync('powershell -NoProfile -Command "Get-StartApps | ConvertTo-Json"', { timeout: 4000 }).toString();
    const data = JSON.parse(jsonStr);
    startAppsCache = Array.isArray(data) ? data : [data];
    lastStartAppsFetch = now;
  } catch (e) {
    if (!startAppsCache) startAppsCache = [];
  }
  return startAppsCache;
}

function findStartApp(identifier) {
  if (!identifier || typeof identifier !== 'string') return null;
  const trimmed = identifier.trim();
  if (!trimmed) return null;

  // If identifier contains path separators and exists on disk, it is a local file, NOT a Windows StartApp / AUMID
  const isPath = trimmed.includes('\\') || trimmed.includes('/');
  if (isPath && fs.existsSync(trimmed)) {
    return null;
  }

  const apps = getStartAppsList();
  if (!apps || apps.length === 0) return null;

  const cleanId = trimmed.replace(/^shell:appsfolder\\/i, '').trim().toLowerCase();

  // 1. Exact match on AppID
  let match = apps.find((a) => a.AppID && a.AppID.toLowerCase() === cleanId);
  if (match) return match;

  // 2. Exact match on Name
  match = apps.find((a) => a.Name && a.Name.toLowerCase() === cleanId);
  if (match) return match;

  // 3. If identifier is a path, only use the basename (without extension) for matching.
  // Never perform fuzzy or path-level substring search that matches directory names like "OneDrive".
  if (isPath) {
    const baseWithoutExt = path.basename(trimmed, path.extname(trimmed)).trim().toLowerCase();
    if (!baseWithoutExt) return null;
    match = apps.find((a) => a.Name && a.Name.toLowerCase() === baseWithoutExt);
    if (match) return match;
    match = apps.find((a) => a.AppID && a.AppID.toLowerCase() === baseWithoutExt);
    return match || null;
  }

  // 4. Non-path identifier: substring match (App's Name or AppID must contain query).
  // Never test cleanId.includes(a.Name) which reverses the search and misidentifies queries containing
  // folder or words like "onedrive".
  if (cleanId.length >= 3) {
    match = apps.find((a) => a.Name && a.Name.toLowerCase().includes(cleanId));
    if (match) return match;

    match = apps.find((a) => a.AppID && a.AppID.toLowerCase().includes(cleanId));
    if (match) return match;
  }

  return null;
}

function resolveShortcutPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return null;
  const trimmed = inputPath.trim();
  if (fs.existsSync(trimmed)) {
    try {
      if (fs.statSync(trimmed).isFile()) return trimmed;
    } catch (e) {}
  }

  const base = path.basename(trimmed);
  const nameWithoutExt = path.basename(trimmed, path.extname(trimmed));
  const candidateNames = [
    base,
    `${base}.lnk`,
    `${nameWithoutExt}.lnk`,
    `${nameWithoutExt}.exe`
  ];

  const searchDirs = getSearchDirectories();
  for (const dir of searchDirs) {
    for (const cand of candidateNames) {
      const full = path.join(dir, cand);
      if (fs.existsSync(full)) {
        try {
          if (fs.statSync(full).isFile()) return full;
          const innerLnk = path.join(full, `${cand}.lnk`);
          if (fs.existsSync(innerLnk) && fs.statSync(innerLnk).isFile()) return innerLnk;
          const innerNameLnk = path.join(full, `${nameWithoutExt}.lnk`);
          if (fs.existsSync(innerNameLnk) && fs.statSync(innerNameLnk).isFile()) return innerNameLnk;
        } catch (e) {}
      }
    }
  }

  // Also check 1 level of subdirectories in Start Menu Programs
  for (const dir of [
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ]) {
    if (fs.existsSync(dir)) {
      try {
        const subs = fs.readdirSync(dir, { withFileTypes: true });
        for (const sub of subs) {
          if (sub.isDirectory()) {
            for (const cand of candidateNames) {
              const full = path.join(dir, sub.name, cand);
              if (fs.existsSync(full)) {
                try {
                  if (fs.statSync(full).isFile()) return full;
                  const innerLnk = path.join(full, `${cand}.lnk`);
                  if (fs.existsSync(innerLnk) && fs.statSync(innerLnk).isFile()) return innerLnk;
                } catch (e) {}
              }
            }
          }
        }
      } catch (e) {}
    }
  }

  // Fallback: If inputPath matches a Windows StartApp (AUMID), resolve via its Name
  const startApp = findStartApp(inputPath);
  if (startApp && startApp.Name && startApp.Name !== inputPath) {
    return resolveShortcutPath(startApp.Name);
  }

  return null;
}

function extractTargetFromLnk(lnkPath) {
  try {
    if (!fs.existsSync(lnkPath)) return null;

    // 1. Try Electron native shell.readShortcutLink
    if (shell && typeof shell.readShortcutLink === 'function') {
      try {
        const link = shell.readShortcutLink(lnkPath);
        if (link) {
          if (link.icon && fs.existsSync(link.icon)) {
            return link.icon;
          }
          if (link.target) {
            const expanded = link.target.replace(/%([^%]+)%/g, (_, n) => process.env[n] || '');
            if (fs.existsSync(expanded)) return expanded;
          }
        }
      } catch (e) {}
    }

    // 2. Scan Latin1 string for standard Windows path to an executable
    const buf = fs.readFileSync(lnkPath);
    const latin1 = buf.toString('latin1');
    const asciiMatches = latin1.match(/[A-Za-z]:\\[^<>:"/|?*\x00-\x1f]+\.(?:exe|ico|bat|cmd)/gi);
    if (asciiMatches) {
      for (const m of asciiMatches) {
        if (fs.existsSync(m)) return m;
      }
    }

    // 3. Scan UTF-16LE unicode sequences for Windows path at both even and odd byte offsets (MSI Advertised shortcuts)
    for (let offset = 0; offset <= 1; offset++) {
      const slice = offset === 0 ? buf : buf.subarray(1);
      const utf16 = slice.toString('utf16le');
      const matches = utf16.match(/[A-Za-z]:\\[^<>:"/|?*\x00-\x1f]+\.(?:exe|ico|bat|cmd)/gi) || [];
      for (const m of matches) {
        const clean = m.trim();
        if (fs.existsSync(clean)) return clean;
      }
    }

    // 4. Fallback for common Windows Accessibility and System tools
    const baseName = path.basename(lnkPath, '.lnk').toLowerCase().replace(/\s+/g, '');
    const sys32 = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32');
    const systemMap = {
      livecaptions: path.join(sys32, 'LiveCaptions.exe'),
      magnify: path.join(sys32, 'magnify.exe'),
      narrator: path.join(sys32, 'Narrator.exe'),
      voiceaccess: path.join(sys32, 'VoiceAccess.exe'),
      taskmgr: path.join(sys32, 'Taskmgr.exe'),
      cmd: path.join(sys32, 'cmd.exe'),
      commandprompt: path.join(sys32, 'cmd.exe'),
      powershell: path.join(sys32, 'WindowsPowerShell\\v1.0\\powershell.exe'),
      snippingtool: path.join(sys32, 'SnippingTool.exe'),
      paint: path.join(sys32, 'mspaint.exe')
    };
    if (systemMap[baseName] && fs.existsSync(systemMap[baseName])) {
      return systemMap[baseName];
    }
  } catch (e) {}
  return null;
}

function getHelperScriptPath(scriptName) {
  const directPath = path.join(__dirname, scriptName);
  // 1. If running in development (unpacked), direct path is directly on disk
  if (!directPath.includes('app.asar') && fs.existsSync(directPath)) {
    return directPath;
  }

  // 2. Check unpacked directory created by electron-builder (asarUnpack)
  const unpackedPath = directPath.replace(/app\.asar([/\\]|$)/, 'app.asar.unpacked$1');
  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }

  const resUnpacked = path.join(process.resourcesPath || '', 'app.asar.unpacked', 'electron', scriptName);
  if (fs.existsSync(resUnpacked)) {
    return resUnpacked;
  }

  // 3. Ironclad runtime fallback: Extract bundled script from within app.asar to app userData directory
  // Node's fs inside Electron can read seamlessly from app.asar!
  try {
    const userData = app.getPath('userData');
    const targetDiskPath = path.join(userData, scriptName);
    if (fs.existsSync(directPath)) {
      const content = fs.readFileSync(directPath);
      if (!fs.existsSync(targetDiskPath) || fs.statSync(targetDiskPath).size !== content.length) {
        fs.writeFileSync(targetDiskPath, content);
      }
      return targetDiskPath;
    }
  } catch (err) {
    console.error(`[AppDock] Failed to extract ${scriptName} from asar:`, err);
  }

  return directPath;
}

function isGenericOrBrokenIcon(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return true;
  if (!dataUrl.startsWith('data:image/')) return true;
  // Generic IDI_APPLICATION window is 850-854 chars, blank images <= 860 chars
  if (dataUrl.length <= 860) return true;
  // Generic Windows shell shortcut overlay document icon (40x40 thumbnail, ~1006 chars)
  if (dataUrl.length >= 950 && dataUrl.length <= 1050 && dataUrl.includes('iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM')) {
    return true;
  }
  return false;
}

function extractIconWithPowerShell(filePath) {
  return new Promise((resolve) => {
    const scriptPath = getHelperScriptPath('icon-helper.ps1');
    if (!fs.existsSync(scriptPath)) return resolve(null);
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Action', 'Single', '-Path', filePath],
      { timeout: 3500, maxBuffer: 10 * 1024 * 1024 },
      (err, stdout) => {
        if (err || !stdout || !stdout.trim()) {
          return resolve(null);
        }
        const trimmed = stdout.trim();
        if (trimmed.startsWith('data:image/')) {
          return resolve(trimmed);
        }
        resolve(null);
      }
    );
  });
}

function extractIconsBatchWithPowerShell(filePaths) {
  return new Promise((resolve) => {
    const scriptPath = getHelperScriptPath('icon-helper.ps1');
    if (!fs.existsSync(scriptPath) || !filePaths || filePaths.length === 0) return resolve({});
    const pathsJoined = filePaths.join('|');
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Action', 'Batch', '-Paths', pathsJoined],
      { timeout: 8000, maxBuffer: 25 * 1024 * 1024 },
      (err, stdout) => {
        if (err || !stdout || !stdout.trim()) {
          return resolve({});
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          resolve(parsed || {});
        } catch {
          resolve({});
        }
      }
    );
  });
}

async function extractNativeIcon(filePath) {
  if (!filePath) return null;
  let resolvedPath = resolveShortcutPath(filePath) || filePath;
  if (!fs.existsSync(resolvedPath)) {
    const startApp = findStartApp(filePath);
    if (startApp) {
      const lnk = resolveShortcutPath(startApp.Name) || resolveShortcutPath(startApp.AppID);
      if (lnk && fs.existsSync(lnk)) {
        resolvedPath = lnk;
      }
    }
  }
  if (!fs.existsSync(resolvedPath)) return null;

  if (iconMemoryCache.has(resolvedPath)) {
    const cached = iconMemoryCache.get(resolvedPath);
    if (cached && !isGenericOrBrokenIcon(cached)) {
      return cached;
    }
  }

  const ext = path.extname(resolvedPath).toLowerCase();

  // 1. If the path itself is an image/icon file
  if (['.ico', '.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(ext)) {
    try {
      const mime = ext === '.ico' ? 'image/x-icon' : ext === '.svg' ? 'image/svg+xml' : ext === '.png' ? 'image/png' : 'image/jpeg';
      const buf = fs.readFileSync(resolvedPath);
      const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
      iconMemoryCache.set(resolvedPath, dataUrl);
      iconMemoryCache.set(filePath, dataUrl);
      return dataUrl;
    } catch (e) {}
  }

  // 2. High-fidelity extraction via native PowerShell icon-helper
  try {
    const psIcon = await extractIconWithPowerShell(resolvedPath);
    if (psIcon && !isGenericOrBrokenIcon(psIcon)) {
      iconMemoryCache.set(resolvedPath, psIcon);
      iconMemoryCache.set(filePath, psIcon);
      return psIcon;
    }
  } catch (e) {}

  // 3. Fallback: If it's a shortcut .lnk, try extracting the target executable or custom icon first
  if (ext === '.lnk') {
    const targetExe = extractTargetFromLnk(resolvedPath);
    if (targetExe && fs.existsSync(targetExe)) {
      const targetExt = path.extname(targetExe).toLowerCase();
      if (['.ico', '.png', '.jpg', '.jpeg', '.svg', '.webp'].includes(targetExt)) {
        try {
          const mime = targetExt === '.ico' ? 'image/x-icon' : targetExt === '.svg' ? 'image/svg+xml' : targetExt === '.png' ? 'image/png' : 'image/jpeg';
          const buf = fs.readFileSync(targetExe);
          const dataUrl = `data:${mime};base64,${buf.toString('base64')}`;
          iconMemoryCache.set(resolvedPath, dataUrl);
          iconMemoryCache.set(filePath, dataUrl);
          return dataUrl;
        } catch (e) {}
      }
      try {
        if (app && typeof app.getFileIcon === 'function') {
          const exeIcon = await app.getFileIcon(targetExe, { size: 'large' });
          if (exeIcon && !exeIcon.isEmpty()) {
            const dataUrl = exeIcon.toDataURL();
            if (!isGenericOrBrokenIcon(dataUrl)) {
              iconMemoryCache.set(resolvedPath, dataUrl);
              iconMemoryCache.set(filePath, dataUrl);
              return dataUrl;
            }
          }
        }
      } catch (e) {}
    }
  }

  // 4. Fallback: Direct native getFileIcon on resolved path (never on .lnk shortcuts, as SHGetFileInfo returns the generic shell sheet)
  if (ext !== '.lnk') {
    try {
      if (app && typeof app.getFileIcon === 'function') {
        const nativeIcon = await app.getFileIcon(resolvedPath, { size: 'large' });
        if (nativeIcon && !nativeIcon.isEmpty()) {
          const dataUrl = nativeIcon.toDataURL();
          if (!isGenericOrBrokenIcon(dataUrl)) {
            iconMemoryCache.set(resolvedPath, dataUrl);
            iconMemoryCache.set(filePath, dataUrl);
            return dataUrl;
          }
        }
      }
    } catch (e) {}
  }

  // 5. Handle .url with IconFile
  if (ext === '.url') {
    try {
      const content = fs.readFileSync(resolvedPath, 'utf8');
      const iconMatch = content.match(/IconFile=(.+)/i);
      if (iconMatch && iconMatch[1] && fs.existsSync(iconMatch[1].trim())) {
        const iconPath = iconMatch[1].trim();
        const urlIcon = await app.getFileIcon(iconPath, { size: 'large' });
        if (urlIcon && !urlIcon.isEmpty()) {
          const dataUrl = urlIcon.toDataURL();
          iconMemoryCache.set(resolvedPath, dataUrl);
          iconMemoryCache.set(filePath, dataUrl);
          return dataUrl;
        }
      }
    } catch (e) {}
  }

  iconMemoryCache.set(resolvedPath, null);
  iconMemoryCache.set(filePath, null);
  return null;
}

ipcMain.handle('app:extract-icon', async (event, filePath) => {
  return await extractNativeIcon(filePath);
});

ipcMain.handle('app:resolve-item', async (event, { name, target }) => {
  const trimmedTarget = (target || '').trim();
  const trimmedName = (name || '').trim();

  // 1. If target is an existing file on disk, resolve it directly!
  // Guard against corrupted target (e.g. target pointing to OneDrive.lnk when name is 'ManorLords')
  const isTargetOneDriveLnk = trimmedTarget.toLowerCase().endsWith('onedrive.lnk');
  const isNameCorruptedToOneDrive = trimmedName.toLowerCase() === 'onedrive';
  const targetBase = trimmedTarget ? path.basename(trimmedTarget, path.extname(trimmedTarget)) : '';

  if (trimmedTarget && fs.existsSync(trimmedTarget)) {
    try {
      if (fs.statSync(trimmedTarget).isFile()) {
        // If target is OneDrive.lnk but name is a different app (e.g. ManorLords), target was corrupted by the bug.
        // Don't treat it as valid target - let step 2/3 find the real shortcut for trimmedName!
        const isCorruptedOneDriveTarget = isTargetOneDriveLnk && !isNameCorruptedToOneDrive;
        if (!isCorruptedOneDriveTarget) {
          const icon = await extractNativeIcon(trimmedTarget);
          let resolvedName = trimmedName;
          const isTargetOneDrive =
            targetBase.toLowerCase() === 'onedrive' || trimmedTarget.toLowerCase().includes('onedrive.exe');
          // If name is missing or was mistakenly named 'OneDrive' while target is NOT onedrive, restore real name from targetBase
          if (!resolvedName || (isNameCorruptedToOneDrive && !isTargetOneDrive)) {
            resolvedName = targetBase;
          }
          return {
            target: trimmedTarget,
            icon,
            name: resolvedName
          };
        }
      }
    } catch (e) {}
  }

  // 2. Check if name or target matches a Windows StartApp (AUMID / Windows 11 Start Menu pinned item)
  let startApp = null;
  if (trimmedName && !isNameCorruptedToOneDrive) {
    startApp = findStartApp(trimmedName);
  }
  if (!startApp && trimmedTarget && (!isTargetOneDriveLnk || isNameCorruptedToOneDrive)) {
    startApp = findStartApp(trimmedTarget);
  }
  if (startApp) {
    const lnkPath = resolveShortcutPath(startApp.Name) || resolveShortcutPath(startApp.AppID);
    let icon = null;
    if (lnkPath) {
      icon = await extractNativeIcon(lnkPath);
    }
    return {
      name: startApp.Name,
      target: lnkPath || `shell:AppsFolder\\${startApp.AppID}`,
      icon
    };
  }

  // 3. Fallback: resolve via resolveShortcutPath
  let resolved = null;
  if (trimmedName && !isNameCorruptedToOneDrive) {
    resolved = resolveShortcutPath(trimmedName);
  }
  if (!resolved && trimmedTarget) {
    resolved = resolveShortcutPath(trimmedTarget);
  }
  if (resolved) {
    const icon = await extractNativeIcon(resolved);
    const base = path.basename(resolved, path.extname(resolved));
    let resolvedName = trimmedName;
    const isResolvedOneDrive = base.toLowerCase() === 'onedrive' || resolved.toLowerCase().includes('onedrive.exe');
    if (!resolvedName || (isNameCorruptedToOneDrive && !isResolvedOneDrive)) {
      resolvedName = base;
    }
    return { target: resolved, icon, name: resolvedName };
  }

  return null;
});

ipcMain.handle('app:scan-system', async () => {
  try {
    let desktopPath = '';
    try {
      desktopPath = app.getPath('desktop');
    } catch (e) {}

    // Only scan Desktop folders (fast, completely stable, pure desktop shortcuts)
    const desktopDirs = [
      desktopPath,
      path.join(process.env.USERPROFILE || '', 'Desktop'),
      path.join(process.env.OneDrive || '', 'Desktop'),
      path.join(process.env.USERPROFILE || '', 'OneDrive', 'Desktop'),
      path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop')
    ].filter(Boolean).filter((d, i, arr) => arr.indexOf(d) === i);

    const results = [];
    const seenNames = new Set();

    for (const dir of desktopDirs) {
      if (!fs.existsSync(dir)) continue;
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          // Strictly files directly on the desktop (depth 0, no folder recursion)
          if (!entry.isFile()) continue;
          const ext = path.extname(entry.name).toLowerCase();
          if (['.lnk', '.exe', '.url'].includes(ext)) {
            const name = path.basename(entry.name, ext);
            if (!seenNames.has(name.toLowerCase()) && !name.toLowerCase().includes('uninstall')) {
              seenNames.add(name.toLowerCase());
              results.push({ name, path: path.join(dir, entry.name), ext });
            }
          }
        }
      } catch (e) {
        // Ignore folder read or permission errors
      }
    }

    // High-performance batch icon extraction via PowerShell helper
    const allPaths = results.map((item) => item.path);
    const batchIcons = await extractIconsBatchWithPowerShell(allPaths);

    const withIcons = await Promise.all(
      results.map(async (item) => {
        let icon = batchIcons[item.path] || null;
        if (!icon || isGenericOrBrokenIcon(icon)) {
          try {
            icon = await extractNativeIcon(item.path);
          } catch (e) {
            icon = null;
          }
        }
        return { ...item, icon };
      })
    );

    return withIcons;
  } catch (err) {
    console.error('[app:scan-system] Desktop scan error:', err);
    return [];
  }
});

// ----------------- MEDIA IPC HANDLERS -----------------

let isMediaCheckInFlight = false;
let lastMediaCache = { hasMedia: false };
let lastMediaCheckTime = 0;

ipcMain.handle('media:get-state', async () => {
  const now = Date.now();
  // Return cached state if requested within 2.5 seconds (eliminates 90% of process spawns)
  if (now - lastMediaCheckTime < 2500) {
    return lastMediaCache;
  }
  // Prevent process stacking: if a query is already running, return the last known state
  if (isMediaCheckInFlight) {
    return lastMediaCache;
  }

  isMediaCheckInFlight = true;
  return new Promise((resolve) => {
    const mediaScript = getHelperScriptPath('media-helper.ps1');
    if (!fs.existsSync(mediaScript)) {
      isMediaCheckInFlight = false;
      return resolve(lastMediaCache);
    }

    let proc = null;
    let finished = false;

    const cleanup = () => {
      finished = true;
      isMediaCheckInFlight = false;
    };

    proc = exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${mediaScript}" -Action GetState`,
      { timeout: 2500 },
      (err, stdout) => {
        if (finished) return;
        cleanup();

        if (err || !stdout || !stdout.trim()) {
          lastMediaCheckTime = Date.now();
          return resolve(lastMediaCache);
        }
        try {
          const json = JSON.parse(stdout.trim());
          lastMediaCache = json;
          lastMediaCheckTime = Date.now();
          resolve(json);
        } catch {
          lastMediaCheckTime = Date.now();
          resolve(lastMediaCache);
        }
      }
    );

    // Hard kill watchdog to prevent orphan PowerShell processes if exec timeout doesn't tree-kill
    setTimeout(() => {
      if (!finished && proc && proc.pid) {
        try {
          exec(`taskkill /pid ${proc.pid} /T /F`, () => {});
        } catch {}
        cleanup();
        resolve(lastMediaCache);
      }
    }, 2800);
  });
});

ipcMain.handle('media:control', async (event, action) => {
  return new Promise((resolve) => {
    const mediaScript = getHelperScriptPath('media-helper.ps1');
    if (!fs.existsSync(mediaScript)) {
      return resolve({ success: false });
    }
    const cleanAction = ['Toggle', 'Next', 'Previous'].includes(action) ? action : 'Toggle';
    exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${mediaScript}" -Action ${cleanAction}`,
      { timeout: 2500 },
      (err) => {
        if (err) return resolve({ success: false });
        // Force refresh cache on next query
        lastMediaCheckTime = 0;
        resolve({ success: true });
      }
    );
  });
});

ipcMain.handle('storage:save', (event, payload) => {
  try {
    const userData = app.getPath('userData');
    const targetFile = path.join(userData, 'dock_backup.json');
    fs.writeFileSync(targetFile, payload, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('storage:load', () => {
  try {
    const userData = app.getPath('userData');
    const targetFile = path.join(userData, 'dock_backup.json');
    if (fs.existsSync(targetFile)) {
      return fs.readFileSync(targetFile, 'utf8');
    }
  } catch (err) {
    console.error('Failed to load backup JSON:', err);
  }
  return null;
});

// ----------------- AUTO-UPDATER & GITHUB RELEASES -----------------

function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.on('checking-for-update', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:checking-for-update');
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('[AutoUpdater] Update available:', info.version);
    const ver = (info.version || '').replace(/^[^\d]*/, '').replace(/[^\d.]*$/, '');
    const directExeUrl = `https://github.com/DevlopTecy/AppDock/releases/download/v${ver}/AppDock-Setup-${ver}.exe`;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : '',
        downloadUrl: directExeUrl,
        htmlUrl: `https://github.com/DevlopTecy/AppDock/releases/tag/v${ver}`
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('[AutoUpdater] Update not available:', info?.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:update-not-available', {
        version: info?.version,
        currentVersion: app.getVersion()
      });
    }
  });

  autoUpdater.on('error', (err) => {
    console.warn('[AutoUpdater] Error:', err ? err.message : err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:update-error', err ? err.message : 'Update check failed');
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:update-progress', {
        bytesPerSecond: progressObj.bytesPerSecond,
        percent: Math.round(progressObj.percent || 0),
        transferred: progressObj.transferred,
        total: progressObj.total
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('[AutoUpdater] Update downloaded:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:update-downloaded', {
        version: info.version
      });
    }
  });
}

function compareSemver(v1, v2) {
  const p1 = (v1 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = (v2 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

function checkGitHubReleases(repoSlug = 'DevlopTecy/AppDock') {
  return new Promise((resolve) => {
    const slug = (repoSlug && repoSlug.includes('/')) ? repoSlug.trim() : 'DevlopTecy/AppDock';
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${slug}/releases/latest`,
      headers: {
        'User-Agent': 'AppDock-Updater',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 6000
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const currentVersion = app.getVersion();
          if (res.statusCode === 200) {
            const release = JSON.parse(data);
            const latestVersion = (release.tag_name || '').replace(/^[^\d]*/, '').replace(/[^\d.]*$/, '');
            const isNewer = compareSemver(latestVersion, currentVersion) > 0;

            // Extract direct Windows installer executable if present in release assets
            let directExeUrl = release.html_url || '';
            if (Array.isArray(release.assets)) {
              const setupAsset = release.assets.find(
                (a) => a.name && (a.name.toLowerCase().includes('setup') && a.name.endsWith('.exe'))
              );
              const exeAsset = setupAsset || release.assets.find(
                (a) => a.name && (a.name.endsWith('.exe') || a.name.endsWith('.zip'))
              );
              if (exeAsset && exeAsset.browser_download_url) {
                directExeUrl = exeAsset.browser_download_url;
              }
            }

            const info = {
              success: true,
              hasUpdate: isNewer,
              version: latestVersion,
              currentVersion,
              releaseNotes: release.body || '',
              releaseDate: release.published_at || '',
              downloadUrl: directExeUrl,
              htmlUrl: release.html_url || ''
            };

            if (isNewer) {
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('dock:update-available', info);
              }
            } else {
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('dock:update-not-available', {
                  version: latestVersion,
                  currentVersion
                });
              }
            }
            resolve(info);
          } else if (res.statusCode === 404) {
            // No releases published yet on this repository; app is currently at latest
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('dock:update-not-available', {
                version: currentVersion,
                currentVersion
              });
            }
            resolve({ success: true, hasUpdate: false, currentVersion, latestVersion: currentVersion });
          } else if (res.statusCode === 403) {
            resolve({ success: false, hasUpdate: false, currentVersion, error: 'GitHub API rate limit exceeded' });
          } else {
            resolve({ success: false, hasUpdate: false, currentVersion, error: `GitHub returned status ${res.statusCode}` });
          }
        } catch (e) {
          resolve({ success: false, hasUpdate: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, hasUpdate: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, hasUpdate: false, error: 'Connection timed out' });
    });
  });
}

ipcMain.handle('dock:get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('dock:check-for-updates', async (event, customRepo) => {
  const ghResult = await checkGitHubReleases(customRepo);
  if (autoUpdater && app.isPackaged) {
    try {
      const nativeRes = await autoUpdater.checkForUpdates();
      if (nativeRes && nativeRes.updateInfo) {
        const nativeVer = (nativeRes.updateInfo.version || '').replace(/^[^\d]*/, '').replace(/[^\d.]*$/, '');
        if (compareSemver(nativeVer, app.getVersion()) > 0) {
          ghResult.hasUpdate = true;
          ghResult.version = nativeVer;
          ghResult.canAutoInstall = true;
        }
      }
    } catch (err) {
      console.warn('[AutoUpdater] checking via native updater failed:', err.message);
    }
  }
  return ghResult;
});

ipcMain.handle('dock:download-update', async () => {
  if (autoUpdater && app.isPackaged) {
    try {
      console.log('[AutoUpdater] Initiating downloadUpdate...');
      const downloadPromise = autoUpdater.downloadUpdate();
      downloadPromise.catch((err) => {
        console.warn('[AutoUpdater] downloadPromise error:', err ? err.message : err);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send('dock:update-error', err ? err.message : 'Download failed');
        }
      });
      return { success: true };
    } catch (err) {
      console.warn('[AutoUpdater] downloadUpdate call error:', err.message);
      return { success: false, error: err.message };
    }
  }
  return { success: false, error: 'In development mode, download from GitHub Releases' };
});

ipcMain.handle('dock:quit-and-install', () => {
  if (autoUpdater && app.isPackaged) {
    isQuitting = true;
    autoUpdater.quitAndInstall();
  } else {
    app.relaunch();
    app.exit(0);
  }
});

ipcMain.handle('dock:open-external-url', (event, url) => {
  if (url && typeof url === 'string') {
    shell.openExternal(url);
  }
});

// ----------------- PROCESS INTELLIGENCE & INDICATORS (Phase 2) -----------------
function queryRunningProcesses() {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve([]);
    exec('tasklist /FO CSV /NH', { windowsHide: true, timeout: 3500 }, (err, stdout) => {
      if (err || !stdout) return resolve([]);
      const lines = stdout.split(/\r?\n/);
      const set = new Set();
      for (const line of lines) {
        if (!line.trim()) continue;
        const match = line.match(/^"([^"]+)"/);
        if (match && match[1]) {
          const name = match[1].toLowerCase().replace(/\.exe$/i, '');
          set.add(name);
        }
      }
      resolve(Array.from(set));
    });
  });
}

ipcMain.handle('dock:get-running-processes', async () => {
  return await queryRunningProcesses();
});

ipcMain.handle('dock:bring-app-to-front', async (event, targetOrName) => {
  if (!targetOrName || process.platform !== 'win32') return false;
  const base = path.basename(targetOrName).replace(/\.(exe|lnk|url|appref-ms)$/i, '');
  return new Promise((resolve) => {
    const escaped = base.replace(/"/g, '`"');
    exec(`powershell -NoProfile -NonInteractive -Command "$ws = New-Object -ComObject WScript.Shell; $ws.AppActivate('${escaped}')"`, (err) => {
      resolve(!err);
    });
  });
});

ipcMain.handle('dock:close-app-process', async (event, targetOrName) => {
  if (!targetOrName || process.platform !== 'win32') return false;
  let base = path.basename(targetOrName).replace(/\.(lnk|url|appref-ms)$/i, '');
  if (!base.toLowerCase().endsWith('.exe')) {
    base = `${base}.exe`;
  }
  return new Promise((resolve) => {
    exec(`taskkill /IM "${base}" /T /F`, (err) => {
      resolve(!err);
    });
  });
});

// ----------------- ACTIVE WINDOW DODGE (Phase 3) -----------------
let smartDodgeEnabled = false;
let smartDodgeTimer = null;

function checkSmartWindowDodge() {
  if (!smartDodgeEnabled || !mainWindow || mainWindow.isDestroyed() || !isExpanded) return;
  const scriptPath = path.join(__dirname, 'window-dodge-helper.ps1');
  if (!fs.existsSync(scriptPath)) return;

  exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`, { timeout: 2000 }, (err, stdout) => {
    if (err || !stdout) return;
    const isMaximized = stdout.trim().toLowerCase() === 'true';
    if (isMaximized && isExpanded && mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:collapse');
    }
  });
}

ipcMain.handle('dock:set-smart-dodge', (event, enabled) => {
  smartDodgeEnabled = Boolean(enabled);
  if (smartDodgeEnabled && !smartDodgeTimer) {
    smartDodgeTimer = setInterval(checkSmartWindowDodge, 3500);
  } else if (!smartDodgeEnabled && smartDodgeTimer) {
    clearInterval(smartDodgeTimer);
    smartDodgeTimer = null;
  }
  return smartDodgeEnabled;
});

// ----------------- AUDIO SWITCHER & VOLUME (Phase 4) -----------------
const audioHelperScript = path.join(__dirname, 'audio-helper.ps1');

ipcMain.handle('dock:get-audio-devices', async () => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32' || !fs.existsSync(audioHelperScript)) {
      return resolve([]);
    }
    exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${audioHelperScript}" -Action GetDevices`, { timeout: 3000 }, (err, stdout) => {
      if (err || !stdout || !stdout.trim()) return resolve([]);
      try {
        const json = JSON.parse(stdout.trim());
        resolve(Array.isArray(json) ? json : [json]);
      } catch {
        resolve([]);
      }
    });
  });
});

ipcMain.handle('dock:set-audio-device', async (event, deviceId) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32' || !fs.existsSync(audioHelperScript)) return resolve(false);
    exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${audioHelperScript}" -Action SetDevice -DeviceId "${deviceId}"`, { timeout: 2000 }, (err) => {
      resolve(!err);
    });
  });
});

ipcMain.handle('dock:set-master-volume', async (event, volume) => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32' || !fs.existsSync(audioHelperScript)) return resolve(false);
    exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${audioHelperScript}" -Action SetVolume -Volume ${volume}`, { timeout: 2000 }, (err) => {
      resolve(!err);
    });
  });
});

ipcMain.handle('dock:toggle-audio-mute', async () => {
  return new Promise((resolve) => {
    if (process.platform !== 'win32' || !fs.existsSync(audioHelperScript)) return resolve(false);
    exec(`powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${audioHelperScript}" -Action ToggleMute`, { timeout: 2000 }, (err) => {
      resolve(!err);
    });
  });
});

// Start background process watcher after window is ready
let runningProcessInterval = null;
function startProcessWatcher() {
  if (runningProcessInterval) clearInterval(runningProcessInterval);
  runningProcessInterval = setInterval(async () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const list = await queryRunningProcesses();
      mainWindow.webContents.send('dock:running-apps-updated', list);
    }
  }, 4500);
}


// ----------------- APP LIFECYCLE -----------------

app.whenReady().then(() => {
  createTray();
  createWindow();
  setupAutoUpdater();
  startProcessWatcher();

  // Windows startup: Auto-start packaged AppDock on Windows boot, but strictly prevent dev Electron from registering
  if (process.platform === 'win32') {
    try {
      if (app.isPackaged) {
        // Auto setup when windows starts up for the installed desktop dock
        const current = app.getLoginItemSettings();
        if (!current.openAtLogin) {
          setAutoLaunchSetting(true);
        }
      } else {
        // In development mode, always remove auto-launch so dev Electron never runs on boot
        app.setLoginItemSettings({ openAtLogin: false });
      }
    } catch (e) {
      console.warn('[AutoLaunch] Startup check:', e.message);
    }
  }

  // Gentle auto-check after app starts up
  setTimeout(() => {
    if (autoUpdater && app.isPackaged) {
      autoUpdater.checkForUpdates().catch(() => {});
    }
  }, 6000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showDockWindow();
    }
  });
});

app.on('second-instance', () => {
  showDockWindow();
});

app.on('before-quit', () => {
  isQuitting = true;
});

app.on('window-all-closed', () => {
  if (isQuitting || process.platform !== 'darwin') {
    if (isQuitting) {
      app.quit();
    }
  }
});
