import React from 'react';
import { AppItem } from '../types/dock';
import { Globe, AppWindow } from 'lucide-react';
import { isGenericOrBrokenIcon } from '../utils/assets';

interface GroupGridIconProps {
  items?: AppItem[];
  size?: number; // Outer container size in pixels (e.g. 24 - 28)
  accentColor?: string;
  gridItemIds?: string[];
}

export const GroupGridIcon: React.FC<GroupGridIconProps> = ({
  items = [],
  size = 24,
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
            objectFit: 'contain',
            borderRadius: '2px',
            pointerEvents: 'none',
            userSelect: 'none'
          }}
          onError={(e) => {
            // If image fails, fallback to Lucide icon
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }

    if (item.type === 'url') {
      return <Globe size={Math.max(6, Math.round(thumbSize * 0.72))} color="var(--text-primary)" />;
    }

    return <AppWindow size={Math.max(6, Math.round(thumbSize * 0.72))} color="var(--text-primary)" />;
  };

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: size > 26 ? '7px' : '5px',
    background: 'rgba(0, 0, 0, 0.42)',
    border: '1px solid rgba(255, 255, 255, 0.12)',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.35)',
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
            gap: '2px',
            width: '100%',
            height: '100%'
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                borderRadius: '2px',
                border: '1px dashed rgba(255, 255, 255, 0.22)',
                background: 'rgba(255, 255, 255, 0.03)'
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  // Case 1: 1 item (single centered icon)
  if (count === 1) {
    const singleSize = Math.max(12, Math.round(size * 0.68));
    return (
      <div style={containerStyle}>
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '4px'
          }}
        >
          {renderItemThumb(displayItems[0], singleSize)}
        </div>
      </div>
    );
  }

  // Case 2: 2 items side-by-side
  if (count === 2) {
    const cellW = Math.max(8, Math.floor((size - 7) / 2));
    const cellH = Math.max(10, Math.floor(size - 6));
    const thumbSize = Math.min(cellW, cellH) - 1;

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', gap: '2px', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          {displayItems.map((it) => (
            <div
              key={it.id}
              style={{
                width: `${cellW}px`,
                height: `${cellH}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.07)',
                borderRadius: '3px',
                overflow: 'hidden'
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
    const cellSize = Math.max(7, Math.floor((size - 7) / 2));

    return (
      <div style={containerStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', width: '100%' }}>
            {displayItems.slice(0, 2).map((it) => (
              <div
                key={it.id}
                style={{
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(255, 255, 255, 0.07)',
                  borderRadius: '2.5px',
                  overflow: 'hidden'
                }}
              >
                {renderItemThumb(it, cellSize - 1)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div
              key={displayItems[2].id}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(255, 255, 255, 0.07)',
                borderRadius: '2.5px',
                overflow: 'hidden'
              }}
            >
              {renderItemThumb(displayItems[2], cellSize - 1)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Case 4: 4 items (2x2 grid, matching example image)
  const cellSize = Math.max(7, Math.floor((size - 7) / 2));

  return (
    <div style={containerStyle}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridTemplateRows: 'repeat(2, 1fr)',
          gap: '2px',
          width: '100%',
          height: '100%'
        }}
      >
        {displayItems.map((it) => (
          <div
            key={it.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255, 255, 255, 0.07)',
              borderRadius: '2.5px',
              overflow: 'hidden'
            }}
          >
            {renderItemThumb(it, cellSize - 1)}
          </div>
        ))}
      </div>
    </div>
  );
};
