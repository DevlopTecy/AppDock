import React, { useState, useEffect, useCallback } from 'react';
import { AppGroup, AppItem, DockSettings, GroupDensity, CompanionModuleType } from './types/dock';
import { loadDockData, saveDockData, DEFAULT_GROUPS, DEFAULT_SETTINGS } from './utils/storage';
import { DockFrame } from './components/DockFrame';
import { GroupTabs } from './components/GroupTabs';
import { AppGrid } from './components/AppGrid';
import { AddItemModal } from './components/AddItemModal';
import { NewGroupModal } from './components/NewGroupModal';
import { SettingsView } from './components/SettingsView';
import { SearchBar } from './components/SearchBar';
import { MusicModule } from './components/modules/MusicModule';
import { WeatherModule } from './components/modules/WeatherModule';
import { CalendarModule } from './components/modules/CalendarModule';
import { UpdateNotification } from './components/UpdateNotification';

export const App: React.FC = () => {
  const [data, setData] = useState(() => {
    const init = loadDockData();
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTheme = params.get('theme') as any;
      if (['dark', 'light', 'cyberpunk', 'midnight', 'emerald', 'kawaii', 'aether', 'deathnote'].includes(urlTheme)) {
        init.settings.theme = urlTheme;
      }
      const urlWidth = params.get('width');
      if (urlWidth && !isNaN(Number(urlWidth))) {
        init.settings.drawerWidth = Number(urlWidth);
      }
      const urlDock = params.get('dock') as any;
      if (['left', 'right', 'top'].includes(urlDock)) {
        init.settings.dockPosition = urlDock;
      }
      const urlCleanDock = params.get('cleandock');
      if (urlCleanDock === '1' || urlCleanDock === 'true') {
        init.settings.cleanDockEnabled = true;
      }
      const urlCleanIconSize = params.get('cleaniconsize') as any;
      if (['small', 'medium', 'large', 'xlarge'].includes(urlCleanIconSize)) {
        init.settings.cleanDockIconSize = urlCleanIconSize;
      }
      const urlCleanGroup = params.get('cleangroup');
      if (urlCleanGroup) {
        init.settings.cleanDockGroupId = urlCleanGroup;
      }
    }
    return init;
  });
  const [activeGroupId, setActiveGroupId] = useState<string>(() => {
    const init = loadDockData();
    return init.groups[0]?.id || 'grp-games';
  });

  // Current active group
  const activeGroup =
    data.groups.find((g) => g.id === activeGroupId) || data.groups[0];

  // Clean Dock computed state
  const isCleanDock = !!data.settings.cleanDockEnabled;
  const cleanDockGroup = data.groups.find((g) => g.id === data.settings.cleanDockGroupId) || activeGroup || data.groups[0];
  const effectiveWidth = isCleanDock ? (data.settings.cleanDockWidth || 220) : data.settings.drawerWidth;
  const effectiveHeight = isCleanDock ? (data.settings.cleanDockHeight || 460) : (data.settings.drawerHeight || 540);

  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('expanded') === '1' || params.get('expanded') === 'true') {
        return true;
      }
    }
    return false;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'add';
    }
    return false;
  });

  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'newgroup';
    }
    return false;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'settings';
    }
    return false;
  });

  const [isSearchOpen, setIsSearchOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('modal') === 'search';
    }
    return false;
  });

  const [activeModule, setActiveModule] = useState<CompanionModuleType>(() => {
    if (typeof window !== 'undefined') {
      const mod = new URLSearchParams(window.location.search).get('module');
      if (mod === 'music' || mod === 'weather' || mod === 'calendar') return mod as CompanionModuleType;
    }
    return null;
  });
  const [cachedModule, setCachedModule] = useState<CompanionModuleType>(() => {
    if (typeof window !== 'undefined') {
      const mod = new URLSearchParams(window.location.search).get('module');
      if (mod === 'music' || mod === 'weather' || mod === 'calendar') return mod as CompanionModuleType;
    }
    return null;
  });

  useEffect(() => {
    if (activeModule) {
      setCachedModule(activeModule);
    }
  }, [activeModule]);

  // Apply Theme Mode on Mount & Changes
  useEffect(() => {
    const theme = data.settings.theme || 'dark';
    document.documentElement.setAttribute('data-theme', theme);
  }, [data.settings.theme]);

  // Sync module bounds with Electron when dock is expanded
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
      if (isExpanded) {
        if (isCleanDock) {
          (window as any).appDock.setModuleWidth(-1);
        } else if (activeModule) {
          (window as any).appDock.setModuleWidth(340);
        } else {
          // Allow 200ms for graceful CSS exit transition before shrinking native window
          const timer = setTimeout(() => {
            if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
              (window as any).appDock.setModuleWidth(54);
            }
          }, 200);
          return () => clearTimeout(timer);
        }
      } else {
        (window as any).appDock.setModuleWidth(0);
      }
    }
  }, [isExpanded, activeModule, isCleanDock]);

  // Sync state changes with persistence
  const updateGroups = useCallback((newGroups: AppGroup[]) => {
    setData((prev) => {
      const next = { ...prev, groups: newGroups };
      saveDockData(next.groups, next.settings);
      return next;
    });
  }, []);

  // Auto-repair missing icons, relative shortcut targets (e.g. Antigravity, CapCut, Gemini)
  useEffect(() => {
    let cancelled = false;
    const repairItems = async () => {
      if (typeof window === 'undefined' || !(window as any).appDock?.resolveItem) return;

      let changed = false;
      const newGroups = await Promise.all(
        data.groups.map(async (grp) => {
          let grpChanged = false;
          const newItems = await Promise.all(
            grp.items.map(async (item) => {
              const isRelative = item.type === 'app' && !item.target.includes('\\') && !item.target.includes('/');
              const needsFix = item.type === 'app' && (isRelative || !item.icon || item.name.toLowerCase().includes('gemini'));

              if (needsFix) {
                try {
                  const res = await (window as any).appDock.resolveItem({ name: item.name, target: item.target });
                  if (res && (res.target !== item.target || (res.icon && res.icon !== item.icon))) {
                    grpChanged = true;
                    changed = true;
                    return {
                      ...item,
                      target: res.target || item.target,
                      icon: res.icon || item.icon
                    };
                  }
                } catch {}
              }
              return item;
            })
          );
          return grpChanged ? { ...grp, items: newItems } : grp;
        })
      );

      if (!cancelled && changed) {
        updateGroups(newGroups);
      }
    };

    const timer = setTimeout(repairItems, 1000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<DockSettings>) => {
    setData((prev) => {
      const next = { ...prev, settings: { ...prev.settings, ...partial } };
      saveDockData(next.groups, next.settings);
      return next;
    });
    if (partial.drawerWidth || partial.drawerHeight) {
      if (typeof window !== 'undefined' && (window as any).appDock?.setDrawerDimensions) {
        (window as any).appDock.setDrawerDimensions({
          width: partial.drawerWidth,
          height: partial.drawerHeight
        });
      }
    }
    if (typeof partial.verticalPosition === 'number') {
      if (typeof window !== 'undefined' && (window as any).appDock?.setVerticalPosition) {
        (window as any).appDock.setVerticalPosition(partial.verticalPosition);
      }
    }
  }, []);

  // Sync initial dimensions, vertical position, and taskbar visibility with Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock) {
      if ((window as any).appDock.setDrawerDimensions) {
        (window as any).appDock.setDrawerDimensions({
          width: effectiveWidth,
          height: effectiveHeight
        });
      }
      if ((window as any).appDock.setVerticalPosition) {
        (window as any).appDock.setVerticalPosition(data.settings.verticalPosition ?? 0.5);
      }
      if ((window as any).appDock.setSkipTaskbar && typeof data.settings.hideFromTaskbar === 'boolean') {
        (window as any).appDock.setSkipTaskbar(data.settings.hideFromTaskbar);
      }
    }
  }, [effectiveWidth, effectiveHeight, data.settings.hideFromTaskbar]);

  // Handle expanding / collapsing dock window
  const handleToggle = useCallback(
    async (forceState?: boolean) => {
      const nextState = typeof forceState === 'boolean' ? forceState : !isExpanded;
      setIsExpanded(nextState);

      // User requirement: when main module closes, small ones all close too!
      if (!nextState) {
        setActiveModule(null);
        if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
          (window as any).appDock.setModuleWidth(0);
        }
      } else {
        if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
          (window as any).appDock.setModuleWidth(isCleanDock ? -1 : (activeModule ? 340 : 54));
        }
      }

      if (typeof window !== 'undefined' && (window as any).appDock?.setState) {
        try {
          await (window as any).appDock.setState(nextState);
        } catch (err) {
          console.error('Failed to notify Electron of dock state:', err);
        }
      }
    },
    [isExpanded, activeModule, isCleanDock]
  );

  // Listen for collapse and expand commands from Electron (e.g. system tray, taskbar toggle)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock) {
      const cleanups: (() => void)[] = [];
      if ((window as any).appDock.onDockCollapse) {
        cleanups.push(
          (window as any).appDock.onDockCollapse(() => {
            setIsSettingsOpen(false);
            setIsAddModalOpen(false);
            setIsNewGroupModalOpen(false);
            setIsSearchOpen(false);
            handleToggle(false);
          })
        );
      }
      if ((window as any).appDock.onDockExpand) {
        cleanups.push(
          (window as any).appDock.onDockExpand(() => {
            handleToggle(true);
          })
        );
      }
      return () => {
        cleanups.forEach((c) => c());
      };
    }
  }, [handleToggle]);

  // Auto-close on blur if enabled (Requirement 7)
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock?.onWindowBlur) {
      const cleanup = (window as any).appDock.onWindowBlur(() => {
        if (data.settings.closeOnBlur && isExpanded) {
          setIsSettingsOpen(false);
          setIsAddModalOpen(false);
          setIsNewGroupModalOpen(false);
          setIsSearchOpen(false);
          handleToggle(false);
        }
      });
      return cleanup;
    }
  }, [data.settings.closeOnBlur, isExpanded, handleToggle]);

  // Sync window resize events from Electron
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock?.onWindowResized) {
      const cleanup = (window as any).appDock.onWindowResized((dims: { width: number; height: number }) => {
        if (dims && typeof dims.width === 'number') {
          setData((prev) => {
            const next = {
              ...prev,
              settings: {
                ...prev.settings,
                drawerWidth: dims.width,
                ...(dims.height ? { drawerHeight: dims.height } : {})
              }
            };
            saveDockData(next.groups, next.settings);
            return next;
          });
        }
      });
      return cleanup;
    }
  }, []);

  // Global Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeModule) setActiveModule(null);
        else if (isAddModalOpen) setIsAddModalOpen(false);
        else if (isNewGroupModalOpen) setIsNewGroupModalOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isSearchOpen) setIsSearchOpen(false);
        else if (isExpanded) handleToggle(false);
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeModule, isAddModalOpen, isNewGroupModalOpen, isSettingsOpen, isSearchOpen, isExpanded, handleToggle]);

  // Delete Group handler (Allows removing ANY group including defaults!)
  const handleDeleteGroup = (groupId: string) => {
    const remaining = data.groups.filter((g) => g.id !== groupId);
    updateGroups(remaining);
    if (activeGroupId === groupId) {
      if (remaining.length > 0) {
        setActiveGroupId(remaining[0].id);
      }
    }
  };

  // Launch Item handler
  const handleLaunchItem = async (item: AppItem) => {
    try {
      if (typeof window !== 'undefined' && (window as any).appDock) {
        if (item.type === 'url') {
          await (window as any).appDock.launchUrl(item.target);
        } else {
          await (window as any).appDock.launchPath(item.target);
        }
      } else {
        if (item.type === 'url') {
          window.open(item.target, '_blank');
        } else {
          alert(`In native Electron, this will launch: ${item.target}`);
        }
      }

      // Increment launch count
      const updatedGroups = data.groups.map((grp) => ({
        ...grp,
        items: grp.items.map((it) =>
          it.id === item.id
            ? { ...it, launchCount: (it.launchCount || 0) + 1, lastLaunched: Date.now() }
            : it
        )
      }));
      updateGroups(updatedGroups);

      // Auto-collapse if setting enabled
      if (data.settings.autoCollapseOnLaunch) {
        handleToggle(false);
      }
    } catch (err) {
      console.error('Launch failed:', err);
    }
  };

  // Add Item handler
  const handleAddItem = (newItem: AppItem) => {
    if (!activeGroup) return;
    const updatedGroups = data.groups.map((grp) => {
      if (grp.id === activeGroup.id) {
        return {
          ...grp,
          items: [...grp.items, newItem]
        };
      }
      return grp;
    });
    updateGroups(updatedGroups);
  };

  // Delete Item handler
  const handleDeleteItem = (groupId: string, itemId: string) => {
    const updatedGroups = data.groups.map((grp) => {
      if (grp.id === groupId) {
        return {
          ...grp,
          items: grp.items.filter((it) => it.id !== itemId)
        };
      }
      return grp;
    });
    updateGroups(updatedGroups);
  };

  // Update Group Density handler (Auto, Large, Medium, Small)
  const handleUpdateGroupDensity = (groupId: string, density: GroupDensity) => {
    const updatedGroups = data.groups.map((grp) => {
      if (grp.id === groupId) {
        return {
          ...grp,
          density
        };
      }
      return grp;
    });
    updateGroups(updatedGroups);
  };

  // Drop Files handler
  const handleDropFiles = async (files: FileList) => {
    if (!activeGroup) return;
    const newItems: AppItem[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let filePath = '';
      if (typeof window !== 'undefined' && (window as any).appDock?.getPathForFile) {
        try {
          filePath = (window as any).appDock.getPathForFile(file);
        } catch {}
      }
      if (!filePath) {
        filePath = (file as any).path || file.name;
      }
      const baseName = file.name.replace(/\.[^/.]+$/, '');

      let icon: string | undefined = undefined;
      let finalTarget = filePath;

      if (typeof window !== 'undefined' && (window as any).appDock) {
        try {
          if ((window as any).appDock.resolveItem) {
            const res = await (window as any).appDock.resolveItem({ name: baseName, target: filePath });
            if (res) {
              if (res.target) finalTarget = res.target;
              if (res.icon) icon = res.icon;
            }
          }
          if (!icon && (window as any).appDock.extractIcon) {
            icon = (await (window as any).appDock.extractIcon(finalTarget)) || undefined;
          }
        } catch {}
      }

      newItems.push({
        id: `dropped-${Date.now()}-${i}`,
        name: baseName,
        type: 'app',
        target: finalTarget,
        icon,
        launchCount: 0
      });
    }

    if (newItems.length > 0) {
      const updatedGroups = data.groups.map((grp) => {
        if (grp.id === activeGroup.id) {
          return {
            ...grp,
            items: [...grp.items, ...newItems]
          };
        }
        return grp;
      });
      updateGroups(updatedGroups);
    }
  };

  // Reset defaults handler
  const handleResetDefaults = () => {
    setData({
      groups: DEFAULT_GROUPS,
      settings: DEFAULT_SETTINGS
    });
    saveDockData(DEFAULT_GROUPS, DEFAULT_SETTINGS);
    setActiveGroupId(DEFAULT_GROUPS[0].id);
    setIsSettingsOpen(false);
  };

  return (
    <DockFrame
      isExpanded={isExpanded}
      dockPosition={data.settings.dockPosition}
      drawerWidth={effectiveWidth}
      toggleOpacity={data.settings.toggleOpacity}
      activeGroupName={isCleanDock ? (cleanDockGroup?.name || 'Group') : (activeGroup?.name || 'Empty')}
      itemCount={isCleanDock ? (cleanDockGroup ? cleanDockGroup.items.length : 0) : (activeGroup ? activeGroup.items.length : 0)}
      activeModule={isCleanDock ? null : activeModule}
      onSelectModule={(mod) => setActiveModule(mod)}
      isCleanDock={isCleanDock}
      onExitCleanDock={() => updateSettings({ cleanDockEnabled: false })}
      companionContent={
        !isCleanDock && (activeModule || cachedModule) && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            {(activeModule || cachedModule) === 'music' && <MusicModule />}
            {(activeModule || cachedModule) === 'weather' && (
              <WeatherModule
                cities={data.settings.weatherCities}
                activeCity={data.settings.activeWeatherCity}
                onSelectCity={(city) => updateSettings({ activeWeatherCity: city })}
              />
            )}
            {(activeModule || cachedModule) === 'calendar' && (
              <CalendarModule countryCode={data.settings.calendarCountry || 'US'} />
            )}
          </div>
        )
      }
      onToggle={() => handleToggle()}
      onOpenSearch={() => setIsSearchOpen(true)}
      onOpenAdd={() => setIsAddModalOpen(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
      onResizeWidth={(w) => updateSettings(isCleanDock ? { cleanDockWidth: w } : { drawerWidth: w })}
      verticalPosition={data.settings.verticalPosition ?? 0.5}
      onUpdateVerticalPosition={(pos) => updateSettings({ verticalPosition: pos })}
      theme={data.settings.theme}
    >
      {/* Main Content Area: Vertical Group Sidebar + App Grid */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: data.settings.dockPosition === 'right' ? 'row-reverse' : 'row',
          overflow: 'hidden',
          height: '100%'
        }}
      >
        {!isCleanDock && (
          <GroupTabs
            groups={data.groups}
            activeGroupId={activeGroup?.id || ''}
            dockPosition={data.settings.dockPosition}
            onSelectGroup={(id) => setActiveGroupId(id)}
            onAddNewGroup={() => setIsNewGroupModalOpen(true)}
            onDeleteGroup={handleDeleteGroup}
          />
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
          <AppGrid
            group={isCleanDock ? cleanDockGroup : activeGroup}
            drawerWidth={effectiveWidth}
            theme={data.settings.theme}
            isCleanDock={isCleanDock}
            cleanDockIconSize={data.settings.cleanDockIconSize || 'medium'}
            onLaunchItem={handleLaunchItem}
            onDeleteItem={(id) => {
              const targetGrp = isCleanDock ? cleanDockGroup : activeGroup;
              if (targetGrp) handleDeleteItem(targetGrp.id, id);
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onAddNewGroup={() => setIsNewGroupModalOpen(true)}
            onDropFiles={handleDropFiles}
            onUpdateGroupDensity={handleUpdateGroupDensity}
          />
        </div>
      </div>

      {/* Modals & Overlays */}
      {!isCleanDock && activeGroup && (
        <AddItemModal
          isOpen={isAddModalOpen}
          activeGroup={activeGroup}
          onClose={() => setIsAddModalOpen(false)}
          onAddItem={handleAddItem}
          theme={data.settings.theme}
        />
      )}

      {!isCleanDock && (
        <NewGroupModal
          isOpen={isNewGroupModalOpen}
          onClose={() => setIsNewGroupModalOpen(false)}
          onCreateGroup={(newGrp) => {
            updateGroups([...data.groups, newGrp]);
            setActiveGroupId(newGrp.id);
          }}
          theme={data.settings.theme}
        />
      )}

      <SettingsView
        isOpen={isSettingsOpen}
        settings={data.settings}
        groups={data.groups}
        onClose={() => setIsSettingsOpen(false)}
        onUpdateSettings={updateSettings}
        onResetDefaults={handleResetDefaults}
        onActivateCleanDock={() => {
          setIsSettingsOpen(false);
          handleToggle(false);
        }}
      />

      {!isCleanDock && (
        <SearchBar
          isOpen={isSearchOpen}
          groups={data.groups}
          onClose={() => setIsSearchOpen(false)}
          onLaunchItem={handleLaunchItem}
          onDeleteItem={handleDeleteItem}
          theme={data.settings.theme}
        />
      )}

      {/* Floating Update Notification Popup */}
      <UpdateNotification
        theme={data.settings.theme}
        githubRepo={data.settings.githubRepo}
      />
    </DockFrame>
  );
};

export default App;
