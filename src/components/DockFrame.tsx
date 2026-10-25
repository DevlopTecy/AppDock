import React from 'react';
import { DockPosition, CompanionModuleType, DockTheme } from '../types/dock';
import { EdgeToggle } from './EdgeToggle';
import { ConnectorHub } from './connectors/ConnectorHub';
import { Search, Settings, X, Minimize2 } from 'lucide-react';

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
}

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
  companionContent,
  onToggle,
  onOpenSearch,
  onOpenAdd: _onOpenAdd,
  onOpenSettings,
  onResizeWidth,
  verticalPosition = 0.5,
  onUpdateVerticalPosition,
  children,
  isCleanDock = false,
  onExitCleanDock
}) => {
  const [isResizing, setIsResizing] = React.useState(false);
  const [renderedModule, setRenderedModule] = React.useState<CompanionModuleType>(activeModule);
  const [isExiting, setIsExiting] = React.useState(false);
  const exitTimerRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (activeModule) {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setRenderedModule(activeModule);
      setIsExiting(false);
    } else if (renderedModule) {
      setIsExiting(true);
      exitTimerRef.current = window.setTimeout(() => {
        setRenderedModule(null);
        setIsExiting(false);
        exitTimerRef.current = null;
        if (typeof window !== 'undefined' && (window as any).appDock?.setModuleWidth) {
          (window as any).appDock.setModuleWidth(54);
        }
      }, 200);
    }
    return () => {
      if (exitTimerRef.current) {
        clearTimeout(exitTimerRef.current);
      }
    };
  }, [activeModule]);

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

  // If not expanded, render ONLY the edge handle
  if (!isExpanded) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
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
    );
  }

  const companionW = isCleanDock ? 0 : ((activeModule || isExiting) ? 340 : 54);
  const totalExpandedWidth = drawerWidth + companionW;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isTop ? 'column' : 'row',
        alignItems: 'flex-start',
        justifyContent: isRight ? 'flex-end' : isLeft ? 'flex-start' : 'center',
        width: '100%',
        minWidth: isTop ? undefined : `${totalExpandedWidth}px`,
        maxWidth: isTop ? `${drawerWidth + 340}px` : `${totalExpandedWidth}px`,
        height: '100%',
        position: 'relative',
        overflow: 'visible',
        marginLeft: 0,
        marginRight: 0,
        marginBottom: isTop ? 'auto' : 0,
        marginTop: 0
      }}
    >
      {/* Right dock layout: Companion Area sticking directly to Main Drawer (Hidden in Clean Dock mode) */}
      {isRight && !isCleanDock && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'flex-start',
            justifyContent: 'flex-end',
            gap: '8px',
            height: '100%',
            width: (activeModule || isExiting) ? '340px' : '54px',
            flexShrink: 0,
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* Active Companion Module (Music / Weather / Calendar) */}
          {renderedModule && companionContent && (
            <div
              className={
                theme === 'deathnote'
                  ? `deathnote-book-wrapper ${isExiting ? 'is-exiting' : 'is-entering'}`
                  : (isExiting ? 'hub-module-exit-right' : 'hub-module-enter-right')
              }
              style={{
                width: '280px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'visible',
                perspective: '1200px',
                position: 'relative'
              }}
            >
              {theme === 'deathnote' && (
                <div
                  className={`deathnote-book-cover ${isExiting ? 'cover-close-right' : 'cover-open-right'}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 30,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="deathnote-cover-spine spine-right" />
                  <div className="deathnote-cover-inner">
                    <img
                      src="/deathnote/icons/logo_deathnote_white.png"
                      alt="Death Note"
                      className="deathnote-cover-logo"
                    />
                    <div className="deathnote-cover-shinigami">
                      <span style={{ fontFamily: 'var(--font-gothic)', fontSize: '24px', color: '#c41e24', textShadow: '0 0 10px rgba(196, 30, 36, 0.8)' }}>
                        †
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div
                className={theme === 'deathnote' ? `deathnote-book-pages ${isExiting ? 'pages-exit' : 'pages-enter'}` : undefined}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                {companionContent}
              </div>
            </div>
          )}

          {/* Anchor Column sticking directly flush against Main Drawer */}
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
              flexShrink: 0
            }}
          >
            {/* Small Handles Hub Box sticking directly to the main UI at the top */}
            <ConnectorHub
              dockPosition={dockPosition}
              isExpanded={isExpanded}
              activeModule={activeModule}
              onSelectModule={onSelectModule}
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
          boxShadow: 'var(--shadow-dock)',
          overflow: 'hidden',
          position: 'relative',
          background: 'var(--bg-dock)',
          transition: isResizing ? 'none' : 'width 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
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
            {/* Main High-Res Wallpaper (Ryuk with Glowing Red Eyes & Apple) */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: "url('/deathnote/backgrounds/wallpaper_main_2.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center 20%',
                backgroundRepeat: 'no-repeat',
                filter: 'brightness(1.12) contrast(1.15) saturate(1.12)'
              }}
            />
            {/* Pattern Overlay 1: Dark Slate & Leather Grain */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: "url('/deathnote/textures/texture_dark_1.jpg')",
                backgroundRepeat: 'repeat',
                opacity: 0.16,
                mixBlendMode: 'overlay',
                pointerEvents: 'none'
              }}
            />
            {/* Pattern Overlay 2: Ink Grunge Wash */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: "url('/deathnote/textures/texture_ink.jpg')",
                backgroundSize: 'cover',
                opacity: 0.12,
                mixBlendMode: 'color-dodge',
                pointerEvents: 'none'
              }}
            />
            {/* Atmospheric Manga Ink & Parchment Vignette */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 50% 25%, rgba(8, 8, 8, 0.12) 0%, rgba(8, 8, 8, 0.58) 100%), linear-gradient(180deg, rgba(8, 8, 8, 0.42) 0%, rgba(13, 13, 13, 0.05) 35%, rgba(8, 8, 8, 0.65) 100%)',
                pointerEvents: 'none'
              }}
            />
            {/* Decorative Element 1: Dark Crimson Blood Splatter in Top Corner */}
            <img
              src="/deathnote/decorations/blood_splatter.png"
              alt="Blood Splatter"
              style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                width: '135px',
                opacity: 0.55,
                pointerEvents: 'none',
                mixBlendMode: 'screen'
              }}
            />
            {/* Decorative Element 2: Ryuk Shinigami Feather in Bottom Left */}
            <img
              src="/deathnote/decorations/feather.png"
              alt="Ryuk Feather"
              style={{
                position: 'absolute',
                bottom: '48px',
                left: '12px',
                width: '44px',
                opacity: 0.85,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.85))'
              }}
            />
            {/* Decorative Element 3: Ryuk Winged Silhouette */}
            <img
              src="/deathnote/decorations/ryuk_silhouette.png"
              alt="Ryuk Silhouette"
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: '85px',
                opacity: 0.35,
                pointerEvents: 'none',
                filter: 'drop-shadow(0 0 10px rgba(163, 38, 45, 0.4))'
              }}
            />
            {/* Subtle bottom crimson ambient lighting */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '90px',
                background: 'linear-gradient(to top, rgba(163, 38, 45, 0.18) 0%, transparent 100%)',
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
                backgroundImage: "url('/aether/wallpaper_aether_sky.jpg')",
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                backgroundRepeat: 'no-repeat',
                opacity: 0.96,
                filter: 'contrast(1.04) saturate(1.08)'
              }}
            />
            {/* Luminous Heavenly Sky Ambient Gradient */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(180deg, rgba(89, 188, 244, 0.22) 0%, rgba(220, 240, 252, 0.08) 45%, rgba(240, 248, 255, 0.35) 85%, rgba(255, 255, 255, 0.6) 100%)',
                pointerEvents: 'none'
              }}
            />
            {/* Bottom Fluffy Cloud Bank */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '145px',
                backgroundImage: "url('/aether/clouds_bottom_bank.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center bottom',
                backgroundRepeat: 'no-repeat',
                opacity: 0.96,
                pointerEvents: 'none'
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0, flex: '1 1 auto', overflow: 'hidden' }}>
            <span
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                letterSpacing: theme === 'deathnote' ? '0.5px' : '-0.2px',
                fontFamily: theme === 'deathnote' ? 'var(--font-gothic)' : undefined,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '190px'
              }}
            >
              {activeGroupName}
            </span>
            {theme === 'kawaii' && (
              <img
                src="/stickers/rocket_ship.png"
                alt="Rocket"
                style={{ width: '20px', height: '20px', objectFit: 'contain', animation: 'kawaiiStickerDrift 3s ease-in-out infinite' }}
                title="Antigravity Rocket"
              />
            )}
            {theme === 'aether' && (
              <img
                src="/aether/sword.png"
                alt="Sword"
                style={{ width: '18px', height: '18px', objectFit: 'contain', imageRendering: 'pixelated', transform: 'rotate(15deg)' }}
                title="Aether Sword"
              />
            )}
            {theme === 'deathnote' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <img
                  src="/deathnote/icons/logo_deathnote_white.png"
                  alt="Death Note"
                  style={{ height: '13px', objectFit: 'contain', opacity: 0.9 }}
                />
                <img
                  src="/deathnote/decorations/apple.png"
                  alt="Shinigami Apple"
                  style={{
                    width: '20px',
                    height: '20px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 0 8px rgba(220, 38, 38, 0.95))'
                  }}
                  title="Shinigami Apple (Death Note)"
                />
              </div>
            )}
          </div>

          {/* Quick Header Actions: Search, Hide to Tray, Close */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
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
                borderRadius: theme === 'kawaii' ? '10px' : theme === 'aether' ? '4px' : '6px',
                background: theme === 'kawaii' ? '#cbf3f0' : theme === 'aether' ? '#f5cf47' : theme === 'deathnote' ? 'rgba(18, 18, 18, 0.9)' : undefined,
                border: theme === 'aether' ? '1px solid #734e2c' : theme === 'deathnote' ? '1px solid rgba(163, 38, 45, 0.6)' : undefined,
                boxShadow: theme === 'aether'
                  ? 'inset -1px -1px 0 #947214, inset 1px 1px 0 #fff'
                  : theme === 'deathnote'
                    ? '0 0 8px rgba(163, 38, 45, 0.25)'
                    : undefined,
                color: theme === 'kawaii' ? '#2d1e4e' : theme === 'deathnote' ? '#eae6df' : undefined
              }}
            >
              {theme === 'aether' ? (
                <img
                  src="/aether/search_gold.png"
                  alt="Search"
                  style={{ width: '20px', height: '20px', objectFit: 'contain', imageRendering: 'pixelated' }}
                />
              ) : (
                <Search size={14} />
              )}
            </button>

            {/* Hide to System Tray button */}
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).appDock?.hideToTray) {
                  (window as any).appDock.hideToTray();
                } else {
                  onToggle();
                }
              }}
              className="btn-dock"
              title="Hide from Taskbar (Stay in Tray & Screen Handle)"
              aria-label="Hide from Taskbar"
              style={{
                width: '28px',
                height: '28px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: theme === 'kawaii' ? '10px' : theme === 'aether' ? '4px' : '6px',
                background: theme === 'kawaii' ? '#d8e2dc' : theme === 'aether' ? '#59bcf4' : theme === 'deathnote' ? 'rgba(18, 18, 18, 0.9)' : undefined,
                border: theme === 'aether' ? '1px solid #236c9e' : theme === 'deathnote' ? '1px solid rgba(163, 38, 45, 0.6)' : undefined,
                boxShadow: theme === 'aether'
                  ? 'inset -1px -1px 0 #1b537a, inset 1px 1px 0 #b3e3ff'
                  : theme === 'deathnote'
                    ? '0 0 8px rgba(163, 38, 45, 0.25)'
                    : undefined,
                color: theme === 'kawaii' ? '#2d1e4e' : theme === 'deathnote' ? '#eae6df' : undefined
              }}
            >
              <Minimize2 size={13} />
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
                borderRadius: theme === 'kawaii' ? '10px' : theme === 'aether' ? '4px' : '6px',
                background: theme === 'kawaii' ? '#ffccd5' : theme === 'aether' ? '#4db5ff' : theme === 'deathnote' ? 'rgba(18, 18, 18, 0.9)' : undefined,
                border: theme === 'aether' ? '1px solid #236c9e' : theme === 'deathnote' ? '1px solid rgba(163, 38, 45, 0.6)' : undefined,
                boxShadow: theme === 'aether'
                  ? 'inset -1px -1px 0 #1b537a, inset 1px 1px 0 #b3e3ff'
                  : theme === 'deathnote'
                    ? '0 0 8px rgba(163, 38, 45, 0.25)'
                    : undefined,
                color: theme === 'kawaii' ? '#2d1e4e' : theme === 'deathnote' ? '#eae6df' : undefined
              }}
            >
              {theme === 'aether' ? (
                <img
                  src="/aether/close_red.png"
                  alt="Close"
                  style={{ width: '20px', height: '20px', objectFit: 'contain', imageRendering: 'pixelated' }}
                />
              ) : (
                <X size={15} />
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
          <button
            onClick={onOpenSettings}
            className="btn-dock"
            title="Settings & Appearance"
            aria-label="Settings"
            style={{
              height: '28px',
              padding: theme === 'aether' ? '0 8px' : '0 10px',
              borderRadius: theme === 'kawaii' ? '14px' : theme === 'aether' ? '4px' : '6px',
              gap: '6px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: theme === 'deathnote' ? 'var(--font-gothic)' : undefined,
              background: theme === 'kawaii'
                ? '#fff0f5'
                : theme === 'aether'
                  ? '#5c3e23'
                  : theme === 'deathnote'
                    ? 'rgba(18, 18, 18, 0.92)'
                    : undefined,
              borderColor: theme === 'kawaii'
                ? '#ffccd5'
                : theme === 'aether'
                  ? '#8c6038'
                  : theme === 'deathnote'
                    ? '#a3262d'
                    : undefined,
              color: theme === 'kawaii'
                ? '#2d1e4e'
                : theme === 'aether'
                  ? '#ffdf59'
                  : theme === 'deathnote'
                    ? '#eae6df'
                    : undefined,
              boxShadow: theme === 'kawaii'
                ? '0 2px 8px rgba(255, 180, 200, 0.4)'
                : theme === 'aether'
                  ? 'inset -1px -1px 0 #2e1c0d, inset 1px 1px 0 #8c6038, 0 2px 4px rgba(0,0,0,0.15)'
                  : theme === 'deathnote'
                    ? '0 0 10px rgba(163, 38, 45, 0.4), inset 0 0 6px rgba(163, 38, 45, 0.15)'
                    : undefined,
              textShadow: theme === 'aether' ? '1px 1px 0 #181005' : undefined
            }}
          >
            {theme === 'kawaii' ? (
              <img
                src="/stickers/swirl_galaxy.png"
                alt="Galaxy"
                style={{ width: '18px', height: '18px', objectFit: 'contain', animation: 'galaxySpin 8s linear infinite' }}
              />
            ) : theme === 'aether' ? (
              <img
                src="/aether/crystal.png"
                alt="Aether Gem"
                style={{ width: '16px', height: '16px', objectFit: 'contain', imageRendering: 'pixelated', filter: 'drop-shadow(0 0 3px #4db5ff)' }}
              />
            ) : (
              <Settings size={13} color={theme === 'deathnote' ? '#e05a61' : undefined} />
            )}
            <span>Settings {theme === 'kawaii' && '🌸'}</span>
          </button>

          {theme === 'kawaii' && (
            <img
              src="/stickers/star_helmet.png"
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

          {theme === 'aether' && (
            <img
              src="/aether/cloud.png"
              alt="Aether Cloud"
              style={{
                width: '28px',
                height: '20px',
                objectFit: 'contain',
                cursor: 'pointer',
                imageRendering: 'pixelated',
                animation: 'aetherDrift 4s ease-in-out infinite alternate',
                filter: 'drop-shadow(0 2px 5px rgba(89, 188, 244, 0.4))'
              }}
              title="Aether Cloud"
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
            gap: '8px',
            height: '100%',
            width: (activeModule || isExiting) ? '340px' : '54px',
            flexShrink: 0,
            overflow: 'visible',
            position: 'relative'
          }}
        >
          {/* Anchor Column sticking directly flush against Main Drawer */}
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
              flexShrink: 0
            }}
          >
            {/* Small Handles Hub Box sticking directly to the main UI at the top */}
            <ConnectorHub
              dockPosition={dockPosition}
              isExpanded={isExpanded}
              activeModule={activeModule}
              onSelectModule={onSelectModule}
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

          {/* Active Companion Module (Music / Weather / Calendar) */}
          {renderedModule && companionContent && (
            <div
              className={
                theme === 'deathnote'
                  ? `deathnote-book-wrapper ${isExiting ? 'is-exiting' : 'is-entering'}`
                  : (isExiting ? 'hub-module-exit-left' : 'hub-module-enter-left')
              }
              style={{
                width: '280px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'visible',
                perspective: '1200px',
                position: 'relative'
              }}
            >
              {theme === 'deathnote' && (
                <div
                  className={`deathnote-book-cover ${isExiting ? 'cover-close-left' : 'cover-open-left'}`}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 30,
                    pointerEvents: 'none'
                  }}
                >
                  <div className="deathnote-cover-spine spine-left" />
                  <div className="deathnote-cover-inner">
                    <img
                      src="/deathnote/icons/logo_deathnote_white.png"
                      alt="Death Note"
                      className="deathnote-cover-logo"
                    />
                    <div className="deathnote-cover-shinigami">
                      <span style={{ fontFamily: 'var(--font-gothic)', fontSize: '24px', color: '#c41e24', textShadow: '0 0 10px rgba(196, 30, 36, 0.8)' }}>
                        †
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div
                className={theme === 'deathnote' ? `deathnote-book-pages ${isExiting ? 'pages-exit' : 'pages-enter'}` : undefined}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
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
