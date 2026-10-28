/**
 * Asset resolution helper for AppDock.
 * Ensures relative URLs (e.g. './stickers/...' instead of '/stickers/...')
 * so assets load reliably under file:// protocol in packaged Electron apps.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  // Remove leading slash if present to make path relative to index.html
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `./${clean}`;
}
