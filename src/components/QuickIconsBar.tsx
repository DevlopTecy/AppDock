import React, { useState, useRef } from 'react';
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
}

export const QuickIconsBar: React.FC<QuickIconsBarProps> = ({
  items = [],
  groups = [],
  onLaunchItem,
  onRemoveQuickIcon,
  onAddQuickIcon,
  onOpenAddModal,
  theme
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isDragOverBar, setIsDragOverBar] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ item: AppItem; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isDeathNote = theme === 'deathnote';
  const isAether = theme === 'aether';
  const isEldenRing = theme === 'eldenring';
  const isKawaii = theme === 'kawaii';
  const isOnePiece = theme === 'onepiece';
  const isCandy = theme === 'candy';

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
      return <Globe size={isEldenRing ? 16 : 14} color="var(--text-primary)" />;
    }
    return <AppWindow size={isEldenRing ? 16 : 14} color="var(--text-primary)" />;
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

  // Close context menu on window click
  React.useEffect(() => {
    if (!contextMenu) return;
    const handleCloseMenu = () => setContextMenu(null);
    window.addEventListener('click', handleCloseMenu);
    return () => window.removeEventListener('click', handleCloseMenu);
  }, [contextMenu]);

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        padding: '0 4px',
        maxWidth: '100%',
        minWidth: 0,
        height: '30px',
        borderRadius: isKawaii || isCandy ? '14px' : '7px',
        background: isDragOverBar
          ? 'rgba(59, 130, 246, 0.22)'
          : isAether
            ? 'rgba(0, 0, 0, 0.2)'
            : 'rgba(255, 255, 255, 0.02)',
        border: isDragOverBar
          ? '1.5px dashed #3b82f6'
          : '1px solid transparent',
        transition: 'all 0.18s ease',
        position: 'relative'
      }}
      title="Quick Icons: Single-click to launch, or drag apps here"
    >
      {/* Scrollable list of Quick Icons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          overflowX: 'auto',
          maxWidth: '100%',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}
      >
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
                style={{
                  width: isEldenRing ? '30px' : '28px',
                  height: isEldenRing ? '30px' : '28px',
                  borderRadius: isKawaii || isCandy ? '8px' : isEldenRing ? '5px' : '6px',
                  background: isHovered
                    ? (isAether ? '#ffdf59' : isDeathNote ? '#3a1215' : 'var(--bg-surface-active)')
                    : (isAether ? '#5c3e23' : 'var(--bg-surface)'),
                  border: isHovered
                    ? (isAether ? '1px solid #ffe885' : isDeathNote ? '1px solid #c41e24' : isEldenRing ? '1px solid #eac477' : '1px solid var(--btn-border-hover)')
                    : (isAether ? '1px solid #8c6038' : isDeathNote ? '1px solid rgba(163, 38, 45, 0.4)' : isEldenRing ? '1px solid rgba(197, 161, 90, 0.35)' : '1px solid var(--btn-border)'),
                  boxShadow: isHovered
                    ? (isDeathNote ? '0 0 8px rgba(196, 30, 36, 0.6)' : isEldenRing ? '0 0 8px rgba(234, 196, 119, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.35)')
                    : '0 1px 3px rgba(0, 0, 0, 0.25)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                  transform: isHovered ? 'scale(1.06)' : 'none',
                  transition: 'all 0.15s ease',
                  flexShrink: 0
                }}
              >
                {renderItemThumb(item)}
              </button>

              {/* Hover X Quick Remove Badge */}
              {isHovered && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveQuickIcon(item.id);
                  }}
                  title="Remove from Quick Icons"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ef4444',
                    border: '1px solid #ffffff',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    zIndex: 5,
                    boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    transition: 'transform 0.1s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X size={9} strokeWidth={3} />
                </button>
              )}
            </div>
          );
        })}

        {/* Plus (+) Add Quick Icon Button */}
        <button
          type="button"
          onClick={onOpenAddModal}
          title="Add Quick Icon from your groups"
          style={{
            width: isEldenRing ? '30px' : '28px',
            height: isEldenRing ? '30px' : '28px',
            borderRadius: isKawaii || isCandy ? '8px' : isEldenRing ? '5px' : '6px',
            background: isAether
              ? '#5c3e23'
              : isDeathNote
                ? 'rgba(18, 18, 18, 0.85)'
                : 'var(--bg-surface)',
            border: isAether
              ? '1px dashed #8c6038'
              : isDeathNote
                ? '1px dashed #a3262d'
                : isEldenRing
                  ? '1px dashed rgba(197, 161, 90, 0.5)'
                  : '1px dashed var(--btn-border)',
            color: isAether ? '#ffdf59' : isDeathNote ? '#e05a61' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            flexShrink: 0,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = isDeathNote ? '#c41e24' : isAether ? '#ffe885' : 'var(--btn-border-hover)';
            e.currentTarget.style.color = isDeathNote ? '#ffffff' : 'var(--text-primary)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = isAether
              ? '1px dashed #8c6038'
              : isDeathNote
                ? '1px dashed #a3262d'
                : '1px dashed var(--btn-border)';
            e.currentTarget.style.color = isAether ? '#ffdf59' : isDeathNote ? '#e05a61' : 'var(--text-muted)';
            e.currentTarget.style.transform = 'none';
          }}
        >
          <Plus size={14} strokeWidth={2.4} />
        </button>
      </div>

      {/* Right-Click Context Menu */}
      {contextMenu && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            left: `${contextMenu.x}px`,
            bottom: '46px',
            background: isDeathNote ? '#1a0b0d' : isAether ? '#243854' : 'var(--bg-surface-active)',
            border: isDeathNote ? '1px solid #a3262d' : isAether ? '1px solid #8c6038' : '1px solid var(--btn-border)',
            borderRadius: '7px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.65)',
            padding: '4px',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            minWidth: '150px'
          }}
        >
          <button
            type="button"
            onClick={() => {
              onLaunchItem(contextMenu.item);
              setContextMenu(null);
            }}
            style={{
              padding: '6px 8px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
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
            style={{
              padding: '6px 8px',
              fontSize: '11px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              borderRadius: '4px',
              color: '#ef4444',
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            <Trash2 size={12} />
            <span>Remove from Quick Icons</span>
          </button>
        </div>
      )}
    </div>
  );
};
