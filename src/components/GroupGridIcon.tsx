import React from 'react';
import { AppItem } from '../types/dock';
import { Globe, AppWindow } from 'lucide-react';
import { isGenericOrBrokenIcon } from '../utils/assets';

interface GroupGridIconProps {
  items?: AppItem[];
  size?: number; // Outer container size in pixels (e.g. 28 - 34)
  accentColor?: string;
  gridItemIds?: string[];
}

export const GroupGridIcon: React.FC<GroupGridIconProps> = ({
  items = [],
  size = 32,
  accentColor,
  gridItemIds
}) => {
  // If specific items were chosen for the grid, prioritize those; otherwise take first 4
  const displayItems = React.useMemo(() => {
    if (gridItemIds && gridItemIds.length >= 2) {
      const selected = items.filter((it) => gridItemIds.includes(it.id));
      if (selected.length >= 2) return selected.slice(0, 4);
    }
    return (items || []).slice(0, 4);
  }, [items, gridItemIds]);

  const count = displayItems.length;

  const renderItemThumb = (item: AppItem, thumbSize: number) => {
    // If the item has a valid, non-broken icon (base64 or URL)
    if (item.icon && !isGenericOrBrokenIcon(item.icon)) {
      return (
        <img
          src={item.icon}
          alt=""
          draggable={false}
          style={{
            width: `${thumbSize}px`,
            height: `${thumbSize}px`,
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '2.5px',
            pointerEvents: 'none',
            userSelect: 'none',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.45))'
          }}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    if (item.type === 'url') {
      return <Globe size={Math.max(9, Math.round(thumbSize * 0.8))} color="var(--text-primary)" />;
    }

    return <AppWindow size={Math.max(9, Math.round(thumbSize * 0.8))} color="var(--text-primary)" />;
  };

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
    boxSizing: 'border-box',
    overflow: 'hidden',
    position: 'relative'
  };

  // Case 0: Empty group (shows a subtle 2x2 outline awaiting apps)
  if (count === 0) {
    return (
      <div style={containerStyle} title="Dynamic icon grid (populates automatically as apps are added)">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)',
            gap: '2.5px',
            width: '100%',
            height: '100%',
            padding: '1px'
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                borderRadius: '3px',
                border: '1px dashed rgba(255, 255, 255, 0.3)',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Case 1: 1 item (single large centered icon taking full space)
  if (count === 1) {
    const singleSize = Math.max(16, Math.round(size * 0.82));
    return (
      <div style={containerStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {renderItemThumb(displayItems[0], singleSize)}
        </div>
      </div>
    );
  }

  // Case 2: 2 items side-by-side filling the space
  if (count === 2) {
    const cellW = Math.max(12, Math.floor((size - 5) / 2));
    const cellH = Math.max(14, Math.floor(size - 3));
    const thumbSize = Math.min(cellW, cellH);

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', gap: '3px', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {displayItems.map((it) => (
            <div
              key={it.id}
              style={{
                flex: 1,
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {renderItemThumb(it, thumbSize)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Case 3: 3 items (2 on top row, 1 centered on bottom row)
  if (count === 3) {
    const cellSize = Math.max(11, Math.floor((size - 5) / 2));

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5px', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '2.5px', justifyContent: 'center', width: '100%', flex: 1, alignItems: 'center' }}>
            {displayItems.slice(0, 2).map((it) => (
              <div
                key={it.id}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {renderItemThumb(it, cellSize)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', flex: 1, alignItems: 'center' }}>
            <div
              key={displayItems[2].id}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {renderItemThumb(displayItems[2], cellSize)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: 4 items (2x2 grid filling all available space)
  const cellSize = Math.max(11, Math.floor((size - 5) / 2));

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '2.5px',
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyItems: 'center'
        }}
      >
        {displayItems.map((it) => (
          <div
            key={it.id}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {renderItemThumb(it, cellSize)}
          </div>
        ))}
      </div>
    </div>
  );
};
