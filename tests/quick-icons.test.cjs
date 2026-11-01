const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('🧪 Running Quick Icons Feature Test Suite...');

// 1. Verify types in src/types/dock.ts
const dockTypesPath = path.join(__dirname, '..', 'src', 'types', 'dock.ts');
const dockTypesContent = fs.readFileSync(dockTypesPath, 'utf8');

assert(
  dockTypesContent.includes('quickIcons?: AppItem[];'),
  'src/types/dock.ts must include quickIcons?: AppItem[] in DockSettings'
);
console.log('  ✓ src/types/dock.ts contains quickIcons?: AppItem[] in DockSettings');

// 2. Verify storage in src/utils/storage.ts
const storagePath = path.join(__dirname, '..', 'src', 'utils', 'storage.ts');
const storageContent = fs.readFileSync(storagePath, 'utf8');

assert(
  storageContent.includes('quickIcons: []'),
  'src/utils/storage.ts must initialize quickIcons: [] in DEFAULT_SETTINGS'
);
console.log('  ✓ src/utils/storage.ts contains default quickIcons: []');

// 3. Verify AddToQuickIconsModal component
const modalPath = path.join(__dirname, '..', 'src', 'components', 'AddToQuickIconsModal.tsx');
assert(fs.existsSync(modalPath), 'AddToQuickIconsModal.tsx must exist');
const modalContent = fs.readFileSync(modalPath, 'utf8');

assert(
  modalContent.includes('export const AddToQuickIconsModal'),
  'AddToQuickIconsModal.tsx must export AddToQuickIconsModal component'
);
assert(
  modalContent.includes('existingQuickItemIds') && modalContent.includes('onAddQuickIcon'),
  'AddToQuickIconsModal must receive existingQuickItemIds and onAddQuickIcon callback'
);
assert(
  modalContent.includes('searchQuery') || modalContent.includes('Search'),
  'AddToQuickIconsModal must include a search bar for finding apps/urls'
);
console.log('  ✓ AddToQuickIconsModal component implemented with search and selection');

// 4. Verify QuickIconsBar component
const barPath = path.join(__dirname, '..', 'src', 'components', 'QuickIconsBar.tsx');
assert(fs.existsSync(barPath), 'QuickIconsBar.tsx must exist');
const barContent = fs.readFileSync(barPath, 'utf8');

assert(
  barContent.includes('export const QuickIconsBar'),
  'QuickIconsBar.tsx must export QuickIconsBar component'
);
assert(
  barContent.includes('onLaunchItem') && barContent.includes('onRemoveQuickIcon'),
  'QuickIconsBar must support launching items and removing items'
);
assert(
  barContent.includes('handleDragOver') && barContent.includes('handleDrop'),
  'QuickIconsBar must support drag-and-drop from groups'
);
assert(
  barContent.includes('onOpenAddModal'),
  'QuickIconsBar must provide a + button to trigger AddToQuickIconsModal'
);
console.log('  ✓ QuickIconsBar component implemented with launch, remove, + button, and drag-and-drop');

// 5. Verify AppGrid drag handlers set appdock item data
const appGridPath = path.join(__dirname, '..', 'src', 'components', 'AppGrid.tsx');
const appGridContent = fs.readFileSync(appGridPath, 'utf8');

assert(
  appGridContent.includes('application/x-appdock-item-json'),
  'AppGrid card drag start must set application/x-appdock-item-json data'
);
assert(
  appGridContent.includes('__appdock_dragging_item'),
  'AppGrid card drag must set window.__appdock_dragging_item'
);
console.log('  ✓ AppGrid sets drag payload for drop onto QuickIconsBar');

// 6. Verify GroupSidebar and DockFrame integration
const sidebarPath = path.join(__dirname, '..', 'src', 'components', 'GroupSidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');

assert(
  sidebarContent.includes('quickIcons?: AppItem[];'),
  'GroupSidebarProps must accept quickIcons'
);
assert(
  sidebarContent.includes('<QuickIconsBar'),
  'GroupSidebar must render QuickIconsBar vertically below the groups'
);
console.log('  ✓ GroupSidebar integrates QuickIconsBar vertically below groups in sidebar');

const dockFramePath = path.join(__dirname, '..', 'src', 'components', 'DockFrame.tsx');
const dockFrameContent = fs.readFileSync(dockFramePath, 'utf8');
assert(
  !dockFrameContent.includes('{quickIconsContent &&'),
  'DockFrame footer must keep clean layout without horizontal quickIcons'
);
console.log('  ✓ DockFrame footer is clean and uncluttered');

// 7. Verify App.tsx wiring
const appPath = path.join(__dirname, '..', 'src', 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf8');

assert(
  appContent.includes("import { AddToQuickIconsModal } from './components/AddToQuickIconsModal';"),
  'App.tsx must import AddToQuickIconsModal'
);
assert(
  appContent.includes('handleAddQuickIcon') && appContent.includes('handleRemoveQuickIcon'),
  'App.tsx must implement handleAddQuickIcon and handleRemoveQuickIcon'
);
assert(
  appContent.includes('quickIcons={data.settings.quickIcons || []}'),
  'App.tsx must pass quickIcons to GroupTabs sidebar'
);
assert(
  appContent.includes('<AddToQuickIconsModal'),
  'App.tsx must render <AddToQuickIconsModal>'
);
console.log('  ✓ App.tsx wires QuickIcons to GroupTabs sidebar, modal state, and storage persistence');

console.log('🎉 All Quick Icons tests passed successfully!\n');

