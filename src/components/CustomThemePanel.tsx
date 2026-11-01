import React, { useRef } from 'react';
import { DockSettings } from '../types/dock';
import { compressImageToBase64 } from '../utils/imageUtils';

interface CustomThemePanelProps {
  settings: DockSettings;
  onUpdateSettings: (patch: Partial<DockSettings>) => void;
  subOptionsOnly?: boolean;
}

// A small labeled toggle pill
const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ label, checked, onChange }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '6px 0'
    }}
  >
    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', flex: 1 }}>{label}</span>
    <button
      type="button"
      onClick={() => onChange(!checked)}
      style={{
        width: '38px',
        height: '20px',
        borderRadius: '10px',
        background: checked ? 'var(--accent, #7c3aed)' : 'var(--bg-surface)',
        border: '1px solid var(--btn-border)',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s ease',
        flexShrink: 0
      }}
      aria-pressed={checked}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '20px' : '2px',
          width: '14px',
          height: '14px',
          borderRadius: '50%',
          background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          transition: 'left 0.2s ease'
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
}> = ({ label, value, defaultColor, onChange }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '5px 0'
    }}
  >
    <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>{label}</span>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <span
        style={{
          fontSize: '10px',
          color: 'var(--text-muted)',
          fontFamily: 'monospace'
        }}
      >
        {value || defaultColor}
      </span>
      <input
        type="color"
        value={value || defaultColor}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          border: '1px solid var(--btn-border)',
          cursor: 'pointer',
          padding: '2px',
          background: 'var(--bg-surface)'
        }}
      />
    </div>
  </div>
);

