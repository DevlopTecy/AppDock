import React, { useState } from 'react';
import { AppItem } from '../types/dock';
import { AppWindow, Globe, Trash2, ArrowUpRight } from 'lucide-react';
import { isGenericOrBrokenIcon } from '../utils/assets';

interface AppCardProps {
  item: AppItem;
  accentColor?: string;
  onLaunch: (item: AppItem) => void;
  onDelete: (itemId: string) => void;
  onContextMenu?: (item: AppItem, e: React.MouseEvent) => void;
  iconSize?: number;
  cardHeight?: number;
  fontSize?: number;
  density?: 'large' | 'medium' | 'compact';
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragEnter?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  item,
  onLaunch,
  onDelete,
  onContextMenu,
  iconSize = 32,
  cardHeight,
  fontSize = 10.5,
  density = 'compact',
  draggable = false,
  onDragStart,
  onDragOver,
  onDragEnter,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false
}) => {
  const [isLaunching, setIsLaunching] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleLaunchClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLaunching(true);
    onLaunch(item);
    setTimeout(() => setIsLaunching(false), 300);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(item.id);
  };

  const iconDimension = `${iconSize}px`;
  const lucideIconSize = Math.max(16, Math.round(iconSize * 0.56));

  const renderIcon = () => {
    if (item.icon && !imgError && !isGenericOrBrokenIcon(item.icon)) {
      return (
        <img
          src={item.icon}
          alt=""
          draggable={false}
          onError={() => setImgError(true)}
          style={{
            width: iconDimension,
            height: iconDimension,
            objectFit: 'contain',
            borderRadius: iconSize > 40 ? '10px' : '6px',
            imageRendering: 'auto',
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))',
            transition: 'transform 0.18s ease'
          }}
        />
      );
    }

    if (item.type === 'url') {
      return (
        <div
          style={{
            width: iconDimension,
            height: iconDimension,
            borderRadius: iconSize > 40 ? '10px' : '6px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--btn-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-primary)',
            boxShadow: 'var(--btn-shadow)'
          }}
        >
          <Globe size={lucideIconSize} />
        </div>
      );
    }

    return (
      <div
        style={{
          width: iconDimension,
          height: iconDimension,
          borderRadius: iconSize > 40 ? '10px' : '6px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--btn-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          boxShadow: 'var(--btn-shadow)'
        }}
      >
        <AppWindow size={lucideIconSize} />
      </div>
    );
  };

  const isLarge = density === 'large';

  return (
    <div
      onClick={handleLaunchClick}
      onContextMenu={(e) => {
        if (onContextMenu) {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(item, e);
        }
      }}
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnter={onDragEnter}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={`glass-card ${isDragging ? 'is-dragging' : ''} ${isDragOver ? 'is-drag-over' : ''}`}
      title={`${item.name}\n${item.target}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isLarge ? '12px 8px 10px 8px' : '8px 4px 6px 4px',
        borderRadius: isLarge ? '12px' : '8px',
        cursor: isDragging ? 'grabbing' : 'grab',
        textAlign: 'center',
        minHeight: cardHeight ? `${cardHeight}px` : isLarge ? '94px' : '66px',
        minWidth: 0,
        overflow: 'hidden',
        boxSizing: 'border-box',
        opacity: isDragging ? 0.35 : 1,
        transform: isDragging
          ? 'scale(0.92)'
          : isDragOver
            ? 'scale(1.05)'
            : isLaunching
              ? 'scale(0.95)'
              : 'scale(1)',
        borderColor: isDragOver ? 'var(--accent)' : isLaunching ? '#ffffff' : undefined,
        boxShadow: isDragOver
          ? '0 0 0 2px var(--accent), 0 8px 24px rgba(0, 0, 0, 0.45)'
          : undefined,
        transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {/* Subtle Trash on Hover */}
      <button
        onClick={handleDeleteClick}
        title="Remove"
        aria-label="Remove"
        style={{
          position: 'absolute',
          top: '3px',
          right: '3px',
          width: '18px',
          height: '18px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          opacity: 0.35,
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.color = '#ef4444';
          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '0.35';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <Trash2 size={11} />
      </button>

      {/* Main App Icon with smooth hover zoom transition & mini URL badge */}
      <div className="app-icon-wrapper" style={{ marginBottom: '4px', position: 'relative' }}>
        {renderIcon()}
        {item.type === 'url' && (
          <div
            style={{
              position: 'absolute',
              bottom: '-1px',
              right: '-2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#000000',
              border: '1px solid var(--btn-border-hover)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff'
            }}
          >
            <ArrowUpRight size={8} />
          </div>
        )}
      </div>

      {/* Item Name (Uses theme text-primary for high contrast in dark & light) */}
      <div
        style={{
          fontSize: `${fontSize}px`,
          fontWeight: isLarge ? 600 : 500,
          color: 'var(--text-primary)',
          width: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          padding: '0 2px',
          lineHeight: '1.2'
        }}
      >
        {item.name}
      </div>
    </div>
  );
};
