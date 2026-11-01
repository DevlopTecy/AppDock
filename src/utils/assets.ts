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

/**
 * Detects whether an icon dataUrl represents a generic Windows placeholder
 * (e.g. blank document with blue shortcut arrow or empty application frame).
 * Web URLs (http/https) and local asset paths are valid icons and never generic placeholders.
 */
export function isGenericOrBrokenIcon(dataUrl?: string | null): boolean {
  if (!dataUrl || typeof dataUrl !== 'string') return true;
  // Valid external web favicon or image URL (e.g. Google Favicon Service or direct icon)
  if (dataUrl.startsWith('http://') || dataUrl.startsWith('https://')) return false;
  // Valid relative asset path
  if (dataUrl.startsWith('./') || dataUrl.startsWith('/')) return false;
  if (!dataUrl.startsWith('data:image/')) return true;
  // Generic IDI_APPLICATION window is ~850 chars
  if (dataUrl.length <= 860) return true;
  // Generic Windows shell shortcut overlay document icon (40x40 thumbnail, ~1006 chars)
  if (dataUrl.length >= 950 && dataUrl.length <= 1050 && dataUrl.includes('iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAYAAACM')) {
    return true;
  }
  return false;
}

