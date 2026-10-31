import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getAssetUrl } from '../utils/assets';
import { AppGroup, DockPosition, DockTheme } from '../types/dock';
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
  AlertTriangle,
  Edit3,
  Trash2,
  ArrowUp,
  ArrowDown
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
  onEditGroup?: (group: AppGroup) => void;
  onMoveGroup?: (groupId: string, direction: 'up' | 'down') => void;
  theme?: DockTheme;
}

export const GroupSidebar: React.FC<GroupSidebarProps> = ({
  groups,
  activeGroupId,
  dockPosition = 'right',
  onSelectGroup,
  onAddNewGroup,
  onDeleteGroup,
  onEditGroup,
  onMoveGroup,
  theme
}) => {
  const [hoveredGroupId, setHoveredGroupId] = useState<string | null>(null);
  const [confirmDeleteGroup, setConfirmDeleteGroup] = useState<AppGroup | null>(null);
  const [contextMenu, setContextMenu] = useState<{ group: AppGroup; x: number; y: number } | null>(null);
  const isRightDock = dockPosition === 'right';
  const isEldenRing = theme === 'eldenring' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'eldenring');

  useEffect(() => {
    if (!contextMenu) return;
    const handleOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target && target.closest('.group-context-menu')) return;
      setContextMenu(null);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    const timer = setTimeout(() => {
      window.addEventListener('click', handleOutside);
      window.addEventListener('contextmenu', handleOutside);
    }, 50);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleOutside);
      window.removeEventListener('contextmenu', handleOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [contextMenu]);

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
                onContextMenu={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setContextMenu({ group, x: e.clientX, y: e.clientY });
                }}
                title={`${group.name} (${group.items.length}) - Right-click to edit`}
                aria-label={group.name}
                style={{
                  width: isEldenRing ? '38px' : '36px',
                  height: isEldenRing ? '38px' : '36px',
                  borderRadius: isEldenRing ? '8px' : '10px',
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
                  {isEldenRing && (group.iconName?.toLowerCase().includes('game') || group.name.toLowerCase().includes('game')) ? (
                    <img
                      src={getAssetUrl('/eldenring/icons/gamepad.png')}
                      alt="Games"
                      style={{
                        height: '26px',
                        width: '26px',
                        objectFit: 'contain',
                        filter: isActive
                          ? 'drop-shadow(0 0 8px rgba(234, 196, 119, 0.95)) brightness(1.2)'
                          : 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.8))'
                      }}
                    />
                  ) : isEldenRing && (group.iconName?.toLowerCase().includes('globe') || group.iconName?.toLowerCase().includes('web')) ? (
                    <img
                      src={getAssetUrl('/eldenring/icons/globe.png')}
                      alt="Web"
                      style={{
                        height: '24px',
                        width: '24px',
                        objectFit: 'contain',
                        filter: isActive
                          ? 'drop-shadow(0 0 8px rgba(234, 196, 119, 0.95))'
                          : 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.8))'
                      }}
                    />
                  ) : isEldenRing && (group.iconName?.toLowerCase().includes('music') || group.name.toLowerCase().includes('music')) ? (
                    <img
                      src={getAssetUrl('/eldenring/sidebar/music_sidebar.png')}
                      alt="Music"
                      style={{
                        height: '34px',
                        width: 'auto',
                        objectFit: 'contain',
                        filter: isActive
                          ? 'drop-shadow(0 0 8px rgba(234, 196, 119, 0.95))'
                          : 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.8))'
                      }}
                    />
                  ) : isEldenRing && (group.iconName?.toLowerCase().includes('calendar') || group.name.toLowerCase().includes('calendar')) ? (
                    <img
                      src={getAssetUrl('/eldenring/sidebar/calendar_sidebar.png')}
                      alt="Calendar"
                      style={{
                        height: '34px',
                        width: 'auto',
                        objectFit: 'contain',
                        filter: isActive
                          ? 'drop-shadow(0 0 8px rgba(234, 196, 119, 0.95))'
                          : 'drop-shadow(0 1px 4px rgba(0, 0, 0, 0.8))'
                      }}
                    />
                  ) : (
                    getGroupIcon(group.iconName, isEldenRing ? 20 : 16)
                  )}
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
            width: isEldenRing ? '38px' : '36px',
            height: isEldenRing ? '38px' : '36px',
            borderRadius: isEldenRing ? '8px' : '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isEldenRing ? 'rgba(23, 24, 19, 0.9)' : 'var(--bg-surface)',
            color: isEldenRing ? '#EAC477' : 'var(--text-muted)',
            border: isEldenRing ? '1px dashed rgba(197, 161, 90, 0.6)' : '1px dashed var(--btn-border)',
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
            e.currentTarget.style.color = isEldenRing ? '#EAC477' : 'var(--text-muted)';
            e.currentTarget.style.borderColor = isEldenRing ? 'rgba(197, 161, 90, 0.6)' : 'var(--btn-border)';
            e.currentTarget.style.boxShadow = 'var(--btn-shadow)';
            e.currentTarget.style.background = isEldenRing ? 'rgba(23, 24, 19, 0.9)' : 'var(--bg-surface)';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          {isEldenRing ? (
            <img
              src={getAssetUrl('/eldenring/icons/add.png')}
              alt="Add"
              style={{ width: '20px', height: '20px', objectFit: 'contain', filter: 'drop-shadow(0 0 5px rgba(234, 196, 119, 0.7))' }}
            />
          ) : (
            <Plus size={15} strokeWidth={2.2} />
          )}
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
            src={getAssetUrl('/stickers/space_candy.png')}
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
            src={getAssetUrl('/aether/feather.png')}
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

      {/* Right-click Context Menu on Group Icon */}
      {contextMenu &&
        (() => {
          const groupIndex = groups.findIndex((g) => g.id === contextMenu.group.id);
          const canMoveUp = groupIndex > 0;
          const canMoveDown = groupIndex >= 0 && groupIndex < groups.length - 1;

          return createPortal(
            <div
              className="group-context-menu"
              onClick={(e) => e.stopPropagation()}
              style={{
                position: 'fixed',
                top: `${Math.max(10, Math.min(contextMenu.y, window.innerHeight - 180))}px`,
                left: isRightDock
                  ? `${Math.max(10, contextMenu.x - 155)}px`
                  : `${Math.min(contextMenu.x + 10, window.innerWidth - 165)}px`,
                zIndex: 99999,
                background: 'var(--modal-bg)',
                border: '1px solid var(--border-hover)',
                borderRadius: '8px',
                padding: '5px',
                boxShadow: 'var(--shadow-dock), 0 10px 28px rgba(0, 0, 0, 0.5)',
                minWidth: '150px',
                display: 'flex',
                flexDirection: 'column',
                gap: '3px',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)'
              }}
            >
              <div
                style={{
                  padding: '4px 8px 3px 8px',
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border-subtle)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {contextMenu.group.name}
              </div>

              {/* Move Up */}
              <button
                disabled={!canMoveUp}
                onClick={() => {
                  if (!canMoveUp || !onMoveGroup) return;
                  const grpId = contextMenu.group.id;
                  setContextMenu(null);
                  onMoveGroup(grpId, 'up');
                }}
                className="context-menu-item"
                title={canMoveUp ? 'Move group up' : 'Already at the top'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  background: 'transparent',
                  border: 'none',
                  color: canMoveUp ? 'var(--text-primary)' : 'var(--text-muted)',
                  opacity: canMoveUp ? 1 : 0.4,
                  fontSize: '11.5px',
                  cursor: canMoveUp ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (canMoveUp) e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ArrowUp size={13} color={canMoveUp ? 'var(--text-secondary)' : 'var(--text-muted)'} />
                <span>Move Up</span>
              </button>

              {/* Move Down */}
              <button
                disabled={!canMoveDown}
                onClick={() => {
                  if (!canMoveDown || !onMoveGroup) return;
                  const grpId = contextMenu.group.id;
                  setContextMenu(null);
                  onMoveGroup(grpId, 'down');
                }}
                className="context-menu-item"
                title={canMoveDown ? 'Move group down' : 'Already at the bottom'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  background: 'transparent',
                  border: 'none',
                  color: canMoveDown ? 'var(--text-primary)' : 'var(--text-muted)',
                  opacity: canMoveDown ? 1 : 0.4,
                  fontSize: '11.5px',
                  cursor: canMoveDown ? 'pointer' : 'not-allowed',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  if (canMoveDown) e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <ArrowDown size={13} color={canMoveDown ? 'var(--text-secondary)' : 'var(--text-muted)'} />
                <span>Move Down</span>
              </button>

              {/* Subtle Divider */}
              <div
                style={{
                  height: '1px',
                  background: 'var(--border-subtle)',
                  margin: '2px 0'
                }}
              />

              {/* Edit Group */}
              <button
                onClick={() => {
                  const grp = contextMenu.group;
                  setContextMenu(null);
                  if (onEditGroup) onEditGroup(grp);
                }}
                className="context-menu-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 8px',
                  borderRadius: '5px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.12s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <Edit3 size={13} color="var(--text-secondary)" />
                <span>Edit Group</span>
              </button>

              {/* Delete Group */}
              {groups.length > 1 && (
                <button
                  onClick={() => {
                    const grp = contextMenu.group;
                    setContextMenu(null);
                    setConfirmDeleteGroup(grp);
                  }}
                  className="context-menu-item"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 8px',
                    borderRadius: '5px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ef4444',
                    fontSize: '11.5px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.12s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Trash2 size={13} color="#ef4444" />
                  <span>Delete Group</span>
                </button>
              )}
            </div>,
            document.body
          );
        })()}
    </aside>
  );
};
