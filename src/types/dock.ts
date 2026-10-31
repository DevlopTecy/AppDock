export type DockPosition = 'left' | 'right' | 'top';

export interface AppItem {
  id: string;
  name: string;
  type: 'app' | 'url';
  target: string;          // Executable/shortcut path or web URL
  icon?: string;          // Base64 data URL or web favicon URL
  launchCount: number;
  lastLaunched?: number;
  customColor?: string;
}

export type GroupDensity = 'auto' | 'large' | 'medium' | 'compact';

export type CompanionModuleType = 'music' | 'weather' | 'calendar' | null;

export interface AppGroup {
  id: string;
  name: string;
  iconName: string;       // Lucide icon identifier (e.g. 'Gamepad2', 'Briefcase', 'Globe', etc.)
  accentColor: string;    // e.g. '#8b5cf6', '#3b82f6', '#10b981'
  items: AppItem[];
  density?: GroupDensity; // Configurable density or auto-scaling based on app count
}

export type DockTheme =
  | 'dark'
  | 'light'
  | 'translucent'
  | 'glassy'
  | 'minimal'
  | 'cyberpunk'
  | 'midnight'
  | 'emerald'
  | 'kawaii'
  | 'aether'
  | 'deathnote'
  | 'eldenring'
  | 'onepiece'
  | 'candy';

export interface DockSettings {
  dockPosition: DockPosition;
  drawerWidth: number;          // Default: 280 (flexible: 180 - 520)
  drawerHeight?: number;        // Default: 540 (flexible: 360 - 800)
  autoCollapseOnLaunch: boolean;// Default: false
  closeOnBlur: boolean;         // Default: true (Requirement 7)
  toggleOpacity: number;        // Default: 0.7
  theme: DockTheme;
  weatherCities?: string[];     // Up to 5 cities (Requirement 2)
  activeWeatherCity?: string;   // Currently viewed city
  calendarCountry?: string;     // Country code for holidays (Requirement 3)
  verticalPosition?: number;    // Vertical offset ratio (0.02 to 0.98, Default: 0.5)
  cleanDockEnabled?: boolean;   // Clean Dock minimal focus mode
  cleanDockIconSize?: 'small' | 'medium' | 'large' | 'xlarge'; // Icon size in Clean Dock mode
  cleanDockWidth?: number;      // Width for Clean Dock (e.g. 160 - 360, default: 220)
  cleanDockHeight?: number;     // Height for Clean Dock (e.g. 280 - 640, default: 460)
  cleanDockGroupId?: string;    // Selected group for Clean Dock mode
  autoCheckUpdates?: boolean;   // Automatically check for GitHub updates
  githubRepo?: string;          // GitHub repository (e.g. "owner/repo")
  hideFromTaskbar?: boolean;    // Hide from Windows taskbar, running quietly in tray while staying on screen
  autoStartWithWindows?: boolean;// Automatically run and set up when Windows boots (Default: true)
}

export interface SystemApp {
  name: string;
  path: string;
  icon?: string;
  category?: string;
}

export interface DockState {
  groups: AppGroup[];
  activeGroupId: string;
  settings: DockSettings;
  isExpanded: boolean;
  searchQuery: string;
}
