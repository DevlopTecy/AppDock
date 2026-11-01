import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppItem, AppGroup, DockTheme } from '../types/dock';
import { getAssetUrl, isGenericOrBrokenIcon } from '../utils/assets';
import { Plus, Globe, AppWindow, X, Trash2 } from 'lucide-react';

export interface QuickIconsBarProps {
  items: AppItem[];
  groups?: AppGroup[];
  onLaunchItem: (item: AppItem) => void;
  onRemoveQuickIcon: (itemId: string) => void;
  onAddQuickIcon: (item: AppItem) => void;
  onOpenAddModal: () => void;
  theme?: DockTheme;
  orientation?: 'vertical' | 'horizontal';
  isRightDock?: boolean;
}

export const QuickIconsBar: React.FC<QuickIconsBarProps> = ({
  items = [],
  groups = [],
  onLaunchItem,
  onRemoveQuickIcon,
  onAddQuickIcon,
  onOpenAddModal,
  theme,
  orientation = 'vertical',
  isRightDock = false
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isHoveredAdd, setIsHoveredAdd] = useState(false);
  const [isDragOverBar, setIsDragOverBar] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ item: AppItem; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDeathNote = theme === 'deathnote';
  const isAether = theme === 'aether';
  const isEldenRing = theme === 'eldenring' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'eldenring');
  const isKawaii = theme === 'kawaii';
  const isOnePiece = theme === 'onepiece';
  const isCandy = theme === 'candy';

  const isVertical = orientation === 'vertical';

  // Render thumbnail
  const renderItemThumb = (item: AppItem) => {
    const isUrl = item.type === 'url';
    const googleFavicon = isUrl
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(item.target)}&sz=128`
      : undefined;

    const hasCustomIcon = item.icon && !isGenericOrBrokenIcon(item.icon);
    const iconSrc = hasCustomIcon ? item.icon : googleFavicon;

    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt=""
          style={{
            width: isEldenRing ? '22px' : '20px',
            height: isEldenRing ? '22px' : '20px',
            objectFit: 'contain',
            borderRadius: '4px',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.45))'
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    if (isUrl) {
      return <Globe size={isEldenRing ? 18 : 16} color="var(--text-primary)" />;
    }
    return <AppWindow size={isEldenRing ? 18 : 16} color="var(--text-primary)" />;
  };

  // Drag and Drop: Dragging from group grid onto QuickIconsBar
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const rawTypes = Array.from(e.dataTransfer.types || []);
    const types = rawTypes.map((t) => t.toLowerCase());

    const isCardDrag =
      types.includes('application/x-appdock-item') ||
      types.includes('application/x-appdock-item-json') ||
      (typeof window !== 'undefined' && (!!(window as any).__appdock_dragging_card_id || !!(window as any).__appdock_dragging_item));

    if (isCardDrag) {
      e.dataTransfer.dropEffect = 'copy';
      if (!isDragOverBar) setIsDragOverBar(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverBar(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverBar(false);

    // Try finding dragged item from in-memory global
    let draggedItem: AppItem | null = null;
    if (typeof window !== 'undefined' && (window as any).__appdock_dragging_item) {
      draggedItem = (window as any).__appdock_dragging_item;
    }

    // Try parsing item JSON from dataTransfer
    if (!draggedItem) {
      try {
        const rawJson = e.dataTransfer.getData('application/x-appdock-item-json');
        if (rawJson) {
          draggedItem = JSON.parse(rawJson);
        }
      } catch {}
    }

    // Try lookup by ID across groups
    if (!draggedItem) {
      const cardId =
        (typeof window !== 'undefined' ? (window as any).__appdock_dragging_card_id : null) ||
        e.dataTransfer.getData('application/x-appdock-item');

      if (cardId && groups) {
        for (const g of groups) {
          const found = g.items.find((it) => it.id === cardId);
          if (found) {
            draggedItem = found;
            break;
          }
        }
      }
    }

    if (draggedItem) {
      onAddQuickIcon(draggedItem);
    }
  };

  // Close context menu on outside click or escape
  useEffect(() => {
    if (!contextMenu) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.quick-icon-context-menu')) return;
      setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutside);
      window.addEventListener('contextmenu', handleOutside);
    }, 50);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutside);
      window.removeEventListener('contextmenu', handleOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

  // Button sizes & styles
  const btnSize = isEldenRing ? '38px' : '36px';
  const btnRadius = isEldenRing ? '8px' : isKawaii || isCandy ? '12px' : '10px';

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: 'center',
        gap: '8px',
        width: isVertical ? '100%' : 'auto',
        maxWidth: '100%',
        minWidth: 0,
        padding: isVertical ? '2px 0' : '0 4px',
        borderRadius: isKawaii || isCandy ? '14px' : '10px',
        background: isDragOverBar
          ? 'rgba(59, 130, 246, 0.22)'
          : 'transparent',
        border: isDragOverBar
          ? '1.5px dashed #3b82f6'
          : '1px solid transparent',
        transition: 'all 0.18s ease',
        position: 'relative'
      }}
      title="Quick Icons: Single-click to launch, or drag apps here"
    >
      {/* Items list */}
      {items.map((item) => {
        const isHovered = hoveredId === item.id;

        return (
          <div
            key={item.id}
            style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              type="button"
              onClick={() => onLaunchItem(item)}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContextMenu({ item, x: e.clientX, y: e.clientY });
              }}
              title={`${item.name} (Quick Launch)\nRight-click to remove`}
              aria-label={`Launch ${item.name}`}
              style={{
                width: btnSize,
                height: btnSize,
                borderRadius: btnRadius,
                background: isHovered
                  ? isAether
                    ? '#ffdf59'
                    : isDeathNote
                      ? '#3a1215'
                      : isEldenRing
                        ? 'rgba(38, 36, 26, 0.95)'
                        : isOnePiece
                          ? 'rgba(50, 35, 25, 0.95)'
                          : isKawaii || isCandy
                            ? '#ffccd5'
                            : 'var(--bg-surface-active)'
                  : isAether
                    ? '#5c3e23'
                    : isDeathNote
                      ? 'rgba(18, 18, 18, 0.85)'
                      : isEldenRing
                        ? 'rgba(23, 24, 19, 0.9)'
                        : isOnePiece
                          ? 'rgba(33, 25, 20, 0.9)'
                          : isKawaii || isCandy
                            ? '#fff0f5'
                            : 'var(--bg-surface)',
                border: isHovered
                  ? isAether
                    ? '1px solid #ffe885'
                    : isDeathNote
                      ? '1px solid #c41e24'
                      : isEldenRing
                        ? '1px solid #eac477'
                        : isOnePiece
                          ? '1px solid #f59e0b'
                          : isKawaii || isCandy
                            ? '1px solid #f472b6'
                            : '1px solid var(--btn-border-hover)'
                  : isAether
                    ? '1.5px solid #8c6038'
                    : isDeathNote
                      ? '1px solid rgba(163, 38, 45, 0.4)'
                      : isEldenRing
                        ? '1px solid rgba(197, 161, 90, 0.35)'
                        : isOnePiece
                          ? '1px solid rgba(245, 158, 11, 0.35)'
                          : isKawaii || isCandy
                            ? '1px solid #ffccd5'
                            : '1px solid var(--btn-border)',
                boxShadow: isHovered
                  ? isDeathNote
                    ? '0 0 10px rgba(196, 30, 36, 0.6)'
                    : isEldenRing
                      ? '0 0 10px rgba(234, 196, 119, 0.5)'
                      : isOnePiece
                        ? '0 0 8px rgba(245, 158, 11, 0.5)'
                        : 'var(--btn-shadow-hover)'
                  : 'var(--btn-shadow)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
                transform: isHovered ? (isVertical ? 'translateY(-2px) scale(1.05)' : 'scale(1.06)') : 'none',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                flexShrink: 0
              }}
            >
              {renderItemThumb(item)}
            </button>

            {/* Floating Tooltip Pill on Hover */}
            {isHovered && (
              <div
                style={{
                  position: 'absolute',
                  left: isRightDock ? undefined : '54px',
                  right: isRightDock ? '54px' : undefined,
                  zIndex: 1000,
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: 'var(--bg-dock)',
                  border: '1px solid var(--btn-border-hover)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
                  color: 'var(--text-primary)',
                  fontSize: '11px',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  animation: 'fadeIn 0.12s ease'
                }}
              >
                <span>{item.name}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '9.5px', opacity: 0.85 }}>
                  Quick Launch
                </span>
              </div>
            )}

            {/* Hover Remove (X) Badge */}
            {isHovered && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveQuickIcon(item.id);
                }}
                title={`Remove ${item.name} from Quick Icons`}
                aria-label={`Remove ${item.name}`}
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '1px',
                  width: '15px',
                  height: '15px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-subtle)',
                  boxShadow: 'var(--btn-shadow)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  zIndex: 25,
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#ef4444';
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  e.currentTarget.style.borderColor = '#ef4444';
                  e.currentTarget.style.transform = 'scale(1.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--text-muted)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                <X size={9} strokeWidth={2.5} />
              </button>
            )}
          </div>
        );
      })}

      {/* Plus (+) Add Quick Icon Button */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={onOpenAddModal}
          onMouseEnter={() => setIsHoveredAdd(true)}
          onMouseLeave={() => setIsHoveredAdd(false)}
          title="Add Quick Icon"
          aria-label="Add Quick Icon"
          style={{
            width: btnSize,
            height: btnSize,
            borderRadius: btnRadius,
            background: isEldenRing
              ? 'rgba(23, 24, 19, 0.9)'
              : isDeathNote
                ? 'rgba(18, 18, 18, 0.85)'
                : isAether
                  ? '#5c3e23'
                  : 'var(--bg-surface)',
            border: isEldenRing
              ? '1px dashed rgba(197, 161, 90, 0.6)'
              : isDeathNote
                ? '1px dashed #a3262d'
                : isAether
                  ? '1px dashed #8c6038'
                  : '1px dashed var(--btn-border)',
            color: isEldenRing
              ? '#EAC477'
              : isDeathNote
                ? '#e05a61'
                : isAether
                  ? '#ffdf59'
                  : 'var(--text-muted)',
            boxShadow: 'var(--btn-shadow)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          {isEldenRing ? (
            <img
              src={getAssetUrl('/eldenring/icons/add.png')}
              alt="Add"
              style={{ width: '18px', height: '18px', objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(234, 196, 119, 0.7))' }}
            />
          ) : (
            <Plus size={15} strokeWidth={2.2} />
          )}
        </button>

        {/* Floating Tooltip Pill for Add Button */}
        {isHoveredAdd && (
          <div
            style={{
              position: 'absolute',
              left: isRightDock ? undefined : '54px',
              right: isRightDock ? '54px' : undefined,
              zIndex: 1000,
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'var(--bg-dock)',
              border: '1px solid var(--btn-border-hover)',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
              color: 'var(--text-primary)',
              fontSize: '11px',
              fontWeight: 500,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'fadeIn 0.12s ease'
            }}
          >
            <span>Add Quick Icon</span>
          </div>
        )}
      </div>

      {/* Right-Click Context Menu (Portaled to document.body) */}
      {contextMenu &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="quick-icon-context-menu"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: `${Math.max(10, Math.min(contextMenu.y, window.innerHeight - 130))}px`,
              left: isRightDock
                ? `${Math.max(10, contextMenu.x - 165)}px`
                : `${Math.min(contextMenu.x + 10, window.innerWidth - 175)}px`,
              zIndex: 100000,
              background: 'var(--modal-bg)',
              border: '1px solid var(--border-hover)',
              borderRadius: '8px',
              padding: '5px',
              boxShadow: 'var(--shadow-dock), 0 10px 28px rgba(0, 0, 0, 0.5)',
              minWidth: '150px',
              display: 'flex',
              flexDirection: 'column',
              gap: '3px',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)'
            }}
          >
            <div
              style={{
                padding: '4px 8px 3px 8px',
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-subtle)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {contextMenu.item.name}
            </div>

            <button
              type="button"
              onClick={() => {
                onLaunchItem(contextMenu.item);
                setContextMenu(null);
              }}
              className="context-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '5px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <span>Launch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onRemoveQuickIcon(contextMenu.item.id);
                setContextMenu(null);
              }}
              className="context-menu-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 8px',
                borderRadius: '5px',
                background: 'transparent',
                border: 'none',
                color: '#ef4444',
                fontSize: '11.5px',
                cursor: 'pointer',
                textAlign: 'left',
                width: '100%',
                transition: 'all 0.12s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Trash2 size={13} color="#ef4444" />
              <span>Remove Quick Icon</span>
            </button>
          </div>,
          document.body
        )}
    </div>
  );
};
