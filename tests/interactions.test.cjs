const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('showItemInFolder is registered in electron main and preload', () => {
  const mainCode = fs.readFileSync(path.resolve(__dirname, '..', 'electron', 'main.cjs'), 'utf8');
  const preloadCode = fs.readFileSync(path.resolve(__dirname, '..', 'electron', 'preload.cjs'), 'utf8');

  assert.ok(mainCode.includes("'app:show-item-in-folder'"), 'main.cjs handles app:show-item-in-folder IPC');
  assert.ok(mainCode.includes('shell.showItemInFolder'), 'main.cjs calls shell.showItemInFolder');
  assert.ok(preloadCode.includes('showItemInFolder:'), 'preload.cjs exposes showItemInFolder to renderer');
});

test('AppCard and AppGrid support right-click context menu and drag-and-drop reordering', () => {
  const cardCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'AppCard.tsx'), 'utf8');
  const gridCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'AppGrid.tsx'), 'utf8');

  // AppCard props & handlers
  assert.ok(cardCode.includes('onContextMenu?:'), 'AppCard accepts onContextMenu prop');
  assert.ok(cardCode.includes('draggable={draggable}'), 'AppCard is draggable');
  assert.ok(cardCode.includes('isDragging'), 'AppCard handles isDragging state');
  assert.ok(cardCode.includes('isDragOver'), 'AppCard handles isDragOver state');

  // AppGrid context menu & reordering
  assert.ok(gridCode.includes('onReorderItems?:'), 'AppGrid accepts onReorderItems prop');
  assert.ok(gridCode.includes('handleCardDragStart'), 'AppGrid handles drag start');
  assert.ok(gridCode.includes('handleCardDrop'), 'AppGrid handles drop and reordering');
  assert.ok(gridCode.includes('Open file location'), 'AppGrid context menu has Open file location option');
  assert.ok(gridCode.includes('showItemInFolder'), 'AppGrid context menu calls showItemInFolder');
});

test('GroupSidebar supports right-click edit/delete and EditGroupModal is integrated', () => {
  const sidebarCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'GroupSidebar.tsx'), 'utf8');
  const modalCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'EditGroupModal.tsx'), 'utf8');
  const appCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'App.tsx'), 'utf8');

  // GroupSidebar context menu
  assert.ok(sidebarCode.includes('onContextMenu='), 'GroupSidebar has onContextMenu on group buttons');
  assert.ok(sidebarCode.includes('Edit Group'), 'GroupSidebar context menu includes Edit Group option');
  assert.ok(sidebarCode.includes('Delete Group'), 'GroupSidebar context menu includes Delete Group option');
  assert.ok(sidebarCode.includes('onEditGroup?:'), 'GroupSidebar exposes onEditGroup prop');

  // EditGroupModal capabilities
  assert.ok(modalCode.includes('Edit Group'), 'EditGroupModal header exists');
  assert.ok(modalCode.includes('GROUP NAME'), 'EditGroupModal edits group name');
  assert.ok(modalCode.includes('GROUP LOGO'), 'EditGroupModal edits group logo');
  assert.ok(modalCode.includes('ACCENT COLOR'), 'EditGroupModal edits accent color');
  assert.ok(modalCode.includes('GRID DENSITY'), 'EditGroupModal edits density');
  assert.ok(modalCode.includes('APPS IN THIS GROUP'), 'EditGroupModal lists and manages group apps');
  assert.ok(modalCode.includes('handleRemoveItem'), 'EditGroupModal can remove apps from group');
  assert.ok(modalCode.includes('handleBrowseAndAddApp'), 'EditGroupModal can add apps to group');

  // App integration
  assert.ok(appCode.includes('handleReorderItems'), 'App.tsx has handleReorderItems');
  assert.ok(appCode.includes('handleUpdateGroup'), 'App.tsx has handleUpdateGroup');
  assert.ok(appCode.includes('EditGroupModal'), 'App.tsx renders EditGroupModal');
});

test('DockFrame and App module toggle transitions prevent Main UI jumping/flicker', () => {
  const dockFrameCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'components', 'DockFrame.tsx'), 'utf8');
  const appCode = fs.readFileSync(path.resolve(__dirname, '..', 'src', 'App.tsx'), 'utf8');
  const mainCode = fs.readFileSync(path.resolve(__dirname, '..', 'electron', 'main.cjs'), 'utf8');

  // Verify no layout-jumping CSS width transitions on root container or glass-surface in DockFrame
  assert.ok(!dockFrameCode.includes("transition: isResizing ? 'none' : 'width"), 'DockFrame root and glass-surface do not transition width');
  assert.ok(!dockFrameCode.includes("transition: 'width"), 'Companion area does not transition width asynchronously');

  // Verify exit animation cleanup still in DockFrame
  assert.ok(dockFrameCode.includes('setRenderedModule(null);'), 'DockFrame unmounts module after exit');
  assert.ok(dockFrameCode.includes('190'), 'Exit timer synchronizes with CSS exit animation (190ms)');

  // Verify fixed 340px companion window strategy: Electron window never resizes during module toggles
  assert.ok(mainCode.includes('moduleWidth < 0 ? 0 : 340'), 'Electron always uses fixed 340px companion width (no resize during module toggle)');

  // Verify App.tsx sends fixed 340 when expanded (not 54 or dynamic)
  assert.ok(appCode.includes('setModuleWidth(340)') || appCode.includes('setModuleWidth(-1)'), 'App.tsx sends fixed companion width to Electron');
});


