const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

test('Process 2: Start with Windows & Auto Setup Verification', async (t) => {
  await t.test('storage.ts defaults include autoStartWithWindows = true', () => {
    const storageCode = fs.readFileSync(path.join(__dirname, '../src/utils/storage.ts'), 'utf8');
    assert.ok(
      storageCode.includes('autoStartWithWindows: true'),
      'storage.ts should define autoStartWithWindows: true in DEFAULT_SETTINGS'
    );
  });

  await t.test('types/dock.ts includes autoStartWithWindows field in DockSettings', () => {
    const typesCode = fs.readFileSync(path.join(__dirname, '../src/types/dock.ts'), 'utf8');
    assert.ok(
      typesCode.includes('autoStartWithWindows?: boolean'),
      'types/dock.ts should include autoStartWithWindows?: boolean'
    );
  });

  await t.test('electron/preload.cjs exposes getAutoLaunch and setAutoLaunch', () => {
    const preloadCode = fs.readFileSync(path.join(__dirname, '../electron/preload.cjs'), 'utf8');
    assert.ok(
      preloadCode.includes("getAutoLaunch: () => ipcRenderer.invoke('dock:get-auto-launch')"),
      'preload should expose getAutoLaunch'
    );
    assert.ok(
      preloadCode.includes("setAutoLaunch: (enable) => ipcRenderer.invoke('dock:set-auto-launch', enable)"),
      'preload should expose setAutoLaunch'
    );
  });

  await t.test('electron/main.cjs registers dock:get-auto-launch and dock:set-auto-launch IPC handlers', () => {
    const mainCode = fs.readFileSync(path.join(__dirname, '../electron/main.cjs'), 'utf8');
    assert.ok(
      mainCode.includes("ipcMain.handle('dock:get-auto-launch'"),
      'main.cjs should handle dock:get-auto-launch'
    );
    assert.ok(
      mainCode.includes("ipcMain.handle('dock:set-auto-launch'"),
      'main.cjs should handle dock:set-auto-launch'
    );
    assert.ok(
      mainCode.includes("function getAutoLaunchSetting()"),
      'main.cjs should define getAutoLaunchSetting'
    );
    assert.ok(
      mainCode.includes("function setAutoLaunchSetting(enable)"),
      'main.cjs should define setAutoLaunchSetting'
    );
  });

  await t.test('electron/main.cjs tray menu includes Start with Windows checkbox', () => {
    const mainCode = fs.readFileSync(path.join(__dirname, '../electron/main.cjs'), 'utf8');
    assert.ok(
      mainCode.includes("label: 'Start with Windows'"),
      'tray menu should include Start with Windows item'
    );
    assert.ok(
      mainCode.includes("checked: getAutoLaunchSetting()"),
      'tray item should reflect getAutoLaunchSetting()'
    );
  });

  await t.test('src/App.tsx synchronizes autoStartWithWindows on startup', () => {
    const appCode = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');
    assert.ok(
      appCode.includes('setAutoLaunch(data.settings.autoStartWithWindows)'),
      'App.tsx should sync autoStartWithWindows with Electron'
    );
  });

  await t.test('src/components/SettingsView.tsx includes Start with Windows toggle control', () => {
    const settingsCode = fs.readFileSync(path.join(__dirname, '../src/components/SettingsView.tsx'), 'utf8');
    assert.ok(
      settingsCode.includes('Start with Windows'),
      'SettingsView should have Start with Windows heading'
    );
    assert.ok(
      settingsCode.includes('autoStartWithWindows: newVal'),
      'SettingsView should update autoStartWithWindows state'
    );
    assert.ok(
      settingsCode.includes('appDock.setAutoLaunch(newVal)'),
      'SettingsView should invoke appDock.setAutoLaunch'
    );
  });
});
