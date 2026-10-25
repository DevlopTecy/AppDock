import React, { useState } from 'react';
import { AppGroup, DockPosition } from '../types/dock';
import {
  Gamepad2,
  Briefcase,
  Globe,
  Folder,
  Code2,
  Music,
  Video,
  Terminal,
  Plus,
  X,
  AlertTriangle
} from 'lucide-react';

export const getGroupIcon = (iconName: string, size = 15) => {
  switch (iconName?.toLowerCase()) {
    case 'gamepad2':
    case 'games':
      return <Gamepad2 size={size} />;
    case 'briefcase':
    case 'work':
    case 'tools':
      return <Briefcase size={size} />;
    case 'globe':
    case 'web':
      return <Globe size={size} />;
    case 'code2':
    case 'dev':
      return <Code2 size={size} />;
    case 'music':
      return <Music size={size} />;
    case 'video':
      return <Video size={size} />;
    case 'terminal':
      return <Terminal size={size} />;
    default:
      return <Folder size={size} />;
  }
};

interface GroupSidebarProps {
  groups: AppGroup[];
  activeGroupId: string;
  dockPosition?: DockPosition;
  onSelectGroup: (groupId: string) => void;
  onAddNewGroup: () => void;
  onDeleteGroup: (groupId: string) => void;
}

