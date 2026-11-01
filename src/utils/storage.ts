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
  autoStartWithWindows: true,
  hideQuickIcons: false,
  customThemeHideQuickIcons: false,
  quickIcons: [],
  customThemeBgRotation: true,
  soundEnabled: false,
  soundVolume: 50,
  soundPack: 'theme',
  showRunningIndicators: true,
  smartWindowDodge: false
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
        icon: 'https://www.google.com/s2/favicons?domain=store.steampowered.com&sz=128',
        launchCount: 12
      },
      {
        id: 'item-epic-web',
        name: 'Epic Games',
        type: 'url',
        target: 'https://store.epicgames.com',
        icon: 'https://www.google.com/s2/favicons?domain=store.epicgames.com&sz=128',
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
        icon: 'https://www.google.com/s2/favicons?domain=google.com&sz=128',
        launchCount: 45
      },
      {
        id: 'item-github',
        name: 'GitHub',
        type: 'url',
        target: 'https://github.com',
        icon: 'https://www.google.com/s2/favicons?domain=github.com&sz=128',
        launchCount: 38
      },
      {
        id: 'item-youtube',
        name: 'YouTube',
        type: 'url',
        target: 'https://www.youtube.com',
        icon: 'https://www.google.com/s2/favicons?domain=youtube.com&sz=128',
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

const MIGRATION_KEY = 'appdock_defaults_v1_0_7_applied';

export function loadDockData(): { groups: AppGroup[]; settings: DockSettings } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && Array.isArray(parsed.groups) && parsed.groups.length > 0) {
        const mergedSettings: DockSettings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };

        // One-time update preset migration: enforce required defaults when user downloads or updates
        if (typeof window !== 'undefined' && !localStorage.getItem(MIGRATION_KEY)) {
          mergedSettings.customThemeBgRotation = true;
          mergedSettings.autoStartWithWindows = true;
          mergedSettings.smartWindowDodge = false;
          mergedSettings.soundEnabled = false;
          try {
            localStorage.setItem(MIGRATION_KEY, 'true');
            saveDockData(parsed.groups, mergedSettings);
          } catch {}
        }

        return {
          groups: parsed.groups,
          settings: mergedSettings
        };
      }
    }
  } catch (err) {
    console.warn('Failed to parse dock data from localStorage:', err);
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(MIGRATION_KEY, 'true');
    } catch {}
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
