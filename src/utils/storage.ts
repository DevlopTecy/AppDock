import { AppGroup, DockSettings } from '../types/dock';

const STORAGE_KEY = 'appdock_data_v1';

export const DEFAULT_SETTINGS: DockSettings = {
  dockPosition: 'right',
  drawerWidth: 280,
  drawerHeight: 540,
  autoCollapseOnLaunch: false,
  closeOnBlur: true,
  toggleOpacity: 0.7,
  theme: 'dark',
  weatherCities: ['London', 'New York', 'Tokyo'],
  activeWeatherCity: 'London',
  calendarCountry: 'US',
  verticalPosition: 0.5,
  cleanDockEnabled: false,
  cleanDockIconSize: 'medium',
  cleanDockWidth: 220,
  cleanDockHeight: 460,
  cleanDockGroupId: 'grp-games',
  autoCheckUpdates: true,
  githubRepo: 'DevlopTecy/AppDock',
  autoStartWithWindows: true
};

export const DEFAULT_GROUPS: AppGroup[] = [
  {
    id: 'grp-games',
    name: 'Games',
    iconName: 'Gamepad2',
    accentColor: '#8b5cf6',
    items: [
      {
        id: 'item-steam-web',
        name: 'Steam Store',
        type: 'url',
        target: 'https://store.steampowered.com',
        icon: 'https://store.steampowered.com/favicon.ico',
        launchCount: 12
      },
      {
        id: 'item-epic-web',
        name: 'Epic Games',
        type: 'url',
        target: 'https://store.epicgames.com',
        icon: 'https://store.epicgames.com/favicon.ico',
        launchCount: 4
      }
    ]
  },
  {
    id: 'grp-tools',
    name: 'Tools & Apps',
    iconName: 'Briefcase',
    accentColor: '#3b82f6',
    items: [
      {
        id: 'item-notepad',
        name: 'Notepad',
        type: 'app',
        target: 'C:\\Windows\\notepad.exe',
        launchCount: 24
      },
      {
        id: 'item-calc',
        name: 'Calculator',
        type: 'app',
        target: 'calc.exe',
        launchCount: 19
      },
      {
        id: 'item-explorer',
        name: 'File Explorer',
        type: 'app',
        target: 'explorer.exe',
        launchCount: 31
      }
    ]
  },
  {
    id: 'grp-web',
    name: 'Web Favorites',
    iconName: 'Globe',
    accentColor: '#10b981',
    items: [
      {
        id: 'item-google',
        name: 'Google Search',
        type: 'url',
        target: 'https://www.google.com',
        icon: 'https://www.google.com/favicon.ico',
        launchCount: 45
      },
      {
        id: 'item-github',
        name: 'GitHub',
        type: 'url',
        target: 'https://github.com',
        icon: 'https://github.githubassets.com/favicons/favicon.png',
        launchCount: 38
      },
      {
        id: 'item-youtube',
        name: 'YouTube',
        type: 'url',
        target: 'https://www.youtube.com',
        icon: 'https://www.youtube.com/favicon.ico',
        launchCount: 29
      }
    ]
  }
];

export function normalizeUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return 'https://' + trimmed;
}

export function loadDockData(): { groups: AppGroup[]; settings: DockSettings } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.groups) && parsed.groups.length > 0) {
        return {
          groups: parsed.groups,
          settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) }
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse dock data from localStorage:', err);
  }

  return {
    groups: DEFAULT_GROUPS,
    settings: DEFAULT_SETTINGS
  };
}

export function saveDockData(groups: AppGroup[], settings: DockSettings): void {
  try {
    const payload = JSON.stringify({ groups, settings, updatedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, payload);
    // If in Electron, also mirror to main process for persistent JSON backup
    if (typeof window !== 'undefined' && (window as any).appDock?.saveStorage) {
      (window as any).appDock.saveStorage(payload);
    }
  } catch (err) {
    console.error('Failed to save dock data:', err);
  }
}
