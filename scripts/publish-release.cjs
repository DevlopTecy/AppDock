const { spawn } = require('child_process');
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
  const installer = path.join(projectRoot, 'release', 'AppDock Setup 1.0.5.exe');
  const portable = path.join(projectRoot, 'release', 'AppDock 1.0.5.exe');
  const zipPkg = path.join(projectRoot, 'release', 'AppDock-v1.0.5-windows-x64.zip');
  const notesFile = path.join(projectRoot, 'release', 'release-notes-v1.0.5.md');

  const cmd = [
    'release', 'create', 'v1.0.5',
    installer,
    portable,
    zipPkg,
    '--repo', 'DevlopTecy/AppDock',
    '--title', 'AppDock v1.0.5 – Disabled Auto-Start, Web Favicon Fix & Web URL Editing',
    '--notes-file', notesFile
  ];
  console.log('Publishing v1.0.5 release to GitHub...');
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
