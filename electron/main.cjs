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
let currentPosition = 'left';
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
  const h = Math.min(drawerHeight, workArea.height - 40);
  const safeRatio = Math.max(0.02, Math.min(0.98, typeof vertRatio === 'number' ? vertRatio : 0.5));
  const centerY = Math.round(workArea.y + (workArea.height - h) * safeRatio);
  const tabCenterY = Math.round(workArea.y + (workArea.height - tabH) * safeRatio);

  // Dynamic companion width: 340px when companion module is active, 54px when only Hub button is displayed, 0 in Clean Dock mode (moduleWidth < 0)
  const companionW = expanded ? (moduleWidth > 54 ? 340 : (moduleWidth < 0 ? 0 : 54)) : 0;
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
    const companionH = 220;
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
  if (typeof width === 'number' && width >= 140 && width <= 600) {
    drawerWidth = Math.round(width);
  }
  if (typeof height === 'number' && height >= 200 && height <= 1000) {
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

ipcMain.handle('app:launch-path', async (event, targetPath) => {
  try {
    if (!targetPath || typeof targetPath !== 'string') {
      return { success: false, error: 'Empty or invalid path' };
    }
    const resolvedPath = resolveShortcutPath(targetPath) || targetPath.trim();
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

function resolveShortcutPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return null;
  const trimmed = inputPath.trim();
  if (fs.existsSync(trimmed)) return trimmed;

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
      if (fs.existsSync(full)) return full;
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
              if (fs.existsSync(full)) return full;
            }
          }
        }
      } catch (e) {}
    }
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

    // 3. Scan UTF-16LE unicode sequences for Windows path
    const unicodeMatches = [];
    for (let i = 0; i < buf.length - 8; i += 2) {
      if (
        buf[i + 1] === 0 &&
        /[A-Za-z]/.test(String.fromCharCode(buf[i])) &&
        buf[i + 2] === 58 &&
        buf[i + 3] === 0 &&
        buf[i + 4] === 92 &&
        buf[i + 5] === 0
      ) {
        let str = '';
        for (let j = i; j < buf.length - 1; j += 2) {
          if (buf[j + 1] !== 0 || buf[j] < 32 || buf[j] > 126) break;
          str += String.fromCharCode(buf[j]);
        }
        if (str.length > 5) unicodeMatches.push(str);
      }
    }
    for (const m of unicodeMatches) {
      const candidates = [m, ...m.split(/[=;]/)];
      for (const cand of candidates) {
        const clean = cand.trim();
        if (/\.(?:exe|ico|bat|cmd)$/i.test(clean) && fs.existsSync(clean)) {
          return clean;
        }
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

async function extractNativeIcon(filePath) {
  if (!filePath) return null;
  const resolvedPath = resolveShortcutPath(filePath) || filePath;
  if (!fs.existsSync(resolvedPath)) return null;

  if (iconMemoryCache.has(resolvedPath)) {
    return iconMemoryCache.get(resolvedPath);
  }

  const ext = path.extname(resolvedPath).toLowerCase();

  // If the path itself is an image/icon file
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

  // If it's a shortcut .lnk, try extracting the target executable or custom icon first
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
            iconMemoryCache.set(resolvedPath, dataUrl);
            iconMemoryCache.set(filePath, dataUrl);
            return dataUrl;
          }
        }
      } catch (e) {}
    }
  }

  // Direct native getFileIcon on resolved path
  try {
    if (app && typeof app.getFileIcon === 'function') {
      const nativeIcon = await app.getFileIcon(resolvedPath, { size: 'large' });
      if (nativeIcon && !nativeIcon.isEmpty()) {
        const dataUrl = nativeIcon.toDataURL();
        iconMemoryCache.set(resolvedPath, dataUrl);
        iconMemoryCache.set(filePath, dataUrl);
        return dataUrl;
      }
    }
  } catch (e) {}

  // Handle .url with IconFile
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
  const resolved = resolveShortcutPath(target) || resolveShortcutPath(name);
  if (resolved) {
    const icon = await extractNativeIcon(resolved);
    return { target: resolved, icon };
  }
  return null;
});

