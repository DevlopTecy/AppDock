import React, { useState, useEffect, useRef } from 'react';
import { getAssetUrl } from '../utils/assets';
import { AppGroup, AppItem, GroupDensity, DockTheme } from '../types/dock';
import { getGroupIcon } from './GroupSidebar';
import { X, Check, Trash2, Plus, FolderOpen, Globe, Sparkles, Layers, Sliders, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';
import { GroupGridIcon } from './GroupGridIcon';

interface EditGroupModalProps {
  isOpen: boolean;
  group: AppGroup | null;
  theme?: DockTheme;
  onClose: () => void;
  onSaveGroup: (updatedGroup: AppGroup) => void;
  onDeleteGroup?: (groupId: string) => void;
}

const ICONS = [
  'Gamepad2',
  'Briefcase',
  'Globe',
  'Code2',
  'Music',
  'Video',
  'Terminal',
  'Folder',
  'Sparkles',
  'Star',
  'Coffee',
  'Bookmark',
  'Shield',
  'Zap'
];

const COLORS = [
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
  '#f43f5e',
  '#f59e0b',
  '#10b981',
  '#06b6d4',
  '#ffffff'
];

export const EditGroupModal: React.FC<EditGroupModalProps> = ({
  isOpen,
  group,
  theme,
  onClose,
  onSaveGroup,
  onDeleteGroup
}) => {
  const [name, setName] = useState('');
  const [iconName, setIconName] = useState('Folder');
  const [customIcon, setCustomIcon] = useState<string | null>(null);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [density, setDensity] = useState<GroupDensity>('auto');
  const [items, setItems] = useState<AppItem[]>([]);
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlNameInput, setUrlNameInput] = useState('');
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (group) {
      setName(group.name);
      setIconName(group.iconName || 'Folder');
      setCustomIcon(group.customIcon || null);
      setAccentColor(group.accentColor || '#3b82f6');
      setDensity(group.density || 'auto');
      setItems([...(group.items || [])]);
      setError('');
      setShowAddUrlInput(false);
      setUrlInput('');
      setUrlNameInput('');
    }
  }, [group, isOpen]);

  if (!isOpen || !group) return null;

  const handleSelectCustomPicture = async () => {
    if (typeof window !== 'undefined' && (window as any).appDock?.browseImage) {
      try {
        const res = await (window as any).appDock.browseImage();
        if (res && res.dataUrl) {
          setRawImageForCrop(res.dataUrl);
          setIsCropModalOpen(true);
          return;
        }
      } catch (err) {
        console.warn('Native browseImage error, falling back to input:', err);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setRawImageForCrop(reader.result);
          setIsCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setCustomIcon(croppedDataUrl);
    setIconName('custom');
  };

  const handleSelectGrid = () => {
    setIconName('grid');
  };

  const handleSelectPresetIcon = (ic: string) => {
    setIconName(ic);
    setCustomIcon(null);
  };

  const handleRemoveItem = (itemId: string) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
  };

  const handleBrowseAndAddApp = async () => {
    if (typeof window !== 'undefined' && (window as any).appDock?.browseFile) {
      try {
        const file = await (window as any).appDock.browseFile();
        if (file && file.path) {
          let icon = undefined;
          if ((window as any).appDock?.extractIcon) {
            try {
              icon = await (window as any).appDock.extractIcon(file.path);
            } catch {}
          }
          const newItem: AppItem = {
            id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            name: file.name || 'Application',
            type: 'app',
            target: file.path,
            icon,
            launchCount: 0
          };
          setItems((prev) => [...prev, newItem]);
        }
      } catch (err) {
        console.error('Error browsing file:', err);
      }
    }
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    let target = urlInput.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    const derivedName = urlNameInput.trim() || target.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] || 'Web Link';
    const newItem: AppItem = {
      id: `url-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: derivedName,
      type: 'url',
      target,
      launchCount: 0
    };
    setItems((prev) => [...prev, newItem]);
    setUrlInput('');
    setUrlNameInput('');
    setShowAddUrlInput(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a group name');
      return;
    }

    const updated: AppGroup = {
      ...group,
      name: name.trim(),
      iconName,
      accentColor,
      density,
      items,
      customIcon: iconName === 'custom' && customIcon ? customIcon : undefined
    };

    onSaveGroup(updated);
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
      className="edit-group-modal-view"
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
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${getAssetUrl('/deathnote/backgrounds/wallpaper_main_4.jpg')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.35,
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {isEldenRing && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${getAssetUrl('/eldenring/backgrounds/vertical_golden_tree_wallpaper.png')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
            filter: 'brightness(0.35) contrast(1.15)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {isOnePiece && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${getAssetUrl('/onepiece/backgrounds/portrait_ship_background.png')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.45,
            filter: 'brightness(0.35) contrast(1.15)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {isCandy && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${getAssetUrl('/candy/backgrounds/sweet_home_candy_cottage.png')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            filter: 'brightness(0.85) contrast(1.05)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {isAether && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url('${getAssetUrl('/aether/wallpaper_aether_sky.jpg')}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.4,
            filter: 'brightness(0.4) contrast(1.1)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}

      {/* Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-header)',
          position: 'relative',
          zIndex: 2
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: `1px solid ${accentColor}`,
              color: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden'
            }}
          >
            {iconName === 'custom' && customIcon ? (
              <img
                src={customIcon}
                alt=""
                style={{ width: '20px', height: '20px', borderRadius: '4px', objectFit: 'cover' }}
              />
            ) : iconName === 'grid' ? (
              <GroupGridIcon items={items} size={20} accentColor={accentColor} />
            ) : (
              getGroupIcon(iconName, 14)
            )}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
            Edit Group
          </span>
        </div>

        <button
          onClick={onClose}
          className="btn-dock"
          title="Close"
          aria-label="Close"
          style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)'
          }}
        >
          <X size={14} />
        </button>
      </header>

      {/* Body with scrolling */}
      <form
        onSubmit={handleSubmit}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Group Name Field */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
            GROUP NAME
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError('');
            }}
            placeholder="e.g. Work, Gaming, Utilities..."
            style={{
              width: '100%',
              padding: '7px 10px',
              borderRadius: '6px',
              background: 'var(--bg-surface)',
              border: error ? '1px solid #ef4444' : '1px solid var(--btn-border)',
              color: 'var(--text-primary)',
              fontSize: '12.5px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />
          {error && <div style={{ fontSize: '10.5px', color: '#ef4444', marginTop: '3px' }}>{error}</div>}
        </div>

        {/* Group Logo / Icon Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '2px' }}>
            GROUP LOGO
          </label>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {/* Custom Picture Button */}
            <button
              type="button"
              onClick={handleSelectCustomPicture}
              className={`btn-custom-icon ${iconName === 'custom' ? 'is-selected' : ''}`}
              style={{
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: iconName === 'custom' ? 'var(--text-primary)' : 'var(--bg-surface)',
                border: iconName === 'custom' ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                color: iconName === 'custom' ? 'var(--bg-dock)' : 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: iconName === 'custom' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'var(--btn-shadow)',
                transition: 'all 0.18s ease'
              }}
              title="Upload picture in JPG, PNG, WebP format and crop like Discord"
            >
              {customIcon && iconName === 'custom' ? (
                <img
                  src={customIcon}
                  alt=""
                  style={{ width: '16px', height: '16px', borderRadius: '3px', objectFit: 'cover' }}
                />
              ) : (
                <ImageIcon size={14} />
              )}
              <span>Custom Picture</span>
            </button>

            {/* Icon Grid Button */}
            <button
              type="button"
              onClick={handleSelectGrid}
              className={`btn-grid-icon ${iconName === 'grid' ? 'is-selected' : ''}`}
              style={{
                height: '32px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                background: iconName === 'grid' ? 'var(--text-primary)' : 'var(--bg-surface)',
                border: iconName === 'grid' ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                color: iconName === 'grid' ? 'var(--bg-dock)' : 'var(--text-primary)',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: iconName === 'grid' ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'var(--btn-shadow)',
                transition: 'all 0.18s ease'
              }}
              title="Combine 2 to 4 apps/links into a composite folder tile"
            >
              <GroupGridIcon items={items} size={16} />
              <span>Icon Grid</span>
            </button>
          </div>

          {/* Hidden File Input fallback */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/jpg, image/webp, image/ico, image/svg+xml"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />

          {/* Custom Picture Details Bar */}
          {iconName === 'custom' && customIcon && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--btn-border)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img
                  src={customIcon}
                  alt="Custom icon preview"
                  style={{ width: '22px', height: '22px', borderRadius: '5px', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>Custom picture active</span>
              </div>
              <button
                type="button"
                onClick={handleSelectCustomPicture}
                style={{
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}
              >
                Re-crop / Change
              </button>
            </div>
          )}

          {/* Icon Grid Details Bar */}
          {iconName === 'grid' && (
            <div
              style={{
                padding: '6px 10px',
                borderRadius: '6px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--btn-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <GroupGridIcon items={items} size={24} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Dynamic Grid: {items.length} {items.length === 1 ? 'app' : 'apps'}
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>
                  {items.length === 0
                    ? 'Empty grid waiting for apps to be added'
                    : items.length < 2
                      ? 'Add at least 2 apps for multi-tile view'
                      : `Combining first ${Math.min(4, items.length)} apps into group icon`}
                </span>
              </div>
            </div>
          )}

          {/* Preset Standard Icons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
            {ICONS.map((ic) => {
              const isSelected = iconName === ic;
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => handleSelectPresetIcon(ic)}
                  className={`group-icon-btn ${isSelected ? 'is-selected' : ''}`}
                  title={ic}
                  style={{
                    height: '32px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--bg-dock)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                    boxShadow: isSelected ? '0 2px 8px rgba(0, 0, 0, 0.2)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {getGroupIcon(ic, 14)}
                </button>
              );
            })}
          </div>
        </div>

        {/* Accent Color Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
            ACCENT COLOR
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {COLORS.map((c) => {
              const isSelected = accentColor === c;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAccentColor(c)}
                  title={c}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: c,
                    border: isSelected ? '2px solid var(--text-primary)' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: isSelected ? `0 0 10px ${c}` : 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isSelected && <Check size={12} color={c === '#ffffff' ? '#000000' : '#ffffff'} strokeWidth={3} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Density Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '5px' }}>
            GRID DENSITY
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['auto', 'compact', 'medium', 'large'] as GroupDensity[]).map((d) => {
              const isSelected = density === d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDensity(d)}
                  style={{
                    flex: 1,
                    padding: '5px 0',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected ? 'var(--text-primary)' : 'var(--bg-surface)',
                    color: isSelected ? 'var(--bg-dock)' : 'var(--text-secondary)',
                    border: isSelected ? '1px solid var(--text-primary)' : '1px solid var(--btn-border)',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Group Apps Management (Add & Remove) */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>
              APPS IN THIS GROUP ({items.length})
            </label>
            <div style={{ display: 'flex', gap: '5px' }}>
              <button
                type="button"
                onClick={handleBrowseAndAddApp}
                title="Add application executable"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--btn-border)',
                  color: 'var(--text-primary)',
                  fontSize: '10.5px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <FolderOpen size={11} />
                <span>+ App</span>
              </button>
              <button
                type="button"
                onClick={() => setShowAddUrlInput(!showAddUrlInput)}
                title="Add web URL"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 7px',
                  borderRadius: '4px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--btn-border)',
                  color: 'var(--text-primary)',
                  fontSize: '10.5px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <Globe size={11} />
                <span>+ URL</span>
              </button>
            </div>
          </div>

          {/* Inline URL Add Input */}
          {showAddUrlInput && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '8px', background: 'var(--bg-surface)', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '8px' }}>
              <input
                type="text"
                placeholder="https://example.com"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                style={{
                  padding: '5px 8px',
                  borderRadius: '4px',
                  background: 'var(--bg-dock)',
                  border: '1px solid var(--btn-border)',
                  color: 'var(--text-primary)',
                  fontSize: '11.5px',
                  outline: 'none'
                }}
              />
              <div style={{ display: 'flex', gap: '5px' }}>
                <input
                  type="text"
                  placeholder="Link Name (optional)"
                  value={urlNameInput}
                  onChange={(e) => setUrlNameInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '5px 8px',
                    borderRadius: '4px',
                    background: 'var(--bg-dock)',
                    border: '1px solid var(--btn-border)',
                    color: 'var(--text-primary)',
                    fontSize: '11.5px',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddUrl}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    background: 'var(--accent)',
                    color: '#ffffff',
                    border: 'none',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Add
                </button>
              </div>
            </div>
          )}

          {/* List of items */}
          <div
            style={{
              maxHeight: '170px',
              overflowY: 'auto',
              borderRadius: '6px',
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-dock)',
              display: 'flex',
              flexDirection: 'column',
              padding: '2px'
            }}
          >
            {items.length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px' }}>
                No apps in this group yet. Click '+ App' or '+ URL' above to add!
              </div>
            ) : (
              items.map((it) => (
                <div
                  key={it.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '5px 8px',
                    borderRadius: '4px',
                    gap: '8px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                    {it.icon ? (
                      <img
                        src={it.icon}
                        alt=""
                        style={{ width: '20px', height: '20px', objectFit: 'contain', borderRadius: '4px' }}
                      />
                    ) : it.type === 'url' ? (
                      <Globe size={16} color="var(--text-secondary)" />
                    ) : (
                      <FolderOpen size={16} color="var(--text-secondary)" />
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {it.name}
                      </div>
                      <div style={{ fontSize: '9.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {it.target}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(it.id)}
                    title={`Remove ${it.name}`}
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '4px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-muted)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#ef4444';
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--text-muted)';
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1,
              padding: '8px 0',
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
            className="btn-primary"
            style={{
              flex: 1,
              padding: '8px 0',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Discord-style Crop Modal for Custom Picture Group Icon */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawImageForCrop || ''}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
        onChooseAnother={handleSelectCustomPicture}
        theme={currentTheme}
      />
    </div>
  );
};

