const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('Phase 1 - Sound FX: types/dock.ts includes SoundPackType and sound settings', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'types', 'dock.ts'), 'utf8');
  assert.ok(content.includes('export type SoundPackType'), 'types/dock.ts must export SoundPackType');
  assert.ok(content.includes('soundEnabled?: boolean;'), 'DockSettings must include soundEnabled');
  assert.ok(content.includes('soundVolume?: number;'), 'DockSettings must include soundVolume');
  assert.ok(content.includes('soundPack?: SoundPackType;'), 'DockSettings must include soundPack');
});

test('Phase 1 - Sound FX: storage.ts sets default sound enabled, volume, and pack', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'utils', 'storage.ts'), 'utf8');
  assert.ok(content.includes('soundEnabled: true'), 'DEFAULT_SETTINGS must have soundEnabled: true');
  assert.ok(content.includes('soundVolume: 50'), 'DEFAULT_SETTINGS must have soundVolume: 50');
  assert.ok(content.includes("soundPack: 'theme'"), "DEFAULT_SETTINGS must have soundPack: 'theme'");
});

test('Phase 1 - Sound FX: soundEngine.ts provides audio synthesis and configuration methods', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'utils', 'soundEngine.ts'), 'utf8');
  assert.ok(content.includes('class SoundEngine'), 'soundEngine.ts must define SoundEngine class');
  assert.ok(content.includes('setSoundEnabled'), 'soundEngine must support setSoundEnabled');
  assert.ok(content.includes('setSoundVolume'), 'soundEngine must support setSoundVolume');
  assert.ok(content.includes('setSoundPack'), 'soundEngine must support setSoundPack');
  assert.ok(content.includes('playClean'), 'soundEngine must support clean sound pack');
  assert.ok(content.includes('playMechanical'), 'soundEngine must support mechanical sound pack');
  assert.ok(content.includes('playEldenRing'), 'soundEngine must support eldenring sound pack');
  assert.ok(content.includes('playDeathNote'), 'soundEngine must support deathnote sound pack');
  assert.ok(content.includes('playKawaii'), 'soundEngine must support kawaii sound pack');
  assert.ok(content.includes('playAether'), 'soundEngine must support aether sound pack');
  assert.ok(content.includes('export const soundEngine = new SoundEngine();'), 'soundEngine must export singleton instance');
  assert.ok(content.includes('export const playSound ='), 'soundEngine must export playSound helper');
});

test('Phase 1 - Sound FX: SettingsView.tsx provides volume slider, profile picker, and preview chime', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'SettingsView.tsx'), 'utf8');
  assert.ok(content.includes('Audio Playback & Sound FX') || content.includes('Sound FX & Haptics'), 'SettingsView must render Sound FX section');
  assert.ok(content.includes('Toggle Acoustic Feedback'), 'SettingsView must render toggle switch for audio feedback');
  assert.ok(content.includes('Feedback Volume'), 'SettingsView must render volume slider');
  assert.ok(content.includes('Sound Profile Pack'), 'SettingsView must render sound pack options');
  assert.ok(content.includes('previewPackSample'), 'SettingsView must provide preview chime trigger');
});

test('Phase 1 - Sound FX: App.tsx and components trigger acoustic feedback on dock events', () => {
  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf8');
  assert.ok(appContent.includes("playSound('collapse', data.settings.theme)"), 'App.tsx must play collapse sound');
  assert.ok(appContent.includes("playSound('expand', data.settings.theme)"), 'App.tsx must play expand sound');
  assert.ok(appContent.includes("playSound('launch', data.settings.theme)"), 'App.tsx must play launch sound');

  const cardContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppCard.tsx'), 'utf8');
  assert.ok(cardContent.includes("playSound('hover')"), 'AppCard must trigger hover sound');

  const dockContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'DockFrame.tsx'), 'utf8');
  assert.ok(dockContent.includes("playSound('click', theme)"), 'DockFrame must trigger click sounds');
});