ipcMain.handle('app:scan-system', async () => {
  let desktopPath = '';
  try {
    desktopPath = app.getPath('desktop');
  } catch (e) {}

  const desktopDirs = [
    desktopPath,
    path.join(process.env.USERPROFILE || '', 'Desktop'),
    path.join(process.env.USERPROFILE || '', 'OneDrive', 'Desktop'),
    path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop'),
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.PROGRAMDATA || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ].filter(Boolean).filter((d, i, arr) => arr.indexOf(d) === i);

  const results = [];
  const seenNames = new Set();

  function scanDir(dir, depth = 0) {
    if (depth > 2 || !fs.existsSync(dir)) return;
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanDir(fullPath, depth + 1);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.lnk', '.exe', '.url'].includes(ext)) {
            const name = path.basename(entry.name, ext);
            if (!seenNames.has(name.toLowerCase()) && !name.toLowerCase().includes('uninstall')) {
              seenNames.add(name.toLowerCase());
              results.push({ name, path: fullPath, ext });
            }
          }
        }
      }
    } catch (e) {
      // Ignore permission errors
    }
  }

  for (const d of desktopDirs) {
    scanDir(d);
  }

  // Limit and extract in small concurrent batches of 4 to avoid CPU/RAM thrashing
  const topItems = results.slice(0, 80);
  const withIcons = [];
  const chunkSize = 4;
  for (let i = 0; i < topItems.length; i += chunkSize) {
    const chunk = topItems.slice(i, i + chunkSize);
    const chunkRes = await Promise.all(
      chunk.map(async (item) => {
        const icon = await extractNativeIcon(item.path);
        return { ...item, icon };
      })
    );
    withIcons.push(...chunkRes);
  }

  return withIcons;
});

// ----------------- MEDIA IPC HANDLERS -----------------

const mediaHelperScript = path.join(__dirname, 'media-helper.ps1');
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
    if (!fs.existsSync(mediaHelperScript)) {
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
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${mediaHelperScript}" -Action GetState`,
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
    if (!fs.existsSync(mediaHelperScript)) {
      return resolve({ success: false });
    }
    const cleanAction = ['Toggle', 'Next', 'Previous'].includes(action) ? action : 'Toggle';
    exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${mediaHelperScript}" -Action ${cleanAction}`,
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
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('dock:update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
        releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : ''
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
            if (isNewer) {
              const info = {
                version: latestVersion,
                releaseNotes: release.body || '',
                releaseDate: release.published_at || '',
                downloadUrl: release.html_url || ''
              };
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('dock:update-available', info);
              }
              resolve({ hasUpdate: true, ...info });
            } else {
              if (mainWindow && !mainWindow.isDestroyed()) {
                mainWindow.webContents.send('dock:update-not-available', {
                  version: latestVersion,
                  currentVersion
                });
              }
              resolve({ hasUpdate: false, currentVersion, latestVersion });
            }
          } else if (res.statusCode === 404) {
            // No releases published yet on this repository; app is currently at the latest/newest version
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.webContents.send('dock:update-not-available', {
                version: currentVersion,
                currentVersion
              });
            }
            resolve({ hasUpdate: false, currentVersion, latestVersion: currentVersion });
          } else {
            resolve({ hasUpdate: false, error: `GitHub API returned ${res.statusCode}` });
          }
        } catch (e) {
          resolve({ hasUpdate: false, error: e.message });
        }
      });
    });

    req.on('error', (err) => {
      resolve({ hasUpdate: false, error: err.message });
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ hasUpdate: false, error: 'Connection timed out' });
    });
  });
}

ipcMain.handle('dock:get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('dock:check-for-updates', async (event, customRepo) => {
  if (autoUpdater && app.isPackaged) {
    try {
      const res = await autoUpdater.checkForUpdates();
      return { success: true, result: res };
    } catch (err) {
      console.warn('[AutoUpdater] checking via native updater failed:', err.message);
    }
  }
  return checkGitHubReleases(customRepo);
});

ipcMain.handle('dock:download-update', async () => {
  if (autoUpdater && app.isPackaged) {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (err) {
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

// ----------------- APP LIFECYCLE -----------------

app.whenReady().then(() => {
  createTray();
  createWindow();
  setupAutoUpdater();

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
