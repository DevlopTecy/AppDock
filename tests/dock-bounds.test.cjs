const assert = require('assert');

function calculateBounds(position, isExpanded, workArea, drawerWidth = 320, drawerHeight = 580, moduleWidth = 340, verticalRatio = 0.5) {
  const tabW = 22;
  const tabH = 64;
  const h = Math.min(drawerHeight, workArea.height - 40);
  const safeRatio = Math.max(0.02, Math.min(0.98, typeof verticalRatio === 'number' ? verticalRatio : 0.5));
  const centerY = Math.round(workArea.y + (workArea.height - h) * safeRatio);
  const tabCenterY = Math.round(workArea.y + (workArea.height - tabH) * safeRatio);

  // Fixed companion width: always 340px when expanded (not clean dock), 0 in clean dock (moduleWidth < 0)
  // This eliminates Electron window resizing during module toggles — only CSS changes inside a fixed window.
  const companionW = isExpanded ? (moduleWidth < 0 ? 0 : 340) : 0;
  const totalExpandedWidth = drawerWidth + companionW;

  if (position === 'left') {
    if (!isExpanded) {
      return { x: workArea.x, y: tabCenterY, width: tabW, height: tabH };
    }
    return { x: workArea.x, y: centerY, width: totalExpandedWidth, height: h };
  } else if (position === 'right') {
    if (!isExpanded) {
      return { x: workArea.x + workArea.width - tabW, y: tabCenterY, width: tabW, height: tabH };
    }
    return { x: workArea.x + workArea.width - totalExpandedWidth, y: centerY, width: totalExpandedWidth, height: h };
  }
  throw new Error(`Unsupported position: ${position}`);
}

const workArea = { x: 0, y: 0, width: 1920, height: 1040 };

// Left collapsed
const leftCollapsed = calculateBounds('left', false, workArea);
assert.strictEqual(leftCollapsed.width, 22);
assert.strictEqual(leftCollapsed.x, 0);

// Left expanded — always 340px companion area (hub button or active module both use same window size)
const leftExpanded = calculateBounds('left', true, workArea, 320, 580, 340);
assert.strictEqual(leftExpanded.width, 320 + 340);
assert.strictEqual(leftExpanded.x, 0);

// Left expanded with module active — same window size (no change!)
const leftExpandedActive = calculateBounds('left', true, workArea, 320, 580, 340);
assert.strictEqual(leftExpandedActive.width, 320 + 340);
assert.strictEqual(leftExpandedActive.x, 0);

// Right collapsed
const rightCollapsed = calculateBounds('right', false, workArea);
assert.strictEqual(rightCollapsed.x, 1920 - 22);
assert.strictEqual(rightCollapsed.width, 22);

// Right expanded — always 340px companion area
const rightExpanded = calculateBounds('right', true, workArea, 320, 580, 340);
assert.strictEqual(rightExpanded.x, 1920 - (320 + 340));
assert.strictEqual(rightExpanded.width, 320 + 340);

// Right expanded with active module — same window size (no change!)
const rightExpandedActive = calculateBounds('right', true, workArea, 320, 580, 340);
assert.strictEqual(rightExpandedActive.x, 1920 - (320 + 340));
assert.strictEqual(rightExpandedActive.width, 320 + 340);

// Left custom vertical position (near top ratio 0.2)
const leftTopRatio = calculateBounds('left', false, workArea, 320, 580, 340, 0.2);
assert.strictEqual(leftTopRatio.y, Math.round((1040 - 64) * 0.2));

// Right custom vertical position (near bottom ratio 0.8)
const rightBottomRatio = calculateBounds('right', false, workArea, 320, 580, 340, 0.8);
// Clean Dock mode (moduleWidth = -1: no companion hub or module width added)
const rightCleanDock = calculateBounds('right', true, workArea, 220, 460, -1);
assert.strictEqual(rightCleanDock.width, 220);
assert.strictEqual(rightCleanDock.x, 1920 - 220);
assert.strictEqual(rightCleanDock.height, 460);

const leftCleanDock = calculateBounds('left', true, workArea, 220, 460, -1);
assert.strictEqual(leftCleanDock.width, 220);
assert.strictEqual(leftCleanDock.x, 0);
assert.strictEqual(leftCleanDock.height, 460);

console.log('Dock bounds calculation tests passed!');
