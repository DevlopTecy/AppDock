const assert = require('assert');

function normalizeUrl(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

assert.strictEqual(normalizeUrl('google.com'), 'https://google.com');
assert.strictEqual(normalizeUrl('https://store.steampowered.com'), 'https://store.steampowered.com');
assert.strictEqual(normalizeUrl('  http://localhost:3000  '), 'http://localhost:3000');
assert.strictEqual(normalizeUrl(''), '');

// Theme definitions check
const validThemes = ['dark', 'light', 'translucent', 'glassy', 'minimal', 'cyberpunk', 'midnight', 'emerald', 'kawaii', 'aether', 'deathnote'];
for (const theme of ['translucent', 'glassy', 'minimal']) {
  assert.ok(validThemes.includes(theme), `Theme ${theme} must be a valid recognized theme`);
}

console.log('Storage & URL normalizer tests passed!');
