const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');

test('BUG-01: App.tsx Escape key handler includes isEditGroupModalOpen in dependencies', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    content.includes('isEditGroupModalOpen, isSettingsOpen, isSearchOpen, isExpanded, handleToggle]'),
    'App.tsx keydown effect must list isEditGroupModalOpen in its dependency array'
  );
});

test('BUG-02: AppGrid.tsx handleDrop resets draggedItemId and dragOverItemId on drop over grid', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppGrid.tsx'), 'utf-8');
  assert.ok(
    content.includes('setDraggedItemId(null)') && content.includes('setDragOverItemId(null)'),
    'AppGrid.tsx handleDrop must clear drag state when cards or files are dropped'
  );
});

test('BUG-03: AppGrid.tsx handleCardDrop checks for external files dropped onto existing cards', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppGrid.tsx'), 'utf-8');
  assert.ok(
    content.includes('e.dataTransfer.files') && content.includes('onDropFiles(e.dataTransfer.files)'),
    'AppGrid.tsx handleCardDrop must forward external file drops to onDropFiles'
  );
});

test('BUG-04: App.tsx and DockFrame use dynamic companion width (54px idle / 340px active) to prevent ghost hitbox', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    content.includes('activeModule ? 340 : 54'),
    'App.tsx must pass dynamic companion width (54px idle / 340px active) to prevent ghost hitbox'
  );
});

test('BUG-05: WeatherModule.tsx includes safe timeout signal fallback helper', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'modules', 'WeatherModule.tsx'), 'utf-8');
  assert.ok(
    content.includes('createTimeoutSignal'),
    'WeatherModule.tsx must use createTimeoutSignal to support diverse Chromium runtimes'
  );
  assert.ok(
    content.includes('AbortController'),
    'WeatherModule.tsx createTimeoutSignal must include AbortController fallback'
  );
});

test('BUG-06: MusicModule.tsx shuffle avoids selecting identical current track', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'modules', 'MusicModule.tsx'), 'utf-8');
  assert.ok(
    content.includes('while (nextIdx === trackIndex)'),
    'MusicModule.tsx shuffle must loop while nextIdx matches trackIndex when playlist length > 1'
  );
});

test('BUG-07 & BUG-08: App.tsx initializes storage once and cleans up cachedModule after close', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    content.includes('const initialDockData = (() => {'),
    'App.tsx must initialize initialDockData once'
  );
  assert.ok(
    content.includes('setCachedModule(null)') && content.includes('setTimeout'),
    'App.tsx must reset cachedModule to null after unmount transition'
  );
});

test('BUG-10: App.tsx dimension guard verifies typeof === "number"', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    content.includes("typeof partial.drawerWidth === 'number' || typeof partial.drawerHeight === 'number'"),
    'App.tsx must check typeof === number rather than truthiness'
  );
});

test('BUG-13 & BUG-14: Modal dialogs include custom backdrops for fantasy/anime themes', () => {
  const addModal = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AddItemModal.tsx'), 'utf-8');
  const newGroupModal = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'NewGroupModal.tsx'), 'utf-8');
  const editGroupModal = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'EditGroupModal.tsx'), 'utf-8');
  const searchBar = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'SearchBar.tsx'), 'utf-8');

  for (const [name, code] of [
    ['AddItemModal', addModal],
    ['NewGroupModal', newGroupModal],
    ['EditGroupModal', editGroupModal],
    ['SearchBar', searchBar]
  ]) {
    assert.ok(code.includes('eldenring-modal-bg') || code.includes('vertical_golden_tree_wallpaper'), `${name} must support Elden Ring backdrop`);
    assert.ok(code.includes('onepiece-modal-bg') || code.includes('portrait_ship_background'), `${name} must support One Piece backdrop`);
    assert.ok(code.includes('candy-modal-bg') || code.includes('sweet_home_candy_cottage'), `${name} must support Candy backdrop`);
    assert.ok(code.includes('aether-modal-bg') || code.includes('wallpaper_aether_sky'), `${name} must support Aether backdrop`);
  }
});

test('BUG-15: Internal card dragging never triggers file drop overlay or creates dummy download files', () => {
  const gridContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppGrid.tsx'), 'utf-8');
  assert.ok(
    gridContent.includes('application/x-appdock-item'),
    'AppGrid.tsx must tag internal card drags with application/x-appdock-item'
  );
  assert.ok(
    gridContent.includes('!draggedItemId && types.includes(\'Files\')'),
    'AppGrid.tsx must only activate file drop overlay if draggedItemId is null and files are dragged'
  );

  const cardContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppCard.tsx'), 'utf-8');
  assert.ok(
    cardContent.includes('draggable={false}'),
    'AppCard.tsx icon img must have draggable={false} to prevent Chromium creating dummy download files'
  );
});

test('BUG-16: Main handle EdgeToggle remains pinned to screen edge and handleToggle synchronizes Electron bounds before React state switch', () => {
  const dockFrameContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'DockFrame.tsx'), 'utf-8');
  assert.ok(
    dockFrameContent.includes('isRight ? 0 : undefined') || dockFrameContent.includes('justifyContent: isRight ? \'flex-end\''),
    'DockFrame.tsx collapsed state must pin EdgeToggle flush to screen edge'
  );

  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    appContent.includes('await (window as any).appDock.setState(true)') &&
    appContent.indexOf('await (window as any).appDock.setState(true)') < appContent.lastIndexOf('setIsExpanded(true)'),
    'App.tsx handleToggle must await Electron window resize before calling setIsExpanded(true)'
  );
});


