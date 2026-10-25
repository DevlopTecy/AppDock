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

console.log('Storage & URL normalizer tests passed!');
