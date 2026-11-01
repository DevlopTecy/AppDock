const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('Phase 4 - Audio Switcher: electron/audio-helper.ps1 implements CoreAudio/Win32 actions', () => {
  const scriptPath = path.join(projectRoot, 'electron', 'audio-helper.ps1');
  assert.ok(fs.existsSync(scriptPath), 'audio-helper.ps1 must exist');
  const scriptContent = fs.readFileSync(scriptPath, 'utf8');
  assert.ok(scriptContent.includes('GetDevices'), 'audio helper must implement GetDevices');
  assert.ok(scriptContent.includes('SetDevice'), 'audio helper must implement SetDevice');
  assert.ok(scriptContent.includes('SetVolume'), 'audio helper must implement SetVolume');
  assert.ok(scriptContent.includes('ToggleMute'), 'audio helper must implement ToggleMute');
});

test('Phase 4 - Audio Switcher: electron/main.cjs registers IPC handlers for audio endpoints', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf8');
  assert.ok(mainContent.includes("ipcMain.handle('dock:get-audio-devices'"), 'main.cjs must handle dock:get-audio-devices');
  assert.ok(mainContent.includes("ipcMain.handle('dock:set-audio-device'"), 'main.cjs must handle dock:set-audio-device');
  assert.ok(mainContent.includes("ipcMain.handle('dock:set-master-volume'"), 'main.cjs must handle dock:set-master-volume');
  assert.ok(mainContent.includes("ipcMain.handle('dock:toggle-audio-mute'"), 'main.cjs must handle dock:toggle-audio-mute');
});

test('Phase 4 - Audio Switcher: electron/preload.cjs exposes audio management APIs', () => {
  const preloadContent = fs.readFileSync(path.join(projectRoot, 'electron', 'preload.cjs'), 'utf8');
  assert.ok(preloadContent.includes('getAudioDevices:'), 'preload.cjs must expose getAudioDevices');
  assert.ok(preloadContent.includes('setAudioDevice:'), 'preload.cjs must expose setAudioDevice');
  assert.ok(preloadContent.includes('setMasterVolume:'), 'preload.cjs must expose setMasterVolume');
  assert.ok(preloadContent.includes('toggleAudioMute:'), 'preload.cjs must expose toggleAudioMute');
});

test('Phase 4 - Audio Switcher: types/dock.ts includes audio in CompanionModuleType', () => {
  const typesContent = fs.readFileSync(path.join(projectRoot, 'src', 'types', 'dock.ts'), 'utf8');
  assert.ok(typesContent.includes("'audio'"), 'CompanionModuleType must include audio');
});

test('Phase 4 - Audio Switcher: AudioModule.tsx provides device switching and master volume control', () => {
  const modulePath = path.join(projectRoot, 'src', 'components', 'modules', 'AudioModule.tsx');
  assert.ok(fs.existsSync(modulePath), 'AudioModule.tsx must exist');
  const moduleContent = fs.readFileSync(modulePath, 'utf8');
  assert.ok(moduleContent.includes('getAudioDevices'), 'AudioModule must query audio devices');
  assert.ok(moduleContent.includes('setAudioDevice'), 'AudioModule must set audio device');
  assert.ok(moduleContent.includes('setMasterVolume'), 'AudioModule must adjust volume');
  assert.ok(moduleContent.includes('toggleAudioMute'), 'AudioModule must toggle mute');
});

test('Phase 4 - Audio Switcher: Sound button removed from ConnectorHub and integrated into SettingsView with flexible UI', () => {
  const hubContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'connectors', 'ConnectorHub.tsx'), 'utf8');
  assert.ok(!hubContent.includes('Audio Playback & Volume'), 'ConnectorHub must not render the old audio button below calendar');

  const settingsContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'SettingsView.tsx'), 'utf8');
  assert.ok(settingsContent.includes('Audio Playback Device'), 'SettingsView must render Audio Playback Device switcher');
  assert.ok(settingsContent.includes('getAudioDevices'), 'SettingsView must interact with audio endpoints');
});