const SECTION_TITLE: React.CSSProperties = {
  fontSize: '10px',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.6px',
  marginBottom: '8px',
  marginTop: '12px'
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
      customThemeHideSidebar: false,
      customThemeHideSidebarModules: false,
      customThemeKeepSidebarModule: 'music',
      customThemeHideAppCount: false
    });
  };

  const displayOptions = (
    <>
      <div style={SECTION_TITLE}>Display Options</div>
      <Toggle label="Background Blur" checked={bgBlur} onChange={(v) => onUpdateSettings({ customThemeBgBlur: v })} />
      <Toggle label="Hide Background (Solid Color)" checked={bgHide} onChange={(v) => onUpdateSettings({ customThemeBgHide: v })} />
      <Toggle label="Hide Sidebar (Weather / Calendar / Music)" checked={hideSidebar} onChange={(v) => onUpdateSettings({ customThemeHideSidebar: v })} />

      <Toggle label="Hide Module Buttons (Keep One)" checked={hideMods} onChange={(v) => onUpdateSettings({ customThemeHideSidebarModules: v })} />
      {hideMods && (
        <div style={{ display: 'flex', gap: '6px', marginTop: '4px', marginBottom: '8px', paddingLeft: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Keep:</span>
          {MODULE_OPTS.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => onUpdateSettings({ customThemeKeepSidebarModule: m })}
              style={{
                padding: '3px 9px',
                borderRadius: '6px',
                fontSize: '10.5px',
                background: keepMod === m ? 'var(--accent, #7c3aed)' : 'var(--bg-surface)',
                color: keepMod === m ? '#fff' : 'var(--text-secondary)',
                border: keepMod === m ? '1px solid var(--accent, #7c3aed)' : '1px solid var(--btn-border)',
                cursor: 'pointer'
              }}
            >
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </button>
          ))}
        </div>
      )}

      <Toggle label="Hide App Count Badge" checked={hideAppCount} onChange={(v) => onUpdateSettings({ customThemeHideAppCount: v })} />
      <Toggle label="Background Rotation" checked={bgRotation} onChange={(v) => onUpdateSettings({ customThemeBgRotation: v })} />
      {bgRotation && (
        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '4px', marginBottom: '8px', paddingLeft: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>Timer:</span>
          {ROTATION_OPTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onUpdateSettings({ customThemeBgRotationSecs: s })}
              style={{
                padding: '3px 9px',
                borderRadius: '6px',
                fontSize: '10.5px',
                background: bgRotSecs === s ? 'var(--accent, #7c3aed)' : 'var(--bg-surface)',
                color: bgRotSecs === s ? '#fff' : 'var(--text-secondary)',
                border: bgRotSecs === s ? '1px solid var(--accent, #7c3aed)' : '1px solid var(--btn-border)',
                cursor: 'pointer'
              }}
            >
              {s}s
            </button>
          ))}
        </div>
      )}
    </>
  );

  if (subOptionsOnly) {
    return (
      <div
        style={{
          marginTop: '12px',
          padding: '12px 14px',
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
    <div style={{ padding: '10px 0 0 0' }}>
      {/* Section A: Backgrounds */}
      <div style={SECTION_TITLE}>Background Images (up to 5)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
        {bgImages.map((src, idx) => (
          <div
            key={idx}
            style={{
              position: 'relative',
              width: '44px',
              height: '44px',
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
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '14px',
                  height: '14px',
                  fontSize: '8px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '0 3px 0 0'
                }}
              >
                ‹
              </button>
            )}
            {/* Right arrow */}
            {idx < bgImages.length - 1 && (
              <button
                type="button"
                onClick={() => handleMoveImage(idx, idx + 1)}
                title="Move right"
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: '14px',
                  width: '14px',
                  height: '14px',
                  fontSize: '8px',
                  background: 'rgba(0,0,0,0.65)',
                  color: '#fff',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '3px 3px 0 0'
                }}
              >
                ›
              </button>
            )}
            {/* Remove */}
            <button
              type="button"
              onClick={() => handleRemoveImage(idx)}
              title="Remove"
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '16px',
                height: '16px',
                fontSize: '9px',
                background: 'rgba(180,0,0,0.8)',
                color: '#fff',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '0 0 0 4px'
              }}
            >
              ✕
            </button>
          </div>
        ))}
        {bgImages.length < 5 && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            title="Upload background image"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '6px',
              border: '1.5px dashed var(--btn-border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            +
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', minWidth: '90px' }}>
          BG Opacity
        </span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={bgOpacity}
          onChange={(e) => onUpdateSettings({ customThemeBgOpacity: Number(e.target.value) })}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', minWidth: '30px', textAlign: 'right' }}>
          {bgOpacity}%
        </span>
      </div>

      {/* Section A: Colors */}
      <div style={SECTION_TITLE}>Colors</div>
      <ColorRow label="Header Color" value={settings.customThemeHeaderColor} defaultColor="#1a1a2e" onChange={(v) => onUpdateSettings({ customThemeHeaderColor: v })} />
      <ColorRow label="Base Color" value={settings.customThemeBaseColor} defaultColor="#0d0d1a" onChange={(v) => onUpdateSettings({ customThemeBaseColor: v })} />
      <ColorRow label="Sidebar Color" value={settings.customThemeSidebarColor} defaultColor="#13131f" onChange={(v) => onUpdateSettings({ customThemeSidebarColor: v })} />
      <ColorRow label="Button / Accent" value={settings.customThemeButtonColor} defaultColor="#7c3aed" onChange={(v) => onUpdateSettings({ customThemeButtonColor: v })} />
      <ColorRow label="Module Sidebar" value={settings.customThemeSidebarModuleColor} defaultColor="#1e1e30" onChange={(v) => onUpdateSettings({ customThemeSidebarModuleColor: v })} />

      {/* Section B: Display Toggles */}
      {displayOptions}

      {/* Section C: Reset */}
      <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <button
          type="button"
          onClick={handleReset}
          style={{
            width: '100%',
            padding: '8px',
            borderRadius: '8px',
            background: 'rgba(200,50,50,0.12)',
            color: '#f87171',
            border: '1px solid rgba(200,50,50,0.35)',
            cursor: 'pointer',
            fontSize: '11.5px',
            fontWeight: 600
          }}
        >
          Reset Custom Theme
        </button>
      </div>
    </div>
  );
};
