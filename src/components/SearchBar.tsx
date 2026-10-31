import React, { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assets';
import { AppGroup, AppItem, DockTheme } from '../types/dock';
import { AppCard } from './AppCard';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  isOpen: boolean;
  groups: AppGroup[];
  onClose: () => void;
  onLaunchItem: (item: AppItem) => void;
  onDeleteItem: (groupId: string, itemId: string) => void;
  theme?: DockTheme;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  isOpen,
  groups,
  onClose,
  onLaunchItem,
  onDeleteItem,
  theme
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const allItems: { item: AppItem; groupName: string; groupId: string; groupColor: string }[] = [];
  groups.forEach((g) => {
    g.items.forEach((item) => {
      allItems.push({ item, groupName: g.name, groupId: g.id, groupColor: g.accentColor });
    });
  });

  const filtered = query.trim()
    ? allItems.filter(
        ({ item, groupName }) =>
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.target.toLowerCase().includes(query.toLowerCase()) ||
          groupName.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  const currentTheme = (theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '')) as DockTheme;
  const isDeathNote = currentTheme === 'deathnote';
  const isEldenRing = currentTheme === 'eldenring';
  const isOnePiece = currentTheme === 'onepiece';
  const isCandy = currentTheme === 'candy';
  const isAether = currentTheme === 'aether';

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--modal-bg)',
        backdropFilter: 'blur(20px)',
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Death Note Thematic Background Artwork */}
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
              filter: 'brightness(0.65) contrast(1.15)',
              opacity: 0.45
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(8, 8, 8, 0.85) 0%, rgba(12, 12, 12, 0.92) 100%)'
            }}
          />
        </div>
      )}

      {/* Elden Ring Thematic Background Artwork */}
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
              backgroundImage: `url('${getAssetUrl('/eldenring/backgrounds/vertical_moon_ruins_wallpaper.png')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.35) contrast(1.2)',
              opacity: 0.55
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(8, 10, 9, 0.88) 0%, rgba(17, 19, 16, 0.95) 100%)'
            }}
          />
        </div>
      )}

      {/* One Piece Thematic Background Artwork */}
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
              opacity: 0.5
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(180deg, rgba(14, 22, 32, 0.88) 0%, rgba(10, 16, 24, 0.96) 100%)'
            }}
          />
        </div>
      )}

      {/* Candy Thematic Background Artwork */}
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
              background: 'linear-gradient(180deg, rgba(255, 240, 245, 0.88) 0%, rgba(255, 228, 238, 0.95) 100%)'
            }}
          />
        </div>
      )}

      {/* Aether Thematic Background Artwork */}
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
              background: 'linear-gradient(180deg, rgba(20, 35, 52, 0.88) 0%, rgba(12, 22, 34, 0.95) 100%)'
            }}
          />
        </div>
      )}

      {/* Search Input Bar */}
      <div
        style={{
          padding: isEldenRing ? '8px 12px' : '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: isEldenRing ? '1px solid rgba(197, 161, 90, 0.35)' : '1px solid var(--border-subtle)',
          background: isEldenRing ? '#080A09' : 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {isEldenRing ? (
          <div
            style={{
              flex: 1,
              height: '42px',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              backgroundImage: `url('${getAssetUrl('/eldenring/misc/search_bar.png')}')`,
              backgroundSize: '100% 100%',
              backgroundRepeat: 'no-repeat',
              padding: '0 32px 0 28px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              placeholder=""
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
              style={{
                width: '100%',
                background: query ? '#111310' : 'transparent',
                padding: query ? '2px 6px' : 0,
                borderRadius: '4px',
                border: 'none',
                outline: 'none',
                color: '#EAC477',
                fontFamily: 'var(--font-fantasy)',
                fontSize: '13px',
                letterSpacing: '0.5px'
              }}
            />
          </div>
        ) : (
          <>
            <Search size={14} color="var(--text-muted)" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '12.5px'
              }}
            />
          </>
        )}
        <button
          onClick={onClose}
          className="btn-dock"
          aria-label="Close search"
          style={{
            width: isEldenRing ? '28px' : '26px',
            height: isEldenRing ? '28px' : '26px',
            borderRadius: isEldenRing ? '4px' : '6px',
            background: isEldenRing ? 'rgba(23, 24, 19, 0.95)' : undefined,
            border: isEldenRing ? '1px solid rgba(197, 161, 90, 0.45)' : undefined,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0
          }}
        >
          {isEldenRing ? (
            <img
              src={getAssetUrl('/eldenring/header/header_control_close.png')}
              alt="Close"
              style={{ width: '22px', height: '22px', objectFit: 'contain' }}
            />
          ) : (
            <X size={14} />
          )}
        </button>
      </div>

      {/* Results Grid */}
      <div style={{ flex: 1, padding: '12px', overflowY: 'auto', position: 'relative', zIndex: 2 }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>
            No results
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '8px'
            }}
          >
            {filtered.map(({ item, groupName, groupId, groupColor }) => (
              <div key={`${groupId}-${item.id}`} style={{ position: 'relative' }}>
                <AppCard
                  item={item}
                  accentColor={groupColor}
                  onLaunch={(it) => {
                    onLaunchItem(it);
                    onClose();
                  }}
                  onDelete={(id) => onDeleteItem(groupId, id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
