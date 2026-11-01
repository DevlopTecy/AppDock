import { useEffect } from 'react';
import { DockSettings } from '../types/dock';

/**
 * Injects custom theme CSS variables onto documentElement when theme === 'custom'.
 * Cleans up all vars when switching away from 'custom'.
 */
export function useCustomThemeVars(settings: DockSettings): void {
  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme !== 'custom') {
      // Remove any previously-set custom vars
      root.style.removeProperty('--bg-header');
      root.style.removeProperty('--bg-dock');
      root.style.removeProperty('--bg-footer');
      root.style.removeProperty('--bg-surface');
      root.style.removeProperty('--sidebar-bg-custom');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--btn-border');
      root.style.removeProperty('--module-bg-custom');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--text-muted');
      return;
    }

    if (settings.customThemeHeaderColor) {
      root.style.setProperty('--bg-header', settings.customThemeHeaderColor);
    }
    if (settings.customThemeBaseColor) {
      root.style.setProperty('--bg-dock', settings.customThemeBaseColor);
      root.style.setProperty('--bg-footer', settings.customThemeBaseColor);
    }
    if (settings.customThemeSidebarColor) {
      root.style.setProperty('--sidebar-bg-custom', settings.customThemeSidebarColor);
    }
    if (settings.customThemeButtonColor) {
      root.style.setProperty('--accent', settings.customThemeButtonColor);
      root.style.setProperty('--btn-border', settings.customThemeButtonColor + '66');
    }
    if (settings.customThemeSidebarModuleColor) {
      root.style.setProperty('--module-bg-custom', settings.customThemeSidebarModuleColor);
    }
    // Surface inherits from base
    if (settings.customThemeBaseColor) {
      root.style.setProperty('--bg-surface', settings.customThemeBaseColor + 'cc');
    }
    // Font / text color
    if (settings.customThemeFontColor) {
      root.style.setProperty('--text-primary', settings.customThemeFontColor);
      if (settings.customThemeFontColor.startsWith('#') && settings.customThemeFontColor.length === 7) {
        root.style.setProperty('--text-secondary', settings.customThemeFontColor + 'cc');
        root.style.setProperty('--text-muted', settings.customThemeFontColor + '88');
      } else {
        root.style.setProperty('--text-secondary', settings.customThemeFontColor);
      }
    } else {
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--text-muted');
    }
  }, [
    settings.theme,
    settings.customThemeHeaderColor,
    settings.customThemeBaseColor,
    settings.customThemeSidebarColor,
    settings.customThemeButtonColor,
    settings.customThemeSidebarModuleColor,
    settings.customThemeFontColor
  ]);
}
