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

  const isDeathNote = (theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '')) === 'deathnote';

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

      {/* Search Input Bar */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
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
        <button
          onClick={onClose}
          className="btn-dock"
          aria-label="Close search"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px'
          }}
        >
          <X size={14} />
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
