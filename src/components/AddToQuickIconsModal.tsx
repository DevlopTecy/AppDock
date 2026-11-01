import React, { useState, useMemo, useEffect } from 'react';
import { AppGroup, AppItem, DockTheme } from '../types/dock';
import { getAssetUrl, isGenericOrBrokenIcon } from '../utils/assets';
import { X, Search, Plus, Check, Globe, AppWindow } from 'lucide-react';

interface AddToQuickIconsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups?: AppGroup[];
  existingQuickItemIds?: string[];
  onAddQuickIcon: (item: AppItem) => void;
  theme?: DockTheme;
}

export const AddToQuickIconsModal: React.FC<AddToQuickIconsModalProps> = ({
  isOpen,
  onClose,
  groups = [],
  existingQuickItemIds = [],
  onAddQuickIcon,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [justAddedIds, setJustAddedIds] = useState<Set<string>>(new Set());

  // ALL HOOKS MUST RUN UNCONDITIONALLY AT THE TOP BEFORE ANY EARLY RETURN
  const currentTheme = (theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '')) as DockTheme;
  const isDeathNote = currentTheme === 'deathnote';
  const isAether = currentTheme === 'aether';
  const isEldenRing = currentTheme === 'eldenring';
  const isOnePiece = currentTheme === 'onepiece';
  const isKawaii = currentTheme === 'kawaii';
  const isCandy = currentTheme === 'candy';

  const pinnedSet = useMemo(() => {
    const ids = Array.isArray(existingQuickItemIds) ? existingQuickItemIds.filter(Boolean) : [];
    return new Set([...ids, ...Array.from(justAddedIds)]);
  }, [existingQuickItemIds, justAddedIds]);

  const query = (searchQuery || '').trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!Array.isArray(groups)) return [];
    return groups
      .map((grp) => {
        if (!grp) return null;
        const items = Array.isArray(grp.items) ? grp.items.filter(Boolean) : [];
        const matchingItems = items.filter((item) => {
          if (!item) return false;
          if (!query) return true;
          const name = String(item.name || '').toLowerCase();
          const target = String(item.target || '').toLowerCase();
          return name.includes(query) || target.includes(query);
        });
        return {
          ...grp,
          items: matchingItems
        };
      })
      .filter((grp): grp is AppGroup => Boolean(grp && grp.items && grp.items.length > 0));
  }, [groups, query]);

  // Escape key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Safe early return only AFTER all hooks have executed
  if (!isOpen) return null;

  const handleItemClick = (item: AppItem) => {
    if (!item || !item.id) return;
    if (pinnedSet.has(item.id)) return;
    onAddQuickIcon(item);
    setJustAddedIds((prev) => new Set(prev).add(item.id));
  };

  const renderIconThumb = (item: AppItem) => {
    if (!item) return <AppWindow size={16} color="var(--text-primary)" />;
    const isUrl = item.type === 'url';
    const target = item.target || '';
    const googleFavicon = isUrl && target
      ? `https://www.google.com/s2/favicons?domain=${encodeURIComponent(target)}&sz=128`
      : undefined;

    const hasCustomIcon = item.icon && !isGenericOrBrokenIcon(item.icon);
    const iconSrc = hasCustomIcon ? item.icon : googleFavicon;

    if (iconSrc) {
      return (
        <img
          src={iconSrc}
          alt=""
          style={{
            width: '24px',
            height: '24px',
            objectFit: 'contain',
            borderRadius: '5px',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))'
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    if (isUrl) {
      return <Globe size={16} color="var(--text-secondary)" />;
    }
    return <AppWindow size={16} color="var(--text-secondary)" />;
  };

  return (
    <div
      className="settings-modal-view"
      style={{
        position: 'absolute',
        inset: 0,
        background: isAether
          ? '#142334'
          : isDeathNote
            ? '#0a0808'
            : isEldenRing
              ? '#0a0c0a'
              : isOnePiece
                ? '#0d131a'
                : 'var(--modal-bg)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        zIndex: 65,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Death Note Theme Thematic Background Artwork */}
      {isDeathNote && (
        <div
          className="deathnote-modal-bg"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${getAssetUrl('/deathnote/backgrounds/wallpaper_main_4.jpg')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              filter: 'brightness(0.35) contrast(1.15)',
              opacity: 0.32
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(14, 10, 10, 0.85) 0%, rgba(6, 4, 4, 0.97) 100%)'
            }}
          />
        </div>
      )}

      {/* Elden Ring Theme Thematic Background Artwork */}
      {isEldenRing && (
        <div
          className="eldenring-modal-bg"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${getAssetUrl('/eldenring/backgrounds/vertical_golden_tree_wallpaper.png')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.35) contrast(1.15)',
              opacity: 0.45
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(8, 10, 9, 0.9) 0%, rgba(14, 16, 13, 0.97) 100%)'
            }}
          />
        </div>
      )}

      {/* One Piece Theme Thematic Background Artwork */}
      {isOnePiece && (
        <div
          className="onepiece-modal-bg"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${getAssetUrl('/onepiece/backgrounds/portrait_ship_background.png')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.35) contrast(1.15)',
              opacity: 0.45
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(14, 22, 32, 0.9) 0%, rgba(10, 16, 24, 0.97) 100%)'
            }}
          />
        </div>
      )}

      {/* Candy Theme Thematic Background Artwork */}
      {isCandy && (
        <div
          className="candy-modal-bg"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${getAssetUrl('/candy/backgrounds/sweet_home_candy_cottage.png')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.85) contrast(1.05)',
              opacity: 0.35
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(255, 240, 245, 0.92) 0%, rgba(255, 228, 238, 0.97) 100%)'
            }}
          />
        </div>
      )}

      {/* Aether Theme Thematic Background Artwork */}
      {isAether && (
        <div
          className="aether-modal-bg"
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url('${getAssetUrl('/aether/wallpaper_aether_sky.jpg')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.4) contrast(1.1)',
              opacity: 0.45
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(20, 35, 52, 0.9) 0%, rgba(12, 22, 34, 0.97) 100%)'
            }}
          />
        </div>
      )}

      {/* Header — Clean, prestigious typography without distracting icon box */}
      <div
        style={{
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isDeathNote
            ? '1px solid rgba(163, 38, 45, 0.45)'
            : isEldenRing
              ? '1px solid rgba(234, 196, 119, 0.35)'
              : isOnePiece
                ? '1px solid rgba(245, 158, 11, 0.35)'
                : isAether
                  ? '1px solid rgba(140, 96, 56, 0.45)'
                  : isCandy
                    ? '1px solid #ffccd5'
                    : '1px solid var(--border-subtle)',
          background: isDeathNote
            ? 'rgba(16, 12, 12, 0.96)'
            : isEldenRing
              ? 'rgba(12, 14, 12, 0.96)'
              : isOnePiece
                ? 'rgba(20, 28, 38, 0.96)'
                : isAether
                  ? 'rgba(18, 32, 48, 0.96)'
                  : isCandy
                    ? 'rgba(255, 240, 245, 0.96)'
                    : 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: isDeathNote
                ? '#fca5a5'
                : isEldenRing
                  ? '#EAC477'
                  : isOnePiece
                    ? '#f59e0b'
                    : isAether
                      ? '#ffdf59'
                      : isCandy
                        ? '#be185d'
                        : 'var(--text-primary)',
              fontFamily: isDeathNote
                ? 'var(--font-gothic)'
                : isEldenRing || isOnePiece
                  ? 'var(--font-fantasy)'
                  : undefined,
              letterSpacing: isDeathNote || isOnePiece ? '0.6px' : '0.1px'
            }}
          >
            Add to Quick Icons
          </div>
          <div
            style={{
              fontSize: '10.5px',
              color: isDeathNote
                ? 'rgba(234, 230, 223, 0.55)'
                : isEldenRing
                  ? 'rgba(234, 196, 119, 0.6)'
                  : isOnePiece
                    ? 'rgba(245, 158, 11, 0.6)'
                    : 'var(--text-muted)',
              marginTop: '1px'
            }}
          >
            Pin apps and links for fast 1-click launching
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-icon"
          title="Close (Esc)"
          aria-label="Close"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: isCandy ? '13px' : '6px',
            cursor: 'pointer',
            border: isDeathNote
              ? '1px solid rgba(163, 38, 45, 0.5)'
              : isEldenRing
                ? '1px solid rgba(234, 196, 119, 0.35)'
                : isOnePiece
                  ? '1px solid rgba(245, 158, 11, 0.35)'
                  : '1px solid var(--btn-border)',
            background: isDeathNote
              ? 'rgba(24, 14, 14, 0.8)'
              : 'var(--bg-surface)',
            color: isDeathNote ? '#e05a61' : isEldenRing ? '#EAC477' : isOnePiece ? '#f59e0b' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDeathNote ? 'rgba(163, 38, 45, 0.25)' : 'var(--bg-surface-hover)';
            e.currentTarget.style.color = isDeathNote ? '#ffffff' : 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isDeathNote ? 'rgba(24, 14, 14, 0.8)' : 'var(--bg-surface)';
            e.currentTarget.style.color = isDeathNote ? '#e05a61' : isEldenRing ? '#EAC477' : isOnePiece ? '#f59e0b' : 'var(--text-muted)';
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          padding: '8px 14px',
          background: isDeathNote
            ? 'rgba(14, 10, 10, 0.8)'
            : isEldenRing
              ? 'rgba(10, 12, 10, 0.8)'
              : isOnePiece
                ? 'rgba(16, 22, 30, 0.8)'
                : isCandy
                  ? 'rgba(255, 245, 248, 0.8)'
                  : 'var(--bg-surface)',
          borderBottom: isDeathNote
            ? '1px solid rgba(163, 38, 45, 0.3)'
            : isEldenRing
              ? '1px solid rgba(234, 196, 119, 0.25)'
              : isOnePiece
                ? '1px solid rgba(245, 158, 11, 0.25)'
                : '1px solid var(--border-subtle)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: isDeathNote
              ? 'rgba(8, 6, 6, 0.85)'
              : isEldenRing
                ? 'rgba(8, 9, 8, 0.85)'
                : isOnePiece
                  ? 'rgba(12, 17, 24, 0.85)'
                  : 'var(--bg-dock)',
            border: isDeathNote
              ? '1px solid rgba(163, 38, 45, 0.35)'
              : isEldenRing
                ? '1px solid rgba(234, 196, 119, 0.3)'
                : isOnePiece
                  ? '1px solid rgba(245, 158, 11, 0.3)'
                  : '1px solid var(--btn-border)',
            borderRadius: isCandy ? '10px' : '6px',
            padding: '0 10px',
            height: '34px',
            transition: 'border-color 0.15s ease, box-shadow 0.15s ease'
          }}
        >
          <Search size={13} color={isDeathNote ? '#e05a61' : isEldenRing ? '#EAC477' : isOnePiece ? '#f59e0b' : 'var(--text-muted)'} />
          <input
            type="text"
            placeholder="Search apps or URLs across groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '11.5px',
              color: isDeathNote ? '#eae6df' : 'var(--text-primary)',
              fontFamily: 'inherit'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Grouped Items List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {filteredGroups.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '36px 16px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              gap: '8px'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isDeathNote
                  ? 'rgba(163, 38, 45, 0.15)'
                  : isEldenRing
                    ? 'rgba(234, 196, 119, 0.12)'
                    : isOnePiece
                      ? 'rgba(245, 158, 11, 0.12)'
                      : 'var(--bg-surface-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: isDeathNote
                  ? '1px solid rgba(163, 38, 45, 0.3)'
                  : isEldenRing
                    ? '1px solid rgba(234, 196, 119, 0.25)'
                    : isOnePiece
                      ? '1px solid rgba(245, 158, 11, 0.25)'
                      : '1px solid var(--border-subtle)'
              }}
            >
              <Search size={18} color={isDeathNote ? '#e05a61' : isEldenRing ? '#EAC477' : isOnePiece ? '#f59e0b' : 'var(--text-muted)'} />
            </div>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: isDeathNote ? '#fca5a5' : isEldenRing ? '#EAC477' : 'var(--text-secondary)'
              }}
            >
              No matching items found
            </div>
            <div style={{ fontSize: '11px', maxWidth: '240px', lineHeight: '1.4' }}>
              Try searching with another keyword or add items to your groups first.
            </div>
          </div>
        ) : (
          filteredGroups.map((grp) => (
            <div key={grp.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Group Section Header — Clean typography and subtle hairline divider (no glow dots) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '4px 2px 2px 2px',
                  fontSize: '11px',
                  fontWeight: 600,
                  fontFamily: isDeathNote
                    ? 'var(--font-gothic)'
                    : isEldenRing || isOnePiece
                      ? 'var(--font-fantasy)'
                      : undefined,
                  letterSpacing: isDeathNote || isOnePiece ? '0.7px' : '0.4px',
                  color: isDeathNote
                    ? '#fca5a5'
                    : isEldenRing
                      ? '#EAC477'
                      : isOnePiece
                        ? '#f59e0b'
                        : isAether
                          ? '#ffdf59'
                          : isCandy
                            ? '#be185d'
                            : 'var(--text-secondary)'
                }}
              >
                <span>{grp.name}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    color: isDeathNote
                      ? 'rgba(252, 165, 165, 0.75)'
                      : isEldenRing
                        ? 'rgba(234, 196, 119, 0.8)'
                        : isOnePiece
                          ? 'rgba(245, 158, 11, 0.8)'
                          : 'var(--text-muted)',
                    background: isDeathNote
                      ? 'rgba(163, 38, 45, 0.2)'
                      : isEldenRing
                        ? 'rgba(234, 196, 119, 0.12)'
                        : isOnePiece
                          ? 'rgba(245, 158, 11, 0.12)'
                          : 'var(--bg-surface-active)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    border: isDeathNote
                      ? '1px solid rgba(163, 38, 45, 0.35)'
                      : isEldenRing
                        ? '1px solid rgba(234, 196, 119, 0.25)'
                        : isOnePiece
                          ? '1px solid rgba(245, 158, 11, 0.25)'
                          : '1px solid var(--border-subtle)'
                  }}
                >
                  {grp.items.length}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: '1px',
                    background: isDeathNote
                      ? 'linear-gradient(90deg, rgba(163, 38, 45, 0.4) 0%, transparent 100%)'
                      : isEldenRing
                        ? 'linear-gradient(90deg, rgba(234, 196, 119, 0.35) 0%, transparent 100%)'
                        : isOnePiece
                          ? 'linear-gradient(90deg, rgba(245, 158, 11, 0.35) 0%, transparent 100%)'
                          : isAether
                            ? 'linear-gradient(90deg, rgba(140, 96, 56, 0.35) 0%, transparent 100%)'
                            : 'linear-gradient(90deg, var(--border-subtle) 0%, transparent 100%)',
                    marginLeft: '4px'
                  }}
                />
              </div>

              {/* Group Items Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '7px'
                }}
              >
                {grp.items.map((item) => {
                  const isPinned = pinnedSet.has(item.id);

                  const defaultBg = isPinned
                    ? 'rgba(255, 255, 255, 0.02)'
                    : isDeathNote
                      ? 'rgba(18, 12, 12, 0.72)'
                      : isEldenRing
                        ? 'rgba(15, 18, 15, 0.72)'
                        : isOnePiece
                          ? 'rgba(20, 28, 38, 0.72)'
                          : isAether
                            ? 'rgba(20, 36, 54, 0.72)'
                            : isCandy
                              ? '#fff0f5'
                              : 'var(--bg-surface)';

                  const defaultBorder = isPinned
                    ? isDeathNote
                      ? '1px solid rgba(255, 255, 255, 0.04)'
                      : '1px solid var(--border-subtle)'
                    : isDeathNote
                      ? '1px solid rgba(163, 38, 45, 0.28)'
                      : isEldenRing
                        ? '1px solid rgba(234, 196, 119, 0.25)'
                        : isOnePiece
                          ? '1px solid rgba(245, 158, 11, 0.25)'
                          : isAether
                            ? '1px solid rgba(140, 96, 56, 0.3)'
                            : isCandy
                              ? '1px solid #ffccd5'
                              : '1px solid var(--btn-border)';

                  const hoverBg = isDeathNote
                    ? 'rgba(28, 16, 16, 0.9)'
                    : isEldenRing
                      ? 'rgba(24, 28, 22, 0.9)'
                      : isOnePiece
                        ? 'rgba(28, 38, 52, 0.9)'
                        : isAether
                          ? 'rgba(28, 48, 70, 0.9)'
                          : isCandy
                            ? '#ffffff'
                            : 'var(--bg-surface-hover)';

                  const hoverBorder = isDeathNote
                    ? '1px solid rgba(224, 90, 97, 0.65)'
                    : isEldenRing
                      ? '1px solid rgba(234, 196, 119, 0.65)'
                      : isOnePiece
                        ? '1px solid rgba(245, 158, 11, 0.65)'
                        : isAether
                          ? '1px solid rgba(255, 223, 89, 0.65)'
                          : isCandy
                            ? '1px solid #f472b6'
                            : '1px solid var(--btn-border-hover)';

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleItemClick(item)}
                      disabled={isPinned}
                      title={isPinned ? `${item.name} is already pinned` : `Pin ${item.name} to Quick Icons`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '9px',
                        padding: '8px 10px',
                        borderRadius: isKawaii || isCandy ? '10px' : isEldenRing ? '6px' : '8px',
                        background: defaultBg,
                        border: defaultBorder,
                        opacity: isPinned ? 0.55 : 1,
                        cursor: isPinned ? 'default' : 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        boxShadow: isPinned ? 'none' : 'var(--btn-shadow)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isPinned) {
                          e.currentTarget.style.border = hoverBorder;
                          e.currentTarget.style.background = hoverBg;
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = isDeathNote
                            ? '0 4px 14px rgba(163, 38, 45, 0.3)'
                            : isEldenRing
                              ? '0 4px 14px rgba(234, 196, 119, 0.25)'
                              : isOnePiece
                                ? '0 4px 14px rgba(245, 158, 11, 0.25)'
                                : '0 4px 12px rgba(0, 0, 0, 0.3)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPinned) {
                          e.currentTarget.style.border = defaultBorder;
                          e.currentTarget.style.background = defaultBg;
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'var(--btn-shadow)';
                        }
                      }}
                    >
                      {/* Item Thumbnail */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isDeathNote || isEldenRing
                            ? 'rgba(0, 0, 0, 0.45)'
                            : 'rgba(0, 0, 0, 0.2)'
                        }}
                      >
                        {renderIconThumb(item)}
                      </div>

                      {/* Name & Target */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '11.5px',
                            fontWeight: 600,
                            color: isPinned
                              ? 'var(--text-muted)'
                              : isDeathNote
                                ? '#eae6df'
                                : isEldenRing
                                  ? '#f3ecd8'
                                  : 'var(--text-primary)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.name}
                        </div>
                        <div
                          style={{
                            fontSize: '9.5px',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            marginTop: '1px'
                          }}
                        >
                          {item.type === 'url' ? 'Web Link' : 'Application'}
                        </div>
                      </div>

                      {/* Pin/Check Badge */}
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: isCandy ? '10px' : '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isPinned
                            ? 'rgba(34, 197, 94, 0.16)'
                            : isDeathNote
                              ? 'rgba(163, 38, 45, 0.16)'
                              : isEldenRing
                                ? 'rgba(234, 196, 119, 0.12)'
                                : isOnePiece
                                  ? 'rgba(245, 158, 11, 0.12)'
                                  : 'var(--bg-surface-active)',
                          color: isPinned
                            ? '#22c55e'
                            : isDeathNote
                              ? '#fca5a5'
                              : isEldenRing
                                ? '#EAC477'
                                : isOnePiece
                                  ? '#f59e0b'
                                  : 'var(--text-muted)',
                          border: isPinned
                            ? '1px solid rgba(34, 197, 94, 0.35)'
                            : isDeathNote
                              ? '1px solid rgba(163, 38, 45, 0.35)'
                              : isEldenRing
                                ? '1px solid rgba(234, 196, 119, 0.25)'
                                : isOnePiece
                                  ? '1px solid rgba(245, 158, 11, 0.25)'
                                  : '1px solid var(--border-subtle)',
                          transition: 'all 0.15s ease'
                        }}
                        aria-label={isPinned ? 'Pinned' : 'Add to Quick Icons'}
                      >
                        {isPinned ? <Check size={11} strokeWidth={2.6} /> : <Plus size={12} strokeWidth={2.2} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer Info & Close */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: isDeathNote
            ? '1px solid rgba(163, 38, 45, 0.45)'
            : isEldenRing
              ? '1px solid rgba(234, 196, 119, 0.35)'
              : isOnePiece
                ? '1px solid rgba(245, 158, 11, 0.35)'
                : isAether
                  ? '1px solid rgba(140, 96, 56, 0.45)'
                  : isCandy
                    ? '1px solid #ffccd5'
                    : '1px solid var(--border-subtle)',
          background: isDeathNote
            ? 'rgba(14, 10, 10, 0.96)'
            : isEldenRing
              ? 'rgba(10, 12, 10, 0.96)'
              : isOnePiece
                ? 'rgba(16, 22, 30, 0.96)'
                : isAether
                  ? 'rgba(16, 28, 42, 0.96)'
                  : isCandy
                    ? 'rgba(255, 240, 245, 0.96)'
                    : 'var(--bg-footer)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              color: isDeathNote
                ? '#fca5a5'
                : isEldenRing
                  ? '#EAC477'
                  : isOnePiece
                    ? '#f59e0b'
                    : 'var(--text-secondary)',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {pinnedSet.size} pinned
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.5 }}>•</span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Drag cards onto Quick Icons anytime
          </span>
        </div>

        <button
          type="button"
          onClick={onClose}
          style={{
            padding: '6px 16px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: isCandy ? '14px' : '6px',
            cursor: 'pointer',
            background: isDeathNote
              ? '#c41e24'
              : isEldenRing
                ? '#c5a059'
                : isOnePiece
                  ? '#f59e0b'
                  : isCandy
                    ? '#f472b6'
                    : 'var(--btn-primary-bg, #3b82f6)',
            color: isEldenRing || isOnePiece ? '#141414' : '#ffffff',
            border: isDeathNote
              ? '1px solid #e05a61'
              : isEldenRing
                ? '1px solid #EAC477'
                : isOnePiece
                  ? '1px solid #fbbf24'
                  : isCandy
                    ? '1px solid #f9a8d4'
                    : '1px solid transparent',
            fontFamily: isDeathNote
              ? 'var(--font-gothic)'
              : isEldenRing || isOnePiece
                ? 'var(--font-fantasy)'
                : undefined,
            letterSpacing: isDeathNote || isOnePiece ? '0.6px' : '0.2px',
            boxShadow: isDeathNote
              ? '0 2px 10px rgba(196, 30, 36, 0.4)'
              : isEldenRing
                ? '0 2px 10px rgba(197, 160, 89, 0.35)'
                : isOnePiece
                  ? '0 2px 10px rgba(245, 158, 11, 0.35)'
                  : '0 2px 8px rgba(0, 0, 0, 0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.filter = 'none';
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};
