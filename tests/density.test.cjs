const assert = require('assert');
const { resolveGroupDensity } = require('../src/utils/density.cjs');

// Test 1: Auto density with <= 4 items returns large layout
const smallGroup = { id: 'g1', name: 'Tools', items: [{ id: '1' }, { id: '2' }] };
const smallRes = resolveGroupDensity(smallGroup);
assert.strictEqual(smallRes.density, 'large');
assert.strictEqual(smallRes.iconSize >= 44, true);

// Test 2: Auto density with 5-8 items returns medium layout
const medGroup = { id: 'g2', name: 'Work', items: Array.from({ length: 6 }, (_, i) => ({ id: `${i}` })) };
const medRes = resolveGroupDensity(medGroup);
assert.strictEqual(medRes.density, 'medium');

// Test 3: Auto density with 9+ items returns compact layout
const bigGroup = { id: 'g3', name: 'All', items: Array.from({ length: 12 }, (_, i) => ({ id: `${i}` })) };
const bigRes = resolveGroupDensity(bigGroup);
assert.strictEqual(bigRes.density, 'compact');

// Test 4: Explicit override respected regardless of count
const explicitSmall = { id: 'g4', name: 'Pinned', density: 'compact', items: [{ id: '1' }] };
const explicitRes = resolveGroupDensity(explicitSmall);
assert.strictEqual(explicitRes.density, 'compact');

// Test 5: Narrow container width scales icon size
const narrowRes = resolveGroupDensity(smallGroup, 210);
assert.strictEqual(narrowRes.density, 'large');
assert.strictEqual(narrowRes.iconSize <= 40, true);
assert.strictEqual(narrowRes.minColWidth <= 65, true);

console.log('Density resolution tests passed!');
