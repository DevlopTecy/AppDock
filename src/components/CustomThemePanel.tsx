import React, { useRef } from 'react';
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
  Palette
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
}> = ({ label, description, checked, onChange }) => (
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
      transition: 'background 0.15s ease'
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
        background: checked ? 'var(--accent-color, #2563eb)' : 'var(--btn-border)',
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
          background: '#ffffff',
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
  const bgRotation = settings.customThemeBgRotation || false;
  const bgRotSecs = settings.customThemeBgRotationSecs || 30;
  const hideSidebar = settings.customThemeHideSidebar || false;
  const hideMods = settings.customThemeHideSidebarModules || false;
  const keepMod = settings.customThemeKeepSidebarModule || 'music';
  const hideALMS = settings.customThemeHideALMS || false;
  const almsDensity = settings.customThemeALMSDensity || 'auto';
  const hideAppCount = settings.customThemeHideAppCount || false;

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

  const handleReset = () => {
    onUpdateSettings({
      customThemeBgImages: [],
      customThemeBgBlur: false,
      customThemeBgHide: false,
      customThemeBgOpacity: 100,
      customThemeBgRotation: false,
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
      customThemeHideAppCount: false
    });
  };

  const displayOptions = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
      <div style={SECTION_TITLE}>
        <Sliders size={12} color="var(--text-muted)" />
        <span>Display options</span>
      </div>

      <Toggle label="Background blur" checked={bgBlur} onChange={(v) => onUpdateSettings({ customThemeBgBlur: v })} />
      <Toggle label="Hide background (solid color)" checked={bgHide} onChange={(v) => onUpdateSettings({ customThemeBgHide: v })} />
      <Toggle label="Hide sidebar (weather / calendar / music)" checked={hideSidebar} onChange={(v) => onUpdateSettings({ customThemeHideSidebar: v })} />

      <Toggle label="Hide module buttons (keep one)" checked={hideMods} onChange={(v) => onUpdateSettings({ customThemeHideSidebarModules: v })} />
      {hideMods && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '2px',
            marginBottom: '6px',
            padding: '6px 10px',
            background: 'var(--bg-surface-active)',
            borderRadius: '6px',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Keep:</span>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {MODULE_OPTS.map((m) => {
              const active = keepMod === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onUpdateSettings({ customThemeKeepSidebarModule: m })}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: active ? 600 : 500,
                    background: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--bg-dock)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
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
        label="Hide density controls (A, L, M, S)"
        checked={hideALMS}
        onChange={(v) => onUpdateSettings({ customThemeHideALMS: v, customThemeALMSDensity: settings.customThemeALMSDensity || 'auto' })}
      />
      {hideALMS && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '2px',
            marginBottom: '6px',
            padding: '6px 10px',
            background: 'var(--bg-surface-active)',
            borderRadius: '6px',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Default size:</span>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
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
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: active ? 600 : 500,
                    background: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--bg-dock)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <Toggle label="Hide app count badge" checked={hideAppCount} onChange={(v) => onUpdateSettings({ customThemeHideAppCount: v })} />
      <Toggle label="Background rotation" checked={bgRotation} onChange={(v) => onUpdateSettings({ customThemeBgRotation: v })} />
      {bgRotation && (
        <div
          style={{
            display: 'flex',
            gap: '8px',
            marginTop: '2px',
            marginBottom: '6px',
            padding: '6px 10px',
            background: 'var(--bg-surface-active)',
            borderRadius: '6px',
            alignItems: 'center'
          }}
        >
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Interval:</span>
          <div style={{ display: 'flex', gap: '4px', flex: 1 }}>
            {ROTATION_OPTS.map((s) => {
              const active = bgRotSecs === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onUpdateSettings({ customThemeBgRotationSecs: s })}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    borderRadius: '4px',
                    fontSize: '10.5px',
                    fontWeight: active ? 600 : 500,
                    background: active ? 'var(--text-primary)' : 'transparent',
                    color: active ? 'var(--bg-dock)' : 'var(--text-secondary)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
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
          boxShadow: 'var(--btn-shadow)'
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
      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '8px 12px',
            borderRadius: '6px',
            background: 'rgba(239, 68, 68, 0.08)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            cursor: 'pointer',
            fontSize: '11.5px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
            e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
          }}
        >
          <RotateCcw size={12} />
          <span>Reset custom theme</span>
        </button>
      </div>
    </div>
  );
};
