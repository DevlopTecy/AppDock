import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assets';
import { AppGroup, AppItem, DockTheme } from '../types/dock';
import { QuickScanner } from './QuickScanner';
import { normalizeUrl } from '../utils/storage';
import {
  X,
  Scan,
  FolderOpen,
  Globe,
  Plus
} from 'lucide-react';

interface AddItemModalProps {
  isOpen: boolean;
  activeGroup: AppGroup;
  onClose: () => void;
  onAddItem: (item: AppItem) => void;
  theme?: DockTheme;
}

type TabType = 'scan' | 'browse' | 'url';

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  activeGroup,
  onClose,
  onAddItem,
  theme
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const tabParam = new URLSearchParams(window.location.search).get('tab');
      if (tabParam === 'browse' || tabParam === 'url') return tabParam;
    }
    return 'scan';
  });

  // URL Tab state
  const [urlName, setUrlName] = useState('');
  const [urlAddress, setUrlAddress] = useState('');
  const [urlError, setUrlError] = useState('');

  if (!isOpen) return null;

  const existingTargetPaths = new Set(activeGroup.items.map((i) => i.target));

  const handleBrowseFile = async () => {
    try {
      if (typeof window !== 'undefined' && (window as any).appDock?.browseFile) {
        const fileInfo = await (window as any).appDock.browseFile();
        if (fileInfo && fileInfo.path) {
          let icon = undefined;
          let finalTarget = fileInfo.path;
          if ((window as any).appDock?.resolveItem) {
            try {
              const res = await (window as any).appDock.resolveItem({ name: fileInfo.name, target: fileInfo.path });
              if (res) {
                if (res.target) finalTarget = res.target;
                if (res.icon) icon = res.icon;
              }
            } catch {}
          }
          if (!icon && (window as any).appDock?.extractIcon) {
            icon = await (window as any).appDock.extractIcon(finalTarget);
          }

          const newItem: AppItem = {
            id: `app-${Date.now()}`,
            name: fileInfo.name || 'Application',
            type: 'app',
            target: finalTarget,
            icon: icon || undefined,
            launchCount: 0
          };
          onAddItem(newItem);
          onClose();
        }
      }
    } catch (err) {
      console.error('File browse error:', err);
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlAddress.trim()) {
      setUrlError('Enter URL');
      return;
    }

    const cleanUrl = normalizeUrl(urlAddress);
    let title = urlName.trim();
    if (!title) {
      try {
        const hostname = new URL(cleanUrl).hostname;
        title = hostname.replace(/^www\./i, '');
      } catch {
        title = 'Web Link';
      }
    }

    let faviconUrl = '';
    try {
      const parsed = new URL(cleanUrl);
      faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;
    } catch {
      faviconUrl = '';
    }

    const newItem: AppItem = {
      id: `url-${Date.now()}`,
      name: title,
      type: 'url',
      target: cleanUrl,
      icon: faviconUrl || undefined,
      launchCount: 0
    };

    onAddItem(newItem);
    setUrlName('');
    setUrlAddress('');
    setUrlError('');
    onClose();
  };

  const isDeathNote = (theme || (typeof document !== 'undefined' ? document.documentElement.getAttribute('data-theme') : '')) === 'deathnote';

  return (
    <div
      className="add-modal-view"
      style={{
        position: 'absolute',
        inset: 0,
        background: 'var(--modal-bg)',
        zIndex: 50,
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
              backgroundImage: `url('${getAssetUrl('/deathnote/backgrounds/wallpaper_main_1.jpg')}')`,
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

      {/* Header */}
      <div
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-header)',
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
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              fontFamily: isDeathNote ? 'var(--font-gothic)' : undefined,
              letterSpacing: isDeathNote ? '0.5px' : undefined
            }}
          >
            Add to {activeGroup.name}
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

      {/* Clean Icon-First Tabs */}
      <div
        style={{
          display: 'flex',
          padding: '6px 10px',
          gap: '6px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {[
          { id: 'scan' as TabType, label: 'Scan', icon: <Scan size={13} /> },
          { id: 'browse' as TabType, label: 'Browse', icon: <FolderOpen size={13} /> },
          { id: 'url' as TabType, label: 'URL', icon: <Globe size={13} /> }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`add-modal-tab-btn ${isActive ? 'is-active' : ''}`}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '6px 4px',
                borderRadius: '6px',
                fontSize: '11.5px',
                fontWeight: isActive ? 600 : 500,
                background: isActive ? 'var(--text-primary)' : 'var(--bg-surface)',
                color: isActive ? 'var(--bg-dock)' : 'var(--text-secondary)',
                border: isActive ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'var(--btn-shadow)',
                cursor: 'pointer',
                transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.background = 'var(--bg-surface-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--btn-border)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-surface)';
                }
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div style={{ flex: 1, padding: '10px 12px', overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 2 }}>
        {activeTab === 'scan' && (
          <QuickScanner
            onAddScannedItem={onAddItem}
            existingTargetPaths={existingTargetPaths}
          />
        )}

        {activeTab === 'browse' && (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              gap: '12px',
              padding: '16px'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-secondary)'
              }}
            >
              <FolderOpen size={22} />
            </div>

            <button
              onClick={handleBrowseFile}
              className="btn-primary"
              style={{
                padding: '8px 20px',
                fontSize: '12.5px',
                gap: '6px'
              }}
            >
              <FolderOpen size={14} />
              <span>Choose Executable</span>
            </button>
          </div>
        )}

        {activeTab === 'url' && (
          <form onSubmit={handleAddUrl} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: urlError ? '1px solid #ef4444' : '1px solid var(--btn-border)',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <Globe size={14} color="var(--text-muted)" />
                <input
                  type="text"
                  placeholder="https://example.com"
                  value={urlAddress}
                  onChange={(e) => {
                    setUrlAddress(e.target.value);
                    if (urlError) setUrlError('');
                  }}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontSize: '12px',
                    outline: 'none'
                  }}
                />
              </div>
            </div>

            <div>
              <input
                type="text"
                placeholder="Title (optional)"
                value={urlName}
                onChange={(e) => setUrlName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--btn-border)',
                  color: 'var(--text-primary)',
                  fontSize: '12px',
                  outline: 'none',
                  transition: 'border-color 0.15s ease'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{
                marginTop: '6px',
                padding: '8px',
                fontSize: '12px',
                gap: '6px'
              }}
            >
              <Plus size={14} />
              <span>Add URL</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
