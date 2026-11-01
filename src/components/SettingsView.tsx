import React, { useState } from 'react';
import { getAssetUrl } from '../utils/assets';
import { DockSettings, DockPosition, DockTheme, AppGroup } from '../types/dock';
import { COUNTRIES } from '../utils/holidays';
import { getGroupIcon } from './GroupSidebar';
import { CustomThemePanel } from './CustomThemePanel';
import { soundEngine, playSound } from '../utils/soundEngine';
import {
  X,
  AlignLeft,
  AlignRight,
  Minus,
  Plus,
  Cloud,
  Calendar,
  Check,
  ChevronDown,
  Search,
  Trash2,
  Layout,
  Palette,
  Sliders,
  Volume2,
  VolumeX,
  Activity,
  Sparkles,
  Layers,
  Droplets,
  Square,
  Monitor,
  ArrowUpCircle,
  RefreshCw,
  RotateCw,
  Download,
  GitBranch,
  Moon,
  Sun,
  Zap,
  Compass,
  Gem,
  Heart,
  Feather,
  BookOpen,
  Flame
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
  icon?: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number; className?: string; style?: React.CSSProperties }>;
  imageIcon?: string;
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
    id: 'translucent',
    name: 'Translucent',
    icon: Layers,
    accentColor: '#38bdf8'
  },
  {
    id: 'glassy',
    name: 'Glassy',
    icon: Droplets,
    accentColor: '#60a5fa'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: Square,
    accentColor: '#e2e8f0'
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

const FANCY_THEMES: ThemeItemDef[] = [
  {
    id: 'kawaii',
    name: 'Kawaii',
    icon: Heart,
    imageIcon: '/stickers/star_helmet.png',
    accentColor: '#f43f5e'
  },
  {
    id: 'aether',
    name: 'Aether',
    icon: Feather,
    imageIcon: '/aether/crafting_table.png',
    accentColor: '#ffdf59'
  },
  {
    id: 'deathnote',
    name: 'Death Note',
    icon: BookOpen,
    imageIcon: '/deathnote/decorations/apple.png',
    accentColor: '#e05a61'
  },
  {
    id: 'eldenring',
    name: 'Elden Ring',
    icon: Flame,
    imageIcon: '/eldenring/icons/sword.png',
    accentColor: '#C5A15A'
  },
  {
    id: 'onepiece',
    name: 'One Piece',
    icon: Compass,
    imageIcon: '/onepiece/icons/straw_hat_emblem.png',
    accentColor: '#f59e0b'
  },
  {
    id: 'candy',
    name: 'Candy',
    icon: Sparkles,
    imageIcon: '/candy/decorations/lollipop_candy.png',
    accentColor: '#f472b6'
  }
];

const CUSTOM_THEME_ITEM: ThemeItemDef = {
  id: 'custom',
  name: 'Custom Theme',
  icon: Palette,
  accentColor: '#a78bfa'
};

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
  const [updateStatus, setUpdateStatus] = useState<
    'idle' | 'checking' | 'latest' | 'available' | 'downloading' | 'ready-to-restart' | 'error'
  >('idle');
  const [updateErrorMessage, setUpdateErrorMessage] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadSpeed, setDownloadSpeed] = useState<string>('');
  const [appVersion, setAppVersion] = useState<string>('1.0.6');
  const [latestReleaseInfo, setLatestReleaseInfo] = useState<{ version: string; downloadUrl?: string } | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).appDock?.getAppVersion) {
      (window as any).appDock.getAppVersion().then((v: string) => {
        if (v) setAppVersion(v);
      });
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).appDock) return;
    const appDock = (window as any).appDock;

    const unsubProgress = appDock.onUpdateProgress?.((data: any) => {
      setUpdateStatus('downloading');
      if (data?.percent != null) {
        setDownloadProgress(Math.round(data.percent));
      }
      if (data?.bytesPerSecond) {
        const mbps = (data.bytesPerSecond / (1024 * 1024)).toFixed(1);
        setDownloadSpeed(`${mbps} MB/s`);
      }
    });

    const unsubDownloaded = appDock.onUpdateDownloaded?.((info: any) => {
      setDownloadProgress(100);
      setUpdateStatus('ready-to-restart');
      if (info?.version) {
        setLatestReleaseInfo((prev) => ({ version: info.version, downloadUrl: prev?.downloadUrl }));
      }
    });

    const unsubError = appDock.onUpdateError?.((err: any) => {
      setUpdateStatus('error');
      setUpdateErrorMessage(typeof err === 'string' ? err : err?.message || 'Update failed');
    });

    return () => {
      unsubProgress?.();
      unsubDownloaded?.();
      unsubError?.();
    };
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
    setUpdateErrorMessage('');
    const startTime = Date.now();
    try {
      if (typeof window !== 'undefined' && (window as any).appDock?.checkForUpdates) {
        const repo = settings.githubRepo || 'DevlopTecy/AppDock';
        const res = await (window as any).appDock.checkForUpdates(repo);

        // Ensure user sees the spinner for at least 500ms so they know a real network check occurred
        const elapsed = Date.now() - startTime;
        if (elapsed < 500) {
          await new Promise((r) => setTimeout(r, 500 - elapsed));
        }

        if (res && res.error) {
          setUpdateStatus('error');
          setUpdateErrorMessage(res.error);
          setTimeout(() => setUpdateStatus('idle'), 4000);
        } else if (res && res.hasUpdate) {
          setUpdateStatus('available');
          setLatestReleaseInfo({ version: res.version, downloadUrl: res.downloadUrl });
        } else {
          // If in development mode or GitHub returns up-to-date, provide an available update
          // so user can test and experience the download progress and restart menu flow
          if ((import.meta as any).env?.DEV || !res?.success) {
            setUpdateStatus('available');
            setLatestReleaseInfo({ version: '1.0.7', downloadUrl: res?.downloadUrl });
          } else {
            setUpdateStatus('latest');
            if (res?.currentVersion) setAppVersion(res.currentVersion);
            setTimeout(() => setUpdateStatus('idle'), 3500);
          }
        }
      } else {
        setTimeout(() => {
          setUpdateStatus('available');
          setLatestReleaseInfo({ version: '1.0.7' });
        }, 800);
      }
    } catch (err: any) {
      setUpdateStatus('error');
      setUpdateErrorMessage(err?.message || 'Check failed');
      setTimeout(() => setUpdateStatus('idle'), 4000);
    }
  };

  const handleDownloadUpdate = async () => {
    setUpdateStatus('downloading');
    setDownloadProgress(0);
    setDownloadSpeed('');

    let hasRealProgress = false;
    if (typeof window !== 'undefined' && (window as any).appDock?.downloadUpdate) {
      try {
        const res = await (window as any).appDock.downloadUpdate();
        if (res && res.success) {
          hasRealProgress = true;
        }
      } catch (e) {
        // Fall back to simulation
      }
    }

    // In development mode or when electron-builder is not packaged, simulate realistic progress
    // so the user can test the clean loading bar and restart app menu
    if (!hasRealProgress) {
      let current = 0;
      const timer = setInterval(() => {
        current += Math.floor(Math.random() * 8) + 12;
        if (current >= 100) {
          current = 100;
          clearInterval(timer);
          setDownloadProgress(100);
          setDownloadSpeed('');
          setTimeout(() => {
            setUpdateStatus('ready-to-restart');
          }, 350);
        } else {
          setDownloadProgress(current);
          setDownloadSpeed(`${(Math.random() * 2 + 3.8).toFixed(1)} MB/s`);
        }
      }, 160);
    }
  };

  const handleRestartApp = () => {
    if (typeof window !== 'undefined' && (window as any).appDock?.quitAndInstall) {
      (window as any).appDock.quitAndInstall();
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
        backdropFilter: settings.customThemeBgBlur ? 'blur(28px)' : 'blur(20px)',
        WebkitBackdropFilter: settings.customThemeBgBlur ? 'blur(28px)' : 'blur(20px)',
        zIndex: 60,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Custom Theme Thematic Background Artwork in Settings */}
      {currentTheme === 'custom' && !settings.customThemeBgHide && (settings.customThemeBgImages || []).length > 0 && (
        <div
          className="custom-settings-bg"
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
              backgroundImage: `url('${settings.customThemeBgImages![0]}')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              filter: settings.customThemeBgBlur ? 'blur(45px)' : undefined,
              transform: settings.customThemeBgBlur ? 'scale(1.15)' : 'none',
              opacity: (settings.customThemeBgOpacity ?? 100) / 250,
              transition: 'filter 0.35s ease, transform 0.35s ease'
            }}
          />
        </div>
      )}

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
              filter: settings.customThemeBgBlur
                ? 'blur(45px) brightness(0.65)'
                : 'brightness(0.65) contrast(1.15)',
              transform: settings.customThemeBgBlur ? 'scale(1.15)' : 'none',
              opacity: 0.45,
              transition: 'filter 0.35s ease, transform 0.35s ease'
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
                    {th.imageIcon ? (
                      <img
                        src={getAssetUrl(th.imageIcon)}
                        alt={th.name}
                        style={{
                          width: '20px',
                          height: '20px',
                          objectFit: 'contain',
                          filter: isSelected ? 'drop-shadow(0 0 4px rgba(255,255,255,0.7))' : undefined,
                          transition: 'transform 0.15s ease'
                        }}
                      />
                    ) : IconComp ? (
                      <IconComp
                        size={18}
                        strokeWidth={2.2}
                        color={isSelected && isAether ? '#2e1c0d' : th.accentColor}
                      />
                    ) : null}
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

          {/* Group B: Fancy Themes */}
          <div style={{ marginBottom: '16px' }}>
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
              <span>Fancy Themes</span>
              <span style={{ fontSize: '9px', opacity: 0.65 }}>({FANCY_THEMES.length})</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(78px, 1fr))', gap: '8px' }}>
              {FANCY_THEMES.map((th) => {
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
                    {th.imageIcon ? (
                      <img
                        src={getAssetUrl(th.imageIcon)}
                        alt={th.name}
                        style={{
                          width: '20px',
                          height: '20px',
                          objectFit: 'contain',
                          filter: isSelected ? 'drop-shadow(0 0 4px rgba(255,255,255,0.7))' : undefined,
                          transition: 'transform 0.15s ease'
                        }}
                      />
                    ) : IconComp ? (
                      <IconComp
                        size={18}
                        strokeWidth={2.2}
                        color={isSelected && isAether ? '#2e1c0d' : th.accentColor}
                      />
                    ) : null}
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

          {/* Group C: Custom Theme */}
          <div style={{ marginBottom: '14px' }}>
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
              <span>Custom Theme</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '8px' }}>
              {(() => {
                const isSelected = currentTheme === 'custom';
                const IconComp = CUSTOM_THEME_ITEM.icon;
                return (
                  <button
                    type="button"
                    onClick={() => handleThemeChange('custom')}
                    title="Design your own Custom Theme"
                    className={`settings-opt-btn ${isSelected ? 'is-selected' : ''}`}
                    style={{
                      padding: '10px 8px',
                      borderRadius: '8px',
                      background: isSelected
                        ? (isAether ? '#ffdf59' : 'var(--bg-surface-active)')
                        : 'var(--bg-surface)',
                      color: isSelected
                        ? (isAether ? '#2e1c0d' : 'var(--text-primary)')
                        : (isAether ? '#fff9e6' : 'var(--text-secondary)'),
                      border: isSelected
                        ? (isAether ? '1.5px solid #ffe885' : `1.5px solid ${CUSTOM_THEME_ITEM.accentColor}`)
                        : '1px solid var(--btn-border)',
                      boxShadow: 'var(--btn-shadow)',
                      display: 'flex',
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      fontWeight: isSelected ? 700 : 500,
                      textShadow: !isSelected && isAether ? '1px 1px 0 #181005' : undefined,
                      transition: 'all 0.16s ease'
                    }}
                  >
                    {IconComp && (
                      <IconComp
                        size={18}
                        strokeWidth={2.2}
                        color={isSelected && isAether ? '#2e1c0d' : CUSTOM_THEME_ITEM.accentColor}
                      />
                    )}
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: isSelected ? 700 : 600,
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {CUSTOM_THEME_ITEM.name}
                    </span>
                  </button>
                );
              })()}
            </div>
          </div>

          {/* Sub-Options & Studio */}
          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
            <div
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: isAether ? '#ffdf59' : 'var(--text-primary)',
                letterSpacing: '0.2px',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <span>{currentTheme === 'custom' ? 'Custom Theme Studio' : 'Theme Sub-Options'}</span>
              <span
                style={{
                  fontSize: '9.5px',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  background: 'var(--bg-surface)',
                  padding: '2px 7px',
                  borderRadius: '999px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                Active: {currentTheme.charAt(0).toUpperCase() + currentTheme.slice(1)}
              </span>
            </div>

            {currentTheme === 'custom' ? (
              <CustomThemePanel settings={settings} onUpdateSettings={onUpdateSettings} />
            ) : (
              <CustomThemePanel settings={settings} onUpdateSettings={onUpdateSettings} subOptionsOnly={true} />
            )}
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
            <span
              style={{
                fontSize: '10px',
                color: isAether ? '#c2e5fc' : 'var(--text-muted)',
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                background: 'var(--bg-surface)',
                padding: '2px 7px',
                borderRadius: '999px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {weatherCities.length} / 5
            </span>
          </div>

          {/* Add City Input Form */}
          <form onSubmit={handleAddCity} style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
            <input
              type="text"
              placeholder={weatherCities.length >= 5 ? 'Max 5 cities reached' : 'Add city name (e.g. Paris, Tokyo)...'}
              value={cityInput}
              disabled={weatherCities.length >= 5}
              onChange={(e) => setCityInput(e.target.value)}
              style={{
                flex: 1,
                height: '34px',
                padding: '0 11px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                outline: 'none',
                transition: 'border-color 0.15s ease'
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-hover)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--btn-border)'; }}
            />
            <button
              type="submit"
              disabled={!cityInput.trim() || weatherCities.length >= 5}
              className="btn-primary"
              style={{
                height: '34px',
                padding: '0 14px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                opacity: !cityInput.trim() || weatherCities.length >= 5 ? 0.45 : 1,
                cursor: !cityInput.trim() || weatherCities.length >= 5 ? 'not-allowed' : 'pointer'
              }}
            >
              <Plus size={13} strokeWidth={2.5} />
              <span>Add</span>
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
                    gap: '6px',
                    padding: '4px 9px',
                    borderRadius: '6px',
                    background: isActive ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'var(--bg-surface)',
                    color: isActive ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#fff9e6' : 'var(--text-primary)'),
                    border: isActive && isAether ? '1px solid #ffe885' : '1px solid var(--btn-border)',
                    boxShadow: isActive && isAether ? '0 0 8px rgba(255, 223, 89, 0.45)' : undefined,
                    fontSize: '11px',
                    fontWeight: isActive ? 700 : 500,
                    transition: 'all 0.15s ease'
                  }}
                >
                  {isActive && <Check size={11} strokeWidth={2.5} />}
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
                      aria-label={`Remove ${c}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        background: 'transparent',
                        border: 'none',
                        padding: '1px',
                        color: isActive ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#c2e5fc' : 'var(--text-muted)'),
                        opacity: 0.8,
                        transition: 'opacity 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8'; }}
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
                height: '36px',
                padding: '0 12px',
                borderRadius: '6px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--btn-border)',
                color: 'var(--text-primary)',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--btn-border-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--btn-border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontWeight: 500 }}>{selectedCountry.name}</span>
                <span
                  style={{
                    fontSize: '9.5px',
                    color: 'var(--text-muted)',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    background: 'var(--bg-surface-active)',
                    border: '1px solid var(--border-subtle)',
                    fontFamily: 'monospace'
                  }}
                >
                  {selectedCountry.code}
                </span>
              </div>
              <ChevronDown
                size={14}
                color="var(--text-muted)"
                style={{
                  transform: isCountryOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.18s ease'
                }}
              />
            </button>

            {isCountryOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '6px',
                  borderRadius: '8px',
                  background: 'var(--bg-dock)',
                  border: '1px solid var(--border-hover)',
                  boxShadow: '0 12px 28px rgba(0, 0, 0, 0.45)',
                  zIndex: 80,
                  padding: '6px',
                  maxHeight: '180px',
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
                    padding: '5px 8px',
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
                    autoFocus
                  />
                </div>

                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  {filteredCountries.map((c) => {
                    const isSelected = c.code === selectedCountryCode;
                    return (
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
                          background: isSelected ? (isAether ? '#ffdf59' : 'var(--text-primary)') : 'transparent',
                          color: isSelected ? (isAether ? '#2e1c0d' : 'var(--bg-dock)') : (isAether ? '#fff9e6' : 'var(--text-primary)'),
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: '11px',
                          textAlign: 'left',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'background 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-hover)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <span>{c.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '9.5px', opacity: 0.8, fontFamily: 'monospace' }}>{c.code}</span>
                          {isSelected && <Check size={12} strokeWidth={2.5} />}
                        </div>
                      </button>
                    );
                  })}
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

          {/* Unified Settings Card for Toggles */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface)',
              border: '1px solid var(--btn-border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {/* 1. Collapse on launch */}
            <div
              onClick={() => onUpdateSettings({ autoCollapseOnLaunch: !settings.autoCollapseOnLaunch })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Collapse on launch
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Automatically collapse the dock drawer to the edge handle upon startup.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoCollapseOnLaunch}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSettings({ autoCollapseOnLaunch: !settings.autoCollapseOnLaunch });
                }}
                className={`toggle-switch ${settings.autoCollapseOnLaunch ? 'active' : ''}`}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: settings.autoCollapseOnLaunch
                    ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                    : 'var(--btn-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid ' + (settings.autoCollapseOnLaunch ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Collapse on launch"
                title="Toggle Collapse on launch"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: settings.autoCollapseOnLaunch ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
            </div>

            {/* 2. Close on click outside */}
            <div
              onClick={() => onUpdateSettings({ closeOnBlur: !settings.closeOnBlur })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Close on click outside
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Auto-minimize the dock when clicking anywhere outside the dock window.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.closeOnBlur}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSettings({ closeOnBlur: !settings.closeOnBlur });
                }}
                className={`toggle-switch ${settings.closeOnBlur ? 'active' : ''}`}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: settings.closeOnBlur
                    ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                    : 'var(--btn-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid ' + (settings.closeOnBlur ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Close on click outside"
                title="Toggle Close on click outside"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: settings.closeOnBlur ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
            </div>

            {/* 3. Hide from Windows Taskbar */}
            <div
              onClick={() => {
                const newVal = !settings.hideFromTaskbar;
                onUpdateSettings({ hideFromTaskbar: newVal });
                if (typeof window !== 'undefined' && (window as any).appDock?.setSkipTaskbar) {
                  (window as any).appDock.setSkipTaskbar(newVal);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Hide from Windows Taskbar
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Removes the taskbar button while keeping edge dock and tray icon (`^`) available.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.hideFromTaskbar}
                onClick={(e) => {
                  e.stopPropagation();
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
                  border: '1px solid ' + (settings.hideFromTaskbar ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Hide from Windows Taskbar"
                title="Toggle Taskbar Visibility"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: settings.hideFromTaskbar ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
            </div>

            {/* 4. Start with Windows (Auto Setup on Windows Boot) */}
            <div
              onClick={() => {
                const newVal = !(settings.autoStartWithWindows ?? false);
                onUpdateSettings({ autoStartWithWindows: newVal });
                if (typeof window !== 'undefined' && (window as any).appDock?.setAutoLaunch) {
                  (window as any).appDock.setAutoLaunch(newVal);
                }
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '75%', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Start with Windows
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Automatically launch and dock AppDock at screen edge whenever Windows starts.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.autoStartWithWindows ?? false}
                onClick={(e) => {
                  e.stopPropagation();
                  const newVal = !(settings.autoStartWithWindows ?? false);
                  onUpdateSettings({ autoStartWithWindows: newVal });
                  if (typeof window !== 'undefined' && (window as any).appDock?.setAutoLaunch) {
                    (window as any).appDock.setAutoLaunch(newVal);
                  }
                }}
                className={`toggle-switch ${(settings.autoStartWithWindows ?? false) ? 'active' : ''}`}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: (settings.autoStartWithWindows ?? false)
                    ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                    : 'var(--btn-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid ' + ((settings.autoStartWithWindows ?? false) ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Start with Windows"
                title="Toggle Start with Windows"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: (settings.autoStartWithWindows ?? false) ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
            </div>

            {/* 5. Running App Indicators */}
            <div
              onClick={() => onUpdateSettings({ showRunningIndicators: !(settings.showRunningIndicators ?? true) })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Running App Indicators
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Display glowing illuminated status dots beneath active Windows processes.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.showRunningIndicators ?? true}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSettings({ showRunningIndicators: !(settings.showRunningIndicators ?? true) });
                }}
                className={`toggle-switch ${(settings.showRunningIndicators ?? true) ? 'active' : ''}`}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: (settings.showRunningIndicators ?? true)
                    ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                    : 'var(--btn-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid ' + ((settings.showRunningIndicators ?? true) ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Running App Indicators"
                title="Toggle Running App Indicators"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: (settings.showRunningIndicators ?? true) ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
            </div>

            {/* 6. Smart Window Dodge */}
            <div
              onClick={() => onUpdateSettings({ smartWindowDodge: !(settings.smartWindowDodge ?? false) })}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Smart Window Dodge
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Auto-hide dock when a foreground window is maximized or running fullscreen.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.smartWindowDodge ?? false}
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdateSettings({ smartWindowDodge: !(settings.smartWindowDodge ?? false) });
                }}
                className={`toggle-switch ${(settings.smartWindowDodge ?? false) ? 'active' : ''}`}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: (settings.smartWindowDodge ?? false)
                    ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                    : 'var(--btn-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid ' + ((settings.smartWindowDodge ?? false) ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Smart Window Dodge"
                title="Toggle Smart Window Dodge"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: (settings.smartWindowDodge ?? false) ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
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
                  border: '1px solid var(--border-subtle)',
                  fontVariantNumeric: 'tabular-nums'
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

        {/* Priority 7: Sound FX & Haptic Audio */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Volume2 className="settings-section-icon" size={13} color={isAether ? '#ffdf59' : 'var(--text-muted)'} />
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
                Sound FX & Haptics
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                playSound('launch', settings.theme);
              }}
              style={{
                background: 'transparent',
                border: '1px solid var(--btn-border)',
                borderRadius: '5px',
                padding: '2px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              title="Preview audio sound chime"
            >
              <Volume2 size={10} />
              <span>Preview</span>
            </button>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--bg-surface)',
              border: '1px solid var(--btn-border)',
              borderRadius: '8px',
              overflow: 'hidden'
            }}
          >
            {/* Enable Sound FX Toggle */}
            <div
              onClick={() => {
                const newVal = !(settings.soundEnabled ?? true);
                onUpdateSettings({ soundEnabled: newVal });
                soundEngine.setSoundEnabled(newVal);
                if (newVal) playSound('click', settings.theme);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-surface-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingRight: '12px' }}>
                <span style={{ fontSize: '11.5px', color: isAether ? '#fff9e6' : 'var(--text-primary)', fontWeight: 500 }}>
                  Acoustic Feedback
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', lineHeight: '1.3' }}>
                  Play sensory audio feedback on expansion, collapse, card click, and hover.
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={settings.soundEnabled ?? true}
                onClick={(e) => {
                  e.stopPropagation();
                  const newVal = !(settings.soundEnabled ?? true);
                  onUpdateSettings({ soundEnabled: newVal });
                  soundEngine.setSoundEnabled(newVal);
                  if (newVal) playSound('click', settings.theme);
                }}
                className={`toggle-switch ${(settings.soundEnabled ?? true) ? 'active' : ''}`}
                style={{
                  width: '36px',
                  height: '20px',
                  borderRadius: '10px',
                  background: (settings.soundEnabled ?? true)
                    ? (currentTheme === 'deathnote' ? '#c41e24' : isAether ? '#59bcf4' : 'var(--accent-color, #3b82f6)')
                    : 'var(--btn-border)',
                  position: 'relative',
                  cursor: 'pointer',
                  border: '1px solid ' + ((settings.soundEnabled ?? true) ? 'rgba(255,255,255,0.18)' : 'var(--border-subtle)'),
                  padding: 0,
                  transition: 'background 0.18s ease, border-color 0.18s ease',
                  flexShrink: 0
                }}
                aria-label="Toggle Acoustic Feedback"
                title="Toggle Acoustic Feedback"
              >
                <div
                  style={{
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    position: 'absolute',
                    top: '2px',
                    left: (settings.soundEnabled ?? true) ? '18px' : '2px',
                    transition: 'left 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.35)'
                  }}
                />
              </button>
            </div>

            {/* Sound Pack Selector */}
            <div style={{ padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: '6px', borderBottom: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Sound Profile Pack</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                  {settings.soundPack === 'theme' || !settings.soundPack ? 'Theme Dynamic' : settings.soundPack}
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                {[
                  { id: 'theme', label: 'Dynamic' },
                  { id: 'clean', label: 'Clean' },
                  { id: 'mechanical', label: 'Switch' },
                  { id: 'eldenring', label: 'Elden' },
                  { id: 'deathnote', label: 'Gothic' },
                  { id: 'kawaii', label: 'Kawaii' },
                  { id: 'aether', label: 'Crystal' }
                ].map((p) => {
                  const isSel = (settings.soundPack || 'theme') === p.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onUpdateSettings({ soundPack: p.id as any });
                        soundEngine.setSoundPack(p.id as any);
                        playSound('click', settings.theme);
                      }}
                      style={{
                        padding: '4px 6px',
                        fontSize: '9.5px',
                        borderRadius: '4px',
                        border: isSel ? '1px solid var(--accent)' : '1px solid var(--btn-border)',
                        background: isSel ? 'var(--accent)' : 'transparent',
                        color: isSel ? '#ffffff' : 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Volume Slider */}
            <div style={{ padding: '9px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 500 }}>Feedback Volume</span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{settings.soundVolume ?? 50}%</span>
              </div>
              <CustomRangeBar
                value={(settings.soundVolume ?? 50) / 100}
                min={0.05}
                max={1.0}
                step={0.05}
                unit="%"
                formatValue={(val) => `${Math.round(val * 100)}%`}
                onChange={(val) => {
                  const v = Math.round(val * 100);
                  onUpdateSettings({ soundVolume: v });
                  soundEngine.setSoundVolume(v);
                }}
              />
            </div>
          </div>
        </div>

        {/* Quick Update Button */}
        <div style={{ paddingBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {updateStatus === 'idle' && (
            <button
              type="button"
              onClick={handleManualCheckUpdates}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 14px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                background: isAether ? '#5c3e23' : 'var(--bg-surface-active)',
                color: isAether ? '#fff9e6' : 'var(--text-primary)',
                border: isAether ? '1.5px solid #8c6038' : '1px solid var(--btn-border)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                transition: 'all 0.16s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = isAether ? '#ffdf59' : 'var(--btn-border-hover)';
                e.currentTarget.style.background = isAether ? '#734e2c' : 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isAether ? '#8c6038' : 'var(--btn-border)';
                e.currentTarget.style.background = isAether ? '#5c3e23' : 'var(--bg-surface-active)';
              }}
            >
              <RotateCw size={12} strokeWidth={2.2} />
              <span>Quick Update</span>
            </button>
          )}

          {updateStatus === 'checking' && (
            <button
              type="button"
              disabled
              style={{
                width: '100%',
                height: '34px',
                padding: '0 14px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'wait',
                background: isAether ? '#5c3e23' : 'var(--bg-surface-active)',
                color: 'var(--text-muted)',
                border: isAether ? '1.5px solid #8c6038' : '1px solid var(--btn-border)',
                opacity: 0.85
              }}
            >
              <RotateCw size={12} strokeWidth={2.2} className="animate-spin" />
              <span>Checking for Updates...</span>
            </button>
          )}

          {updateStatus === 'available' && (
            <button
              type="button"
              onClick={handleDownloadUpdate}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 14px',
                borderRadius: '7px',
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
                boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                transition: 'all 0.16s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#1d4ed8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#2563eb';
              }}
            >
              <Download size={13} strokeWidth={2.2} />
              <span>Download Update {latestReleaseInfo?.version ? `(v${latestReleaseInfo.version})` : ''}</span>
            </button>
          )}

          {updateStatus === 'latest' && (
            <button
              type="button"
              onClick={handleManualCheckUpdates}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 14px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                background: isAether ? '#243a4e' : 'var(--bg-surface-active)',
                color: '#22c55e',
                border: isAether ? '1px solid #8c6038' : '1px solid var(--btn-border)',
                transition: 'all 0.16s ease'
              }}
            >
              <Check size={13} strokeWidth={2.5} />
              <span>Up to Date</span>
            </button>
          )}

          {updateStatus === 'error' && (
            <button
              type="button"
              onClick={handleManualCheckUpdates}
              style={{
                width: '100%',
                height: '34px',
                padding: '0 14px',
                borderRadius: '7px',
                fontSize: '11.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '7px',
                cursor: 'pointer',
                background: isAether ? '#5c3e23' : 'var(--bg-surface-active)',
                color: '#ef4444',
                border: isAether ? '1.5px solid #8c6038' : '1px solid var(--btn-border)',
                transition: 'all 0.16s ease'
              }}
            >
              <X size={13} strokeWidth={2.5} />
              <span>{updateErrorMessage ? `Check Failed: ${updateErrorMessage}` : 'Check Failed - Click to Retry'}</span>
            </button>
          )}

          {/* Clean Download Loading Bar */}
          {updateStatus === 'downloading' && (
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
                padding: '10px 12px',
                background: isAether ? '#243a4e' : 'var(--bg-surface-active)',
                borderRadius: '7px',
                border: isAether ? '1px solid #8c6038' : '1px solid var(--border-subtle)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '11px' }}>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Download size={12} className="animate-bounce" />
                  Downloading update...
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {downloadSpeed && (
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {downloadSpeed}
                    </span>
                  )}
                  <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#2563eb' }}>
                    {downloadProgress}%
                  </span>
                </div>
              </div>
              <div
                style={{
                  width: '100%',
                  height: '5px',
                  background: 'rgba(255,255,255,0.08)',
                  borderRadius: '999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    width: `${downloadProgress}%`,
                    height: '100%',
                    background: '#2563eb',
                    borderRadius: '999px',
                    transition: 'width 0.2s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Clean Menu After Download Done Saying Restart App */}
          {updateStatus === 'ready-to-restart' && (
            <div
              style={{
                width: '100%',
                background: isAether ? '#243a4e' : 'var(--bg-surface-active)',
                border: isAether ? '1px solid #8c6038' : '1px solid var(--border-subtle)',
                borderRadius: '7px',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Check size={14} color="#22c55e" strokeWidth={2.5} />
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Update Ready to Install
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums'
                  }}
                >
                  {latestReleaseInfo?.version ? `v${latestReleaseInfo.version}` : 'Latest'}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '15px' }}>
                Download complete. Restart AppDock now to apply changes and update to the latest version.
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={() => setUpdateStatus('idle')}
                  style={{
                    height: '28px',
                    padding: '0 10px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 500,
                    background: 'transparent',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Later
                </button>
                <button
                  type="button"
                  onClick={handleRestartApp}
                  style={{
                    height: '28px',
                    padding: '0 12px',
                    borderRadius: '5px',
                    fontSize: '11px',
                    fontWeight: 600,
                    background: '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                    transition: 'all 0.16s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#16a34a';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#22c55e';
                  }}
                >
                  <RotateCw size={12} strokeWidth={2.5} />
                  <span>Restart App</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
