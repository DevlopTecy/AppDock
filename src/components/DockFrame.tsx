import React from 'react';
import { getAssetUrl } from '../utils/assets';
import { DockPosition, CompanionModuleType, DockTheme } from '../types/dock';
import { EdgeToggle } from './EdgeToggle';
import { ConnectorHub } from './connectors/ConnectorHub';
import { Search, Settings, X, Minimize2, Maximize2 } from 'lucide-react';

interface DockFrameProps {
  isExpanded: boolean;
  dockPosition: DockPosition;
  drawerWidth: number;
  toggleOpacity: number;
  activeGroupName: string;
  itemCount: number;
  theme?: DockTheme;
  activeModule?: CompanionModuleType;
  onSelectModule?: (mod: CompanionModuleType) => void;
  companionContent?: React.ReactNode;
  onToggle: () => void;
  onOpenSearch: () => void;
  onOpenAdd?: () => void;
  onOpenSettings: () => void;
  onResizeWidth?: (width: number) => void;
  verticalPosition?: number;
  onUpdateVerticalPosition?: (ratio: number) => void;
  children: React.ReactNode;
  isCleanDock?: boolean;
  onExitCleanDock?: () => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

const ELDEN_RING_BACKGROUNDS = [
  '/eldenring/backgrounds/weary_knight_beneath_the_golden_tree.png',
  '/eldenring/backgrounds/vertical_golden_tree_wallpaper.png',
  '/eldenring/backgrounds/vertical_erdtree_wallpaper.png'
];

const ONE_PIECE_BACKGROUNDS = [
  '/onepiece/backgrounds/straw_hat_crew_over_skull_island.png',
  '/onepiece/backgrounds/portrait_ship_background.png'
];

const CANDY_BACKGROUNDS = [
  '/candy/backgrounds/sweet_home_candy_cottage.png',
  '/candy/backgrounds/candy_cafe_dock.png'
];

export const DockFrame: React.FC<DockFrameProps> = ({
  isExpanded,
  dockPosition,
  drawerWidth,
  toggleOpacity,
  activeGroupName,
  itemCount: _itemCount,
  theme,
  activeModule = null,
  onSelectModule = () => {},
  isCleanDock = false,
  onExitCleanDock,
  isMaximized = false,
  onToggleMaximize,
  companionContent,
  onToggle,
  onOpenSearch,
  onOpenAdd: _onOpenAdd,
  onOpenSettings,
  onResizeWidth,
  verticalPosition = 0.5,
  onUpdateVerticalPosition,
  children
}) => {
  const [isResizing, setIsResizing] = React.useState(false);
  const [renderedModule, setRenderedModule] = React.useState<CompanionModuleType>(activeModule);
  const [isExiting, setIsExiting] = React.useState(false);
  const [prevActive, setPrevActive] = React.useState(activeModule);
  const [eldenBgIndex, setEldenBgIndex] = React.useState(0);
  const [onePieceBgIndex, setOnePieceBgIndex] = React.useState(0);
  const [candyBgIndex, setCandyBgIndex] = React.useState(0);
  const exitTimerRef = React.useRef<number | null>(null);

  // 30-second rotating background timer for atmospheric themes
  React.useEffect(() => {
    if (theme === 'eldenring') {
      const timer = window.setInterval(() => {
        setEldenBgIndex((prev) => (prev + 1) % ELDEN_RING_BACKGROUNDS.length);
      }, 30000);
      return () => window.clearInterval(timer);
    } else if (theme === 'onepiece') {
      const timer = window.setInterval(() => {
        setOnePieceBgIndex((prev) => (prev + 1) % ONE_PIECE_BACKGROUNDS.length);
      }, 30000);
      return () => window.clearInterval(timer);
    } else if (theme === 'candy') {
      const timer = window.setInterval(() => {
        setCandyBgIndex((prev) => (prev + 1) % CANDY_BACKGROUNDS.length);
      }, 30000);
      return () => window.clearInterval(timer);
    }
  }, [theme]);

  // Synchronize enter/exit transitions immediately without 1-frame width dip / stutter
  if (activeModule !== prevActive) {
    setPrevActive(activeModule);
    if (activeModule) {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setRenderedModule(activeModule);
      setIsExiting(false);
      if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
        (window as any).appDock.setModuleWidth(340);
      }
    } else if (renderedModule) {
      setIsExiting(true);
    }
  }

