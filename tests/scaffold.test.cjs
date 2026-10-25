const fs = require('fs');
const path = require('path');
const assert = require('assert');

const root = path.resolve(__dirname, '..');
assert.ok(fs.existsSync(path.join(root, 'package.json')), 'package.json must exist');
assert.ok(fs.existsSync(path.join(root, 'vite.config.ts')), 'vite.config.ts must exist');
assert.ok(fs.existsSync(path.join(root, 'tsconfig.json')), 'tsconfig.json must exist');
assert.ok(fs.existsSync(path.join(root, 'index.html')), 'index.html must exist');
console.log('Scaffolding tests passed!');
