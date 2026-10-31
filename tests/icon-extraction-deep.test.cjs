const test = require('node:test');
const assert = require('node:assert');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { execFile } = require('child_process');

function isGenericOrBrokenIcon(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return true;
  if (!dataUrl.startsWith('data:image/')) return true;
  if (dataUrl.length <= 860) return true;
  if (dataUrl.length >= 950 && dataUrl.length <= 1050 && dataUrl.includes('iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM')) {
    return true;
  }
  return false;
}

function resolveHelperScript(baseDir, scriptName, fallbackDir) {
  const direct = path.join(baseDir, scriptName);
  if (!direct.includes('app.asar') && fs.existsSync(direct)) {
    return direct;
  }
  const unpacked = direct.replace(/app\.asar([/\\]|$)/, 'app.asar.unpacked$1');
  if (fs.existsSync(unpacked)) {
    return unpacked;
  }
  // Fallback to writable directory
  const target = path.join(fallbackDir, scriptName);
  const src = path.resolve(__dirname, '..', 'electron', scriptName);
  if (fs.existsSync(src)) {
    fs.writeFileSync(target, fs.readFileSync(src));
    return target;
  }
  return direct;
}

test('isGenericOrBrokenIcon correctly rejects invalid, empty, and generic icons', () => {
  assert.strictEqual(isGenericOrBrokenIcon(null), true, 'null is rejected');
  assert.strictEqual(isGenericOrBrokenIcon(''), true, 'empty string is rejected');
  assert.strictEqual(isGenericOrBrokenIcon('not-an-image'), true, 'invalid prefix is rejected');
  assert.strictEqual(isGenericOrBrokenIcon('data:image/png;base64,' + 'A'.repeat(500)), true, 'short icon is rejected');
  
  // Test exact 1006-byte generic Windows shortcut icon
  const genericShortcutUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAACp0lEQVRYhe2YzWsTQRjGn81u2mAas4EeWpumnvSkeBG8iHhUK8WDH0hBFP+ASKVqISQieI7g0bNiFbz4detVPYj+AZI1/QhSaLahit2dmddDkiZpd9Pd7Ec85CGHnXnnzfvbZ3aWnQH+c0l2gfvzcyVJkg77UYSItL8Gv1QsFr+5zbUFfHDvLj189NgzHADkcwuIxWJ6dXPrrFvIiC8EDnTz1m01lRxZymazJ9zkhQY4Nn6oJ8jQANEjZKiA6AEydEC4hOwLIFxA9g0QDiGVMEBUVUU+t9B1yPCQvAQgtTsQCuCdufl9x+RzC6pVf1+n2IkGgF41APSqAaBXDQC9agDoVUplfTMvgbKApFKzlwgEYL36u9kEgdD41eP1C4wcGEYiPhwcIIDCaOogZNl2g2crxgVWf1UDBYwQUU9wAKDIETAmfIfqqCEEWQZOLVawssXqjcbUCk7gTCAdl/H1xiQAQJB1vm+A5KCA4ATOCYILCAGUNsydGIk+OfjpyvjO9XKNYeZNBZrO67BmK8cm3TdFBHV3YLnGcPF1BaUNA+m4DNMQMA3eAgzYwYidgwBQrjFMv1qDVjWQjit4e3kCbJuDmS2owJ9BO8ByjWF6cQ0/dQPphIJ3VyeQSSpgpkA7U7cb9AfQwoFyjeHCy1VoVQOZRBQfrqWRSdb3V8Q7x4fuYLnGcP7FCrSqiUxCwfvrLTgAmEpFO07tKGgH218z5U0T556vQtMbzs1OYirZuTMtzR/paAc9xR2L5OkXvbFaFXycTe+Bs1LwU9xWYPZYAht/GHJnRjGlRh39QfCLpK3A8bEYns2Md03YrcAd5FzohsnUoaj7U5Btg4GI9jt3cSQioVn1S5+//yjIspxvLhai5scBWX8HtiULIh1CPDl98mjBM6GN/gG0b1HFgkHRbwAAAABJRU5ErkJggg==';
  assert.strictEqual(genericShortcutUrl.length, 1006, 'sample generic shortcut icon is exactly 1006 chars');
  assert.strictEqual(isGenericOrBrokenIcon(genericShortcutUrl), true, 'generic 1006-byte shortcut icon is rejected');

  // Test Topaz generic shortcut variant
  const topazGenericUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM/rhtAAACp0lEQVRYhe2Yy2sTURTGv8xM2mCMmYpIa9PUla4UN4IbEZdqpbjwgRREwX18VS2EVATXEVy6VqyCG1+7btWF6B8gGdNHkEIyDVbszL3nuEjSJDWTTjKZqYt8zGLu48z5zXfnDvde4D9XyKnh3p2buZCi7O9FEiYy/th0LpvNfu001hHw/t3b/ODhI89wAJBJzyASGTRLq2snO4VUekLgQlevXdeH4tH5VCp1pJO4wACHR/Z1BRkYILqEDBQQXUAGDogOIbcFEB1AbhsgXEJqQYDouo5MeqZtl4EBdR7A0OaGQABv3Jresk8mPaO3qt/WIXajPqBX9QG9qg/oVX1Ar+oDepVWWFnNMHNKCYV0rtUygwGslNZqRTAY1avSXrnBzh2DiEUH/QMEMLt39y6oquMGz1FCEhZ/Fn0FVJi5KzgA0FQFUrCLnt1LI2qd4NhcAYu/RKVQHVqSDCkIiaiKL1fGAADEPgOyiwQkGVIySBKIgFzR3mhjIn8BnRz8eGFk436hLDD5ugDDlBVYux7jEN4zKcTtHVgoC5x9VUCuaCERVWFbBNuSdUCfHVScHASAfFlg4uUyjJKFRFTDm/OjEOsSwq5D+f4NOgHmywITc8v4YVpIxDS8vTiKZFyDsAmNTO1esDeALRzIlwXOvFiCUbKQjIXx/lICyXhlf8WyuX/gDubLAqefL8Io2UjGNLy7XIcDgPGhcNOpHfvtYONvJr9q49SzJRhm1bmpMYzHm3emuekDTWW/h7hpkjz5bFZnq4YPU4l/4FrJ/yFuSDB1KIbib4H0iT0Y18OuHuD/JGlIcHg4gqeTI20DNst3B4Uk07KFPhDu/BRk3RJg5q3OXVyJiYxW9aFP377PqqqaqU0W5trigFuvAxuCicgE8+PjRw/OeiZ00F8VPVPFKb3yaAAAAABJRU5ErkJggg==';
  assert.strictEqual(isGenericOrBrokenIcon(topazGenericUrl), true, 'topaz generic shortcut variant is rejected');

  // Real icon should be accepted
  const realIcon = 'data:image/png;base64,' + 'B'.repeat(1500);
  assert.strictEqual(isGenericOrBrokenIcon(realIcon), false, 'valid real icon is accepted');
});

