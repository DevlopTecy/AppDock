const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('Phase 2 - Running Indicators: electron/main.cjs registers IPC handlers and periodic process scanner', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf8');
  assert.ok(mainContent.includes("ipcMain.handle('dock:get-running-processes'"), 'main.cjs must handle dock:get-running-processes');
  assert.ok(mainContent.includes("ipcMain.handle('dock:bring-app-to-front'"), 'main.cjs must handle dock:bring-app-to-front');
  assert.ok(mainContent.includes("ipcMain.handle('dock:close-app-process'"), 'main.cjs must handle dock:close-app-process');
  assert.ok(mainContent.includes("startProcessWatcher()"), 'main.cjs must call startProcessWatcher on ready');
});

test('Phase 2 - Running Indicators: electron/preload.cjs exposes process methods and event listener', () => {
  const preloadContent = fs.readFileSync(path.join(projectRoot, 'electron', 'preload.cjs'), 'utf8');
  assert.ok(preloadContent.includes('getRunningProcesses:'), 'preload.cjs must expose getRunningProcesses');
  assert.ok(preloadContent.includes('bringAppToFront:'), 'preload.cjs must expose bringAppToFront');
  assert.ok(preloadContent.includes('closeAppProcess:'), 'preload.cjs must expose closeAppProcess');
  assert.ok(preloadContent.includes('onRunningAppsChanged:'), 'preload.cjs must expose onRunningAppsChanged');
});

test('Phase 2 - Running Indicators: App.tsx subscribes to process updates and passes state', () => {
  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf8');
  assert.ok(appContent.includes('const [runningProcesses, setRunningProcesses]'), 'App.tsx must maintain runningProcesses state');
  assert.ok(appContent.includes('onRunningAppsChanged'), 'App.tsx must listen to onRunningAppsChanged');
  assert.ok(appContent.includes('runningProcesses={runningProcesses}'), 'App.tsx must pass runningProcesses to AppGrid');
});

test('Phase 2 - Running Indicators: AppCard and QuickIconsBar render illuminated status dots', () => {
  const cardContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppCard.tsx'), 'utf8');
  assert.ok(cardContent.includes('showRunningIndicator && isRunning'), 'AppCard must check showRunningIndicator && isRunning');
  assert.ok(cardContent.includes('#10b981'), 'AppCard must render glowing green status dot');

  const quickContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'QuickIconsBar.tsx'), 'utf8');
  assert.ok(quickContent.includes('isQuickItemRunning(item)'), 'QuickIconsBar must compute isQuickItemRunning');
  assert.ok(quickContent.includes('#10b981'), 'QuickIconsBar must render glowing green status dot');
});

test('Phase 2 - Running Indicators: AppGrid context menu includes Bring to Front and Close Process', () => {
  const gridContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppGrid.tsx'), 'utf8');
  assert.ok(gridContent.includes('isItemRunning(contextMenu.item)'), 'AppGrid must check if context menu item is running');
  assert.ok(gridContent.includes('Bring to Front'), 'AppGrid context menu must include Bring to Front');
  assert.ok(gridContent.includes('Close Process'), 'AppGrid context menu must include Close Process');
});
