const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('Phase 3 - Smart Dodge: electron/window-dodge-helper.ps1 checks foreground window state', () => {
  const scriptPath = path.join(projectRoot, 'electron', 'window-dodge-helper.ps1');
  assert.ok(fs.existsSync(scriptPath), 'window-dodge-helper.ps1 must exist');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  assert.ok(scriptContent.includes('GetForegroundWindow'), 'helper must invoke GetForegroundWindow');
  assert.ok(scriptContent.includes('IsZoomed'), 'helper must invoke IsZoomed');
});

test('Phase 3 - Smart Dodge: electron/main.cjs handles dock:set-smart-dodge and monitors maximized windows', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf8');
  assert.ok(mainContent.includes("ipcMain.handle('dock:set-smart-dodge'"), 'main.cjs must handle dock:set-smart-dodge');
  assert.ok(mainContent.includes('checkSmartWindowDodge'), 'main.cjs must implement checkSmartWindowDodge');
  assert.ok(mainContent.includes("mainWindow.webContents.send('dock:collapse')"), 'main.cjs must trigger collapse when maximized');
});

test('Phase 3 - Smart Dodge: electron/preload.cjs exposes setSmartDodge bridge', () => {
  const preloadContent = fs.readFileSync(path.join(projectRoot, 'electron', 'preload.cjs'), 'utf8');
  assert.ok(preloadContent.includes('setSmartDodge:'), 'preload.cjs must expose setSmartDodge');
});

test('Phase 3 - Smart Dodge: types and storage define smartWindowDodge', () => {
  const typesContent = fs.readFileSync(path.join(projectRoot, 'src', 'types', 'dock.ts'), 'utf8');
  assert.ok(typesContent.includes('smartWindowDodge?: boolean;'), 'types/dock.ts must include smartWindowDodge');

  const storageContent = fs.readFileSync(path.join(projectRoot, 'src', 'utils', 'storage.ts'), 'utf8');
  assert.ok(storageContent.includes('smartWindowDodge: false'), 'storage.ts must default smartWindowDodge: false');
});

test('Phase 3 - Smart Dodge: SettingsView.tsx provides Smart Window Dodge toggle', () => {
  const settingsContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'SettingsView.tsx'), 'utf8');
  assert.ok(settingsContent.includes('Smart Window Dodge'), 'SettingsView must render Smart Window Dodge');
  assert.ok(settingsContent.includes('Toggle Smart Window Dodge'), 'SettingsView must render toggle switch');
});

test('Phase 3 - Smart Dodge: App.tsx synchronizes smart dodge setting with Electron', () => {
  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf8');
  assert.ok(appContent.includes('setSmartDodge(Boolean(data.settings.smartWindowDodge))'), 'App.tsx must sync setting to Electron');
});

