import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DockSettings } from '../types/dock';
import { compressImageToBase64 } from '../utils/imageUtils';
import {
  ChevronLeft,
  ChevronRight,
  X,
  Plus,
  RotateCcw,
  Sliders,
  Image as ImageIcon,
  Palette,
  AlertTriangle
} from 'lucide-react';

interface CustomThemePanelProps {
  settings: DockSettings;
  onUpdateSettings: (patch: Partial<DockSettings>) => void;
  subOptionsOnly?: boolean;
}

// A sleek, standardized toggle row
const Toggle: React.FC<{
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
  thumbColor?: string;
}> = ({ label, description, checked, onChange, accentColor, thumbColor }) => (
  <div
    onClick={() => onChange(!checked)}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '7px 8px',
      borderRadius: '6px',
      cursor: 'pointer',
      userSelect: 'none',
      transition: 'background 0.15s ease',
      boxSizing: 'border-box',
      width: '100%'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'var(--bg-surface-hover)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
    }}
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
      <span
        style={{
          fontSize: '11.5px',
          color: checked ? 'var(--text-primary)' : 'var(--text-secondary)',
          fontWeight: checked ? 600 : 500
        }}
      >
        {label}
      </span>
      {description && (
        <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
          {description}
        </span>
      )}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      style={{
        width: '36px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? (accentColor || 'var(--accent, #3b82f6)') : 'var(--btn-border)',
        border: '1px solid ' + (checked ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.18s ease, border-color 0.18s ease',
        flexShrink: 0,
        padding: 0
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '18px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: checked && thumbColor ? thumbColor : '#ffffff',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)',
          transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none'
        }}
      />
    </button>
  </div>
);

// Labeled color picker row
const ColorRow: React.FC<{
  label: string;
  value: string | undefined;
  defaultColor: string;
  onChange: (v: string) => void;
}> = ({ label, value, defaultColor, onChange }) => {
  const currentColor = value || defaultColor;
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '6px 8px',
        borderRadius: '6px',
        transition: 'background 0.15s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--bg-surface-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent';
      }}
    >
      <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span
          style={{
            fontSize: '10.5px',
            color: 'var(--text-muted)',
            fontFamily: 'monospace',
            fontVariantNumeric: 'tabular-nums'
          }}
        >
          {currentColor}
        </span>
        <label
          style={{
            position: 'relative',
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            background: currentColor,
            border: '1px solid var(--border-hover)',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
            cursor: 'pointer',
            display: 'block',
            overflow: 'hidden'
          }}
          title={`Pick ${label}`}
        >
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onChange(e.target.value)}
            style={{
              position: 'absolute',
              opacity: 0,
              width: '100%',
              height: '100%',
              cursor: 'pointer'
            }}
          />
        </label>
      </div>
    </div>
  );
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  marginBottom: '8px',
  marginTop: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '6px'
};

const ROTATION_OPTS: Array<20 | 30 | 40 | 50 | 60> = [20, 30, 40, 50, 60];
const MODULE_OPTS: Array<'music' | 'weather' | 'calendar'> = ['music', 'weather', 'calendar'];

