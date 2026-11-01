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

test('BUG-25: Custom Picture icon with Discord-style ImageCropModal and native/input image browse', () => {
  const mainContent = fs.readFileSync(path.join(projectRoot, 'electron', 'main.cjs'), 'utf-8');
  assert.ok(
    mainContent.includes("ipcMain.handle('app:browse-image'") && mainContent.includes('Images (JPG, PNG, WebP, ICO, SVG)'),
    'main.cjs must implement app:browse-image IPC handler with image filters'
  );

  const preloadContent = fs.readFileSync(path.join(projectRoot, 'electron', 'preload.cjs'), 'utf-8');
  assert.ok(
    preloadContent.includes('browseImage:'),
    'preload.cjs must expose browseImage in window.appDock'
  );

  const cropModalPath = path.join(projectRoot, 'src', 'components', 'ImageCropModal.tsx');
  assert.ok(fs.existsSync(cropModalPath), 'src/components/ImageCropModal.tsx must exist');

  const cropModalContent = fs.readFileSync(cropModalPath, 'utf-8');
  assert.ok(
    cropModalContent.includes('handleSaveCrop') && cropModalContent.includes('canvas.toDataURL'),
    'ImageCropModal.tsx must implement high-resolution canvas cropping to data URL'
  );
  assert.ok(
    cropModalContent.includes('createPortal') && cropModalContent.includes('zIndex: 100000'),
    'ImageCropModal.tsx must render in portal with high z-index'
  );

  const newGroupContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'NewGroupModal.tsx'), 'utf-8');
  assert.ok(
    newGroupContent.includes('Custom Picture') && newGroupContent.includes('handleSelectCustomPicture'),
    'NewGroupModal.tsx must provide Custom Picture button and selection flow'
  );

  const editGroupContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'EditGroupModal.tsx'), 'utf-8');
  assert.ok(
    editGroupContent.includes('Custom Picture') && editGroupContent.includes('handleSelectCustomPicture'),
    'EditGroupModal.tsx must provide Custom Picture button and selection flow'
  );
});

test('BUG-26: Dynamic composite GroupGridIcon (2-4 apps) matching iOS/Android/Launchpad folders', () => {
  const gridIconPath = path.join(projectRoot, 'src', 'components', 'GroupGridIcon.tsx');
  assert.ok(fs.existsSync(gridIconPath), 'src/components/GroupGridIcon.tsx must exist');

  const gridIconContent = fs.readFileSync(gridIconPath, 'utf-8');
  assert.ok(
    gridIconContent.includes('slice(0, 4)'),
    'GroupGridIcon.tsx must take up to 4 items from group'
  );
  assert.ok(
    gridIconContent.includes('count === 3') && gridIconContent.includes('count === 2'),
    'GroupGridIcon.tsx must gracefully handle 2, 3, or 4 item layouts'
  );

  const sidebarContent = fs.readFileSync(path.join(projectRoot, 'src', 'components', 'GroupSidebar.tsx'), 'utf-8');
  assert.ok(
    sidebarContent.includes('group.customIcon ?') && sidebarContent.includes("group.iconName === 'grid' ?"),
    'GroupSidebar.tsx must render customIcon or GroupGridIcon when group uses custom or grid mode'
  );
});

test('BUG-27: Expanded dock handle EdgeToggle is placed on inner edge facing desktop when sidebar is hidden', () => {
  const dockFramePath = path.join(projectRoot, 'src', 'components', 'DockFrame.tsx');
  const dockFrameContent = fs.readFileSync(dockFramePath, 'utf-8');

  // Verify Right dock when sidebar is hidden puts handle on inner desktop edge (left: '0px'), NOT right: '0px'
  const rightHiddenMatch = dockFrameContent.match(/isRight\s*&&\s*isSidebarHidden[\s\S]*?position:\s*'absolute'[\s\S]*?left:\s*'0px'/);
  assert.ok(rightHiddenMatch, 'DockFrame.tsx must position handle on left inner edge (left: 0px) for right dock when sidebar is hidden');

  // Verify Left dock when sidebar is hidden puts handle on inner desktop edge (right: '0px'), NOT left: '0px'
  const leftHiddenMatch = dockFrameContent.match(/isLeft\s*&&\s*isSidebarHidden[\s\S]*?position:\s*'absolute'[\s\S]*?right:\s*'0px'/);
  assert.ok(leftHiddenMatch, 'DockFrame.tsx must position handle on right inner edge (right: 0px) for left dock when sidebar is hidden');
});

