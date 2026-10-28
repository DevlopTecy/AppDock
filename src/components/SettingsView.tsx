import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assets';
import { DockSettings, DockPosition, DockTheme, AppGroup } from '../types/dock';
import { COUNTRIES } from '../utils/holidays';
import { getGroupIcon } from './GroupSidebar';
import {
  X,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  Cloud,
  Calendar,
  Check,
  Search,
  Trash2,
  Layout,
  Palette,
  Sliders,
  Sparkles,
  Layers,
  Monitor,
  ArrowUpCircle,
  RefreshCw,
  GitBranch,
  Moon,
  Sun,
  Zap,
  Compass,
  Gem,
  Heart,
  Feather,
  BookOpen
} from 'lucide-react';

interface SettingsViewProps {
  isOpen: boolean;
  settings: DockSettings;
  groups?: AppGroup[];
  onClose: () => void;
  onUpdateSettings: (newSettings: Partial<DockSettings>) => void;
  onResetDefaults?: () => void;
  onActivateCleanDock?: () => void;
}

interface CustomRangeBarProps {
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  formatValue?: (val: number) => string;
  onChange: (val: number) => void;
}

const CustomRangeBar: React.FC<CustomRangeBarProps> = ({
  value,
  min,
  max,
  step,
  onChange
}) => {
  const pct = Math.max(0, Math.min(100, Math.round(((value - min) / (max - min)) * 100)));

  const handleDecrement = () => {
    const next = Math.max(min, Math.min(max, Math.round((value - step) * 100) / 100));
    onChange(next);
  };

  const handleIncrement = () => {
    const next = Math.max(min, Math.min(max, Math.round((value + step) * 100) / 100));
    onChange(next);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
      {/* Decrease Button */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        title="Decrease (-)"
        aria-label="Decrease"
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--btn-border)',
          color: value <= min ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: value <= min ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--btn-shadow)',
          transition: 'all 0.15s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if (value > min) {
            e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
            e.currentTarget.style.background = 'var(--bg-surface-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (value > min) {
            e.currentTarget.style.borderColor = 'var(--btn-border)';
            e.currentTarget.style.background = 'var(--bg-surface)';
          }
        }}
      >
        <Minus size={13} strokeWidth={2.5} />
      </button>

      {/* Range Track with dynamic fill */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="custom-range-bar"
          style={{
            background: `linear-gradient(to right, var(--text-primary) 0%, var(--text-primary) ${pct}%, var(--border-hover) ${pct}%, var(--border-hover) 100%)`
          }}
        />
      </div>

      {/* Increase Button */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        title="Increase (+)"
        aria-label="Increase"
        style={{
          width: '26px',
          height: '26px',
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-surface)',
          border: '1px solid var(--btn-border)',
          color: value >= max ? 'var(--text-muted)' : 'var(--text-primary)',
          cursor: value >= max ? 'not-allowed' : 'pointer',
          boxShadow: 'var(--btn-shadow)',
          transition: 'all 0.15s ease',
          flexShrink: 0
        }}
        onMouseEnter={(e) => {
          if (value < max) {
            e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
            e.currentTarget.style.background = 'var(--bg-surface-hover)';
          }
        }}
        onMouseLeave={(e) => {
          if (value < max) {
            e.currentTarget.style.borderColor = 'var(--btn-border)';
            e.currentTarget.style.background = 'var(--bg-surface)';
          }
        }}
      >
        <Plus size={13} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export interface ThemeItemDef {
  id: DockTheme;
  name: string;
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string; style?: React.CSSProperties }>;
  accentColor: string;
}

const DEFAULT_THEMES: ThemeItemDef[] = [
  {
    id: 'dark',
    name: 'Dark',
    icon: Moon,
    accentColor: '#60a5fa'
  },
  {
    id: 'light',
    name: 'Light',
    icon: Sun,
    accentColor: '#2563eb'
  },
  {
    id: 'cyberpunk',
    name: 'Cyber',
    icon: Zap,
    accentColor: '#00f2fe'
  },
  {
    id: 'midnight',
    name: 'Midnight',
    icon: Compass,
    accentColor: '#38bdf8'
  },
  {
    id: 'emerald',
    name: 'Emerald',
    icon: Gem,
    accentColor: '#10b981'
  }
];

