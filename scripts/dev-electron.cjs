const { spawn } = require('child_process');
const electronPath = require('electron');
const http = require('http');
const path = require('path');

const env = { ...process.env };
delete env.ELECTRON_RUN_AS_NODE;

const port = process.env.VITE_PORT || 5178;
const url = `http://localhost:${port}`;

function waitForVite(callback, attempts = 0) {
  if (attempts > 50) {
    // After 10s fallback to spawning anyway
    return callback();
  }
  const req = http.get(url, (res) => {
    callback();
  });
  req.on('error', () => {
    setTimeout(() => waitForVite(callback, attempts + 1), 200);
  });
}

waitForVite(() => {
  const projectRoot = path.resolve(__dirname, '..');
  const child = spawn(electronPath, [projectRoot], {
    env,
    stdio: 'inherit'
  });

  child.on('exit', (code) => {
    process.exit(code || 0);
  });
});
