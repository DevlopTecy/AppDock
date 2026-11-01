const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const dir = path.resolve(__dirname, '..', 'release');
const srcExe = path.join(dir, 'AppDock Setup 1.0.5.exe');
const dstExe = path.join(dir, 'AppDock-Setup-1.0.5.exe');
if (!fs.existsSync(dstExe)) {
  fs.copyFileSync(srcExe, dstExe);
  console.log('Created AppDock-Setup-1.0.5.exe');
}

const srcMap = path.join(dir, 'AppDock Setup 1.0.5.exe.blockmap');
const dstMap = path.join(dir, 'AppDock-Setup-1.0.5.exe.blockmap');
if (fs.existsSync(srcMap) && !fs.existsSync(dstMap)) {
  fs.copyFileSync(srcMap, dstMap);
  console.log('Created AppDock-Setup-1.0.5.exe.blockmap');
}

const creds = execSync('git credential fill', { input: 'protocol=https\nhost=github.com\n\n' }).toString();
const token = creds.match(/password=([^\r\n]+)/)[1];

const latestYml = path.join(dir, 'latest.yml');

console.log('Uploading latest.yml, AppDock-Setup-1.0.5.exe, blockmap to release v1.0.5...');
execSync(`gh release upload v1.0.5 "${latestYml}" "${dstExe}" "${dstMap}" --clobber`, {
  cwd: path.resolve(__dirname, '..'),
  env: { ...process.env, GH_TOKEN: token },
  stdio: 'inherit'
});
console.log('Upload complete!');

