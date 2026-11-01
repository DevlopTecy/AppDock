import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AppItem, AppGroup, DockTheme } from '../types/dock';
import { getAssetUrl, isGenericOrBrokenIcon } from '../utils/assets';
import {
  Plus,
  Globe,
  AppWindow,
  X,
  Trash2,
  Moon,
  Sun,
  Layers,
  Droplets,
  Square,
  Zap,
  Compass,
  Gem,
  Palette
} from 'lucide-react';

export interface QuickIconsBarProps {
  items: AppItem[];
  groups?: AppGroup[];
  onLaunchItem: (item: AppItem) => void;
  onRemoveQuickIcon: (itemId: string) => void;
  onAddQuickIcon: (item: AppItem) => void;
  onOpenAddModal: () => void;
  theme?: DockTheme;
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
  isRightDock = true
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

  // Render Theme Sticker or Icon for the disguised Add button (unhovered state)
  const renderThemeStickerOrIcon = () => {
    // 1. Fancy Themes: Theme stickers / emblem graphics
    if (isDeathNote) {
      return (
        <img
          src={getAssetUrl('/deathnote/icons/apple_red.png')}
          alt="Death Note"
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 2px 5px rgba(163, 38, 45, 0.7))',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      );
    }
    if (isEldenRing) {
      return (
        <img
          src={getAssetUrl('/eldenring/icons/sword.png')}
          alt="Elden Ring"
          style={{
            width: '21px',
            height: '21px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 4px rgba(234, 196, 119, 0.8))',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      );
    }
    if (isOnePiece) {
      return (
        <img
          src={getAssetUrl('/onepiece/icons/straw_hat_emblem.png')}
          alt="One Piece"
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 4px rgba(245, 158, 11, 0.7))',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      );
    }
    if (isKawaii) {
      return (
        <img
          src={getAssetUrl('/stickers/star_helmet.png')}
          alt="Kawaii"
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 4px rgba(244, 63, 94, 0.6))',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      );
    }
    if (isCandy) {
      return (
        <img
          src={getAssetUrl('/candy/decorations/lollipop_candy.png')}
          alt="Candy"
          style={{
            width: '22px',
            height: '22px',
            objectFit: 'contain',
            filter: 'drop-shadow(0 1px 4px rgba(244, 114, 182, 0.6))',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      );
    }
    if (isAether) {
      return (
        <img
          src={getAssetUrl('/aether/crafting_table.png')}
          alt="Aether"
          style={{
            width: '21px',
            height: '21px',
            objectFit: 'contain',
            imageRendering: 'pixelated',
            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.6))',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
        />
      );
    }

    // 2. Default Themes & Custom Theme: Standard theme icons matching Settings
    switch (theme) {
      case 'light':
        return <Sun size={17} strokeWidth={2.2} color="#2563eb" />;
      case 'translucent':
        return <Layers size={17} strokeWidth={2.2} color="#38bdf8" />;
      case 'glassy':
        return <Droplets size={17} strokeWidth={2.2} color="#60a5fa" />;
      case 'minimal':
        return <Square size={16} strokeWidth={2.2} color="var(--text-secondary)" />;
      case 'cyberpunk':
        return <Zap size={17} strokeWidth={2.2} color="#00f2fe" />;
      case 'midnight':
        return <Compass size={17} strokeWidth={2.2} color="#38bdf8" />;
      case 'emerald':
        return <Gem size={17} strokeWidth={2.2} color="#10b981" />;
      case 'custom':
        return <Palette size={17} strokeWidth={2.2} color="#a78bfa" />;
      case 'dark':
      default:
        return <Moon size={17} strokeWidth={2.2} color="#60a5fa" />;
    }
  };

  // Render Plus Icon for the revealed state on hover / drag
  const renderPlusIcon = () => {
    if (isEldenRing) {
      return (
        <img
          src={getAssetUrl('/eldenring/icons/add.png')}
          alt="Add"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            filter: 'drop-shadow(0 0 6px rgba(234, 196, 119, 0.85))'
          }}
        />
      );
    }
    return (
      <Plus
        size={17}
        strokeWidth={2.6}
        color={
          isDeathNote
            ? '#ffffff'
            : isAether
              ? '#2e1c0d'
              : isKawaii || isCandy
                ? '#db2777'
                : isOnePiece
                  ? '#ffffff'
                  : 'var(--text-primary)'
        }
      />
    );
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

    let draggedItem: AppItem | null = null;
    if (typeof window !== 'undefined' && (window as any).__appdock_dragging_item) {
      draggedItem = (window as any).__appdock_dragging_item;
    }

    if (!draggedItem) {
      try {
        const rawJson = e.dataTransfer.getData('application/x-appdock-item-json');
        if (rawJson) {
          draggedItem = JSON.parse(rawJson);
        }
      } catch {}
    }

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

  // Pill article container styling (matches ConnectorHub / uiverse-vbar-article aesthetic)
  const containerBg = isDeathNote
    ? 'rgba(26, 11, 13, 0.92)'
    : isEldenRing
      ? 'rgba(23, 24, 19, 0.95)'
      : isAether
        ? '#5c3e23'
        : isKawaii || isCandy
          ? '#fff0f5'
          : isOnePiece
            ? 'rgba(33, 25, 20, 0.95)'
            : 'var(--bg-surface, #121214)';

  const containerBorder = isDeathNote
    ? '1px solid rgba(163, 38, 45, 0.55)'
    : isEldenRing
      ? '1px solid rgba(197, 161, 90, 0.45)'
      : isAether
        ? '1px solid #8c6038'
        : isKawaii || isCandy
          ? '1px solid #f472b6'
          : isOnePiece
            ? '1px solid rgba(245, 158, 11, 0.45)'
            : '1px solid var(--border-hover, rgba(255, 255, 255, 0.16))';

  const containerRadius = isEldenRing ? '8px' : '14px';

  return (
    <div
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="uiverse-vbar-container quick-icons-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '44px',
        userSelect: 'none',
        flexShrink: 0,
        maxHeight: '100%',
        position: 'relative'
      }}
      title="Quick Icons: Single-click to launch, or drag apps here"
    >
      <article
        className="uiverse-vbar-article quick-icons-article"
        style={{
          width: '100%',
          maxHeight: '100%',
          borderRadius: containerRadius,
          background: isDragOverBar ? 'rgba(59, 130, 246, 0.22)' : containerBg,
          border: isDragOverBar ? '1.5px dashed #3b82f6' : containerBorder,
          boxShadow: isDragOverBar
            ? '0 0 16px rgba(59, 130, 246, 0.45)'
            : '0 8px 24px rgba(0, 0, 0, 0.55), inset 0 1px 1px rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          padding: '3px',
          boxSizing: 'border-box',
          transition: 'all 250ms ease-in-out'
        }}
      >
        {/* Disguised Theme Sticker / Plus (+) Add Quick Icon Button */}
        <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={onOpenAddModal}
            onMouseEnter={() => setIsHoveredAdd(true)}
            onMouseLeave={() => setIsHoveredAdd(false)}
            title={isHoveredAdd ? "Add Quick Icon from your apps" : "Quick Icons · Hover to add apps"}
            aria-label="Add Quick Icon"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: isEldenRing ? '6px' : '10px',
              background: isHoveredAdd || isDragOverBar
                ? isAether
                  ? '#ffdf59'
                  : isDeathNote
                    ? '#801419'
                    : isEldenRing
                      ? 'rgba(38, 36, 26, 0.95)'
                      : isOnePiece
                        ? 'rgba(245, 158, 11, 0.35)'
                        : isKawaii || isCandy
                          ? '#fce7f3'
                          : 'var(--bg-surface-active)'
                : isAether
                  ? '#4a321b'
                  : isDeathNote
                    ? 'rgba(18, 18, 18, 0.85)'
                    : isEldenRing
                      ? 'rgba(23, 24, 19, 0.85)'
                      : isOnePiece
                        ? 'rgba(33, 25, 20, 0.85)'
                        : isKawaii || isCandy
                          ? 'rgba(255, 255, 255, 0.85)'
                          : 'var(--bg-surface)',
              border: isHoveredAdd || isDragOverBar
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
                  ? '1px solid rgba(140, 96, 56, 0.6)'
                  : isDeathNote
                    ? '1px solid rgba(163, 38, 45, 0.45)'
                    : isEldenRing
                      ? '1px solid rgba(197, 161, 90, 0.45)'
                      : isOnePiece
                        ? '1px solid rgba(245, 158, 11, 0.45)'
                        : isKawaii || isCandy
                          ? '1px solid rgba(244, 114, 182, 0.45)'
                          : '1px solid var(--border-subtle)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 0,
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: isHoveredAdd || isDragOverBar
                ? isDeathNote
                  ? '0 0 10px rgba(196, 30, 36, 0.5)'
                  : isEldenRing
                    ? '0 0 10px rgba(234, 196, 119, 0.45)'
                    : '0 0 8px rgba(255, 255, 255, 0.15)'
                : 'var(--btn-shadow)',
              transform: isHoveredAdd || isDragOverBar ? 'scale(1.06)' : 'scale(1)',
              transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* The Hidden/Theme Sticker or Icon when NOT hovered */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isHoveredAdd || isDragOverBar ? 0 : 1,
                transform: isHoveredAdd || isDragOverBar ? 'scale(0.65) rotate(-15deg)' : 'scale(1) rotate(0deg)',
                transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            >
              {renderThemeStickerOrIcon()}
            </div>

            {/* The Plus (+) Icon revealed on hover or drag */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: isHoveredAdd || isDragOverBar ? 1 : 0,
                transform: isHoveredAdd || isDragOverBar ? 'scale(1) rotate(0deg)' : 'scale(0.65) rotate(15deg)',
                transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                pointerEvents: 'none'
              }}
            >
              {renderPlusIcon()}
            </div>
          </button>

          {/* Floating Tooltip for Add Button */}
          {isHoveredAdd && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                left: isRightDock ? undefined : '50px',
                right: isRightDock ? '50px' : undefined,
                zIndex: 1000,
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'var(--bg-dock)',
                border: '1px solid var(--btn-border-hover)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
                color: 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                animation: 'fadeIn 0.12s ease'
              }}
            >
              <span>Add Quick Icon</span>
            </div>
          )}
        </div>

        {/* Divider line if items exist */}
        {items.length > 0 && (
          <div
            style={{
              width: '24px',
              height: '1px',
              background: 'var(--border-subtle)',
              margin: '2px 0',
              opacity: 0.8
            }}
          />
        )}

        {/* Scrollable column of Quick Icon buttons */}
        {items.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              width: '100%',
              flex: 1,
              minHeight: 0,
              maxHeight: '100%',
              overflowY: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            {items.map((item) => {
              const isHovered = hoveredId === item.id;

              return (
                <div
                  key={item.id}
                  style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center' }}
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
                      width: '38px',
                      height: '38px',
                      borderRadius: isEldenRing ? '6px' : '10px',
                      background: isHovered
                        ? isAether
                          ? '#ffdf59'
                          : isDeathNote
                            ? '#3a1215'
                            : isEldenRing
                              ? 'rgba(38, 36, 26, 0.95)'
                              : isOnePiece
                                ? 'rgba(50, 35, 25, 0.95)'
                                : 'var(--bg-surface-active)'
                        : 'transparent',
                      border: isHovered
                        ? isAether
                          ? '1px solid #ffe885'
                          : isDeathNote
                            ? '1px solid #c41e24'
                            : isEldenRing
                              ? '1px solid #eac477'
                              : isOnePiece
                                ? '1px solid #f59e0b'
                                : '1px solid var(--btn-border-hover)'
                        : '1px solid transparent',
                      boxShadow: isHovered
                        ? isDeathNote
                          ? '0 0 10px rgba(196, 30, 36, 0.6)'
                          : isEldenRing
                            ? '0 0 10px rgba(234, 196, 119, 0.5)'
                            : 'var(--btn-shadow-hover)'
                        : 'none',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0,
                      transform: isHovered ? 'scale(1.08)' : 'none',
                      transition: 'all 0.16s ease',
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
                        top: '50%',
                        transform: 'translateY(-50%)',
                        left: isRightDock ? undefined : '50px',
                        right: isRightDock ? '50px' : undefined,
                        zIndex: 1000,
                        padding: '4px 8px',
                        borderRadius: '6px',
                        background: 'var(--bg-dock)',
                        border: '1px solid var(--btn-border-hover)',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.45)',
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
                        top: '-2px',
                        right: '1px',
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#dc2626',
                        border: '1px solid #ffffff',
                        boxShadow: '0 1px 4px rgba(0,0,0,0.5)',
                        color: '#ffffff',
                        cursor: 'pointer',
                        zIndex: 25,
                        padding: 0,
                        transition: 'transform 0.12s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                    >
                      <X size={8} strokeWidth={3} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </article>

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
