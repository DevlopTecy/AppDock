import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assets';
import { AppGroup, AppItem, GroupDensity, DockTheme } from '../types/dock';
import { AppCard } from './AppCard';
import { Plus, UploadCloud, FolderPlus, Sparkles, LayoutGrid } from 'lucide-react';
import { resolveGroupDensity } from '../utils/density';
import { KawaiiSpaceStickers } from './common/KawaiiSpaceStickers';
import { AetherSpaceStickers } from './common/AetherSpaceStickers';

interface AppGridProps {
  group?: AppGroup;
  drawerWidth?: number;
  theme?: DockTheme;
  isCleanDock?: boolean;
  cleanDockIconSize?: 'small' | 'medium' | 'large' | 'xlarge';
  onLaunchItem: (item: AppItem) => void;
  onDeleteItem: (itemId: string) => void;
  onOpenAddModal: () => void;
  onAddNewGroup: () => void;
  onDropFiles?: (files: FileList) => void;
  onUpdateGroupDensity?: (groupId: string, density: GroupDensity) => void;
}

export const AppGrid: React.FC<AppGridProps> = ({
  group,
  drawerWidth,
  theme,
  isCleanDock = false,
  cleanDockIconSize = 'medium',
  onLaunchItem,
  onDeleteItem,
  onOpenAddModal,
  onAddNewGroup,
  onDropFiles,
  onUpdateGroupDensity
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0 && onDropFiles) {
      onDropFiles(e.dataTransfer.files);
    }
  };

  // If no group exists at all
  if (!group) {
    return (
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          gap: '10px'
        }}
      >
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          No groups created
        </div>
        <button
          onClick={onAddNewGroup}
          className="btn-primary"
          style={{
            gap: '6px',
            padding: '6px 16px',
            fontSize: '12px'
          }}
        >
          <Plus size={13} />
          <span>New Group</span>
        </button>
      </div>
    );
  }

  const isNarrow = typeof drawerWidth === 'number' && drawerWidth <= 245;
  const standardLayout = resolveGroupDensity(group, drawerWidth);
  const currentDensity: GroupDensity = group.density || 'auto';

  const cleanDockConfig = cleanDockIconSize === 'small'
    ? { iconSize: 26, minColWidth: 52, cardHeight: 62, gap: 6, fontSize: 10, density: 'compact' as const }
    : cleanDockIconSize === 'large'
    ? { iconSize: 52, minColWidth: 84, cardHeight: 98, gap: 10, fontSize: 12, density: 'large' as const }
    : cleanDockIconSize === 'xlarge'
    ? { iconSize: 66, minColWidth: 100, cardHeight: 118, gap: 12, fontSize: 13, density: 'large' as const }
    : { iconSize: 38, minColWidth: 68, cardHeight: 80, gap: 8, fontSize: 11, density: 'medium' as const };

  const layout = isCleanDock ? {
    ...standardLayout,
    ...cleanDockConfig
  } : standardLayout;

  const densities: { id: GroupDensity; label: string; short: string }[] = [
    { id: 'auto', label: 'Auto', short: 'A' },
    { id: 'large', label: 'Large', short: 'L' },
    { id: 'medium', label: 'Medium', short: 'M' },
    { id: 'compact', label: 'Small', short: 'S' }
  ];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        flex: 1,
        padding: isCleanDock ? '12px 10px 6px 10px' : isNarrow ? '8px 8px 12px 8px' : '10px 12px 14px 12px',
        overflowY: 'auto',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Subtle Drag Over Overlay */}
      {isDragOver && (
        <div
          style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '10px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px dashed rgba(255, 255, 255, 0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            color: 'var(--text-primary)',
            zIndex: 10,
            pointerEvents: 'none'
          }}
        >
          <UploadCloud size={24} color="#ffffff" />
          <div style={{ fontSize: '11.5px', fontWeight: 500 }}>Drop files here</div>
        </div>
      )}

      {/* Whimsical Antigravity & Kawaii Space Cosmic Stickers Layer */}
      {theme === 'kawaii' && <KawaiiSpaceStickers />}

      {/* Celestial Aether & Sky Antigravity Flight Floating Objects Layer */}
      {theme === 'aether' && <AetherSpaceStickers />}

      {/* Grid Subheader: Item count indicator + Density Quick Selector (Hidden in Clean Dock mode) */}
      {!isCleanDock && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
          padding: '2px 0',
          flexShrink: 0,
          gap: '6px',
          minWidth: 0,
          position: 'relative',
          zIndex: 3
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', minWidth: 0, overflow: 'hidden' }}>
          <span
            style={{
              fontSize: '11px',
              color: 'var(--text-secondary)',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            {theme === 'deathnote' ? (
              <span
                style={{
                  borderBottom: '2px solid #a3262d',
                  paddingBottom: '2px',
                  color: '#eae6df',
                  fontFamily: 'var(--font-gothic)',
                  letterSpacing: '0.5px'
                }}
              >
                {group.items.length} {group.items.length === 1 ? 'app' : 'apps'}
              </span>
            ) : theme === 'aether' ? (
              <span
                style={{
                  color: '#0e385e',
                  fontWeight: 800,
                  textShadow: '0 1px 2px rgba(255, 255, 255, 0.9), 0 0 8px rgba(255, 255, 255, 0.95)'
                }}
              >
                {group.items.length} {group.items.length === 1 ? 'app' : 'apps'}
              </span>
            ) : (
              <span>{group.items.length} {group.items.length === 1 ? 'app' : 'apps'}</span>
            )}
            {theme === 'kawaii' && '💖 🍬'}
            {theme === 'aether' && (
              <img
                src={getAssetUrl('/aether/feather.png')}
                alt="Aether Feather"
                style={{ width: '13px', height: '13px', objectFit: 'contain', imageRendering: 'pixelated' }}
                title="Aether Weightless Feather"
              />
            )}
          </span>
        </div>

        {/* Density Selector (A, L, M, S) */}
        <div
          className="density-selector-box"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            background: theme === 'aether' ? 'transparent' : 'var(--bg-surface)',
            border: theme === 'aether' ? 'none' : '1px solid var(--btn-border)',
            borderRadius: '8px',
            padding: theme === 'aether' ? '0' : '2px',
            gap: theme === 'aether' ? '4px' : '2px',
            flexShrink: 0
          }}
        >
          {theme === 'kawaii' && (
            <span style={{ fontSize: '11px', padding: '0 2px 0 4px', userSelect: 'none' }} title="Cosmic Crater Density">
              🪐
            </span>
          )}
          {densities.map((d) => {
            const isSelected = currentDensity === d.id;
            const aetherIcons: Record<string, string> = {
              auto: '/aether/btn_A.png',
              large: '/aether/btn_L.png',
              medium: '/aether/btn_M.png',
              compact: '/aether/btn_S.png'
            };

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => onUpdateGroupDensity && onUpdateGroupDensity(group.id, d.id)}
                title={`Layout size: ${d.label}`}
                style={{
                  border: theme === 'aether'
                    ? 'none'
                    : theme === 'deathnote'
                      ? (isSelected ? '1.5px solid #a3262d' : '1px solid rgba(52, 48, 47, 0.6)')
                      : 'none',
                  background: theme === 'aether'
                    ? 'transparent'
                    : theme === 'deathnote'
                      ? (isSelected ? '#ffffff' : 'rgba(18, 18, 18, 0.85)')
                      : isSelected ? 'var(--text-primary)' : 'transparent',
                  color: theme === 'aether'
                    ? (isSelected ? '#2e1c0d' : '#e8f4fc')
                    : theme === 'deathnote'
                      ? (isSelected ? '#a3262d' : '#96908a')
                      : isSelected ? 'var(--bg-dock)' : 'var(--text-muted)',
                  fontSize: '9.5px',
                  fontWeight: isSelected ? 800 : 500,
                  fontFamily: theme === 'deathnote' ? 'var(--font-gothic)' : undefined,
                  width: theme === 'aether' ? '25px' : '20px',
                  height: theme === 'aether' ? '23px' : '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: theme === 'aether' ? '0' : theme === 'deathnote' ? '6px' : '4px',
                  cursor: 'pointer',
                  padding: 0,
                  boxShadow: theme === 'aether'
                    ? 'none'
                    : theme === 'deathnote' && isSelected
                      ? '0 0 8px rgba(163, 38, 45, 0.7)'
                      : undefined,
                  transition: 'all 0.15s ease'
                }}
              >
                {theme === 'aether' && aetherIcons[d.id] ? (
                  <img
                    src={aetherIcons[d.id]}
                    alt={d.short}
                    style={{
                      width: '25px',
                      height: '23px',
                      objectFit: 'contain',
                      imageRendering: 'pixelated',
                      filter: isSelected
                        ? 'drop-shadow(0 0 5px rgba(255, 223, 89, 0.95)) brightness(1.15)'
                        : 'brightness(0.76) contrast(0.95)',
                      transform: isSelected ? 'scale(1.08)' : 'scale(0.96)',
                      transition: 'transform 0.15s ease, filter 0.15s ease'
                    }}
                  />
                ) : (
                  d.short
                )}
              </button>
            );
          })}
        </div>
      </div>
      )}

      {/* Empty State */}
      {group.items.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center',
            gap: '8px'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--btn-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}
          >
            <FolderPlus size={18} />
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            No apps in {group.name}
          </div>

          {!isCleanDock && (
            <button
              onClick={onOpenAddModal}
              className="btn-primary"
              title="Add to group"
              aria-label="Add to group"
              style={{
                gap: '6px',
                padding: '6px 14px',
                fontSize: '11.5px'
              }}
            >
              <Plus size={13} />
              <span>Add Items</span>
            </button>
          )}
        </div>
      ) : (
        /* Adaptive App Cards Grid with Zero-G Floating Card Wrappers */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(auto-fill, minmax(${layout.minColWidth}px, 1fr))`,
            gap: `${layout.gap}px`,
            position: 'relative',
            zIndex: 3
          }}
        >
          {group.items.map((item) => (
            <div key={item.id} className="app-card-wrapper" style={{ position: 'relative' }}>
              <AppCard
                item={item}
                onLaunch={onLaunchItem}
                onDelete={onDeleteItem}
                iconSize={layout.iconSize}
                cardHeight={layout.cardHeight}
                fontSize={layout.fontSize}
                density={layout.density}
              />
            </div>
          ))}

          {/* Add button styled to match density (Hidden in Clean Dock mode) */}
          {!isCleanDock && (
          <div className="app-card-wrapper btn-add-card-wrapper" style={{ position: 'relative' }}>
            <button
              onClick={onOpenAddModal}
              className="btn-add-card"
              title="Add app or link"
              aria-label="Add app or link"
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: layout.density === 'large' ? '12px 8px' : '6px 4px',
                borderRadius: layout.density === 'large' ? '12px' : '8px',
                cursor: 'pointer',
                border: '1px dashed var(--btn-border)',
                background: 'var(--bg-surface)',
                boxShadow: 'var(--btn-shadow)',
                color: 'var(--text-muted)',
                gap: '4px',
                minHeight: `${layout.cardHeight}px`,
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text-primary)';
                e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                e.currentTarget.style.background = 'var(--bg-surface-hover)';
                e.currentTarget.style.boxShadow = 'var(--btn-shadow-hover)';
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--btn-border)';
                e.currentTarget.style.background = 'var(--bg-surface)';
                e.currentTarget.style.boxShadow = 'var(--btn-shadow)';
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              {theme === 'aether' ? (
                <>
                  <span
                    style={{
                      fontSize: layout.density === 'large' ? '22px' : '16px',
                      color: '#ffdf59',
                      fontWeight: 900,
                      lineHeight: 1,
                      textShadow: '1px 1px 0 #2e1c0d, -1px -1px 0 #2e1c0d, 1px -1px 0 #2e1c0d, -1px 1px 0 #2e1c0d'
                    }}
                  >
                    +
                  </span>
                  <span
                    style={{
                      fontSize: `${layout.fontSize}px`,
                      fontWeight: 700,
                      color: '#2e4960',
                      textShadow: '0 1px 0 #ffffff'
                    }}
                  >
                    Add
                  </span>
                </>
              ) : theme === 'deathnote' ? (
                <>
                  <span
                    style={{
                      fontSize: layout.density === 'large' ? '20px' : '16px',
                      color: '#96908a',
                      fontWeight: 300,
                      lineHeight: 1
                    }}
                  >
                    +
                  </span>
                  <span
                    style={{
                      fontSize: `${layout.fontSize}px`,
                      fontWeight: 500,
                      color: '#96908a',
                      fontFamily: 'var(--font-gothic)'
                    }}
                  >
                    Add
                  </span>
                </>
              ) : (
                <>
                  <Plus size={layout.density === 'large' ? 18 : 14} />
                  <span style={{ fontSize: `${layout.fontSize}px`, fontWeight: 500 }}>Add</span>
                </>
              )}
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AppGrid;
