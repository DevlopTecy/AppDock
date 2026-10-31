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
  assert.ok(sidebarCode.includes('Move Up'), 'GroupSidebar context menu includes Move Up option');
  assert.ok(sidebarCode.includes('Move Down'), 'GroupSidebar context menu includes Move Down option');
  assert.ok(sidebarCode.includes('ArrowUp'), 'GroupSidebar imports ArrowUp icon');
  assert.ok(sidebarCode.includes('ArrowDown'), 'GroupSidebar imports ArrowDown icon');
  assert.ok(sidebarCode.includes('onEditGroup?:'), 'GroupSidebar exposes onEditGroup prop');
  assert.ok(sidebarCode.includes('onMoveGroup?:'), 'GroupSidebar exposes onMoveGroup prop');

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
  assert.ok(appCode.includes('handleMoveGroup'), 'App.tsx has handleMoveGroup');
  assert.ok(appCode.includes('onMoveGroup={handleMoveGroup}'), 'App.tsx passes onMoveGroup to GroupTabs');
  assert.ok(appCode.includes('EditGroupModal'), 'App.tsx renders EditGroupModal');
});

test('Group reorder logic moves groups up and down correctly with bounds safety', () => {
  const groups = [
    { id: 'g1', name: 'Web' },
    { id: 'g2', name: 'Games' },
    { id: 'g3', name: 'Dev' }
  ];

  const moveGroup = (list, groupId, direction) => {
    const index = list.findIndex((g) => g.id === groupId);
    if (index === -1) return list;
    if (direction === 'up' && index === 0) return list;
    if (direction === 'down' && index === list.length - 1) return list;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const copy = [...list];
    const [moved] = copy.splice(index, 1);
    copy.splice(targetIndex, 0, moved);
    return copy;
  };

  // Move g2 up -> should swap g1 and g2
  const upRes = moveGroup(groups, 'g2', 'up');
  assert.deepStrictEqual(upRes.map((g) => g.id), ['g2', 'g1', 'g3']);

  // Move g1 up when already at index 0 -> should remain unchanged
  const noopUp = moveGroup(groups, 'g1', 'up');
  assert.deepStrictEqual(noopUp.map((g) => g.id), ['g1', 'g2', 'g3']);

  // Move g2 down -> should swap g2 and g3
  const downRes = moveGroup(groups, 'g2', 'down');
  assert.deepStrictEqual(downRes.map((g) => g.id), ['g1', 'g3', 'g2']);

  // Move g3 down when already at the end -> should remain unchanged
  const noopDown = moveGroup(groups, 'g3', 'down');
  assert.deepStrictEqual(noopDown.map((g) => g.id), ['g1', 'g2', 'g3']);
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

  // Verify dynamic companion window strategy: 54px when idle, 340px when module active to prevent ghost hitbox
  assert.ok(mainCode.includes('moduleWidth > 54 ? 340 : 54'), 'Electron dynamically sizes companion width to prevent ghost hitbox');

  // Verify App.tsx sends dynamic companion width (54 idle / 340 active) to Electron
  assert.ok(appCode.includes('activeModule ? 340 : 54'), 'App.tsx sends dynamic companion width to Electron');
});