test('resolveHelperScript falls back to physical disk file when inside virtual asar', () => {
  const fakeAsarDir = 'D:\\Projects\\release\\win-unpacked\\resources\\app.asar\\electron';
  const tmpDir = os.tmpdir();
  const resolved = resolveHelperScript(fakeAsarDir, 'icon-helper.ps1', tmpDir);
  assert.ok(fs.existsSync(resolved), 'Resolved script exists on real disk');
  assert.ok(!resolved.includes('app.asar'), 'Resolved script is NOT an inaccessible asar path');
});

test('icon-helper.ps1 extracts real icons for Antigravity, AppDock, Lunar Client, and Topaz Video AI', async () => {
  const scriptPath = path.resolve(__dirname, '..', 'electron', 'icon-helper.ps1');
  assert.ok(fs.existsSync(scriptPath), 'icon-helper.ps1 exists');

  const testShortcuts = [
    path.join(process.env.USERPROFILE || '', 'OneDrive', 'Desktop', 'Antigravity.lnk'),
    path.join(process.env.USERPROFILE || '', 'OneDrive', 'Desktop', 'AppDock.lnk'),
    path.join(process.env.USERPROFILE || '', 'OneDrive', 'Desktop', 'Lunar Client.lnk'),
    path.join(process.env.PUBLIC || 'C:\\Users\\Public', 'Desktop', 'Topaz Video AI.lnk')
  ];

  for (const sc of testShortcuts) {
    if (!fs.existsSync(sc)) continue;
    const baseName = path.basename(sc);
    await new Promise((resolve, reject) => {
      execFile(
        'powershell.exe',
        ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, '-Action', 'Single', '-Path', sc],
        { timeout: 5000 },
        (err, stdout) => {
          if (err) return reject(err);
          const icon = stdout.trim();
          assert.ok(icon.startsWith('data:image/'), `${baseName} returned a data URL`);
          assert.strictEqual(isGenericOrBrokenIcon(icon), false, `${baseName} is NOT a generic or broken icon (length: ${icon.length})`);
          assert.ok(icon.length > 1200, `${baseName} has real icon payload > 1200 bytes`);
          resolve();
        }
      );
    });
  }
});