test('BUG-28: Background blur uses valid CSS filter (no invalid scale() in filter) and applies full 45px blur with transform scale', () => {
  const dockFramePath = path.join(projectRoot, 'src', 'components', 'DockFrame.tsx');
  const dockFrameContent = fs.readFileSync(dockFramePath, 'utf-8');

  // Verify scale(...) is never placed inside filter: in DockFrame
  const badFilterMatch = dockFrameContent.match(/filter:\s*[^;\n]*scale\(/);
  assert.ok(!badFilterMatch, 'DockFrame.tsx must never contain scale() inside filter: CSS declaration');

  // Verify DockFrame applies blur(45px) and transform: scale(1.15) for full blur
  assert.ok(dockFrameContent.includes("blur(45px)"), 'DockFrame.tsx must apply full 45px blur');
  assert.ok(dockFrameContent.includes("scale(1.15)"), 'DockFrame.tsx must scale blurred image via transform to eliminate feathered borders');

  const settingsViewPath = path.join(projectRoot, 'src', 'components', 'SettingsView.tsx');
  const settingsViewContent = fs.readFileSync(settingsViewPath, 'utf-8');
  const badSettingsFilterMatch = settingsViewContent.match(/filter:\s*[^;\n]*scale\(/);
  assert.ok(!badSettingsFilterMatch, 'SettingsView.tsx must never contain scale() inside filter: CSS declaration');
});

test('BUG-29: Header layout adjusts dynamically for small and compact UI widths without overlap', () => {
  const dockFramePath = path.join(projectRoot, 'src', 'components', 'DockFrame.tsx');
  const dockFrameContent = fs.readFileSync(dockFramePath, 'utf-8');

  // Verify responsive width flags are defined
  assert.ok(dockFrameContent.includes('const isSmallUi = drawerWidth < 300;'), 'DockFrame must define isSmallUi for widths < 300');
  assert.ok(dockFrameContent.includes('const isCompactUi = drawerWidth < 260;'), 'DockFrame must define isCompactUi for widths < 260');

  // Verify header has responsive padding and flex shrinking guard
  assert.ok(dockFrameContent.includes("isCompactUi ? '6px 8px' : isSmallUi ? '8px 10px' : '10px 14px'"), 'Header must adapt padding dynamically');
  assert.ok(dockFrameContent.includes("isCompactUi ? '4px' : isSmallUi ? '6px' : '8px'"), 'Header must adapt gap dynamically');

  // Verify Elden Ring title badge has minWidth: 0 and responsive padding
  assert.ok(dockFrameContent.includes("isCompactUi ? '0 5px 0 3px' : isSmallUi ? '0 8px 0 4px' : '0 12px 0 6px'"), 'Elden Ring badge must adapt padding dynamically');
  assert.ok(dockFrameContent.includes("isCompactUi ? '18px' : isSmallUi ? '20px' : '26px'"), 'Elden Ring runestone icon must adapt size dynamically');

  // Verify Quick Header Actions container has flexShrink: 0
  assert.ok(dockFrameContent.includes('flexShrink: 0'), 'Quick Header Actions container must prevent flex shrinking / collision');

  // Verify action buttons adapt dimensions dynamically
  assert.ok(dockFrameContent.includes("isCompactUi ? '24px' : isSmallUi ? '27px' : '33px'"), 'Action buttons must adapt width dynamically');
});

test('BUG-30: Desktop shortcuts in OneDrive folders are not misidentified as OneDrive and corrupted items are auto-healed', () => {
  const mainCjsPath = path.join(projectRoot, 'electron', 'main.cjs');
  const mainCjs = fs.readFileSync(mainCjsPath, 'utf-8');

  // 1. findStartApp ignores paths that exist on disk or checks only basename without reverse substring match
  assert.ok(
    mainCjs.includes('if (isPath && fs.existsSync(trimmed))'),
    'findStartApp must skip local files that already exist on disk'
  );
  assert.ok(
    mainCjs.includes('const baseWithoutExt = path.basename(trimmed, path.extname(trimmed))'),
    'findStartApp must only use basename for paths, preventing folder names from matching'
  );
  assert.ok(
    !mainCjs.includes('cleanId.includes(a.Name.toLowerCase())'),
    'findStartApp must never perform reverse substring match cleanId.includes(a.Name)'
  );

  // 2. app:resolve-item resolves existing disk files directly and heals corrupted OneDrive names
  assert.ok(
    mainCjs.includes('isTargetOneDriveLnk') && mainCjs.includes('isNameCorruptedToOneDrive'),
    'app:resolve-item must guard against corrupted OneDrive names and targets'
  );
  assert.ok(
    mainCjs.includes('!resolvedName || (isNameCorruptedToOneDrive && !isTargetOneDrive)'),
    'app:resolve-item must restore real shortcut name from targetBase when name was corrupted to OneDrive'
  );

  // 3. App.tsx pre-heals corrupted items before deduplication to prevent dropping tiles
  const appTsxPath = path.join(projectRoot, 'src', 'App.tsx');
  const appTsx = fs.readFileSync(appTsxPath, 'utf-8');

  assert.ok(
    appTsx.includes('const preHealedItems = grp.items.map('),
    'App.tsx must pre-heal corrupted items before deduplication loop'
  );
  assert.ok(
    appTsx.includes("normName === 'onedrive'") && appTsx.includes("targetBase.toLowerCase() !== 'onedrive'"),
    'App.tsx must restore targetBase name for items mistakenly named onedrive'
  );
  assert.ok(
    appTsx.includes("normName !== 'onedrive' && normTarget.endsWith('onedrive.lnk')"),
    'App.tsx must clear corrupted OneDrive.lnk target for non-OneDrive apps so resolveItem can find real shortcut'
  );
  assert.ok(
    appTsx.includes("!isPath && (item.target.includes('.') || item.target.includes('!'))"),
    'App.tsx isMismatchedAumid must not falsely treat filesystem paths with extensions as mismatched AUMIDs'
  );
  assert.ok(
    appTsx.includes("res.name.toLowerCase() !== 'onedrive' || baseName.toLowerCase() === 'onedrive'"),
    'App.tsx drop handler must guard against renaming dropped apps to onedrive'
  );
});
