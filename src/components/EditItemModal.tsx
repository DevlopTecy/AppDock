import React, { useState, useEffect } from 'react';
import { getAssetUrl } from '../utils/assets';
import { AppItem, DockTheme } from '../types/dock';
import { normalizeUrl } from '../utils/storage';
import {
  X,
  Globe,
  Check,
  Edit3,
  ExternalLink,
  AppWindow
} from 'lucide-react';

interface EditItemModalProps {
  isOpen: boolean;
  item: AppItem | null;
  onClose: () => void;
  onSaveItem: (updatedItem: AppItem) => void;
  theme?: DockTheme;
}

export const EditItemModal: React.FC<EditItemModalProps> = ({
  isOpen,
  item,
  onClose,
  onSaveItem,
  theme
}) => {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [error, setError] = useState('');
  const [previewError, setPreviewError] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setTarget(item.target || '');
      setError('');
      setPreviewError(false);
    }
  }, [item, isOpen]);

  if (!isOpen || !item) return null;

  const isUrl = item.type === 'url';
  const currentTheme = (theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '')) as DockTheme;
  const isDeathNote = currentTheme === 'deathnote';
  const isEldenRing = currentTheme === 'eldenring';
  const isOnePiece = currentTheme === 'onepiece';
  const isCandy = currentTheme === 'candy';
  const isAether = currentTheme === 'aether';

  // Compute live preview favicon
  const cleanTarget = isUrl ? normalizeUrl(target.trim()) : target.trim();
  let previewFaviconUrl = '';
  if (isUrl && cleanTarget) {
    try {
      const hostname = new URL(cleanTarget).hostname;
      if (hostname) {
        previewFaviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=128`;
      }
    } catch {}
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    if (isUrl) {
      if (!target.trim()) {
        setError('URL cannot be empty');
        return;
      }
      try {
        const normalized = normalizeUrl(target.trim());
        const parsed = new URL(normalized);
        const newFavicon = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;

        onSaveItem({
          ...item,
          name: name.trim(),
          target: normalized,
          icon: newFavicon
        });
        onClose();
      } catch {
        setError('Please enter a valid URL');
      }
    } else {
      // Desktop app shortcut rename
      onSaveItem({
        ...item,
        name: name.trim()
      });
      onClose();
    }
  };

  const primaryAccent = isDeathNote
    ? '#ef4444'
    : isEldenRing
      ? '#EAC477'
      : isOnePiece
        ? '#E5A93C'
        : isCandy
          ? '#ff7eb9'
          : isAether
            ? '#59bcf4'
            : 'var(--accent-color, #3b82f6)';

  return (
    <div
      className="edit-item-modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        className="edit-item-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '360px',
          background: 'var(--bg-dock)',
          border: `1px solid ${isEldenRing ? 'rgba(234, 196, 119, 0.45)' : isDeathNote ? 'rgba(239, 68, 68, 0.45)' : 'var(--border-hover)'}`,
          borderRadius: isCandy ? '16px' : isEldenRing ? '10px' : '12px',
          boxShadow: `0 20px 48px rgba(0, 0, 0, 0.6), 0 0 24px ${isDeathNote ? 'rgba(239, 68, 68, 0.2)' : isEldenRing ? 'rgba(234, 196, 119, 0.2)' : 'rgba(0,0,0,0.3)'}`,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-header)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'var(--bg-surface)',
                color: primaryAccent,
                border: `1px solid var(--btn-border)`
              }}
            >
              {isUrl ? <Globe size={15} /> : <AppWindow size={15} />}
            </div>
            <div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: isDeathNote ? '#fca5a5' : isEldenRing ? '#EAC477' : 'var(--text-primary)',
                  fontFamily: isDeathNote ? "'Cinzel', serif" : isOnePiece ? "'Pirata One', 'Cinzel', serif" : 'inherit'
                }}
              >
                {isUrl ? 'Edit Web Link' : 'Edit Shortcut'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Live Preview Card */}
        <div
          style={{
            padding: '14px 16px 0 16px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                background: 'var(--bg-dock)',
                border: '1px solid var(--btn-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {isUrl && previewFaviconUrl && !previewError ? (
                <img
                  src={previewFaviconUrl}
                  alt=""
                  onError={() => setPreviewError(true)}
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                />
              ) : item.icon && !previewError ? (
                <img
                  src={item.icon}
                  alt=""
                  onError={() => setPreviewError(true)}
                  style={{ width: '28px', height: '28px', objectFit: 'contain' }}
                />
              ) : isUrl ? (
                <Globe size={22} color={primaryAccent} />
              ) : (
                <AppWindow size={22} color={primaryAccent} />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {name.trim() || 'Untitled'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '2px'
                }}
              >
                {target.trim() || 'No target specified'}
              </div>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div
              style={{
                fontSize: '11px',
                color: '#ef4444',
                background: 'rgba(239, 68, 68, 0.1)',
                padding: '6px 10px',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}
            >
              {error}
            </div>
          )}

          {/* Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em'
              }}
            >
              DISPLAY NAME
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              placeholder="e.g. YouTube, GitHub"
              autoFocus
              style={{
                padding: '8px 12px',
                fontSize: '12.5px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* URL or Target Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label
              style={{
                fontSize: '10.5px',
                fontWeight: 600,
                color: 'var(--text-muted)',
                letterSpacing: '0.04em'
              }}
            >
              {isUrl ? 'WEB URL' : 'TARGET PATH'}
            </label>
            <input
              type="text"
              value={target}
              readOnly={!isUrl}
              onChange={(e) => {
                if (isUrl) {
                  setTarget(e.target.value);
                  setError('');
                  setPreviewError(false);
                }
              }}
              placeholder={isUrl ? 'e.g. https://youtube.com' : ''}
              style={{
                padding: '8px 12px',
                fontSize: '12.5px',
                borderRadius: '6px',
                background: !isUrl ? 'rgba(0,0,0,0.15)' : 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: !isUrl ? 'var(--text-muted)' : 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                boxSizing: 'border-box',
                cursor: !isUrl ? 'not-allowed' : 'text'
              }}
            />
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '8px',
              marginTop: '4px'
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '7px 14px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              style={{
                padding: '7px 16px',
                borderRadius: '6px',
                background: primaryAccent,
                border: 'none',
                color: isEldenRing || isOnePiece ? '#121212' : '#ffffff',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: `0 2px 8px ${primaryAccent}55`
              }}
            >
              <Check size={14} />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

