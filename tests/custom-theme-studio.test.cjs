const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

test('Custom Theme Studio & Sub-Options Verification', async (t) => {
  await t.test('1. types/dock.ts includes custom theme and all customTheme* fields', () => {
    const dockTypesPath = path.join(ROOT, 'src', 'types', 'dock.ts');
    const content = fs.readFileSync(dockTypesPath, 'utf8');

    assert.ok(content.includes("'custom'"), "DockTheme union must include 'custom'");
    assert.ok(content.includes('customThemeBgImages?: string[]'), 'DockSettings must include customThemeBgImages');
    assert.ok(content.includes('customThemeBgBlur?: boolean'), 'DockSettings must include customThemeBgBlur');
    assert.ok(content.includes('customThemeBgHide?: boolean'), 'DockSettings must include customThemeBgHide');
    assert.ok(content.includes('customThemeBgOpacity?: number'), 'DockSettings must include customThemeBgOpacity');
    assert.ok(content.includes('customThemeBgRotation?: boolean'), 'DockSettings must include customThemeBgRotation');
    assert.ok(content.includes('customThemeBgRotationSecs?: 20 | 30 | 40 | 50 | 60'), 'DockSettings must include customThemeBgRotationSecs');
    assert.ok(content.includes('customThemeHeaderColor?: string'), 'DockSettings must include customThemeHeaderColor');
    assert.ok(content.includes('customThemeBaseColor?: string'), 'DockSettings must include customThemeBaseColor');
    assert.ok(content.includes('customThemeSidebarColor?: string'), 'DockSettings must include customThemeSidebarColor');
    assert.ok(content.includes('customThemeButtonColor?: string'), 'DockSettings must include customThemeButtonColor');
    assert.ok(content.includes('customThemeSidebarModuleColor?: string'), 'DockSettings must include customThemeSidebarModuleColor');
    assert.ok(content.includes('customThemeFontColor?: string'), 'DockSettings must include customThemeFontColor');
    assert.ok(content.includes('customThemeHideSidebar?: boolean'), 'DockSettings must include customThemeHideSidebar');
    assert.ok(content.includes('customThemeHideSidebarModules?: boolean'), 'DockSettings must include customThemeHideSidebarModules');
    assert.ok(content.includes('customThemeKeepSidebarModule?: \'music\' | \'weather\' | \'calendar\''), 'DockSettings must include customThemeKeepSidebarModule');
    assert.ok(content.includes('customThemeHideALMS?: boolean'), 'DockSettings must include customThemeHideALMS');
    assert.ok(content.includes('customThemeALMSDensity?: \'auto\' | \'large\' | \'medium\' | \'compact\''), 'DockSettings must include customThemeALMSDensity');
    assert.ok(content.includes('customThemeHideAppCount?: boolean'), 'DockSettings must include customThemeHideAppCount');
  });

  await t.test('2. imageUtils.ts exists and exports compressImageToBase64', () => {
    const file = path.join(ROOT, 'src', 'utils', 'imageUtils.ts');
    assert.ok(fs.existsSync(file), 'imageUtils.ts must exist');
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes('export async function compressImageToBase64'), 'compressImageToBase64 must be exported');
  });

  await t.test('3. useCustomThemeVars hook exists and manages CSS variables', () => {
    const file = path.join(ROOT, 'src', 'hooks', 'useCustomThemeVars.ts');
    assert.ok(fs.existsSync(file), 'useCustomThemeVars.ts must exist');
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes('export function useCustomThemeVars'), 'useCustomThemeVars hook must be exported');
    assert.ok(content.includes('--bg-header'), 'Hook must set --bg-header');
    assert.ok(content.includes('--bg-dock'), 'Hook must set --bg-dock');
    assert.ok(content.includes('--sidebar-bg-custom'), 'Hook must set --sidebar-bg-custom');
    assert.ok(content.includes('--accent'), 'Hook must set --accent');
    assert.ok(content.includes('--module-bg-custom'), 'Hook must set --module-bg-custom');
  });

  await t.test('4. CustomThemePanel.tsx exists and supports subOptionsOnly', () => {
    const file = path.join(ROOT, 'src', 'components', 'CustomThemePanel.tsx');
    assert.ok(fs.existsSync(file), 'CustomThemePanel.tsx must exist');
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes('export const CustomThemePanel'), 'CustomThemePanel must be exported');
    assert.ok(content.includes('subOptionsOnly'), 'CustomThemePanel must support subOptionsOnly prop');
    assert.ok(content.includes('Background Blur'), 'Panel must include Background Blur toggle');
    assert.ok(content.includes('Hide Background'), 'Panel must include Hide Background toggle');
    assert.ok(content.includes('Hide Sidebar'), 'Panel must include Hide Sidebar toggle');
    assert.ok(content.includes('Hide Module Buttons'), 'Panel must include Hide Module Buttons toggle');
    assert.ok(content.includes('Hide A, L, M, S Buttons'), 'Panel must include Hide A, L, M, S Buttons toggle');
    assert.ok(content.includes('Hide App Count'), 'Panel must include Hide App Count toggle');
    assert.ok(content.includes('Background Rotation'), 'Panel must include Background Rotation toggle');
    assert.ok(content.includes('Reset Custom Theme'), 'Panel must include Reset Custom Theme button');
    assert.ok(content.includes('Font Color'), 'Panel must include Font Color picker');
  });

  await t.test('5. SettingsView.tsx has Default Themes, Fancy Themes, Custom Theme, and Sub-Options', () => {
    const file = path.join(ROOT, 'src', 'components', 'SettingsView.tsx');
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes('Default Themes'), 'SettingsView must display Default Themes');
    assert.ok(content.includes('Fancy Themes'), 'SettingsView must display Fancy Themes (renamed from Custom Themes)');
    assert.ok(content.includes('Custom Theme</span>'), 'SettingsView must display Custom Theme section');
    assert.ok(content.includes('<CustomThemePanel'), 'SettingsView must render CustomThemePanel');
    assert.ok(content.includes('subOptionsOnly={true}'), 'SettingsView must render Sub-Options for default & fancy themes');
  });

  await t.test('6. DockFrame.tsx renders custom background, blur, rotation, and hidden sidebar logic', () => {
    const file = path.join(ROOT, 'src', 'components', 'DockFrame.tsx');
    const content = fs.readFileSync(file, 'utf8');
    assert.ok(content.includes('customTheme?:'), 'DockFrameProps must accept customTheme');
    assert.ok(content.includes('theme === \'custom\' && !customTheme?.bgHide'), 'DockFrame must render custom theme background');
    assert.ok(content.includes('isSidebarHidden'), 'DockFrame must support hiding sidebar via customTheme.hideSidebar');
    assert.ok(content.includes('customTheme?.bgBlur'), 'DockFrame must support bgBlur');
    assert.ok(content.includes('customTheme?.bgRotation'), 'DockFrame must support bgRotation');
  });

  await t.test('7. ConnectorHub.tsx and GroupSidebar.tsx support module filtering and app count hiding', () => {
    const hubFile = path.join(ROOT, 'src', 'components', 'connectors', 'ConnectorHub.tsx');
    const hubContent = fs.readFileSync(hubFile, 'utf8');
    assert.ok(hubContent.includes('hideSidebarModules'), 'ConnectorHub must support hideSidebarModules');
    assert.ok(hubContent.includes('keepModule'), 'ConnectorHub must support keepModule');

    const sidebarFile = path.join(ROOT, 'src', 'components', 'GroupSidebar.tsx');
    const sidebarContent = fs.readFileSync(sidebarFile, 'utf8');
    assert.ok(sidebarContent.includes('hideAppCount'), 'GroupSidebar must support hideAppCount');
    assert.ok(sidebarContent.includes('--sidebar-bg-custom'), 'GroupSidebar must read --sidebar-bg-custom');
  });

  await t.test('8. AppGrid.tsx supports hideAppCount and hideALMS to hide badge and density selector', () => {
    const gridFile = path.join(ROOT, 'src', 'components', 'AppGrid.tsx');
    const gridContent = fs.readFileSync(gridFile, 'utf8');
    assert.ok(gridContent.includes('hideAppCount'), 'AppGrid must support hideAppCount');
    assert.ok(gridContent.includes('hideALMS'), 'AppGrid must support hideALMS');
  });
});

