import React, { useState, useEffect } from 'react';
import { AppItem, SystemApp } from '../types/dock';
import { Search, Check, Plus, AppWindow } from 'lucide-react';
import { UiverseLoader } from './common/UiverseLoader';

interface QuickScannerProps {
  onAddScannedItem: (item: AppItem) => void;
  existingTargetPaths: Set<string>;
}

export const QuickScanner: React.FC<QuickScannerProps> = ({
  onAddScannedItem,
  existingTargetPaths
}) => {
  const [apps, setApps] = useState<SystemApp[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterText, setFilterText] = useState('');
  const [addedPaths, setAddedPaths] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const fetchShortcuts = async () => {
      setLoading(true);
      try {
        if (typeof window !== 'undefined' && (window as any).appDock?.scanSystemShortcuts) {
          const scanned = await (window as any).appDock.scanSystemShortcuts();
          if (isMounted && Array.isArray(scanned)) {
            setApps(scanned);
          }
        } else {
          if (isMounted) {
            setApps([
              { name: 'Google Chrome', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' },
              { name: 'Visual Studio Code', path: 'C:\\Program Files\\Microsoft VS Code\\Code.exe' },
              { name: 'Discord', path: 'C:\\Users\\User\\AppData\\Local\\Discord\\Discord.exe' },
              { name: 'Steam', path: 'C:\\Program Files (x86)\\Steam\\steam.exe' },
              { name: 'Spotify', path: 'C:\\Users\\User\\AppData\\Roaming\\Spotify\\Spotify.exe' },
              { name: 'Obsidian', path: 'C:\\Users\\User\\AppData\\Local\\Obsidian\\Obsidian.exe' },
              { name: 'VLC media player', path: 'C:\\Program Files\\VideoLAN\\VLC\\vlc.exe' }
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to scan system shortcuts:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchShortcuts();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAdd = async (app: SystemApp) => {
    let target = app.path;
    let icon = app.icon;

    if (typeof window !== 'undefined' && (window as any).appDock?.resolveItem) {
      try {
        const res = await (window as any).appDock.resolveItem({ name: app.name, target: app.path });
        if (res) {
          if (res.target) target = res.target;
          if (res.icon) icon = res.icon;
        }
      } catch {}
    }

    if (!icon && typeof window !== 'undefined' && (window as any).appDock?.extractIcon) {
      try {
        icon = await (window as any).appDock.extractIcon(target);
      } catch {}
    }

    const newItem: AppItem = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: app.name,
      type: 'app',
      target,
      icon: icon || undefined,
      launchCount: 0
    };

    setAddedPaths((prev) => new Set(prev).add(app.path));
    onAddScannedItem(newItem);
  };

  const filteredApps = apps.filter((app) =>
    app.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Search Input */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 10px',
          borderRadius: '6px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          marginBottom: '8px'
        }}
      >
        <Search size={13} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '12px',
            outline: 'none'
          }}
        />
      </div>

      {/* Scanned Icon Grid with small title below */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))',
          gap: '6px',
          padding: '2px',
          alignContent: 'start'
        }}
      >
        {loading ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '36px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <UiverseLoader scale={0.75} label="Scanning system shortcuts..." />
          </div>
        ) : filteredApps.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              padding: '24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '11.5px'
            }}
          >
            No matches
          </div>
        ) : (
          filteredApps.map((app) => {
            const isAlreadyAdded = existingTargetPaths.has(app.path) || addedPaths.has(app.path);
            return (
              <button
                key={app.path}
                disabled={isAlreadyAdded}
                onClick={() => handleAdd(app)}
                title={isAlreadyAdded ? `${app.name} (Added)` : `Add ${app.name}`}
                aria-label={isAlreadyAdded ? `${app.name} (Added)` : `Add ${app.name}`}
                className={`quick-scanner-card ${isAlreadyAdded ? 'is-added' : ''}`}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '6px 3px 5px 3px',
                  borderRadius: '7px',
                  background: isAlreadyAdded ? 'var(--bg-dock)' : 'var(--bg-surface)',
                  border: isAlreadyAdded ? '1px solid var(--border-subtle)' : '1px solid var(--btn-border)',
                  boxShadow: 'var(--btn-shadow)',
                  cursor: isAlreadyAdded ? 'default' : 'pointer',
                  opacity: isAlreadyAdded ? 0.45 : 1,
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                  outline: 'none',
                  minHeight: '60px',
                  maxHeight: '68px',
                  minWidth: 0,
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isAlreadyAdded) {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isAlreadyAdded) {
                    e.currentTarget.style.background = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--btn-border)';
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  }
                }}
              >
                {/* Check badge when added */}
                {isAlreadyAdded && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '3px',
                      right: '3px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      zIndex: 2
                    }}
                  >
                    <Check size={8} strokeWidth={3} />
                  </div>
                )}

                {/* App Icon with smooth hover zoom transition */}
                <div
                  className="app-icon-wrapper"
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '5px',
                    background: 'var(--bg-dock)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)',
                    marginBottom: '3px',
                    flexShrink: 0
                  }}
                >
                  {app.icon ? (
                    <img
                      src={app.icon}
                      alt=""
                      style={{
                        width: '22px',
                        height: '22px',
                        objectFit: 'contain',
                        imageRendering: '-webkit-optimize-contrast'
                      }}
                    />
                  ) : (
                    <AppWindow size={16} />
                  )}
                </div>

                {/* Small Title Text Below */}
                <div
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 500,
                    color: isAlreadyAdded ? 'var(--text-muted)' : 'var(--text-primary)',
                    textAlign: 'center',
                    width: '100%',
                    padding: '0 2px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    lineHeight: 1.15
                  }}
                >
                  {app.name}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
