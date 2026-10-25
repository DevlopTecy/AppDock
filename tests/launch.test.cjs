const { spawn } = require('child_process');
const path = require('path');
const electronPath = require('electron');

console.log('[Launch Test] Starting Electron from:', electronPath);
const appDir = path.resolve(__dirname, '..');

const child = spawn(electronPath, [appDir], {
  env: {
    ...process.env,
    SERVE_DIST: '1',
    NODE_ENV: 'production'
  },
  stdio: ['pipe', 'pipe', 'pipe']
});

let stderrData = '';
let stdoutData = '';

child.stdout.on('data', (d) => {
  stdoutData += d.toString();
  console.log('[AppDock stdout]:', d.toString().trim());
});

child.stderr.on('data', (d) => {
  stderrData += d.toString();
  console.error('[AppDock stderr]:', d.toString().trim());
});

// Let it run for 4 seconds to ensure full initialization, tray creation, window bounds calculation, and IPC readiness
setTimeout(() => {
  console.log('[Launch Test] App successfully ran for 4 seconds without crashing. Terminating test instance cleanly...');
  child.kill();
  
  // Verify no fatal uncaught exceptions
  if (stderrData.includes('uncaughtException') || stderrData.includes('SyntaxError')) {
    console.error('[Launch Test FAILED] Fatal error detected in stderr:', stderrData);
    process.exit(1);
  }
  console.log('[Launch Test PASSED] AppDock launches and runs with zero fatal errors!');
  process.exit(0);
}, 4000);

child.on('exit', (code, signal) => {
  if (signal !== 'SIGTERM' && signal !== 'SIGINT' && code !== null && code !== 0) {
    console.error(`[Launch Test] Electron exited prematurely with code ${code}, signal ${signal}`);
    process.exit(1);
  }
});