export const CustomThemePanel: React.FC<CustomThemePanelProps> = ({ settings, onUpdateSettings, subOptionsOnly = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgImages = settings.customThemeBgImages || [];
  const bgBlur = settings.customThemeBgBlur || false;
  const bgHide = settings.customThemeBgHide || false;
  const bgOpacity = settings.customThemeBgOpacity ?? 100;
  const bgRotation = settings.customThemeBgRotation ?? true;
  const bgRotSecs = settings.customThemeBgRotationSecs || 30;
  const hideSidebar = settings.customThemeHideSidebar || false;
  const hideMods = settings.customThemeHideSidebarModules || false;
  const keepMod = settings.customThemeKeepSidebarModule || 'music';
  const hideALMS = settings.customThemeHideALMS || false;
  const almsDensity = settings.customThemeALMSDensity || 'auto';
  const hideAppCount = settings.customThemeHideAppCount || false;
  const hideQuickIcons = settings.customThemeHideQuickIcons || settings.hideQuickIcons || false;

  const currentTheme = settings.theme || 'dark';
  const isEldenRing = currentTheme === 'eldenring';
  const isDeathNote = currentTheme === 'deathnote';
  const isAether = currentTheme === 'aether';
  const themeAccent = isEldenRing ? '#EAC477' : isDeathNote ? '#c41e24' : isAether ? '#ffdf59' : 'var(--accent, #3b82f6)';
  const themeThumb = isEldenRing ? '#171813' : '#ffffff';

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    const slots = 5 - bgImages.length;
    const toProcess = files.slice(0, slots);
    try {
      const compressed = await Promise.all(toProcess.map((f) => compressImageToBase64(f)));
      onUpdateSettings({ customThemeBgImages: [...bgImages, ...compressed] });
    } catch {
      // silent
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    const next = bgImages.filter((_, i) => i !== idx);
    onUpdateSettings({ customThemeBgImages: next });
  };

  const handleMoveImage = (from: number, to: number) => {
    if (to < 0 || to >= bgImages.length) return;
    const arr = [...bgImages];
    const [item] = arr.splice(from, 1);
    arr.splice(to, 0, item);
    onUpdateSettings({ customThemeBgImages: arr });
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (!showResetConfirm) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowResetConfirm(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showResetConfirm]);

  const handleReset = () => {
    onUpdateSettings({
      theme: 'dark',
      customThemeBgImages: [],
      customThemeBgBlur: false,
      customThemeBgHide: false,
      customThemeBgOpacity: 100,
      customThemeBgRotation: true,
      customThemeBgRotationSecs: 30,
      customThemeHeaderColor: undefined,
      customThemeBaseColor: undefined,
      customThemeSidebarColor: undefined,
      customThemeButtonColor: undefined,
      customThemeSidebarModuleColor: undefined,
      customThemeFontColor: undefined,
      customThemeHideSidebar: false,
      customThemeHideSidebarModules: false,
      customThemeKeepSidebarModule: 'music',
      customThemeHideALMS: false,
      customThemeALMSDensity: 'auto',
      customThemeHideAppCount: false,
      customThemeHideQuickIcons: false,
      hideQuickIcons: false
    });
    setShowResetConfirm(false);
  };

  const displayOptions = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', width: '100%', boxSizing: 'border-box', overflow: 'hidden' }}>
      <div style={SECTION_TITLE}>
        <Sliders size={12} color={isEldenRing ? '#EAC477' : isAether ? '#ffdf59' : 'var(--text-muted)'} />
        <span style={{ color: isEldenRing ? '#EAC477' : undefined }}>Display options</span>
      </div>

      <Toggle label="Background Blur" checked={bgBlur} onChange={(v) => onUpdateSettings({ customThemeBgBlur: v })} accentColor={themeAccent} thumbColor={themeThumb} />
      <Toggle label="Hide Background" checked={bgHide} onChange={(v) => onUpdateSettings({ customThemeBgHide: v })} accentColor={themeAccent} thumbColor={themeThumb} />
      <Toggle label="Hide Sidebar (weather / calendar / music)" checked={hideSidebar} onChange={(v) => onUpdateSettings({ customThemeHideSidebar: v })} accentColor={themeAccent} thumbColor={themeThumb} />

      <Toggle label="Hide Module Buttons (keep one)" checked={hideMods} onChange={(v) => onUpdateSettings({ customThemeHideSidebarModules: v })} accentColor={themeAccent} thumbColor={themeThumb} />
      {hideMods && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: '2px',
            marginBottom: '6px',
            padding: '7px 10px',
            background: 'var(--bg-surface-active)',
            borderRadius: '6px',
            border: isEldenRing ? '1px solid rgba(197, 161, 90, 0.25)' : '1px solid var(--border-subtle)',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Keep module button:</span>
            <span style={{ fontSize: '9.5px', color: isEldenRing ? '#EAC477' : 'var(--accent, #3b82f6)', fontWeight: 700, textTransform: 'capitalize' }}>{keepMod}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
            {MODULE_OPTS.map((m) => {
              const active = keepMod === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onUpdateSettings({ customThemeKeepSidebarModule: m })}
                  style={{
                    padding: '5px 2px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: active ? 700 : 500,
                    background: active
                      ? (isEldenRing ? '#EAC477' : 'var(--accent, var(--text-primary))')
                      : 'transparent',
                    color: active
                      ? (isEldenRing ? '#171813' : 'var(--bg-dock, #ffffff)')
                      : 'var(--text-secondary)',
                    border: active && isEldenRing ? '1px solid #EAC477' : '1px solid var(--btn-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Toggle
        label="Hide A, L, M, S Buttons (density controls)"
        checked={hideALMS}
        onChange={(v) => onUpdateSettings({ customThemeHideALMS: v, customThemeALMSDensity: settings.customThemeALMSDensity || 'auto' })}
        accentColor={themeAccent}
        thumbColor={themeThumb}
      />
      {hideALMS && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: '2px',
            marginBottom: '6px',
            padding: '7px 10px',
            background: 'var(--bg-surface-active)',
            borderRadius: '6px',
            border: isEldenRing ? '1px solid rgba(197, 161, 90, 0.25)' : '1px solid var(--border-subtle)',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Default Density size:</span>
            <span style={{ fontSize: '9.5px', color: isEldenRing ? '#EAC477' : 'var(--accent, #3b82f6)', fontWeight: 700, textTransform: 'capitalize' }}>{almsDensity}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
            {[
              { id: 'auto', label: 'Auto' },
              { id: 'large', label: 'Large' },
              { id: 'medium', label: 'Medium' },
              { id: 'compact', label: 'Small' }
            ].map((opt) => {
              const active = almsDensity === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdateSettings({ customThemeALMSDensity: opt.id as any })}
                  style={{
                    padding: '5px 2px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: active ? 700 : 500,
                    background: active
                      ? (isEldenRing ? '#EAC477' : 'var(--accent, var(--text-primary))')
                      : 'transparent',
                    color: active
                      ? (isEldenRing ? '#171813' : 'var(--bg-dock, #ffffff)')
                      : 'var(--text-secondary)',
                    border: active && isEldenRing ? '1px solid #EAC477' : '1px solid var(--btn-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Toggle label="Hide App Count badge" checked={hideAppCount} onChange={(v) => onUpdateSettings({ customThemeHideAppCount: v })} accentColor={themeAccent} thumbColor={themeThumb} />
      <Toggle label="Hide Quick Icons" checked={hideQuickIcons} onChange={(v) => onUpdateSettings({ customThemeHideQuickIcons: v, hideQuickIcons: v })} accentColor={themeAccent} thumbColor={themeThumb} />
      <Toggle label="Background Rotation" checked={bgRotation} onChange={(v) => onUpdateSettings({ customThemeBgRotation: v })} accentColor={themeAccent} thumbColor={themeThumb} />
      {bgRotation && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            marginTop: '2px',
            marginBottom: '6px',
            padding: '7px 10px',
            background: 'var(--bg-surface-active)',
            borderRadius: '6px',
            border: isEldenRing ? '1px solid rgba(197, 161, 90, 0.25)' : '1px solid var(--border-subtle)',
            boxSizing: 'border-box',
            width: '100%'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>Rotation Interval:</span>
            <span style={{ fontSize: '9.5px', color: isEldenRing ? '#EAC477' : 'var(--accent, #3b82f6)', fontWeight: 700 }}>{bgRotSecs}s</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '4px', width: '100%', boxSizing: 'border-box' }}>
            {ROTATION_OPTS.map((s) => {
              const active = bgRotSecs === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateSettings({ customThemeBgRotationSecs: s })}
                  style={{
                    padding: '5px 2px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: active ? 700 : 500,
                    background: active
                      ? (isEldenRing ? '#EAC477' : 'var(--accent, var(--text-primary))')
                      : 'transparent',
                    color: active
                      ? (isEldenRing ? '#171813' : 'var(--bg-dock, #ffffff)')
                      : 'var(--text-secondary)',
                    border: active && isEldenRing ? '1px solid #EAC477' : '1px solid var(--btn-border)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'center',
                    boxSizing: 'border-box'
                  }}
                >
                  {s}s
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  if (subOptionsOnly) {
    return (
      <div
        style={{
          marginTop: '8px',
          padding: '10px 12px',
          borderRadius: '8px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--btn-border)',
          boxShadow: 'var(--btn-shadow)',
          boxSizing: 'border-box',
          width: '100%',
          overflow: 'hidden'
        }}
      >
        {displayOptions}
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 0 0 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {/* Section A: Backgrounds */}
      <div>
        <div style={SECTION_TITLE}>
          <ImageIcon size={12} color="var(--text-muted)" />
          <span>Background images (up to 5)</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
          {bgImages.map((src, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                width: '46px',
                height: '46px',
                borderRadius: '6px',
                overflow: 'hidden',
                border: '1px solid var(--btn-border)',
                flexShrink: 0
              }}
            >
              <img src={src} alt={`bg${idx}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              {/* Left arrow */}
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => handleMoveImage(idx, idx - 1)}
                  title="Move left"
                  aria-label="Move left"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '16px',
                    height: '16px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '0 4px 0 0'
                  }}
                >
                  <ChevronLeft size={10} />
                </button>
              )}
              {/* Right arrow */}
              {idx < bgImages.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMoveImage(idx, idx + 1)}
                  title="Move right"
                  aria-label="Move right"
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    right: '16px',
                    width: '16px',
                    height: '16px',
                    background: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px 4px 0 0'
                  }}
                >
                  <ChevronRight size={10} />
                </button>
              )}
              {/* Remove */}
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                title="Remove"
                aria-label="Remove image"
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '16px',
                  height: '16px',
                  background: 'rgba(239,68,68,0.85)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0 0 0 4px'
                }}
              >
                <X size={10} />
              </button>
            </div>
          ))}
          {bgImages.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Upload background image"
              aria-label="Upload background image"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '6px',
                border: '1.5px dashed var(--btn-border)',
                background: 'var(--bg-surface)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--btn-border)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <Plus size={16} />
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={handleUpload}
          />
        </div>

        {/* Opacity slider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', minWidth: '75px', fontWeight: 500 }}>
            Opacity
          </span>
          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={bgOpacity}
            onChange={(e) => onUpdateSettings({ customThemeBgOpacity: Number(e.target.value) })}
            className="custom-range-bar"
            style={{ flex: 1 }}
          />
          <span
            style={{
              fontSize: '10.5px',
              color: 'var(--text-muted)',
              minWidth: '32px',
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums'
            }}
          >
            {bgOpacity}%
          </span>
        </div>
      </div>

      {/* Section B: Colors */}
      <div>
        <div style={SECTION_TITLE}>
          <Palette size={12} color="var(--text-muted)" />
          <span>Theme colors</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <ColorRow label="Font color" value={settings.customThemeFontColor} defaultColor="#ffffff" onChange={(v) => onUpdateSettings({ customThemeFontColor: v })} />
          <ColorRow label="Header background" value={settings.customThemeHeaderColor} defaultColor="#1a1a2e" onChange={(v) => onUpdateSettings({ customThemeHeaderColor: v })} />
          <ColorRow label="Base dock background" value={settings.customThemeBaseColor} defaultColor="#0d0d1a" onChange={(v) => onUpdateSettings({ customThemeBaseColor: v })} />
          <ColorRow label="Sidebar background" value={settings.customThemeSidebarColor} defaultColor="#13131f" onChange={(v) => onUpdateSettings({ customThemeSidebarColor: v })} />
          <ColorRow label="Button & accent" value={settings.customThemeButtonColor} defaultColor="#7c3aed" onChange={(v) => onUpdateSettings({ customThemeButtonColor: v })} />
          <ColorRow label="Sidebar module surface" value={settings.customThemeSidebarModuleColor} defaultColor="#1e1e30" onChange={(v) => onUpdateSettings({ customThemeSidebarModuleColor: v })} />
        </div>
      </div>

      {/* Section C: Display Toggles */}
      {displayOptions}

      {/* Section D: Reset */}
      <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.22)',
            cursor: 'pointer',
            fontSize: '11.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
            e.currentTarget.style.color = '#ffffff';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.22)';
            e.currentTarget.style.color = '#f87171';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <RotateCcw size={12.5} />
          <span>Reset custom theme</span>
        </button>
        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '6px', lineHeight: 1.35 }}>
          Reverts all custom theme styling and switches back to Dark Theme
        </div>
      </div>

      {showResetConfirm &&
        createPortal(
          <div
            onClick={() => setShowResetConfirm(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.72)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              zIndex: 100000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px',
              animation: 'fadeIn 0.15s ease'
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '320px',
                maxWidth: 'calc(100vw - 32px)',
                background: 'var(--modal-bg, #18181b)',
                border: '1px solid var(--border-hover, rgba(255, 255, 255, 0.14))',
                borderRadius: '14px',
                padding: '22px 20px 20px',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                textAlign: 'center',
                animation: 'scaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            >
              {/* Glowing Warning Badge */}
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.14)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 24px rgba(239, 68, 68, 0.25)'
                }}
              >
                <AlertTriangle size={24} />
              </div>

              {/* Title & Explanation */}
              <div>
                <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Reset Custom Theme?
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.45 }}>
                  This will remove all custom wallpapers, colors, and layout customizations, and revert back to the default <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>Dark Theme</span>.
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px', width: '100%', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(false)}
                  style={{
                    flex: 1,
                    padding: '8.5px 12px',
                    borderRadius: '8px',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--btn-border)',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--bg-surface)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  style={{
                    flex: 1.3,
                    padding: '8.5px 12px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    border: '1px solid rgba(239, 68, 68, 0.6)',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 2px 10px rgba(239, 68, 68, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'brightness(1.1)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.45)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'none';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 10px rgba(239, 68, 68, 0.35)';
                  }}
                >
                  Reset & Revert
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