export const GroupSidebar: React.FC<GroupSidebarProps> = ({
  groups,
  activeGroupId,
  dockPosition = 'left',
  onSelectGroup,
  onAddNewGroup,
  onDeleteGroup
}) => {
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<AppGroup | null>(null);
  const isRightDock = dockPosition === 'right';

  return (
    <aside
      style={{
        width: '48px',
        flexShrink: 0,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '10px 0',
        gap: '6px',
        background: 'var(--bg-header)',
        borderRight: isRightDock ? 'none' : '1px solid var(--border-subtle)',
        borderLeft: isRightDock ? '1px solid var(--border-subtle)' : 'none',
        overflowY: 'auto',
        overflowX: 'visible',
        scrollbarWidth: 'none',
        zIndex: 20
      }}
    >
      {/* Group Icon Buttons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          width: '100%',
          flex: 1
        }}
      >
        {groups.map((group) => {
          const isActive = group.id === activeGroupId;
          const isHovered = hoveredGroupId === group.id;

          return (
            <div
              key={group.id}
              onMouseEnter={() => setHoveredGroupId(group.id)}
              onMouseLeave={() => setHoveredGroupId(null)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              {/* Active Indicator Pill (Left for left-dock, Right for right-dock) */}
              <div
                style={{
                  position: 'absolute',
                  left: isRightDock ? undefined : 0,
                  right: isRightDock ? 0 : undefined,
                  width: '3px',
                  height: isActive ? '22px' : isHovered ? '10px' : '0px',
                  borderRadius: isRightDock ? '4px 0 0 4px' : '0 4px 4px 0',
                  background: 'var(--text-primary)',
                  boxShadow: isActive ? '0 0 8px rgba(255, 255, 255, 0.4)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />

              {/* 3D Tactile Group Button */}
              <button
                onClick={() => onSelectGroup(group.id)}
                title={`${group.name} (${group.items.length})`}
                aria-label={group.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? 'var(--text-primary)' : 'var(--bg-surface)',
                  color: isActive ? 'var(--bg-dock)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                  boxShadow: isActive
                    ? '0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.4)'
                    : 'var(--btn-shadow)',
                  cursor: 'pointer',
                  transform: isHovered && !isActive ? 'translateY(-2px) scale(1.05)' : 'translateY(0) scale(1)',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.boxShadow = 'var(--btn-shadow-hover)';
                    e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                    e.currentTarget.style.boxShadow = 'var(--btn-shadow)';
                    e.currentTarget.style.borderColor = 'var(--btn-border)';
                  }
                }}
              >
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: isHovered ? 'scale(1.15)' : 'scale(1)',
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                >
                  {getGroupIcon(group.iconName, 16)}
                </span>
              </button>

              {/* Floating Tooltip Pill on Hover */}
              {isHovered && (
                <div
                  style={{
                    position: 'absolute',
                    left: isRightDock ? undefined : '54px',
                    right: isRightDock ? '54px' : undefined,
                    zIndex: 100,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    background: 'var(--bg-dock)',
                    border: '1px solid var(--btn-border-hover)',
                    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
                    color: 'var(--text-primary)',
                    fontSize: '11px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    animation: 'fadeIn 0.15s ease'
                  }}
                >
                  <span>{group.name}</span>
                  <span style={{ color: 'var(--text-muted)', marginLeft: '4px', fontSize: '10px' }}>
                    ({group.items.length})
                  </span>
                </div>
              )}

              {/* Delete Group (X) on Hover */}
              {isHovered && groups.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteGroup(group);
                  }}
                  title={`Remove ${group.name}`}
                  aria-label={`Remove ${group.name}`}
                  style={{
                    position: 'absolute',
                    top: '-3px',
                    right: '1px',
                    width: '15px',
                    height: '15px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    boxShadow: 'var(--btn-shadow)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    zIndex: 25,
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#ef4444';
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.borderColor = '#ef4444';
                    e.currentTarget.style.transform = 'scale(1.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <X size={9} strokeWidth={2.5} />
                </button>
              )}
            </div>
          );
        })}

        {/* Subtle Divider */}
        <div
          style={{
            width: '24px',
            height: '1px',
            background: 'var(--border-subtle)',
            margin: '4px 0'
          }}
        />

        {/* 3D Add New Group Button */}
        <button
          onClick={onAddNewGroup}
          title="Add New Group"
          aria-label="Add New Group"
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--bg-surface)',
            color: 'var(--text-muted)',
            border: '1px dashed var(--btn-border)',
            boxShadow: 'var(--btn-shadow)',
            cursor: 'pointer',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
            e.currentTarget.style.boxShadow = 'var(--btn-shadow-hover)';
            e.currentTarget.style.background = 'var(--bg-surface-hover)';
            e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--btn-border)';
            e.currentTarget.style.boxShadow = 'var(--btn-shadow)';
            e.currentTarget.style.background = 'var(--bg-surface)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <Plus size={15} strokeWidth={2.2} />
        </button>

        {/* Cute Kawaii Space Candy Sticker */}
        <div
          className="kawaii-sidebar-candy"
          style={{
            marginTop: '8px',
            display: 'none',
            animation: 'kawaiiStickerDrift 4s ease-in-out infinite alternate',
            cursor: 'pointer'
          }}
          title="Space Candy Sticker"
        >
          <img
            src="/stickers/space_candy.png"
            alt="Space Candy"
            style={{ width: '28px', height: '24px', objectFit: 'contain' }}
          />
        </div>

        {/* Celestial Aether Sky Feather Badge */}
        <div
          className="aether-sidebar-feather"
          style={{
            marginTop: '8px',
            display: 'none',
            animation: 'aetherDrift 3.6s ease-in-out infinite alternate',
            cursor: 'pointer'
          }}
          title="Aether Floating Feather"
        >
          <img
            src="/aether/feather.png"
            alt="Aether Feather"
            style={{
              width: '26px',
              height: '26px',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 2px 5px rgba(255, 223, 89, 0.4))'
            }}
          />
        </div>
      </div>

      {/* Warning Confirmation Dialog for Removing Group */}
      {confirmDeleteGroup && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setConfirmDeleteGroup(null);
          }}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '230px',
              background: 'var(--modal-bg)',
              border: '1px solid var(--border-hover)',
              borderRadius: '12px',
              padding: '16px 14px',
              boxShadow: 'var(--shadow-dock)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '10px',
              textAlign: 'center'
            }}
          >
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.14)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={20} />
            </div>

            <div>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                Delete "{confirmDeleteGroup.name}"?
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '4px', lineHeight: 1.35 }}>
                This removes all {confirmDeleteGroup.items.length} {confirmDeleteGroup.items.length === 1 ? 'app' : 'apps'} in this group.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setConfirmDeleteGroup(null)}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--btn-border)',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteGroup(confirmDeleteGroup.id);
                  setConfirmDeleteGroup(null);
                }}
                style={{
                  flex: 1,
                  padding: '7px 4px',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: '#ffffff',
                  border: '1px solid #dc2626',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