const CUSTOM_THEMES: ThemeItemDef[] = [
  {
    id: 'kawaii',
    name: 'Kawaii',
    icon: Heart,
    accentColor: '#f43f5e'
  },
  {
    id: 'aether',
    name: 'Aether',
    icon: Feather,
    accentColor: '#ffdf59'
  },
  {
    id: 'deathnote',
    name: 'Death Note',
    icon: BookOpen,
    accentColor: '#e05a61'
  }
];

export const SettingsView: React.FC<SettingsViewProps> = ({
  isOpen,
  settings,
  groups = [],
  onClose,
  onUpdateSettings,
  onActivateCleanDock
}) => {
  const [cityInput, setCityInput] = useState('');
  const [countryQuery, setCountryQuery] = useState('');
  const [isCountryOpen, setIsCountryOpen] = useState(false);

  // App updates state
  const [updateStatus, setUpdateStatus] = useState<'idle' | 'checking' | 'latest' | 'available' | 'error'>('idle');
  const [appVersion, setAppVersion] = useState<string>('1.0.0');
  const [latestReleaseInfo, setLatestReleaseInfo] = useState<{ version: string; downloadUrl?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock?.getAppVersion) {
      (window as any).appDock.getAppVersion().then((v: string) => {
        if (v) setAppVersion(v);
      });
    }
  }, []);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('scroll') === 'bottom') {
        setTimeout(() => {
          const el = document.getElementById('settings-content-body');
          if (el) el.scrollTop = el.scrollHeight;
        }, 100);
      }
    }
  }, []);

  const handleManualCheckUpdates = async () => {
    setUpdateStatus('checking');
    try {
      if (typeof window !== 'undefined' && (window as any).appDock?.checkForUpdates) {
        const repo = settings.githubRepo || 'DevlopTecy/AppDock';
        const res = await (window as any).appDock.checkForUpdates(repo);
        if (res && res.hasUpdate) {
          setUpdateStatus('available');
          setLatestReleaseInfo({ version: res.version, downloadUrl: res.downloadUrl });
        } else {
          // If no newer release or already newest, user has the latest version!
          setUpdateStatus('latest');
        }
      } else {
        setTimeout(() => setUpdateStatus('latest'), 800);
      }
    } catch {
      setUpdateStatus('latest');
    }
  };

  if (!isOpen) return null;

  const currentTheme = settings.theme || 'dark';
  const isAether = currentTheme === 'aether';
  const weatherCities = settings.weatherCities && settings.weatherCities.length > 0
    ? settings.weatherCities
    : ['London', 'New York', 'Tokyo'];

  const selectedCountryCode = settings.calendarCountry || 'US';
  const selectedCountry = COUNTRIES.find((c) => c.code === selectedCountryCode) || COUNTRIES[0];

  const handlePositionChange = (pos: DockPosition) => {
    onUpdateSettings({ dockPosition: pos });
    if (typeof window !== 'undefined' && (window as any).appDock?.setPosition) {
      (window as any).appDock.setPosition(pos);
    }
  };

  const handleThemeChange = (theme: DockTheme) => {
    onUpdateSettings({ theme });
    document.documentElement.setAttribute('data-theme', theme);
  };

  const handleDimensionChange = (width?: number, height?: number) => {
    const newWidth = width ?? settings.drawerWidth;
    const newHeight = height ?? settings.drawerHeight ?? 540;
    onUpdateSettings({ drawerWidth: newWidth, drawerHeight: newHeight });
  };

  const handleAddCity = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cityInput.trim();
    if (!trimmed) return;
    if (weatherCities.length >= 5) return;
    if (weatherCities.some((c) => c.toLowerCase() === trimmed.toLowerCase())) {
      setCityInput('');
      return;
    }
    const updated = [...weatherCities, trimmed];
    onUpdateSettings({ weatherCities: updated, activeWeatherCity: trimmed });
    setCityInput('');
  };

  const handleRemoveCity = (cityToRemove: string) => {
    if (weatherCities.length <= 1) return; // Keep at least 1 city
    const updated = weatherCities.filter((c) => c !== cityToRemove);
    const newActive = settings.activeWeatherCity === cityToRemove ? updated[0] : settings.activeWeatherCity;
    onUpdateSettings({ weatherCities: updated, activeWeatherCity: newActive });
  };

  const filteredCountries = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(countryQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(countryQuery.toLowerCase())
  );

  return (
    <div
      className="settings-modal-view"
      style={{
        position: 'absolute',
        inset: 0,
        background: isAether ? '#142334' : 'var(--modal-bg)',
        backdropFilter: 'blur(20px)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Death Note Thematic Background Artwork */}
      {currentTheme === 'deathnote' && (
        <div
          className="deathnote-settings-bg"
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
              backgroundImage: `url('${getAssetUrl('/deathnote/backgrounds/wallpaper_main_3.jpg')}')`,
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
              background: 'linear-gradient(180deg, rgba(8, 8, 8, 0.84) 0%, rgba(12, 12, 12, 0.92) 100%)'
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
          {currentTheme === 'deathnote' && (
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
              fontFamily: currentTheme === 'deathnote' ? 'var(--font-gothic)' : undefined,
              letterSpacing: currentTheme === 'deathnote' ? '0.5px' : undefined
            }}
          >
            Settings
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

      {/* Settings Options - Reordered by Priority with Luxurious Spacing */}
      <div
        id="settings-content-body"
        style={{
          flex: 1,
          padding: '18px 16px 32px 16px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 2,
          gap: '24px'
        }}
      >
        {/* Priority 1: Screen Edge Position (Left & Right) */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Layout className="settings-section-icon" size={13} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
            <span
              className="settings-section-title"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                letterSpacing: '0.2px'
              }}
            >
              Dock Position
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {(['left', 'right'] as DockPosition[]).map((pos) => {
              const isSelected = settings.dockPosition === pos;
              const label = pos.charAt(0).toUpperCase() + pos.slice(1);
              return (
                <button
                  key={pos}
                  onClick={() => handlePositionChange(pos)}
                  className={`settings-opt-btn ${isSelected ? 'is-selected' : ''}`}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '8px',
                    background: isSelected ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'var(--bg-surface)',
                    color: isSelected ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#fff9e6' : 'var(--text-secondary)'),
                    border: isSelected ? (isAether ? '1.5px solid #ffe885' : '1px solid var(--text-primary)') : '1px solid var(--btn-border)',
                    boxShadow: isSelected ? (isAether ? '0 0 12px rgba(255, 223, 89, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.2)') : 'var(--btn-shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    fontWeight: isSelected ? 700 : 600,
                    textShadow: !isSelected && isAether ? '1px 1px 0 #181005' : undefined,
                    transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = isAether ? '#ffdf59' : 'var(--btn-border-hover)';
                      e.currentTarget.style.color = isAether ? '#ffdf59' : 'var(--text-primary)';
                      e.currentTarget.style.background = 'var(--bg-surface-hover)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = 'var(--btn-border)';
                      e.currentTarget.style.color = isAether ? '#fff9e6' : 'var(--text-secondary)';
                      e.currentTarget.style.background = 'var(--bg-surface)';
                    }
                  }}
                >
                  {pos === 'left' && <AlignLeft size={16} />}
                  {pos === 'right' && <AlignRight size={16} />}
                  <span style={{ fontSize: '11px', fontWeight: isSelected ? 700 : 600 }}>{label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Priority 2: Dock Size & Width (Presets + Custom Range Bar) */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Sliders className="settings-section-icon" size={13} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
              <span
                className="settings-section-title"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                  textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                  letterSpacing: '0.2px'
                }}
              >
                Dock Size & Width
              </span>
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isAether ? '#ffdf59' : 'var(--text-primary)',
                background: isAether ? '#3a2614' : 'var(--bg-surface)',
                padding: '2px 8px',
                borderRadius: '5px',
                border: isAether ? '1px solid #ffdf59' : '1px solid var(--border-subtle)',
                textShadow: isAether ? '1px 1px 0 #181005' : undefined
              }}
            >
              {settings.drawerWidth}px
            </span>
          </div>

          {/* Size Presets */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {[
              { id: 'slim', label: 'Slim', width: 210, height: 480, isMatch: settings.drawerWidth <= 230 },
              { id: 'compact', label: 'Compact', width: 280, height: 540, isMatch: settings.drawerWidth > 230 && settings.drawerWidth <= 320 },
              { id: 'spacious', label: 'Spacious', width: 360, height: 620, isMatch: settings.drawerWidth > 320 }
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => handleDimensionChange(preset.width, preset.height)}
                className={`settings-opt-btn ${preset.isMatch ? 'is-selected' : ''}`}
                style={{
                  padding: '8px 4px',
                  borderRadius: '6px',
                  background: preset.isMatch ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'var(--bg-surface)',
                  color: preset.isMatch ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#fff9e6' : 'var(--text-secondary)'),
                  border: preset.isMatch ? (isAether ? '1.5px solid #ffe885' : '1px solid var(--text-primary)') : '1px solid var(--btn-border)',
                  boxShadow: preset.isMatch ? (isAether ? '0 0 12px rgba(255, 223, 89, 0.45)' : '0 2px 8px rgba(0, 0, 0, 0.2)') : 'var(--btn-shadow)',
                  cursor: 'pointer',
                  fontSize: '11px',
                  fontWeight: preset.isMatch ? 700 : 600,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '3px',
                  textShadow: !preset.isMatch && isAether ? '1px 1px 0 #181005' : undefined,
                  transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => {
                  if (!preset.isMatch) {
                    e.currentTarget.style.borderColor = isAether ? '#ffdf59' : 'var(--btn-border-hover)';
                    e.currentTarget.style.color = isAether ? '#ffdf59' : 'var(--text-primary)';
                    e.currentTarget.style.background = 'var(--bg-surface-hover)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!preset.isMatch) {
                    e.currentTarget.style.borderColor = 'var(--btn-border)';
                    e.currentTarget.style.color = isAether ? '#fff9e6' : 'var(--text-secondary)';
                    e.currentTarget.style.background = 'var(--bg-surface)';
                  }
                }}
              >
                <span style={{ fontWeight: preset.isMatch ? 700 : 600 }}>{preset.label}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    color: preset.isMatch ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#c2e5fc' : 'var(--text-muted)'),
                    textShadow: !preset.isMatch && isAether ? '0 1px 2px rgba(0,0,0,0.8)' : undefined
                  }}
                >
                  {preset.width}px
                </span>
              </button>
            ))}
          </div>

          <CustomRangeBar
            value={settings.drawerWidth}
            min={180}
            max={460}
            step={10}
            unit="px"
            onChange={(val) => handleDimensionChange(val)}
          />
        </div>

        {/* Priority: Aesthetic Themes */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <Palette className="settings-section-icon" size={14} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
            <span
              className="settings-section-title"
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                letterSpacing: '0.2px'
              }}
            >
              Themes & Styles
            </span>
          </div>

          {/* Group A: Default Core Themes */}
          <div style={{ marginBottom: '16px' }}>
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isAether ? '#c2e5fc' : 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Default Themes</span>
              <span style={{ fontSize: '9px', opacity: 0.65 }}>({DEFAULT_THEMES.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '8px' }}>
              {DEFAULT_THEMES.map((th) => {
                const isSelected = currentTheme === th.id;
                const IconComp = th.icon;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleThemeChange(th.id)}
                    title={th.name}
                    className={`settings-opt-btn ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      background: isSelected
                        ? (isAether ? '#ffdf59' : 'var(--bg-surface-active)')
                        : 'var(--bg-surface)',
                      color: isSelected
                        ? (isAether ? '#2e1c0d' : 'var(--text-primary)')
                        : (isAether ? '#fff9e6' : 'var(--text-secondary)'),
                      border: isSelected
                        ? (isAether ? '1.5px solid #ffe885' : `1.5px solid ${th.accentColor}`)
                        : '1px solid var(--btn-border)',
                      boxShadow: 'var(--btn-shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      textShadow: !isSelected && isAether ? '1px 1px 0 #181005' : undefined,
                      transition: 'all 0.16s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = isAether ? '#ffdf59' : 'var(--btn-border-hover)';
                        e.currentTarget.style.color = isAether ? '#ffdf59' : 'var(--text-primary)';
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--btn-border)';
                        e.currentTarget.style.color = isAether ? '#fff9e6' : 'var(--text-secondary)';
                        e.currentTarget.style.background = 'var(--bg-surface)';
                      }
                    }}
                  >
                    <IconComp
                      size={18}
                      strokeWidth={2.2}
                      color={isSelected && isAether ? '#2e1c0d' : th.accentColor}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group B: Custom Themes */}
          <div>
            <div
              style={{
                fontSize: '9.5px',
                fontWeight: 700,
                color: isAether ? '#ffdf59' : 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>Custom Themes</span>
              <span style={{ fontSize: '9px', opacity: 0.65 }}>({CUSTOM_THEMES.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '8px' }}>
              {CUSTOM_THEMES.map((th) => {
                const isSelected = currentTheme === th.id;
                const IconComp = th.icon;
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => handleThemeChange(th.id)}
                    title={th.name}
                    className={`settings-opt-btn ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      padding: '10px 6px',
                      borderRadius: '8px',
                      background: isSelected
                        ? (isAether ? '#ffdf59' : 'var(--bg-surface-active)')
                        : 'var(--bg-surface)',
                      color: isSelected
                        ? (isAether ? '#2e1c0d' : 'var(--text-primary)')
                        : (isAether ? '#fff9e6' : 'var(--text-secondary)'),
                      border: isSelected
                        ? (isAether ? '1.5px solid #ffe885' : `1.5px solid ${th.accentColor}`)
                        : '1px solid var(--btn-border)',
                      boxShadow: 'var(--btn-shadow)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      textShadow: !isSelected && isAether ? '1px 1px 0 #181005' : undefined,
                      transition: 'all 0.16s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = isAether ? '#ffdf59' : 'var(--btn-border-hover)';
                        e.currentTarget.style.color = isAether ? '#ffdf59' : 'var(--text-primary)';
                        e.currentTarget.style.background = 'var(--bg-surface-hover)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = 'var(--btn-border)';
                        e.currentTarget.style.color = isAether ? '#fff9e6' : 'var(--text-secondary)';
                        e.currentTarget.style.background = 'var(--bg-surface)';
                      }
                    }}
                  >
                    <IconComp
                      size={18}
                      strokeWidth={2.2}
                      color={isSelected && isAether ? '#2e1c0d' : th.accentColor}
                    />
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: isSelected ? 700 : 500,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '100%'
                      }}
                    >
                      {th.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Priority 4: Weather Cities (Up to 5) */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Cloud className="settings-section-icon" size={13} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
              <span
                className="settings-section-title"
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                  textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                  letterSpacing: '0.2px'
                }}
              >
                Weather Cities (Up to 5)
              </span>
            </div>
            <span style={{ fontSize: '10px', color: isAether ? '#c2e5fc' : 'var(--text-muted)', fontWeight: 600 }}>
              {weatherCities.length} / 5
            </span>
          </div>

          {/* Add City Input Form */}
          <form onSubmit={handleAddCity} style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={weatherCities.length >= 5 ? 'Max 5 cities reached' : 'Add city name (e.g. Paris)...'}
              value={cityInput}
              disabled={weatherCities.length >= 5}
              onChange={(e) => setCityInput(e.target.value)}
              style={{
                flex: 1,
                padding: '7px 9px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!cityInput.trim() || weatherCities.length >= 5}
              className="btn-primary"
              style={{
                padding: '0 14px',
                fontSize: '11px',
                opacity: !cityInput.trim() || weatherCities.length >= 5 ? 0.45 : 1,
                cursor: !cityInput.trim() || weatherCities.length >= 5 ? 'not-allowed' : 'pointer'
              }}
            >
              Add
            </button>
          </form>

          {/* Cities Chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {weatherCities.map((c) => {
              const isActive = settings.activeWeatherCity?.toLowerCase() === c.toLowerCase();
              return (
                <div
                  key={c}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    background: isActive ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'var(--bg-surface)',
                    color: isActive ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#fff9e6' : 'var(--text-primary)'),
                    border: isActive && isAether ? '1px solid #ffe885' : '1px solid var(--btn-border)',
                    boxShadow: isActive && isAether ? '0 0 8px rgba(255, 223, 89, 0.45)' : undefined,
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500
                  }}
                >
                  <span
                    onClick={() => onUpdateSettings({ activeWeatherCity: c })}
                    style={{ cursor: 'pointer' }}
                    title="Click to set as primary weather view"
                  >
                    {c}
                  </span>
                  {weatherCities.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCity(c)}
                      title={`Remove ${c}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: isActive ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#c2e5fc' : 'var(--text-muted)')
                      }}
                    >
                      <X size={11} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority 5: Calendar Holidays & Festivals */}
        <div style={{ paddingBottom: '20px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Calendar className="settings-section-icon" size={13} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
            <span
              className="settings-section-title"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                letterSpacing: '0.2px'
              }}
            >
              Calendar Holidays & Festivals
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              type="button"
              onClick={() => setIsCountryOpen(!isCountryOpen)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <span>{selectedCountry.name} ({selectedCountry.code})</span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Change ▼</span>
            </button>

            {isCountryOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  borderRadius: '8px',
                  background: 'var(--bg-dock)',
                  border: '1px solid var(--border-hover)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
                  zIndex: 80,
                  padding: '6px',
                  maxHeight: '160px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 6px',
                    borderRadius: '4px',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)'
                  }}
                >
                  <Search size={12} color="var(--text-muted)" />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={countryQuery}
                    onChange={(e) => setCountryQuery(e.target.value)}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {filteredCountries.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ calendarCountry: c.code });
                        setIsCountryOpen(false);
                        setCountryQuery('');
                      }}
                      style={{
                        padding: '6px 8px',
                        borderRadius: '4px',
                        background: c.code === selectedCountryCode ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'transparent',
                        color: c.code === selectedCountryCode ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#fff9e6' : 'var(--text-primary)'),
                        fontWeight: c.code === selectedCountryCode ? 700 : 500,
                        fontSize: '11px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <span>{c.name}</span>
                      <span style={{ fontSize: '9.5px', opacity: 0.8 }}>{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Priority 6: Behavior Toggles & Handle Opacity */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders className="settings-section-icon" size={13} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
            <span
              className="settings-section-title"
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined,
                letterSpacing: '0.2px'
              }}
            >
              Dock Behavior & Handle
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              onClick={() => onUpdateSettings({ autoCollapseOnLaunch: !settings.autoCollapseOnLaunch })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--btn-border)';
                e.currentTarget.style.background = 'var(--bg-surface)';
              }}
            >
              <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                Collapse on launch
              </span>
              <div
                style={{
                  width: '32px',
                  height: '18px',
                  borderRadius: '999px',
                  background: settings.autoCollapseOnLaunch ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'var(--bg-surface-active)',
                  border: '1px solid var(--btn-border)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                  justifyContent: settings.autoCollapseOnLaunch ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: settings.autoCollapseOnLaunch ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : 'var(--text-muted)',
                    transition: 'background 0.2s ease'
                  }}
                />
              </div>
            </div>

            <div
              onClick={() => onUpdateSettings({ closeOnBlur: !settings.closeOnBlur })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--btn-border-hover)';
                e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--btn-border)';
                e.currentTarget.style.background = 'var(--bg-surface)';
              }}
            >
              <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                Close on click outside
              </span>
              <div
                style={{
                  width: '32px',
                  height: '18px',
                  borderRadius: '999px',
                  background: settings.closeOnBlur ? 'var(--text-primary)' : 'var(--bg-surface-active)',
                  border: '1px solid var(--btn-border)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'background 0.2s ease',
                  justifyContent: settings.closeOnBlur ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: settings.closeOnBlur ? 'var(--bg-dock)' : 'var(--text-muted)',
                    transition: 'background 0.2s ease'
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                marginTop: '2px'
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Hide from Windows Taskbar
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                  Removes the app button from the Windows bottom taskbar while keeping the dock & handle completely visible on your screen. AppDock remains accessible in the hidden tray (`^`).
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const newVal = !settings.hideFromTaskbar;
                    onUpdateSettings({ hideFromTaskbar: newVal });
                    if (typeof window !== 'undefined' && (window as any).appDock?.setSkipTaskbar) {
                      (window as any).appDock.setSkipTaskbar(newVal);
                    }
                  }}
                  className={`toggle-switch ${settings.hideFromTaskbar ? 'active' : ''}`}
                  style={{
                    width: '36px',
                    height: '20px',
                    borderRadius: '10px',
                    background: settings.hideFromTaskbar
                      ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                      : 'var(--btn-border)',
                    position: 'relative',
                    cursor: 'pointer',
                    border: 'none',
                    padding: 0,
                    transition: 'background 0.2s ease',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  aria-label="Toggle Hide from Windows Taskbar"
                  title="Toggle Taskbar Visibility"
                >
                  <div
                    style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#fff',
                      position: 'absolute',
                      left: settings.hideFromTaskbar ? '19px' : '3px',
                      transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Handle Opacity */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: isAether ? '#a3dbfe' : 'var(--text-secondary)',
                  textShadow: isAether ? '0 1px 2px rgba(0, 0, 0, 0.7)' : undefined
                }}
              >
                Handle Opacity
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  background: 'var(--bg-surface)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {Math.round(settings.toggleOpacity * 100)}%
              </span>
            </div>

            <CustomRangeBar
              value={settings.toggleOpacity}
              min={0.2}
              max={1.0}
              step={0.05}
              unit="%"
              formatValue={(val) => `${Math.round(val * 100)}%`}
              onChange={(val) => onUpdateSettings({ toggleOpacity: val })}
            />
          </div>
        </div>

        {/* Single Update Button */}
        <div style={{ paddingBottom: '16px' }}>
          {updateStatus === 'available' && latestReleaseInfo ? (
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).appDock?.openExternalUrl && latestReleaseInfo.downloadUrl) {
                  (window as any).appDock.openExternalUrl(latestReleaseInfo.downloadUrl);
                }
              }}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                boxShadow: 'var(--btn-shadow)',
                transition: 'all 0.16s ease'
              }}
            >
              <ArrowUpCircle size={14} />
              <span>Update to v{latestReleaseInfo.version}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleManualCheckUpdates}
              disabled={updateStatus === 'checking'}
              className="settings-opt-btn"
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: updateStatus === 'checking' ? 'wait' : 'pointer',
                background: isAether ? '#5c3e23' : 'var(--bg-surface)',
                color: isAether ? '#fff9e6' : 'var(--text-primary)',
                border: isAether ? '1.5px solid #8c6038' : '1px solid var(--btn-border)',
                boxShadow: 'var(--btn-shadow)',
                transition: 'all 0.16s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isAether ? '#ffdf59' : 'var(--btn-border-hover)';
                e.currentTarget.style.background = isAether ? '#734e2c' : 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isAether ? '#8c6038' : 'var(--btn-border)';
                e.currentTarget.style.background = isAether ? '#5c3e23' : 'var(--bg-surface)';
              }}
            >
              {updateStatus === 'checking' ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Checking for Updates...</span>
                </>
              ) : updateStatus === 'latest' ? (
                <>
                  <Check size={13} color="#22c55e" strokeWidth={2.5} />
                  <span>Up to Date (v{appVersion})</span>
                </>
              ) : (
                <>
                  <RefreshCw size={13} />
                  <span>Check for Updates (v{appVersion})</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
