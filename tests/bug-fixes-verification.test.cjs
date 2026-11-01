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

test('BUG-17: Auto-launch enables for packaged app on Windows boot and never auto-registers in development mode', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf-8');
  assert.ok(
    mainContent.includes('!app.isPackaged && openAtLogin') && mainContent.includes('Skipping auto-launch'),
    'main.cjs setAutoLaunchSetting must skip registration in dev mode'
  );
  assert.ok(
    mainContent.includes('if (app.isPackaged)') && mainContent.includes('setAutoLaunchSetting(true)'),
    'main.cjs startup lifecycle must enable auto-launch for packaged app'
  );

  const storageContent = fs.readFileSync(path.join(projectRoot, 'src', 'utils', 'storage.ts'), 'utf-8');
  assert.ok(
    storageContent.includes('autoStartWithWindows: true'),
    'storage.ts DEFAULT_SETTINGS must default autoStartWithWindows to true'
  );
});

test('BUG-18: isGenericOrBrokenIcon accepts web favicon URLs and AppCard derives high-res Google favicon fallback', () => {
  const assetsContent = fs.readFileSync(path.join(projectRoot, 'src', 'utils', 'assets.ts'), 'utf-8');
  assert.ok(
    assetsContent.includes("dataUrl.startsWith('http://') || dataUrl.startsWith('https://')"),
    'assets.ts isGenericOrBrokenIcon must accept http and https web URLs'
  );

  const cardContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppCard.tsx'), 'utf-8');
  assert.ok(
    cardContent.includes('googleFaviconUrl') && cardContent.includes('s2/favicons?domain='),
    'AppCard.tsx must derive Google high-res favicon fallback for web links'
  );
});

test('BUG-19: AppGrid context menu includes Edit URL & Name for web links and renders EditItemModal', () => {
  const gridContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppGrid.tsx'), 'utf-8');
  assert.ok(
    gridContent.includes('Edit URL & Name'),
    'AppGrid.tsx context menu must include Edit URL & Name for web links'
  );
  assert.ok(
    gridContent.includes('<EditItemModal'),
    'AppGrid.tsx must render EditItemModal component'
  );

  const editModalContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'EditItemModal.tsx'), 'utf-8');
  assert.ok(
    editModalContent.includes('WEB URL') && editModalContent.includes('DISPLAY NAME'),
    'EditItemModal.tsx must contain inputs for WEB URL and DISPLAY NAME'
  );
  assert.ok(
    editModalContent.includes('previewFaviconUrl'),
    'EditItemModal.tsx must provide live preview favicon'
  );
});




test('BUG-20: autoUpdater disables differential download and UpdateNotification listens to errors and provides watchdog fallback', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf-8');
  assert.ok(
    mainContent.includes('autoUpdater.disableDifferentialDownload = true'),
    'main.cjs must set autoUpdater.disableDifferentialDownload = true to prevent stall on GitHub'
  );
  assert.ok(
    mainContent.includes('setupAsset') && mainContent.includes(".toLowerCase().includes('setup')"),
    'main.cjs checkGitHubReleases must prioritize Setup installer asset'
  );

  const notifContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'UpdateNotification.tsx'), 'utf-8');
  assert.ok(
    notifContent.includes('onUpdateError'),
    'UpdateNotification.tsx must register onUpdateError listener'
  );
  assert.ok(
    notifContent.includes('showManualFallback') && notifContent.includes('openManualDownload'),
    'UpdateNotification.tsx must provide manual browser download fallback when download stalls or fails'
  );
});

test('BUG-21: Group delete confirmation modal uses createPortal to document.body and high z-index', () => {
  const sidebarContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'GroupSidebar.tsx'), 'utf-8');
  assert.ok(
    sidebarContent.includes('confirmDeleteGroup &&') && sidebarContent.includes('createPortal(') && sidebarContent.includes('document.body'),
    'GroupSidebar.tsx must render confirmDeleteGroup inside createPortal(..., document.body)'
  );
  assert.ok(
    sidebarContent.includes('zIndex: 100000'),
    'confirmDeleteGroup dialog must have zIndex: 100000 so it is never trapped behind UI'
  );
});

