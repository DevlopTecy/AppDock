import React, { useState, useRef } from 'react';
import { ChevronRight, ChevronLeft, ChevronDown, ChevronUp } from 'lucide-react';
import { DockPosition } from '../types/dock';

interface EdgeToggleProps {
  isExpanded: boolean;
  dockPosition: DockPosition;
  opacity: number;
  verticalPosition?: number;
  onToggle: () => void;
  onUpdateVerticalPosition?: (ratio: number) => void;
}

export const EdgeToggle: React.FC<EdgeToggleProps> = ({
  isExpanded,
  dockPosition,
  opacity,
  verticalPosition = 0.5,
  onToggle,
  onUpdateVerticalPosition
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const isHorizontalDock = dockPosition === 'left' || dockPosition === 'right';

  const dragRef = useRef({
    startScreenY: 0,
    startRatio: 0.5,
    hasMoved: false,
    latestRatio: 0.5
  });
  const rafRef = useRef<number | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const startScreenY = e.screenY;
    const currentRatio = typeof verticalPosition === 'number' ? verticalPosition : 0.5;

    dragRef.current = {
      startScreenY,
      startRatio: currentRatio,
      hasMoved: false,
      latestRatio: currentRatio
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = moveEvent.screenY - dragRef.current.startScreenY;

      // Start drag threshold of 4px to avoid treating simple clicks as drags
      if (!dragRef.current.hasMoved && Math.abs(deltaY) >= 4) {
        dragRef.current.hasMoved = true;
        setIsDragging(true);
      }

      if (dragRef.current.hasMoved) {
        // Screen travel height (desktop work area height minus handle height)
        const availHeight = (typeof window !== 'undefined' && window.screen?.availHeight)
          ? window.screen.availHeight
          : 1040;
        const travelHeight = Math.max(200, availHeight - (isExpanded ? 580 : 64));
        const deltaRatio = deltaY / travelHeight;
        const newRatio = Math.max(0.02, Math.min(0.98, dragRef.current.startRatio + deltaRatio));
        dragRef.current.latestRatio = newRatio;

        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(() => {
            if (typeof window !== 'undefined' && (window as any).appDock?.setVerticalPosition) {
              (window as any).appDock.setVerticalPosition(dragRef.current.latestRatio);
            }
            rafRef.current = null;
          });
        }
      }
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      if (dragRef.current.hasMoved) {
        const finalRatio = dragRef.current.latestRatio;
        if (onUpdateVerticalPosition) {
          onUpdateVerticalPosition(finalRatio);
        }
        if (typeof window !== 'undefined' && (window as any).appDock?.setVerticalPosition) {
          (window as any).appDock.setVerticalPosition(finalRatio);
        }
        setTimeout(() => {
          setIsDragging(false);
          dragRef.current.hasMoved = false;
        }, 50);
      } else {
        // Simple click without dragging -> trigger toggle open/close
        onToggle();
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const renderIcon = () => {
    if (dockPosition === 'left') {
      return isExpanded ? <ChevronLeft size={12} /> : <ChevronRight size={12} />;
    } else if (dockPosition === 'right') {
      return isExpanded ? <ChevronRight size={12} /> : <ChevronLeft size={12} />;
    } else {
      return isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />;
    }
  };

  return (
    <button
      id="dock-edge-toggle"
      type="button"
      onMouseDown={handleMouseDown}
      title={
        isDragging
          ? "Moving holder..."
          : isExpanded
            ? "Click to collapse · Hold & drag to move up/down"
            : "Click to open · Hold & drag to move up/down"
      }
      aria-label={isExpanded ? "Collapse Dock" : "Open Dock"}
      style={{
        opacity: isDragging ? 1 : isExpanded ? Math.max(0.85, opacity) : opacity,
        display: 'flex',
        flexDirection: isHorizontalDock ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        width: isHorizontalDock ? '22px' : '64px',
        height: isHorizontalDock ? '64px' : '22px',
        background: isDragging ? 'var(--bg-surface-active)' : 'var(--toggle-bg)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid',
        borderColor: isDragging ? 'var(--border-hover)' : 'var(--border-subtle)',
        borderLeft: dockPosition === 'left' ? 'none' : undefined,
        borderRight: dockPosition === 'right' ? 'none' : undefined,
        borderTop: dockPosition === 'top' ? 'none' : undefined,
        borderRadius: isHorizontalDock
          ? dockPosition === 'left'
            ? '0 10px 10px 0'
            : '10px 0 0 10px'
          : '0 0 10px 10px',
        color: isDragging ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: isDragging ? 'ns-resize' : 'pointer',
        boxShadow: isDragging
          ? '0 0 12px rgba(255, 255, 255, 0.25), var(--btn-shadow)'
          : 'var(--btn-shadow)',
        transition: isDragging ? 'none' : 'opacity 0.18s cubic-bezier(0.16, 1, 0.3, 1), background 0.18s ease',
        zIndex: 9999,
        flexShrink: 0,
        padding: 0,
        userSelect: 'none',
        WebkitUserSelect: 'none'
      }}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.color = 'var(--text-primary)';
          e.currentTarget.style.borderColor = 'var(--border-hover)';
          e.currentTarget.style.background = 'var(--bg-surface-hover)';
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.opacity = `${isExpanded ? Math.max(0.85, opacity) : opacity}`;
          e.currentTarget.style.color = 'var(--text-secondary)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.background = 'var(--toggle-bg)';
        }
      }}
    >
      {/* Subtle Tactile Notch */}
      <div
        style={{
          width: isHorizontalDock ? (isDragging ? '3.5px' : '2.5px') : (isDragging ? '14px' : '10px'),
          height: isHorizontalDock ? (isDragging ? '14px' : '10px') : (isDragging ? '3.5px' : '2.5px'),
          borderRadius: '2px',
          background: isDragging ? 'var(--text-primary)' : 'var(--border-hover)',
          opacity: isDragging ? 1 : 0.8,
          transition: 'all 0.15s ease'
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {renderIcon()}
      </div>
    </button>
  );
};

export default EdgeToggle;
