import React from 'react';
import { getAssetUrl } from '../../utils/assets';
import { DockPosition, CompanionModuleType, DockTheme } from '../../types/dock';
import './hub.css';

interface ConnectorHubProps {
  dockPosition: DockPosition;
  isExpanded: boolean;
  activeModule: CompanionModuleType;
  onSelectModule: (mod: CompanionModuleType) => void;
  theme?: DockTheme;
}

export const ConnectorHub: React.FC<ConnectorHubProps> = ({
  dockPosition,
  isExpanded,
  activeModule,
  onSelectModule,
  theme
}) => {
  if (!isExpanded) return null;

  const isEldenRing = theme === 'eldenring' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'eldenring');

  const handleToggle = (id: 'music' | 'weather' | 'calendar', e: React.MouseEvent) => {
    e.stopPropagation();
    if (activeModule === id) {
      onSelectModule(null);
    } else {
      onSelectModule(id);
    }
  };

  return (
    <div
      className={`uiverse-vbar-container dock-pos-${dockPosition}`}
    >
      <article className="uiverse-vbar-article">
        {/* Item 1: Music Player */}
        <button
          type="button"
          className={`uiverse-vbar-item ${activeModule === 'music' ? 'is-active' : ''}`}
          onClick={(e) => handleToggle('music', e)}
          title="Music Player"
          aria-label="Music Player"
          style={isEldenRing ? { height: '58px', padding: 0 } : undefined}
        >
          {isEldenRing ? (
            <img
              src={getAssetUrl('/eldenring/sidebar/music_sidebar.png')}
              alt="Music"
              style={{
                height: '54px',
                width: 'auto',
                objectFit: 'contain',
                filter: activeModule === 'music'
                  ? 'drop-shadow(0 0 10px rgba(234, 196, 119, 0.95)) brightness(1.2)'
                  : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.85))',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
            />
          ) : (
            <span className="vbar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </span>
          )}
        </button>

        {/* Item 2: Weather */}
        <button
          type="button"
          className={`uiverse-vbar-item ${activeModule === 'weather' ? 'is-active' : ''}`}
          onClick={(e) => handleToggle('weather', e)}
          title="Weather"
          aria-label="Weather"
          style={isEldenRing ? { height: '58px', padding: 0 } : undefined}
        >
          {isEldenRing ? (
            <img
              src={getAssetUrl('/eldenring/sidebar/cloud_sidebar.png')}
              alt="Weather"
              style={{
                height: '54px',
                width: 'auto',
                objectFit: 'contain',
                filter: activeModule === 'weather'
                  ? 'drop-shadow(0 0 10px rgba(234, 196, 119, 0.95)) brightness(1.2)'
                  : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.85))',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
            />
          ) : (
            <span className="vbar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
              </svg>
            </span>
          )}
        </button>

        {/* Item 3: Calendar */}
        <button
          type="button"
          className={`uiverse-vbar-item ${activeModule === 'calendar' ? 'is-active' : ''}`}
          onClick={(e) => handleToggle('calendar', e)}
          title="Calendar"
          aria-label="Calendar"
          style={isEldenRing ? { height: '58px', padding: 0 } : undefined}
        >
          {isEldenRing ? (
            <img
              src={getAssetUrl('/eldenring/sidebar/calendar_sidebar.png')}
              alt="Calendar"
              style={{
                height: '54px',
                width: 'auto',
                objectFit: 'contain',
                filter: activeModule === 'calendar'
                  ? 'drop-shadow(0 0 10px rgba(234, 196, 119, 0.95)) brightness(1.2)'
                  : 'drop-shadow(0 2px 5px rgba(0, 0, 0, 0.85))',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
            />
          ) : (
            <span className="vbar-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" />
              </svg>
            </span>
          )}
        </button>

        {/* Cute Kawaii Space Strawberry Astronaut Sticker */}
        <div
          className="kawaii-hub-cherries"
          style={{
            marginTop: '4px',
            display: 'none',
            animation: 'kawaiiStickerDrift 3.5s ease-in-out infinite alternate',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          title="Kawaii Astro Strawberry"
        >
          <img
            src={getAssetUrl('/stickers/strawberry_astro.png')}
            alt="Astro Strawberry"
            style={{ width: '24px', height: '24px', objectFit: 'contain' }}
          />
        </div>

        {/* Celestial Aether Crystal Gem Badge */}
        <div
          className="aether-hub-crystal"
          style={{
            marginTop: '6px',
            display: 'none',
            animation: 'aetherDrift 3s ease-in-out infinite alternate',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          title="Aether Crystal Gem"
        >
          <img
            src={getAssetUrl('/aether/crystal.png')}
            alt="Aether Crystal"
            style={{
              width: '22px',
              height: '22px',
              objectFit: 'contain',
              imageRendering: 'pixelated',
              filter: 'drop-shadow(0 0 6px #59bcf4)'
            }}
          />
        </div>


        {/* One Piece Straw Hat Pirate Accent */}
        <div
          className="onepiece-hub-hat"
          style={{
            marginTop: '6px',
            display: 'none',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          title="Straw Hat Pirates"
        >
          <img
            src={getAssetUrl('/onepiece/icons/straw_hat_emblem.png')}
            alt="Straw Hat"
            style={{
              width: '20px',
              height: '20px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.75))'
            }}
          />
        </div>

        {/* Candy Land Sweet Candy Sticker Accent */}
        <div
          className="candy-hub-lollipop"
          style={{
            marginTop: '6px',
            display: 'none',
            cursor: 'pointer',
            textAlign: 'center'
          }}
          title="Sweet Bonbon Candy"
        >
          <img
            src={getAssetUrl('/candy/decorations/wrapped_candy.png')}
            alt="Candy Bonbon"
            style={{
              width: '24px',
              height: '24px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 0 6px rgba(244, 114, 182, 0.75))'
            }}
          />
        </div>
      </article>
    </div>
  );
};

export default ConnectorHub;