test('BUG-22: AUMID StartApp resolution, launch, and icon extraction', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf-8');
  assert.ok(
    mainContent.includes('findStartApp') && mainContent.includes('Get-StartApps'),
    'main.cjs must implement findStartApp to resolve Windows AUMIDs'
  );
  assert.ok(
    mainContent.includes('shell:AppsFolder\\'),
    'main.cjs launch-path and resolve-item must handle shell:AppsFolder\\ protocol'
  );

  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    appContent.includes('const EXT_REGEX = /\\.(exe|lnk|url|bat|cmd|appref-ms|ico|png|jpg|jpeg|svg|webp)$/i;'),
    'App.tsx handleDropFiles must only strip real file extensions and preserve AUMIDs'
  );
  assert.ok(
    appContent.includes('item.name.toLowerCase() === \'google\'') || appContent.includes('isMismatchedAumid'),
    'App.tsx repairItems must detect and repair mismatched AUMID / Google items'
  );
});

test('BUG-23: Internal card drag does not trigger file drop overlay or create download cards', () => {
  const gridContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppGrid.tsx'), 'utf-8');
  assert.ok(
    gridContent.includes('draggedItemIdRef') && gridContent.includes('isInternalCardDrag'),
    'AppGrid.tsx must track internal card drag synchronously with ref and flag'
  );
  assert.ok(
    gridContent.includes('if (isInternalCardDrag)') && gridContent.includes('setIsDragOver(false)'),
    'AppGrid.tsx handleDragOver must never show file drop overlay during internal card drag'
  );
  assert.ok(
    gridContent.includes('if (sourceId)') && gridContent.includes('return;'),
    'AppGrid.tsx handleCardDrop must return after internal reorder without checking files'
  );

  const cardContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'AppCard.tsx'), 'utf-8');
  assert.ok(
    cardContent.includes("WebkitUserDrag: 'none'") && cardContent.includes("pointerEvents: 'none'"),
    'AppCard.tsx img must have pointerEvents: none and WebkitUserDrag: none to prevent synthetic download file drag'
  );

  const appContent = fs.readFileSync(path.join(projectRoot, 'src', 'App.tsx'), 'utf-8');
  assert.ok(
    appContent.includes('isSyntheticDownload'),
    'App.tsx must discard synthetic download files and clean them up from storage'
  );
});

test('BUG-24: Collapsed tab screen center matches expanded drawer handle center across all vertical ratios', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf-8');
  assert.ok(
    mainContent.includes('const tabCenterY = Math.round(centerY + (h - tabH) / 2);'),
    'main.cjs calculateBounds must align collapsed tab vertical center exactly with expanded drawer handle'
  );

  // Mathematical verification: test across multiple vertical ratios
  const workArea = { x: 0, y: 0, width: 1920, height: 1080 };
  const tabH = 64;
  const h = 580;

  [0.05, 0.2, 0.35, 0.5, 0.7, 0.85, 0.95].forEach((vertRatio) => {
    const safeRatio = Math.max(0.02, Math.min(0.98, vertRatio));
    const centerY = Math.round(workArea.y + (workArea.height - h) * safeRatio);
    const tabCenterY = Math.round(centerY + (h - tabH) / 2);

    const expandedHandleCenterY = centerY + h / 2;
    const collapsedHandleCenterY = tabCenterY + tabH / 2;

    assert.ok(
      Math.abs(expandedHandleCenterY - collapsedHandleCenterY) <= 0.5,
      `Vertical handle center must match on screen for ratio ${vertRatio}: expanded ${expandedHandleCenterY} vs collapsed ${collapsedHandleCenterY}`
    );
  });
});
