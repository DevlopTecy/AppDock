const assert = require('assert');

function validateLaunchTarget(type, target) {
  if (!target || typeof target !== 'string') return false;
  if (type === 'url') {
    return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(target.trim());
  }
  if (type === 'app') {
    return target.trim().length > 0;
  }
  return false;
}

assert.strictEqual(validateLaunchTarget('url', 'https://github.com'), true);
assert.strictEqual(validateLaunchTarget('url', 'http://127.0.0.1:8080'), true);
assert.strictEqual(validateLaunchTarget('url', 'javascript:alert(1)'), false);
assert.strictEqual(validateLaunchTarget('url', 'file:///C:/passwords.txt'), false);
assert.strictEqual(validateLaunchTarget('app', 'C:\\Windows\\notepad.exe'), true);
assert.strictEqual(validateLaunchTarget('app', 'explorer.exe'), true);
assert.strictEqual(validateLaunchTarget('app', ''), false);

// Path resolution validator test
function extractTargetFromLnkBuffer(buf) {
  const latin1 = buf.toString('latin1');
  const asciiMatches = latin1.match(/[A-Za-z]:\\[^<>:"/|?*\x00-\x1f]+\.(?:exe|ico|bat|cmd)/gi);
  if (asciiMatches && asciiMatches.length > 0) return asciiMatches[0];
  return null;
}

const mockLnkBuf = Buffer.from('Prefix_Data_C:\\Users\\Test\\AppData\\Local\\App\\App.exe_Suffix', 'latin1');
assert.strictEqual(extractTargetFromLnkBuffer(mockLnkBuf), 'C:\\Users\\Test\\AppData\\Local\\App\\App.exe');

console.log('Launch & shortcut extraction validation tests passed!');

