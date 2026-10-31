import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assets';
import { AppGroup, GroupDensity, DockTheme } from '../types/dock';
import { getGroupIcon } from './GroupTabs';
import { X, Plus, Sparkles } from 'lucide-react';

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (group: AppGroup) => void;
  theme?: DockTheme;
}

const ICONS = ['Gamepad2', 'Briefcase', 'Globe', 'Code2', 'Music', 'Video', 'Terminal', 'Folder'];
const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4'];

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  theme
}) => {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Gamepad2');
  const [selectedColor, setSelectedColor] = useState('#3b82f6');
  const [density, setDensity] = useState<GroupDensity>('auto');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Enter name');
      return;
    }

    const newGroup: AppGroup = {
      id: `grp-${Date.now()}`,
      name: name.trim(),
      iconName: selectedIcon,
      accentColor: selectedColor,
      items: [],
      density
    };

    onCreateGroup(newGroup);
    setName('');
    setError('');
    setDensity('auto');
    onClose();
  };

  const currentTheme = (theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '')) as DockTheme;
  const isDeathNote = currentTheme === 'deathnote';
  const isEldenRing = currentTheme === 'eldenring';
  const isOnePiece = currentTheme === 'onepiece';
  const isCandy = currentTheme === 'candy';
  const isAether = currentTheme === 'aether';

  return (
    <div
      className="new-group-modal-view"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--modal-bg)',
        zIndex: 55,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Thematic Background Artwork */}
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
              backgroundImage: `url('${getAssetUrl('/eldenring/backgrounds/vertical_golden_tree_wallpaper.png')}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: 'brightness(0.35) contrast(1.15)',
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

      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: isEldenRing
            ? '1px solid rgba(197, 161, 90, 0.35)'
            : isOnePiece
              ? '1px solid rgba(245, 158, 11, 0.35)'
              : '1px solid var(--border-subtle)',
          background: isEldenRing
            ? '#080A09'
            : isOnePiece
              ? 'rgba(20, 28, 38, 0.95)'
              : 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isDeathNote && (
            <img
              src={getAssetUrl('/deathnote/icons/logo_deathnote_white.png')}
              alt="Death Note"
              style={{ height: '15px', objectFit: 'contain' }}
            />
          )}
          {isEldenRing && (
            <img
              src={getAssetUrl('/eldenring/icons/sword.png')}
              alt="Elden Ring"
              style={{ height: '18px', width: '18px', objectFit: 'contain' }}
            />
          )}
          {isOnePiece && (
            <img
              src={getAssetUrl('/onepiece/icons/straw_hat_emblem.png')}
              alt="One Piece"
              style={{ height: '18px', width: '18px', objectFit: 'contain' }}
            />
          )}
          {isCandy && (
            <img
              src={getAssetUrl('/candy/decorations/lollipop_candy.png')}
              alt="Candy"
              style={{ height: '18px', width: '18px', objectFit: 'contain' }}
            />
          )}
          {isAether && (
            <img
              src={getAssetUrl('/aether/crafting_table.png')}
              alt="Aether"
              style={{ height: '18px', width: '18px', objectFit: 'contain', imageRendering: 'pixelated' }}
            />
          )}
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: isEldenRing
                ? '#EAC477'
                : isOnePiece
                  ? '#f59e0b'
                  : 'var(--text-primary)',
              fontFamily: isDeathNote
                ? 'var(--font-gothic)'
                : isEldenRing
                  ? 'var(--font-fantasy)'
                  : isOnePiece
                    ? 'var(--font-onepiece)'
                    : undefined,
              letterSpacing: isDeathNote || isEldenRing || isOnePiece ? '0.6px' : undefined
            }}
          >
            New Group
          </span>
        </div>
        <button
          onClick={onClose}
          className="btn-dock"
          aria-label="Close"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px'
          }}
        >
          <X size={14} />
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', zIndex: 2 }}>
        <div>
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: error ? '1px solid #ef4444' : '1px solid var(--btn-border)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              boxSizing: 'border-box',
              outline: 'none',
              transition: 'border-color 0.15s ease'
            }}
          />
        </div>

        {/* Icon Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {ICONS.map((icon) => {
            const isSelected = selectedIcon === icon;
            return (
              <button
                type="button"
                key={icon}
                onClick={() => setSelectedIcon(icon)}
                className={`group-icon-btn ${isSelected ? 'is-selected' : ''}`}
                style={{
                  height: '32px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                  color: isSelected ? 'var(--bg-dock)' : 'var(--text-secondary)',
                  boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'var(--btn-shadow)',
                  cursor: 'pointer',
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--btn-border)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }
                }}
              >
                {getGroupIcon(icon, 15)}
              </button>
            );
          })}
        </div>

        {/* Color Palette */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', padding: '4px 0' }}>
          {COLORS.map((col) => {
            const isSelected = selectedColor === col;
            return (
              <button
                type="button"
                key={col}
                onClick={() => setSelectedColor(col)}
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: col,
                  border: 'none',
                  boxShadow: isSelected ? `0 0 0 2px var(--bg-dock), 0 0 0 4px ${col}` : 'none',
                  cursor: 'pointer',
                  transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                  transition: 'all 0.15s ease'
                }}
              />
            );
          })}
        </div>

        {/* Density Layout Choice */}
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
            Icon & Grid Size
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '4px',
              background: 'var(--bg-surface)',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid var(--btn-border)'
            }}
          >
            {[
              { id: 'auto' as const, label: 'Auto' },
              { id: 'large' as const, label: 'Large' },
              { id: 'medium' as const, label: 'Medium' },
              { id: 'compact' as const, label: 'Small' }
            ].map((opt) => {
              const isSel = density === opt.id;
              return (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDensity(opt.id)}
                  className={`group-density-btn ${isSel ? 'is-selected' : ''}`}
                  style={{
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 2px',
                    fontSize: '10.5px',
                    fontWeight: isSel ? 600 : 400,
                    cursor: 'pointer',
                    background: isSel ? 'var(--text-primary)' : 'transparent',
                    color: isSel ? 'var(--bg-dock)' : 'var(--text-secondary)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            marginTop: '4px',
            padding: '8px',
            fontSize: '12px',
            gap: '6px'
          }}
        >
          <Plus size={14} />
          <span>Create</span>
        </button>
      </form>
    </div>
  );
};
