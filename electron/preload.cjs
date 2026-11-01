const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('appDock', {
  getPathForFile: (file) => {
    try {
      if (webUtils && typeof webUtils.getPathForFile === 'function') {
        return webUtils.getPathForFile(file);
      }
    } catch (e) {}
    return file?.path || '';
  },
  resolveItem: (payload) => ipcRenderer.invoke('app:resolve-item', payload),
  setState: (isExpanded) => ipcRenderer.invoke('dock:set-state', isExpanded),
  setModuleWidth: (width) => ipcRenderer.invoke('dock:set-module-width', width),
  setPosition: (position) => ipcRenderer.invoke('dock:set-position', position),
  setVerticalPosition: (ratio) => ipcRenderer.invoke('dock:set-vertical-position', ratio),
  setDrawerDimensions: (dimensions) => ipcRenderer.invoke('dock:set-dimensions', dimensions),
  getWorkArea: () => ipcRenderer.invoke('dock:get-workarea'),
  launchPath: (targetPath) => ipcRenderer.invoke('app:launch-path', targetPath),
  launchUrl: (url) => ipcRenderer.invoke('app:launch-url', url),
  extractIcon: (filePath) => ipcRenderer.invoke('app:extract-icon', filePath),
  scanSystemShortcuts: () => ipcRenderer.invoke('app:scan-system'),
  browseFile: () => ipcRenderer.invoke('app:browse-file'),
  browseImage: () => ipcRenderer.invoke('app:browse-image'),
  showItemInFolder: (filePath) => ipcRenderer.invoke('app:show-item-in-folder', filePath),
  saveStorage: (payload) => ipcRenderer.invoke('storage:save', payload),
  loadStorage: () => ipcRenderer.invoke('storage:load'),
  closeApp: () => ipcRenderer.invoke('dock:close'),
  hideToTray: () => ipcRenderer.invoke('dock:hide-to-tray'),
  showFromTray: () => ipcRenderer.invoke('dock:show-from-tray'),
  setSkipTaskbar: (skip) => ipcRenderer.invoke('dock:set-skip-taskbar', skip),
  getSkipTaskbar: () => ipcRenderer.invoke('dock:get-skip-taskbar'),
  getAutoLaunch: () => ipcRenderer.invoke('dock:get-auto-launch'),
  setAutoLaunch: (enable) => ipcRenderer.invoke('dock:set-auto-launch', enable),
  getMediaState: () => ipcRenderer.invoke('media:get-state'),
  controlMedia: (action) => ipcRenderer.invoke('media:control', action),
  onDockCollapse: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('dock:collapse', handler);
    return () => ipcRenderer.removeListener('dock:collapse', handler);
  },
  onDockExpand: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('dock:expand', handler);
    return () => ipcRenderer.removeListener('dock:expand', handler);
  },
  onWindowBlur: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('dock:blur', handler);
    return () => ipcRenderer.removeListener('dock:blur', handler);
  },
  onWindowResized: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:resized', handler);
    return () => ipcRenderer.removeListener('dock:resized', handler);
  },
  // Process Intelligence & Indicators (Phase 2)
  getRunningProcesses: () => ipcRenderer.invoke('dock:get-running-processes'),
  bringAppToFront: (targetOrName) => ipcRenderer.invoke('dock:bring-app-to-front', targetOrName),
  closeAppProcess: (targetOrName) => ipcRenderer.invoke('dock:close-app-process', targetOrName),
  onRunningAppsChanged: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:running-apps-updated', handler);
    return () => ipcRenderer.removeListener('dock:running-apps-updated', handler);
  },
  // Active Window Dodge (Phase 3)
  setSmartDodge: (enabled) => ipcRenderer.invoke('dock:set-smart-dodge', enabled),
  // Audio Switcher & Volume (Phase 4)
  getAudioDevices: () => ipcRenderer.invoke('dock:get-audio-devices'),
  setAudioDevice: (deviceId) => ipcRenderer.invoke('dock:set-audio-device', deviceId),
  setMasterVolume: (volume) => ipcRenderer.invoke('dock:set-master-volume', volume),
  toggleAudioMute: () => ipcRenderer.invoke('dock:toggle-audio-mute'),
  // Auto-Update APIs
  getAppVersion: () => ipcRenderer.invoke('dock:get-app-version'),
  checkForUpdates: (repo) => ipcRenderer.invoke('dock:check-for-updates', repo),
  downloadUpdate: () => ipcRenderer.invoke('dock:download-update'),
  quitAndInstall: () => ipcRenderer.invoke('dock:quit-and-install'),
  openExternalUrl: (url) => ipcRenderer.invoke('dock:open-external-url', url),
  onCheckingForUpdate: (callback) => {
    const handler = () => callback();
    ipcRenderer.on('dock:checking-for-update', handler);
    return () => ipcRenderer.removeListener('dock:checking-for-update', handler);
  },
  onUpdateAvailable: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:update-available', handler);
    return () => ipcRenderer.removeListener('dock:update-available', handler);
  },
  onUpdateNotAvailable: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:update-not-available', handler);
    return () => ipcRenderer.removeListener('dock:update-not-available', handler);
  },
  onUpdateProgress: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:update-progress', handler);
    return () => ipcRenderer.removeListener('dock:update-progress', handler);
  },
  onUpdateDownloaded: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:update-downloaded', handler);
    return () => ipcRenderer.removeListener('dock:update-downloaded', handler);
  },
  onUpdateError: (callback) => {
    const handler = (event, data) => callback(data);
    ipcRenderer.on('dock:update-error', handler);
    return () => ipcRenderer.removeListener('dock:update-error', handler);
  }
});
