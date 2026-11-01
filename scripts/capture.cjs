const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const projectRoot = path.resolve(__dirname, '..');
const outDir = path.join(projectRoot, 'docs', 'screenshots');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

let viteServer = null;

async function startVite() {
  const vitePath = path.join(projectRoot, 'node_modules/vite/dist/node/index.js');
  const { createServer } = await import(pathToFileURL(vitePath).href);
  viteServer = await createServer({
    root: projectRoot,
    server: {
      port: 5174,
      host: 'localhost'
    }
  });
  await viteServer.listen();
  console.log('[Vite] In-process dev server running on http://localhost:5174');
}

const shots = [
  // 1. Basic Themes (starting 2 themes)
  {
    name: '01-theme-dark.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark',
    width: 440,
    height: 640
  },
  {
    name: '02-theme-light.png',
    url: 'http://localhost:5174/?expanded=1&theme=light',
    width: 440,
    height: 640
  },
  // 2. Flexible App UI Sizes (Large, Medium, Small)
  {
    name: '03-density-large.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark&density=L',
    width: 440,
    height: 640
  },
  {
    name: '04-density-medium.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark&density=M',
    width: 440,
    height: 640
  },
  {
    name: '05-density-small.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark&density=S',
    width: 440,
    height: 640
  },
  // 3. Quick Icons
  {
    name: '06-quick-icons-rail.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark&quickicons=1',
    width: 440,
    height: 640
  },
  {
    name: '07-quick-icons-modal.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark&modal=quickicons',
    width: 480,
    height: 640
  },
  // 4. Settings View with Quick Update button
  {
    name: '08-settings-view.png',
    url: 'http://localhost:5174/?expanded=1&theme=dark&modal=settings',
    width: 450,
    height: 680
  },
  // 5. Custom Themes (4 themes requested)
  {
    name: '09-theme-kawaii.png',
    url: 'http://localhost:5174/?expanded=1&theme=kawaii',
    width: 440,
    height: 640
  },
  {
    name: '10-theme-aether.png',
    url: 'http://localhost:5174/?expanded=1&theme=aether',
    width: 440,
    height: 640
  },
  {
    name: '11-theme-deathnote.png',
    url: 'http://localhost:5174/?expanded=1&theme=deathnote',
    width: 440,
    height: 640
  },
  {
    name: '12-theme-eldenring.png',
    url: 'http://localhost:5174/?expanded=1&theme=eldenring',
    width: 440,
    height: 640
  },
  // Extra bonus popular custom themes
  {
    name: '13-theme-onepiece.png',
    url: 'http://localhost:5174/?expanded=1&theme=onepiece',
    width: 440,
    height: 640
  },
  {
    name: '14-theme-candy.png',
    url: 'http://localhost:5174/?expanded=1&theme=candy',
    width: 440,
    height: 640
  }
];

app.whenReady().then(async () => {
  let win = null;
  try {
    await startVite();

    console.log('[Screenshots] Starting screenshot capture pipeline...');

    win = new BrowserWindow({
      width: 440,
      height: 640,
      show: true,
      x: 100,
      y: 100,
      frame: false,
      backgroundColor: '#0a0d14',
      webPreferences: {
        deviceScaleFactor: 2,
        contextIsolation: false
      }
    });

    for (let i = 0; i < shots.length; i++) {
      const s = shots[i];
      console.log(`[Screenshots] [${i + 1}/${shots.length}] Capturing ${s.name}...`);

      win.setSize(s.width, s.height);
      await win.loadURL(s.url);

      // Inject clean dark backdrop wallpaper for translucency
      await win.webContents.executeJavaScript(`
        document.body.style.background = 'radial-gradient(circle at 60% 40%, #172033 0%, #07090e 100%)';
        document.body.style.margin = '0';
        document.body.style.overflow = 'hidden';
        true;
      `);

      // Wait 1200ms for images and transitions
      await new Promise((r) => setTimeout(r, 1200));

      const img = await win.capturePage();
      const filePath = path.join(outDir, s.name);
      fs.writeFileSync(filePath, img.toPNG());
      console.log(`[Screenshots] Saved: ${s.name} (${img.toPNG().length} bytes) to ${filePath}`);
    }

    console.log('[Screenshots] All showcase screenshots captured successfully!');
  } catch (err) {
    console.error('[Screenshots] Fatal error:', err);
  } finally {
    if (win) {
      try { win.destroy(); } catch (e) {}
    }
    if (viteServer) {
      try { await viteServer.close(); } catch (e) {}
      console.log('[Vite] Dev server closed cleanly.');
    }
    app.quit();
  }
});
