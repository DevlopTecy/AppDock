import React, { useState, useMemo } from 'react';
import { AppGroup, AppItem, DockTheme } from '../types/dock';
import { getAssetUrl, isGenericOrBrokenIcon } from '../utils/assets';
import { X, Search, Plus, Check, Globe, AppWindow, Zap } from 'lucide-react';

interface AddToQuickIconsModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: AppGroup[];
  existingQuickItemIds: string[];
  onAddQuickIcon: (item: AppItem) => void;
  theme?: DockTheme;
}

export const AddToQuickIconsModal: React.FC<AddToQuickIconsModalProps> = ({
  isOpen,
  onClose,
  groups,
  existingQuickItemIds = [],
  onAddQuickIcon,
  theme
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [justAddedIds, setJustAddedIds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const isDeathNote = theme === 'deathnote';
  const isAether = theme === 'aether';
  const isEldenRing = theme === 'eldenring';
  const isKawaii = theme === 'kawaii';
  const isOnePiece = theme === 'onepiece';
  const isCandy = theme === 'candy';

  const pinnedSet = useMemo(() => {
    return new Set([...existingQuickItemIds, ...Array.from(justAddedIds)]);
  }, [existingQuickItemIds, justAddedIds]);

  const query = searchQuery.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    return groups
      .map((grp) => {
        const matchingItems = grp.items.filter((item) => {
          if (!query) return true;
          return (
            item.name.toLowerCase().includes(query) ||
            item.target.toLowerCase().includes(query)
          );
        });
        return {
          ...grp,
          items: matchingItems
        };
      })
      .filter((grp) => grp.items.length > 0);
  }, [groups, query]);

  const handleItemClick = (item: AppItem) => {
    if (pinnedSet.has(item.id)) return;
    onAddQuickIcon(item);
    setJustAddedIds((prev) => new Set(prev).add(item.id));
  };

  const renderIconThumb = (item: AppItem) => {
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
            width: '26px',
            height: '26px',
            objectFit: 'contain',
            borderRadius: '5px',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.45))'
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    if (isUrl) {
      return <Globe size={18} color="var(--text-primary)" />;
    }
    return <AppWindow size={18} color="var(--text-primary)" />;
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
      {/* Death Note Theme Thematic Background Artwork */}
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
              filter: 'brightness(0.55) contrast(1.15)',
              opacity: 0.35
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(245, 158, 11, 0.4)'
            }}
          >
            <Zap size={15} color="#fff" strokeWidth={2.4} />
          </div>
          <div>
            <div
              style={{
                fontSize: '12.5px',
                fontWeight: 700,
                color: isDeathNote ? '#e05a61' : isAether ? '#ffdf59' : 'var(--text-primary)',
                fontFamily: isDeathNote ? 'var(--font-gothic)' : undefined,
                letterSpacing: isDeathNote ? '0.5px' : undefined
              }}
            >
              Add to Quick Icons
            </div>
            <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
              Pin apps and links for fast 1-click launching
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="btn-icon"
          title="Close"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: 'var(--text-muted)'
          }}
        >
          <X size={16} />
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
            background: 'rgba(0, 0, 0, 0.25)',
            border: '1px solid var(--btn-border)',
            borderRadius: '7px',
            padding: '5px 9px'
          }}
        >
          <Search size={14} color="var(--text-muted)" />
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
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                padding: 0
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Grouped Items List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '10px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
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
              padding: '30px 15px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              gap: '6px'
            }}
          >
            <Zap size={28} strokeWidth={1.5} color="var(--text-muted)" style={{ opacity: 0.5 }} />
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              No matching items found
            </div>
            <div style={{ fontSize: '10.5px' }}>
              Add apps or URLs to your groups first, or try another search.
            </div>
          </div>
        ) : (
          filteredGroups.map((grp) => (
            <div key={grp.id} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {/* Group Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '2px 4px',
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: isDeathNote ? '#e05a61' : grp.accentColor || 'var(--text-muted)'
                }}
              >
                <span
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: grp.accentColor || 'var(--accent, #3b82f6)'
                  }}
                />
                <span>{grp.name}</span>
                <span style={{ fontSize: '9px', opacity: 0.65 }}>({grp.items.length})</span>
              </div>

              {/* Group Items Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
                  gap: '6px'
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
                        gap: '8px',
                        padding: '6px 8px',
                        borderRadius: isKawaii || isCandy ? '10px' : isEldenRing ? '6px' : '7px',
                        background: isPinned
                          ? 'rgba(0, 0, 0, 0.15)'
                          : 'var(--bg-surface)',
                        border: isPinned
                          ? '1px solid rgba(255, 255, 255, 0.05)'
                          : '1px solid var(--btn-border)',
                        opacity: isPinned ? 0.65 : 1,
                        cursor: isPinned ? 'default' : 'pointer',
                        textAlign: 'left',
                        position: 'relative',
                        transition: 'all 0.15s ease',
                        boxShadow: isPinned ? 'none' : '0 2px 4px rgba(0, 0, 0, 0.25)'
                      }}
                      onMouseEnter={(e) => {
                        if (!isPinned) {
                          e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isPinned) {
                          e.currentTarget.style.borderColor = 'var(--btn-border)';
                          e.currentTarget.style.transform = 'none';
                        }
                      }}
                    >
                      {/* Item Thumbnail */}
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        {renderIconThumb(item)}
                      </div>

                      {/* Name & Target */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: '11px',
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
                            fontSize: '9px',
                            color: 'var(--text-muted)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {item.type === 'url' ? 'Web Link' : 'Application'}
                        </div>
                      </div>

                      {/* Pin/Check Badge */}
                      <div
                        style={{
                          width: '18px',
                          height: '18px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          background: isPinned ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                          color: isPinned ? '#fff' : 'var(--text-muted)',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {isPinned ? <Check size={11} strokeWidth={3} /> : <Plus size={12} strokeWidth={2.5} />}
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
          padding: '8px 12px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-footer)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative',
          zIndex: 2
        }}
      >
        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
          💡 Tip: You can also drag and drop cards directly from groups onto the Quick Icons bar!
        </span>
        <button
          type="button"
          onClick={onClose}
          className="btn-dock"
          style={{
            padding: '4px 12px',
            fontSize: '11px',
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