  React.useEffect(() => {
    if (isExiting) {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
      exitTimerRef.current = window.setTimeout(() => {
        setRenderedModule(null);
        setIsExiting(false);
        exitTimerRef.current = null;
        if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
          (window as any).appDock.setModuleWidth(isCleanDock ? -1 : 54);
        }
      }, 190);
    }
    return () => {
      if (exitTimerRef.current) {
        window.clearTimeout(exitTimerRef.current);
      }
    };
  }, [isExiting, isCleanDock]);

  const isLeft = dockPosition === 'left';
  const isRight = dockPosition === 'right';
  const isTop = dockPosition === 'top';

  const handleMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    const startScreenX = e.screenX;
    const startWidth = drawerWidth;
    let latestWidth = startWidth;
    let rafId: number | null = null;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      // Using global screenX prevents coordinate feedback loop when window moves on the desktop
      const delta = isRight
        ? (startScreenX - moveEvent.screenX)
        : (moveEvent.screenX - startScreenX);
      const newWidth = Math.max(180, Math.min(520, Math.round(startWidth + delta)));
      latestWidth = newWidth;

      if (onResizeWidth) {
        onResizeWidth(newWidth);
      }

      if (!rafId) {
        rafId = requestAnimationFrame(() => {
          if (typeof window !== 'undefined' && (window as any).appDock?.setDrawerDimensions) {
            (window as any).appDock.setDrawerDimensions({ width: latestWidth });
          }
          rafId = null;
        });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      if (typeof window !== 'undefined' && (window as any).appDock?.setDrawerDimensions) {
        (window as any).appDock.setDrawerDimensions({ width: latestWidth });
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // If not expanded, render ONLY the edge handle flush against the screen edge
  if (!isExpanded) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isRight ? 'flex-end' : isLeft ? 'flex-start' : 'center',
          position: 'relative'
        }}
      >
        <div
          style={{
            position: 'absolute',
            right: isRight ? 0 : undefined,
            left: isLeft ? 0 : undefined,
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <EdgeToggle
            isExpanded={false}
            dockPosition={dockPosition}
            opacity={toggleOpacity}
            verticalPosition={verticalPosition}
            onToggle={onToggle}
            onUpdateVerticalPosition={onUpdateVerticalPosition}
          />
        </div>
      </div>
    );
  }

  const isModuleActive = Boolean(renderedModule || isExiting);
  const companionW = isCleanDock ? 0 : (isModuleActive ? 340 : 54);
  const _totalExpandedWidth = drawerWidth + companionW;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isTop ? 'column' : 'row',
        alignItems: 'flex-start',
        justifyContent: isRight ? 'flex-end' : isLeft ? 'flex-start' : 'center',
        width: '100%',
        maxWidth: isTop ? `${drawerWidth + 340}px` : undefined,
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        margin: 0
      }}
    >
      {/* Right dock layout: Companion Area */}
      {isRight && !isCleanDock && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            height: '100%',
            width: `${companionW}px`,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Active Companion Module (Music / Weather / Calendar) — animates in/out within the fixed 340px space */}
          {renderedModule && companionContent && (
            <div
              key={renderedModule}
              className={isExiting ? 'hub-module-exit-right' : 'hub-module-enter-right'}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: '52px',
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'visible',
                zIndex: 1
              }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {companionContent}
              </div>
            </div>
          )}

          {/* Anchor Column — always flush against Main Drawer at right edge of companion area */}
          <div
            style={{
              width: '48px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '8px',
              position: 'relative',
              flexShrink: 0,
              zIndex: 2,
              marginLeft: 'auto'
            }}
          >
            {/* Small Handles Hub Box sticking directly to the main UI at the top */}
            <ConnectorHub
              dockPosition={dockPosition}
              isExpanded={isExpanded}
              activeModule={activeModule}
              onSelectModule={onSelectModule}
              theme={theme}
            />

            {/* Main Handle (EdgeToggle) stays visible when opened, sticking to Drawer at vertical center */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                right: '0px',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                zIndex: 40
              }}
            >
              <EdgeToggle
                isExpanded={true}
                dockPosition={dockPosition}
                opacity={toggleOpacity}
                verticalPosition={verticalPosition}
                onToggle={onToggle}
                onUpdateVerticalPosition={onUpdateVerticalPosition}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edge Handle for Right dock when in Clean Dock mode */}
      {isRight && isCleanDock && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            right: '0px',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            zIndex: 40
          }}
        >
          <EdgeToggle
            isExpanded={true}
            dockPosition={dockPosition}
            opacity={toggleOpacity}
            verticalPosition={verticalPosition}
            onToggle={onToggle}
            onUpdateVerticalPosition={onUpdateVerticalPosition}
          />
        </div>
      )}

      {/* Main Drawer Surface - Sticks completely flush against screen edge */}
      <div
        className="glass-surface"
        style={{
          width: `${drawerWidth}px`,
          maxWidth: `${drawerWidth}px`,
          minWidth: `${drawerWidth}px`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: isLeft
            ? '0 16px 16px 0'
            : isRight
              ? '16px 0 0 16px'
              : '0 0 16px 16px',
          borderLeft: isLeft ? 'none' : '1px solid var(--border-subtle)',
          borderRight: isRight ? 'none' : '1px solid var(--border-subtle)',
          borderTop: isTop ? 'none' : '1px solid var(--border-subtle)',
          borderBottom: isTop ? 'none' : '1px solid var(--border-subtle)',
          boxShadow: isRight
            ? '-8px 0 28px rgba(0, 0, 0, 0.45)'
            : isLeft
              ? '8px 0 28px rgba(0, 0, 0, 0.45)'
              : '0 8px 28px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--bg-dock)',
          flexShrink: 0
        }}
      >
        {/* Resize Handle Strip for Left/Right Dock */}
        {(isLeft || isRight) && (
          <div
            onMouseDown={handleMouseDownResize}
            title="Drag to resize dock width"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              right: isLeft ? 0 : undefined,
              left: isRight ? 0 : undefined,
              width: '6px',
              cursor: 'ew-resize',
              zIndex: 45,
              background: isResizing ? 'var(--accent)' : 'transparent',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={(e) => {
              if (!isResizing) e.currentTarget.style.background = 'var(--border-hover)';
            }}
            onMouseLeave={(e) => {
              if (!isResizing) e.currentTarget.style.background = 'transparent';
            }}
          />
        )}

        {/* Full-Window Death Note Background Artwork Layer */}
        {theme === 'deathnote' && (
          <div
            className="deathnote-bg-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {/* Main High-Res Wallpaper (Kira & L Divided with Chained Apple) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/deathnote/backgrounds/wallpaper_kira_l_divided.png')}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 12%',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(1.02) contrast(1.08)'
              }}
            />
            {/* Subtle atmospheric dark gradient for icon & footer legibility */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 50% 25%, rgba(0, 0, 0, 0.05) 0%, rgba(0, 0, 0, 0.45) 100%), linear-gradient(180deg, rgba(8, 8, 8, 0.3) 0%, transparent 35%, rgba(8, 8, 8, 0.55) 100%)',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}

        {/* Full-Window Kawaii Pastel Cat Gamer Nook Background Layer */}
        {theme === 'kawaii' && (
          <div
            className="kawaii-bg-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {/* Main High-Res Pastel Cat Gamer Nook Wallpaper */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/kawaii/wallpaper_kawaii_nook.png')}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                backgroundRepeat: 'no-repeat',
                filter: 'contrast(1.02) saturate(1.04)'
              }}
            />
            {/* Soft dreamy vignette to preserve pastel tones while aiding text contrast */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(255, 235, 245, 0.22) 0%, rgba(255, 255, 255, 0.06) 40%, rgba(255, 225, 240, 0.32) 100%)',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}

        {/* Full-Window Celestial Aether Sky & Clouds Background Artwork Layer */}
        {theme === 'aether' && (
          <div
            className="aether-bg-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {/* Main High-Res Celestial Sky Wallpaper */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/aether/wallpaper_aether_sky.jpg')}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                opacity: 0.98,
                filter: 'contrast(1.02) saturate(1.05)'
              }}
            />
            {/* Luminous Heavenly Sky Ambient Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(89, 188, 244, 0.12) 0%, rgba(255, 255, 255, 0.05) 50%, rgba(220, 240, 255, 0.25) 100%)',
                pointerEvents: 'none'
              }}
            />
          </div>
        )}

        {/* Full-Window Cinematic Elden Ring Atmospheric Background Layer (Rotating 4 Wallpapers every 30s) */}
        {theme === 'eldenring' && (
          <div
            className="eldenring-bg-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {/* 4 Background Artworks rotating every 30 seconds with smooth cross-fade */}
            {ELDEN_RING_BACKGROUNDS.map((bgUrl, idx) => (
              <div
                key={bgUrl}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url('${getAssetUrl(bgUrl)}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'contrast(1.04) brightness(0.97) saturate(1.08)',
                  imageRendering: '-webkit-optimize-contrast',
                  opacity: eldenBgIndex === idx ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  zIndex: 0
                }}
              />
            ))}
            {/* Atmospheric Mist Texture */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/eldenring/textures/cloud_mist_texture.png')}')`,
                backgroundSize: '280px',
                backgroundRepeat: 'repeat',
                opacity: 0.03,
                mixBlendMode: 'screen',
                zIndex: 1
              }}
            />
            {/* Subtle Drifting Golden Embers */}
            <div
              className="eldenring-embers-drift"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/eldenring/textures/embers_texture.png')}')`,
                backgroundSize: '240px',
                opacity: 0.10,
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
            {/* Subtle Translucent Overlay for High Contrast & Text Readability without Clouding Background */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(8, 10, 9, 0.22) 0%, rgba(12, 14, 11, 0.14) 45%, rgba(8, 10, 9, 0.38) 100%)',
                pointerEvents: 'none',
                zIndex: 3
              }}
            />
            {/* Soft Edge Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.50)',
                pointerEvents: 'none',
                zIndex: 4
              }}
            />
          </div>
        )}

        {/* Full-Window Grand Line One Piece Cinematic Atmospheric Background Layer (Rotating Wallpapers every 30s) */}
        {theme === 'onepiece' && (
          <div
            className="onepiece-bg-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {/* Grand Line Pirate Ships & Ocean Wallpapers rotating every 30 seconds */}
            {ONE_PIECE_BACKGROUNDS.map((bgUrl, idx) => (
              <div
                key={bgUrl}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url('${getAssetUrl(bgUrl)}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'contrast(1.02) brightness(0.98) saturate(1.06)',
                  opacity: onePieceBgIndex === idx ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  zIndex: 0
                }}
              />
            ))}
            {/* Cinematic Anime Film Grain Noise Overlay */}
            <div
              className="onepiece-noise-layer"
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/onepiece/textures/noise_texture.png')}')`,
                backgroundSize: '180px',
                backgroundRepeat: 'repeat',
                opacity: 0.14,
                mixBlendMode: 'overlay',
                pointerEvents: 'none',
                zIndex: 1
              }}
            />
            {/* Subtle Nautical Translucent Overlay for Crisp Legibility without Dulling the Artwork */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(14, 20, 27, 0.16) 0%, rgba(20, 28, 38, 0.08) 45%, rgba(14, 20, 27, 0.26) 100%)',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
            {/* Soft Edge Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 35px rgba(0, 0, 0, 0.45)',
                pointerEvents: 'none',
                zIndex: 3
              }}
            />
          </div>
        )}

        {/* Full-Window Fairy Tale Candy Land Atmospheric Background Layer (Rotating 4 Wallpapers every 30s) */}
        {theme === 'candy' && (
          <div
            className="candy-bg-layer"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 0,
              pointerEvents: 'none',
              overflow: 'hidden'
            }}
          >
            {/* 4 Whimsical Candy Land Sugar Kingdom Wallpapers rotating every 30 seconds */}
            {CANDY_BACKGROUNDS.map((bgUrl, idx) => (
              <div
                key={bgUrl}
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundImage: `url('${getAssetUrl(bgUrl)}')`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  backgroundRepeat: 'no-repeat',
                  filter: 'contrast(1.05) brightness(0.98) saturate(1.15)',
                  opacity: candyBgIndex === idx ? 1 : 0,
                  transition: 'opacity 1.5s ease-in-out',
                  zIndex: 0
                }}
              />
            ))}
            {/* Soft Pastel Sugar Glaze Texture Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url('${getAssetUrl('/candy/textures/candy_sky_texture.png')}')`,
                backgroundSize: '360px',
                backgroundRepeat: 'repeat',
                opacity: 0.06,
                mixBlendMode: 'soft-light',
                zIndex: 1
              }}
            />
            {/* Translucent Strawberry Cream Contrast Overlay */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(255, 240, 245, 0.28) 0%, rgba(255, 228, 237, 0.18) 45%, rgba(255, 240, 245, 0.42) 100%)',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />
            {/* Soft Edge Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                boxShadow: 'inset 0 0 70px rgba(244, 114, 182, 0.35)',
                pointerEvents: 'none',
                zIndex: 3
              }}
            />
          </div>
        )}

        {/* Top Header Bar: Clean & Minimal (Group Title + Search + Close) - Hidden in Clean Dock mode */}
        {!isCleanDock && (
        <header
          style={{
            position: 'relative',
            zIndex: 15,
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-header)'
          }}
        >
          {/* Active Category Title */}
          {theme === 'eldenring' ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                height: '34px',
                minWidth: 0,
                flex: '1 1 auto',
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  height: '30px',
                  padding: '0 10px 0 6px',
                  background: 'rgba(23, 24, 19, 0.85)',
                  borderRadius: '4px',
                  border: '1px solid rgba(197, 161, 90, 0.45)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.6)'
                }}
              >
                <img
                  src={getAssetUrl('/eldenring/misc/runestone_icon.png')}
                  alt="Rune Stone"
                  style={{
                    width: '18px',
                    height: '18px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 6px rgba(234, 196, 119, 0.8))'
                  }}
                />
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#EAC477',
                    letterSpacing: '1px',
                    fontFamily: 'var(--font-fantasy)',
                    textShadow: '0 0 10px rgba(197, 161, 90, 0.65)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {activeGroupName}
                </span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
              {theme === 'candy' && (
                <img
                  src={getAssetUrl('/candy/decorations/cute_cat_header.png')}
                  alt="Candy Cat"
                  style={{
                    width: '24px',
                    height: '21px',
                    objectFit: 'contain',
                    flexShrink: 0,
                    filter: 'drop-shadow(0 2px 4px rgba(244, 114, 182, 0.4))'
                  }}
                  title="Sweet Candy Cat"
                />
              )}
              <span
                style={{
                  fontSize: theme === 'onepiece' ? '20px' : '13px',
                  fontWeight: theme === 'onepiece' || theme === 'candy' ? 700 : 600,
                  color: theme === 'onepiece' ? '#f59e0b' : theme === 'candy' ? '#db2777' : 'var(--text-primary)',
                  letterSpacing: theme === 'deathnote' ? '0.5px' : theme === 'onepiece' ? '1.5px' : '-0.2px',
                  fontFamily: theme === 'deathnote' ? 'var(--font-gothic)' : theme === 'onepiece' ? 'var(--font-onepiece)' : undefined,
                  textShadow: theme === 'onepiece' ? '0 0 10px rgba(245, 158, 11, 0.55)' : theme === 'candy' ? '0 1px 3px rgba(255, 255, 255, 0.9), 0 0 10px rgba(244, 114, 182, 0.6)' : undefined,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: theme === 'deathnote' ? 'calc(50% - 85px)' : theme === 'onepiece' ? '220px' : '190px'
                }}
              >
                {activeGroupName}
              </span>
              {theme === 'kawaii' && (
                <img
                  src={getAssetUrl('/stickers/rocket_ship.png')}
                  alt="Rocket"
                  style={{ width: '20px', height: '20px', objectFit: 'contain', animation: 'kawaiiStickerDrift 3s ease-in-out infinite' }}
                  title="Antigravity Rocket"
                />
              )}
              {theme === 'aether' && (
                <img
                  src={getAssetUrl('/aether/sword.png')}
                  alt="Sword"
                  style={{ width: '18px', height: '18px', objectFit: 'contain', imageRendering: 'pixelated', transform: 'rotate(15deg)' }}
                  title="Aether Sword"
                />
              )}
            </div>
          )}

          {/* Death Note Theme: Centered Death Note Title in Top Bar */}
          {theme === 'deathnote' && (
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                zIndex: 2
              }}
            >
              <img
                src={getAssetUrl('/deathnote/icons/title_deathnote_white.png')}
                alt="Death Note"
                style={{
                  height: drawerWidth < 310 ? '24px' : '28px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 0 10px rgba(163, 38, 45, 0.85)) drop-shadow(0 2px 4px rgba(0, 0, 0, 0.95))',
                  userSelect: 'none'
                }}
              />
            </div>
          )}

          {/* Quick Header Actions: Search, Hide to Tray, Close */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              ...(theme === 'eldenring' ? {
                padding: '2px 4px',
                borderRadius: '4px',
                background: 'rgba(17, 19, 16, 0.75)',
                border: '1px solid rgba(197, 161, 90, 0.35)',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)'
              } : {})
            }}
          >
            <button
              onClick={onOpenSearch}
              className="btn-dock"
              title="Search (Ctrl+F)"
              aria-label="Search"
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme === 'kawaii' || theme === 'candy' ? '10px' : theme === 'aether' || theme === 'eldenring' || theme === 'onepiece' ? '4px' : '6px',
                background: theme === 'kawaii' ? '#cbf3f0' : theme === 'candy' ? '#fff0f5' : theme === 'aether' ? '#f5cf47' : theme === 'deathnote' ? 'rgba(18, 18, 18, 0.9)' : theme === 'eldenring' || theme === 'onepiece' ? 'transparent' : undefined,
                border: theme === 'candy' ? '1.5px solid #fbcfe8' : theme === 'aether' ? '1px solid #734e2c' : theme === 'deathnote' ? '1px solid rgba(163, 38, 45, 0.6)' : theme === 'eldenring' || theme === 'onepiece' ? 'none' : undefined,
                boxShadow: theme === 'candy'
                  ? '0 2px 6px rgba(244, 114, 182, 0.35), inset 0 1px 0 #fff'
                  : theme === 'aether'
                    ? 'inset -1px -1px 0 #947214, inset 1px 1px 0 #fff'
                    : theme === 'deathnote'
                      ? '0 0 8px rgba(163, 38, 45, 0.25)'
                      : theme === 'eldenring' || theme === 'onepiece'
                        ? 'none'
                        : undefined,
                color: theme === 'kawaii' || theme === 'candy' ? '#db2777' : theme === 'deathnote' ? '#eae6df' : theme === 'eldenring' ? '#EAC477' : theme === 'onepiece' ? '#f59e0b' : undefined
              }}
            >
              {theme === 'aether' ? (
                <img
                  src={getAssetUrl('/aether/search_gold.png')}
                  alt="Search"
                  style={{ width: '20px', height: '20px', objectFit: 'contain', imageRendering: 'pixelated' }}
                />
              ) : theme === 'eldenring' ? (
                <img
                  src={getAssetUrl('/eldenring/header/header_control_search.png')}
                  alt="Search"
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                />
              ) : theme === 'onepiece' ? (
                <img
                  src={getAssetUrl('/onepiece/icons/search.png')}
                  alt="Search"
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                />
              ) : (
                <Search size={14} color={theme === 'candy' ? '#db2777' : undefined} />
              )}
            </button>

            {/* Maximize / Restore button */}
            <button
              onClick={() => {
                if (onToggleMaximize) {
                  onToggleMaximize();
                }
              }}
              className="btn-dock"
              title={isMaximized ? "Restore Dock Size" : "Maximize Dock (460px x Full Height)"}
              aria-label={isMaximized ? "Restore Dock" : "Maximize Dock"}
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme === 'kawaii' || theme === 'candy' ? '10px' : theme === 'aether' || theme === 'eldenring' || theme === 'onepiece' ? '4px' : '6px',
                background: theme === 'kawaii' ? '#d8e2dc' : theme === 'candy' ? '#fff0f5' : theme === 'aether' ? '#59bcf4' : theme === 'deathnote' ? 'rgba(18, 18, 18, 0.9)' : theme === 'eldenring' || theme === 'onepiece' ? 'transparent' : undefined,
                border: theme === 'candy' ? '1.5px solid #fbcfe8' : theme === 'aether' ? '1px solid #236c9e' : theme === 'deathnote' ? '1px solid rgba(163, 38, 45, 0.6)' : theme === 'eldenring' || theme === 'onepiece' ? 'none' : undefined,
                boxShadow: theme === 'candy'
                  ? '0 2px 6px rgba(244, 114, 182, 0.35), inset 0 1px 0 #fff'
                  : theme === 'aether'
                    ? 'inset -1px -1px 0 #1b537a, inset 1px 1px 0 #b3e3ff'
                    : theme === 'deathnote'
                      ? '0 0 8px rgba(163, 38, 45, 0.25)'
                      : theme === 'eldenring' || theme === 'onepiece'
                        ? 'none'
                        : undefined,
                color: theme === 'kawaii' || theme === 'candy' ? '#db2777' : theme === 'deathnote' ? '#eae6df' : theme === 'eldenring' ? '#EAC477' : theme === 'onepiece' ? '#f59e0b' : undefined
              }}
            >
              {theme === 'eldenring' ? (
                <img
                  src={getAssetUrl('/eldenring/header/header_control_expand.png')}
                  alt="Expand"
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                />
              ) : theme === 'onepiece' ? (
                <img
                  src={getAssetUrl('/onepiece/icons/expand.png')}
                  alt="Expand"
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                />
              ) : isMaximized ? (
                <Minimize2 size={13} color={theme === 'candy' ? '#db2777' : undefined} />
              ) : (
                <Maximize2 size={13} color={theme === 'candy' ? '#db2777' : undefined} />
              )}
            </button>

            <button
              onClick={onToggle}
              className="btn-dock"
              title="Collapse (Esc)"
              aria-label="Collapse"
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme === 'kawaii' || theme === 'candy' ? '10px' : theme === 'aether' || theme === 'eldenring' || theme === 'onepiece' ? '4px' : '6px',
                background: theme === 'kawaii' ? '#ffccd5' : theme === 'candy' ? '#fff0f5' : theme === 'aether' ? '#4db5ff' : theme === 'deathnote' ? 'rgba(18, 18, 18, 0.9)' : theme === 'eldenring' || theme === 'onepiece' ? 'transparent' : undefined,
                border: theme === 'candy' ? '1.5px solid #fbcfe8' : theme === 'aether' ? '1px solid #236c9e' : theme === 'deathnote' ? '1px solid rgba(163, 38, 45, 0.6)' : theme === 'eldenring' || theme === 'onepiece' ? 'none' : undefined,
                boxShadow: theme === 'candy'
                  ? '0 2px 6px rgba(244, 114, 182, 0.35), inset 0 1px 0 #fff'
                  : theme === 'aether'
                    ? 'inset -1px -1px 0 #1b537a, inset 1px 1px 0 #b3e3ff'
                    : theme === 'deathnote'
                      ? '0 0 8px rgba(163, 38, 45, 0.25)'
                      : theme === 'eldenring' || theme === 'onepiece'
                        ? 'none'
                        : undefined,
                color: theme === 'kawaii' || theme === 'candy' ? '#db2777' : theme === 'deathnote' ? '#eae6df' : theme === 'eldenring' ? '#EAC477' : theme === 'onepiece' ? '#f59e0b' : undefined
              }}
            >
              {theme === 'aether' ? (
                <img
                  src={getAssetUrl('/aether/close_red.png')}
                  alt="Close"
                  style={{ width: '20px', height: '20px', objectFit: 'contain', imageRendering: 'pixelated' }}
                />
              ) : theme === 'eldenring' ? (
                <img
                  src={getAssetUrl('/eldenring/header/header_control_close.png')}
                  alt="Close"
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                />
              ) : theme === 'onepiece' ? (
                <img
                  src={getAssetUrl('/onepiece/icons/close.png')}
                  alt="Close"
                  style={{ width: '26px', height: '26px', objectFit: 'contain' }}
                />
              ) : (
                <X size={15} color={theme === 'candy' ? '#db2777' : undefined} />
              )}
            </button>
          </div>
        </header>
        )}

        {/* Content Body */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', zIndex: 1 }}>
          {children}
        </div>

        {/* Bottom Footer Action Bar: Settings button or tiny x bar in Clean Dock */}
        {isCleanDock ? (
          <div
            style={{
              padding: '6px 8px 8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              flexShrink: 0,
              position: 'relative',
              zIndex: 20
            }}
          >
            <button
              onClick={onExitCleanDock}
              title="Exit Clean Dock & return to Main UI"
              aria-label="Return to Main UI"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                background: theme === 'deathnote'
                  ? 'rgba(18, 18, 18, 0.92)'
                  : theme === 'aether'
                    ? 'rgba(77, 181, 255, 0.3)'
                    : theme === 'kawaii'
                      ? 'rgba(255, 204, 213, 0.6)'
                      : 'rgba(255, 255, 255, 0.1)',
                border: theme === 'deathnote'
                  ? '1px solid rgba(163, 38, 45, 0.6)'
                  : theme === 'aether'
                    ? '1px solid rgba(179, 227, 255, 0.5)'
                    : theme === 'kawaii'
                      ? '1px solid rgba(255, 180, 200, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.18)',
                color: theme === 'deathnote'
                  ? '#eae6df'
                  : theme === 'aether'
                    ? '#ffdf59'
                    : 'var(--text-secondary)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.6px',
                cursor: 'pointer',
                transition: 'all 0.18s ease',
                backdropFilter: 'blur(10px)',
                boxShadow: theme === 'deathnote'
                  ? '0 0 10px rgba(163, 38, 45, 0.3)'
                  : theme === 'aether'
                    ? '0 2px 6px rgba(0, 0, 0, 0.2)'
                    : '0 2px 8px rgba(0, 0, 0, 0.25)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.06)';
                e.currentTarget.style.borderColor = theme === 'deathnote' ? '#c41e24' : 'var(--text-primary)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.borderColor = theme === 'deathnote' ? 'rgba(163, 38, 45, 0.6)' : 'rgba(255, 255, 255, 0.18)';
                e.currentTarget.style.color = theme === 'deathnote' ? '#eae6df' : theme === 'aether' ? '#ffdf59' : 'var(--text-secondary)';
              }}
            >
              <X size={11} strokeWidth={2.5} />
              <span>MAIN UI</span>
            </button>
          </div>
        ) : (
        <footer
          style={{
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--bg-footer)',
            height: '38px',
            flexShrink: 0,
            position: 'relative',
            zIndex: 2
          }}
        >
          {theme === 'eldenring' ? (
            <button
              onClick={onOpenSettings}
              className="btn-dock eldenring-settings-btn"
              title="Settings & Appearance"
              aria-label="Settings"
              style={{
                height: '28px',
                padding: 0,
                background: 'transparent',
                border: 'none',
                boxShadow: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
            >
              <img
                src={getAssetUrl('/eldenring/misc/settings_button.png')}
                alt="Settings"
                style={{
                  height: '26px',
                  width: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.7))'
                }}
              />
            </button>
          ) : (
            <button
              onClick={onOpenSettings}
              className="btn-dock"
              title="Settings & Appearance"
              aria-label="Settings"
              style={{
                height: '28px',
                padding: theme === 'aether' ? '0 8px' : '0 10px',
                borderRadius: theme === 'kawaii' || theme === 'candy' ? '14px' : theme === 'aether' || theme === 'onepiece' ? '4px' : '6px',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: theme === 'deathnote' ? 'var(--font-gothic)' : theme === 'onepiece' ? 'var(--font-fantasy)' : undefined,
                letterSpacing: theme === 'onepiece' ? '0.8px' : undefined,
                background: theme === 'kawaii' || theme === 'candy'
                  ? '#fff0f5'
                  : theme === 'aether'
                    ? '#5c3e23'
                    : theme === 'deathnote'
                      ? 'rgba(18, 18, 18, 0.92)'
                      : theme === 'onepiece'
                        ? 'rgba(33, 25, 20, 0.95)'
                        : undefined,
                borderColor: theme === 'kawaii'
                  ? '#ffccd5'
                  : theme === 'candy'
                    ? '#f472b6'
                    : theme === 'aether'
                      ? '#8c6038'
                      : theme === 'deathnote'
                        ? '#a3262d'
                        : theme === 'onepiece'
                          ? 'rgba(245, 158, 11, 0.45)'
                          : undefined,
                color: theme === 'kawaii'
                  ? '#2d1e4e'
                  : theme === 'candy'
                    ? '#be185d'
                    : theme === 'aether'
                      ? '#ffdf59'
                      : theme === 'deathnote'
                        ? '#eae6df'
                        : theme === 'onepiece'
                          ? '#f59e0b'
                          : undefined,
                boxShadow: theme === 'kawaii' || theme === 'candy'
                  ? '0 2px 8px rgba(255, 180, 200, 0.4)'
                  : theme === 'aether'
                    ? 'inset -1px -1px 0 #2e1c0d, inset 1px 1px 0 #8c6038, 0 2px 4px rgba(0,0,0,0.15)'
                    : theme === 'deathnote'
                      ? '0 0 10px rgba(163, 38, 45, 0.4), inset 0 0 6px rgba(163, 38, 45, 0.15)'
                      : theme === 'onepiece'
                        ? '0 2px 8px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(245, 158, 11, 0.2)'
                        : undefined,
                textShadow: theme === 'aether' ? '1px 1px 0 #181005' : theme === 'onepiece' ? '0 0 6px rgba(245, 158, 11, 0.4)' : theme === 'candy' ? '0 0 6px rgba(244, 114, 182, 0.45)' : undefined
              }}
            >
              {theme === 'kawaii' ? (
                <img
                  src={getAssetUrl('/stickers/swirl_galaxy.png')}
                  alt="Galaxy"
                  style={{ width: '18px', height: '18px', objectFit: 'contain', animation: 'galaxySpin 8s linear infinite' }}
                />
              ) : theme === 'aether' ? (
                <img
                  src={getAssetUrl('/aether/crystal.png')}
                  alt="Aether Gem"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', imageRendering: 'pixelated', filter: 'drop-shadow(0 0 3px #4db5ff)' }}
                />
              ) : theme === 'onepiece' ? (
                <img
                  src={getAssetUrl('/onepiece/icons/settings.png')}
                  alt="Settings"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'drop-shadow(0 0 3px rgba(245, 158, 11, 0.5))' }}
                />
              ) : theme === 'candy' ? (
                <img
                  src={getAssetUrl('/candy/icons/settings.png')}
                  alt="Candy Settings"
                  style={{ width: '16px', height: '16px', objectFit: 'contain', filter: 'drop-shadow(0 0 3px rgba(244, 114, 182, 0.6))' }}
                />
              ) : (
                <Settings size={13} color={theme === 'deathnote' ? '#e05a61' : undefined} />
              )}
              <span>Settings {(theme === 'kawaii' || theme === 'candy') && '🌸'}</span>
            </button>
          )}

          {theme === 'kawaii' && (
            <img
              src={getAssetUrl('/stickers/star_helmet.png')}
              alt="Astro Star"
              style={{
                width: '24px',
                height: '24px',
                objectFit: 'contain',
                cursor: 'pointer',
                animation: 'kawaiiStickerDrift 4s ease-in-out infinite alternate',
                filter: 'drop-shadow(0 2px 6px rgba(255, 200, 100, 0.45))'
              }}
              title="Astro Star Sticker"
            />
          )}

          {theme === 'eldenring' && (
            <img
              src={getAssetUrl('/eldenring/misc/decorative_rune_site_of_grace.png')}
              alt="Site of Grace"
              style={{
                height: '26px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 8px rgba(234, 196, 119, 0.85))',
                cursor: 'pointer'
              }}
              title="Site of Grace"
            />
          )}

          {theme === 'onepiece' && (
            <img
              src={getAssetUrl('/onepiece/icons/pirate_skull_logo.png')}
              alt="Pirate Skull"
              style={{
                height: '26px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.6))',
                cursor: 'pointer'
              }}
              title="Straw Hat Pirate Skull"
            />
          )}

          {theme === 'candy' && (
            <img
              src={getAssetUrl('/candy/decorations/lollipop_candy.png')}
              alt="Lollipop"
              style={{
                height: '24px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.65))',
                cursor: 'pointer'
              }}
              title="Sweet Candy Land"
            />
          )}
        </footer>
        )}
      </div>

      {/* Left dock layout: Main Drawer -> Companion Area sticking to Main Drawer (Hidden in Clean Dock mode) */}
      {isLeft && !isCleanDock && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
            height: '100%',
            width: `${companionW}px`,
            flexShrink: 0,
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Anchor Column — always flush against Main Drawer at left edge of companion area */}
          <div
            style={{
              width: '48px',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              paddingTop: '8px',
              position: 'relative',
              flexShrink: 0,
              zIndex: 2
            }}
          >
            {/* Small Handles Hub Box sticking directly to the main UI at the top */}
            <ConnectorHub
              dockPosition={dockPosition}
              isExpanded={isExpanded}
              activeModule={activeModule}
              onSelectModule={onSelectModule}
              theme={theme}
            />

            {/* Main Handle (EdgeToggle) stays visible when opened, sticking to Drawer at vertical center */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '0px',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                zIndex: 40
              }}
            >
              <EdgeToggle
                isExpanded={true}
                dockPosition={dockPosition}
                opacity={toggleOpacity}
                verticalPosition={verticalPosition}
                onToggle={onToggle}
                onUpdateVerticalPosition={onUpdateVerticalPosition}
              />
            </div>
          </div>

          {/* Active Companion Module (Music / Weather / Calendar) — animates in/out within the fixed 340px space */}
          {renderedModule && companionContent && (
            <div
              key={renderedModule}
              className={isExiting ? 'hub-module-exit-left' : 'hub-module-enter-left'}
              style={{
                position: 'absolute',
                top: 0,
                left: '52px',
                right: 0,
                bottom: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'visible',
                zIndex: 1
              }}
            >
              <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                {companionContent}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edge Handle for Left dock when in Clean Dock mode */}
      {isLeft && isCleanDock && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '0px',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            flexShrink: 0,
            zIndex: 40
          }}
        >
          <EdgeToggle
            isExpanded={true}
            dockPosition={dockPosition}
            opacity={toggleOpacity}
            verticalPosition={verticalPosition}
            onToggle={onToggle}
            onUpdateVerticalPosition={onUpdateVerticalPosition}
          />
        </div>
      )}

      {/* Top dock tab at bottom */}
      {isTop && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px' }}>
            <ConnectorHub
              dockPosition={dockPosition}
              isExpanded={isExpanded}
              activeModule={activeModule}
              onSelectModule={onSelectModule}
              theme={theme}
            />
            <EdgeToggle
              isExpanded={true}
              dockPosition={dockPosition}
              opacity={toggleOpacity}
              onToggle={onToggle}
            />
          </div>
          {activeModule && companionContent && (
            <div style={{ display: 'flex', marginTop: '12px', justifyContent: 'center' }}>{companionContent}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default DockFrame;
