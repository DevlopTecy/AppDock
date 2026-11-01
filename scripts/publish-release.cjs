const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const child = spawn('git', ['credential', 'fill'], { stdio: ['pipe', 'pipe', 'inherit'] });
let out = '';
child.stdout.on('data', d => out += d);
child.on('close', code => {
  const line = out.split('\n').find(l => l.startsWith('password='));
  if (!line) {
    console.error('Failed to get token from git credential');
    process.exit(1);
  }
  const token = line.replace('password=', '').trim();
  const projectRoot = path.resolve(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(projectRoot, 'package.json'), 'utf-8'));
  const version = pkg.version;
  const tag = `v${version}`;

  const releaseDir = path.join(projectRoot, 'release');
  const installer = path.join(releaseDir, `AppDock Setup ${version}.exe`);
  const installerHyphen = path.join(releaseDir, `AppDock-Setup-${version}.exe`);
  const blockmapSrc = path.join(releaseDir, `AppDock Setup ${version}.exe.blockmap`);
  const blockmapDst = path.join(releaseDir, `AppDock-Setup-${version}.exe.blockmap`);
  const portable = path.join(releaseDir, `AppDock ${version}.exe`);
  const zipPkg = path.join(releaseDir, `AppDock-v${version}-windows-x64.zip`);
  const latestYml = path.join(releaseDir, 'latest.yml');
  const notesFile = path.join(releaseDir, `release-notes-v${version}.md`);

  // Ensure hyphenated installer exists for latest.yml compatibility
  if (fs.existsSync(installer) && !fs.existsSync(installerHyphen)) {
    fs.copyFileSync(installer, installerHyphen);
  }
  if (fs.existsSync(blockmapSrc) && !fs.existsSync(blockmapDst)) {
    fs.copyFileSync(blockmapSrc, blockmapDst);
  }

  const assets = [installer, portable, zipPkg];
  if (fs.existsSync(installerHyphen)) assets.push(installerHyphen);
  if (fs.existsSync(blockmapDst)) assets.push(blockmapDst);
  if (fs.existsSync(latestYml)) assets.push(latestYml);

  const cmd = [
    'release', 'create', tag,
    ...assets,
    '--repo', 'DevlopTecy/AppDock',
    '--title', `AppDock ${tag}`,
    '--notes-file', notesFile
  ];

  console.log(`Publishing ${tag} release to GitHub with all updater metadata...`);
  const res = spawn('gh', cmd, {
    cwd: projectRoot,
    env: { ...process.env, GH_TOKEN: token },
    stdio: 'inherit'
  });
  res.on('close', c => {
    console.log('gh release create finished with code:', c);
    process.exit(c);
  });
});
child.stdin.write('protocol=https\nhost=github.com\n\n');
child.stdin.end();
