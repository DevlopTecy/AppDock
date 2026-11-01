import React, { useState, useMemo, useEffect } from 'react';
import { AppGroup, AppItem, DockTheme } from '../types/dock';
import { getAssetUrl, isGenericOrBrokenIcon } from '../utils/assets';
import { X, Search, Plus, Check, Globe, AppWindow, Zap } from 'lucide-react';

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
  const isDeathNote = theme === 'deathnote';
  const isAether = theme === 'aether';
  const isEldenRing = theme === 'eldenring';
  const isKawaii = theme === 'kawaii';
  const isCandy = theme === 'candy';

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
        background: isAether ? '#142334' : 'var(--modal-bg)',
        backdropFilter: 'blur(28px)',
        WebkitBackdropFilter: 'blur(28px)',
        zIndex: 65,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Death Note Theme Thematic Background Artwork with Soft Scrim */}
      {isDeathNote && (
        <div
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
              filter: 'brightness(0.35) contrast(1.1)',
              opacity: 0.22
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(12, 12, 12, 0.8) 0%, rgba(5, 5, 5, 0.96) 100%)'
            }}
          />
        </div>
      )}

      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '7px',
              background: 'var(--bg-surface-active)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--btn-shadow)'
            }}
          >
            <Zap size={14} color={isDeathNote ? '#e05a61' : isAether ? '#ffdf59' : '#f59e0b'} strokeWidth={2.4} />
          </div>
          <div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 600,
                color: isDeathNote ? '#fca5a5' : isAether ? '#ffdf59' : 'var(--text-primary)',
                letterSpacing: '0.1px'
              }}
            >
              Add to Quick Icons
            </div>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
              Pin apps and links for fast 1-click launching
            </div>
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
            borderRadius: '6px',
            cursor: 'pointer',
            border: '1px solid var(--btn-border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface-hover)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--bg-surface)';
            e.currentTarget.style.color = 'var(--text-muted)';
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Search Input Bar */}
      <div
        style={{
          padding: '8px 12px',
          background: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-subtle)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--bg-dock)',
            border: '1px solid var(--btn-border)',
            borderRadius: '6px',
            padding: '0 10px',
            height: '34px',
            transition: 'border-color 0.15s ease'
          }}
        >
          <Search size={13} color="var(--text-muted)" />
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
              color: 'var(--text-primary)'
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
          padding: '12px',
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
                background: 'var(--bg-surface-active)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--border-subtle)'
              }}
            >
              <Search size={18} color="var(--text-muted)" />
            </div>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No matching items found
            </div>
            <div style={{ fontSize: '11px', maxWidth: '240px', lineHeight: '1.4' }}>
              Try searching with another keyword or add items to your groups first.
            </div>
          </div>
        ) : (
          filteredGroups.map((grp) => (
            <div key={grp.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {/* Group Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isDeathNote ? '#e05a61' : grp.accentColor || 'var(--text-secondary)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: grp.accentColor || 'var(--accent, #3b82f6)',
                    boxShadow: `0 0 6px ${grp.accentColor || 'rgba(59, 130, 246, 0.4)'}`
                  }}
                />
                <span style={{ letterSpacing: '0.1px' }}>{grp.name}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--text-muted)',
                    background: 'var(--bg-surface-active)',
                    padding: '1px 6px',
                    borderRadius: '999px',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  {grp.items.length}
                </span>
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
                        background: isPinned
                          ? 'rgba(255, 255, 255, 0.03)'
                          : 'var(--bg-surface)',
                        border: isPinned
                          ? '1px solid var(--border-subtle)'
                          : '1px solid var(--btn-border)',
                        opacity: isPinned ? 0.6 : 1,
                        cursor: isPinned ? 'default' : 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        boxShadow: isPinned ? 'none' : 'var(--btn-shadow)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isPinned) {
                          e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                          e.currentTarget.style.background = 'var(--bg-surface-hover)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPinned) {
                          e.currentTarget.style.borderColor = 'var(--btn-border)';
                          e.currentTarget.style.background = 'var(--bg-surface)';
                          e.currentTarget.style.transform = 'none';
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
                          background: 'rgba(0, 0, 0, 0.2)'
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
                            color: 'var(--text-primary)',
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
                          borderRadius: '5px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isPinned ? 'rgba(34, 197, 94, 0.14)' : 'var(--bg-surface-active)',
                          color: isPinned ? '#22c55e' : 'var(--text-muted)',
                          border: isPinned ? '1px solid rgba(34, 197, 94, 0.3)' : '1px solid var(--border-subtle)',
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
          padding: '10px 14px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-footer)',
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
              fontSize: '10.5px',
              color: 'var(--text-secondary)',
              fontWeight: 500,
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
          className="btn-primary"
          style={{
            padding: '5px 14px',
            fontSize: '11.5px',
            fontWeight: 600,
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};
