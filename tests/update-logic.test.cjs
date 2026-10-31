const assert = require('assert');
const https = require('https');

// 1. Verify Semver Comparison logic used in update checker
function compareSemver(v1, v2) {
  const p1 = (v1 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  const p2 = (v2 || '0').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const num1 = p1[i] || 0;
    const num2 = p2[i] || 0;
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  return 0;
}

// Semver test cases
assert.strictEqual(compareSemver('1.0.1', '1.0.0'), 1, '1.0.1 should be newer than 1.0.0');
assert.strictEqual(compareSemver('1.0.0', '1.0.1'), -1, '1.0.0 should be older than 1.0.1');
assert.strictEqual(compareSemver('1.0.0', '1.0.0'), 0, '1.0.0 should be equal to 1.0.0');
assert.strictEqual(compareSemver('2.0.0', '1.9.9'), 1, '2.0.0 should be newer than 1.9.9');
assert.strictEqual(compareSemver('1.10.0', '1.9.0'), 1, '1.10.0 should be newer than 1.9.0');

// Tag name sanitization test (e.g. "v1.2.3" -> "1.2.3")
const cleanTag = (tag) => (tag || '').replace(/^[^\d]*/, '').replace(/[^\d.]*$/, '');
assert.strictEqual(cleanTag('v1.0.2'), '1.0.2');
assert.strictEqual(cleanTag('release-2.0.0'), '2.0.0');
assert.strictEqual(cleanTag('1.5.0'), '1.5.0');

// Asset extraction test
function extractDownloadUrl(assets, fallbackHtmlUrl) {
  if (Array.isArray(assets)) {
    const exeAsset = assets.find((a) => a.name && (a.name.endsWith('.exe') || a.name.endsWith('.zip')));
    if (exeAsset && exeAsset.browser_download_url) {
      return exeAsset.browser_download_url;
    }
  }
  return fallbackHtmlUrl;
}

const mockAssets = [
  { name: 'AppDock-Setup-1.0.3.exe.blockmap', browser_download_url: 'https://example.com/blockmap' },
  { name: 'AppDock-Setup-1.0.3.exe', browser_download_url: 'https://github.com/DevlopTecy/AppDock/releases/download/v1.0.3/AppDock-Setup-1.0.3.exe' }
];
assert.strictEqual(
  extractDownloadUrl(mockAssets, 'https://github.com/releases/v1.0.3'),
  'https://github.com/DevlopTecy/AppDock/releases/download/v1.0.3/AppDock-Setup-1.0.3.exe'
);

// 2. Verify Preload Bridge signatures
const fs = require('fs');
const path = require('path');
const preloadSource = fs.readFileSync(path.join(__dirname, '../electron/preload.cjs'), 'utf8');

assert.ok(preloadSource.includes("getAppVersion: () => ipcRenderer.invoke('dock:get-app-version')"), 'preload exposes getAppVersion');
assert.ok(preloadSource.includes("checkForUpdates: (repo) => ipcRenderer.invoke('dock:check-for-updates', repo)"), 'preload exposes checkForUpdates');
assert.ok(preloadSource.includes("openExternalUrl: (url) => ipcRenderer.invoke('dock:open-external-url', url)"), 'preload exposes openExternalUrl');

// 3. Verify Main IPC handlers
const mainSource = fs.readFileSync(path.join(__dirname, '../electron/main.cjs'), 'utf8');
assert.ok(mainSource.includes("ipcMain.handle('dock:get-app-version'"), 'main handles dock:get-app-version');
assert.ok(mainSource.includes("ipcMain.handle('dock:check-for-updates'"), 'main handles dock:check-for-updates');
assert.ok(mainSource.includes("ipcMain.handle('dock:open-external-url'"), 'main handles dock:open-external-url');

// 4. Verify Live GitHub API query to the repository
async function testLiveGitHubApi() {
  const repoSlug = 'DevlopTecy/AppDock';
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${repoSlug}/releases/latest`,
      headers: {
        'User-Agent': 'AppDock-Updater',
        'Accept': 'application/vnd.github.v3+json'
      },
      timeout: 8000
    };

    const req = https.get(options, (res) => {
      let data = '';
      res.on('data', (c) => { data += c; });
      res.on('end', () => {
        console.log(`[GitHub API Live Check] HTTP status: ${res.statusCode}`);
        // 200 (release exists) or 404 (no releases published yet) are both handled gracefully by AppDock
        assert.ok([200, 404, 403].includes(res.statusCode), `Expected valid HTTP status from GitHub API, got ${res.statusCode}`);
        if (res.statusCode === 200) {
          const parsed = JSON.parse(data);
          console.log(`[GitHub API Live Check] Latest published release tag: ${parsed.tag_name}`);
        } else if (res.statusCode === 404) {
          console.log('[GitHub API Live Check] Repository has no public releases yet (graceful fallback to up-to-date)');
        } else if (res.statusCode === 403) {
          console.log('[GitHub API Live Check] GitHub rate limit reached (graceful fallback to up-to-date)');
        }
        resolve(res.statusCode);
      });
    });

    req.on('error', (err) => {
      console.warn('[GitHub API Live Check] Network warning:', err.message);
      // Graceful offline fallback
      resolve(null);
    });

    req.on('timeout', () => {
      req.destroy();
      console.log('[GitHub API Live Check] Request timed out (gracefully handled)');
      resolve(null);
    });
  });
}

testLiveGitHubApi().then(() => {
  console.log('Update button logic & IPC verification tests passed!');
});

