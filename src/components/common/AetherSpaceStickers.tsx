import React, { useState } from 'react';
import { getAssetUrl } from '../../utils/assets';

interface AetherItem {
  id: string;
  src: string;
  label: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: number;
  duration: string;
  delay: string;
  rotateDeg: number;
}

const AETHER_ITEMS: AetherItem[] = [
  { id: 'golden_apple', src: '/aether/golden_apple.png', label: 'Golden Apple with Glints', top: '175px', right: '28%', width: 34, duration: '3.8s', delay: '0.2s', rotateDeg: 12 },
  { id: 'wind_gust1', src: '/aether/flight_wind.png', label: 'Swirling Sky Breeze', top: '205px', right: '8%', width: 70, duration: '5.2s', delay: '0.5s', rotateDeg: 5 },
  { id: 'steve', src: '/aether/elytra_steve.png', label: 'Elytra Steve Soaring', top: '265px', left: '42%', width: 50, duration: '4.2s', delay: '0s', rotateDeg: -8 },
  { id: 'potion', src: '/aether/potion.png', label: 'Floating Splash Potion', top: '335px', right: '14%', width: 28, duration: '4.5s', delay: '0.4s', rotateDeg: -15 },
  { id: 'feather', src: '/aether/feather.png', label: 'Cyan Aether Feather', top: '295px', left: '16%', width: 28, duration: '3.6s', delay: '0.8s', rotateDeg: 35 },
  { id: 'gold_ore', src: '/aether/gold_ore.png', label: 'Floating Gold Ore Block', top: '390px', left: '22%', width: 40, duration: '4.6s', delay: '0.7s', rotateDeg: -10 },
  { id: 'glowstone', src: '/aether/glowstone.png', label: 'Glowing Glowstone Block', top: '440px', right: '34%', width: 42, duration: '5s', delay: '0.6s', rotateDeg: 15 },
  { id: 'chest', src: '/aether/chest.png', label: 'Suspended Aether Chest', top: '510px', right: '16%', width: 40, duration: '4.8s', delay: '0.3s', rotateDeg: -12 },
  { id: 'wind_gust2', src: '/aether/flight_wind.png', label: 'Ascending Wind Spiral', top: '490px', left: '12%', width: 80, duration: '5.6s', delay: '0.2s', rotateDeg: -8 },
];

export const AetherSpaceStickers: React.FC = () => {
  const [bouncedId, setBouncedId] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    setBouncedId(id);
    setTimeout(() => setBouncedId(null), 500);
  };

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        zIndex: 1,
        userSelect: 'none'
      }}
    >
      {/* Updraft ascending currents under cards */}
      <div
        className="aether-updraft-particles"
        style={{
          position: 'absolute',
          top: '90px',
          left: '10%',
          right: '10%',
          height: '60px',
          display: 'flex',
          justifyContent: 'space-around',
          opacity: 0.55,
          pointerEvents: 'none'
        }}
      >
        <span style={{ fontSize: '14px', animation: 'aetherUpdraft 2.2s linear infinite' }}>💨</span>
        <span style={{ fontSize: '12px', animation: 'aetherUpdraft 2.6s linear infinite 0.4s' }}>✨</span>
        <span style={{ fontSize: '14px', animation: 'aetherUpdraft 2s linear infinite 0.8s' }}>💨</span>
        <span style={{ fontSize: '12px', animation: 'aetherUpdraft 2.4s linear infinite 1.2s' }}>✨</span>
      </div>

      {AETHER_ITEMS.map((item) => {
        const isBounced = bouncedId === item.id;
        return (
          <div
            key={item.id}
            title={`${item.label} (Click to interact!)`}
            onClick={() => handleItemClick(item.id)}
            style={{
              position: 'absolute',
              top: item.top,
              bottom: item.bottom,
              left: item.left,
              right: item.right,
              width: `${item.width}px`,
              pointerEvents: 'auto',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 8px rgba(30, 60, 90, 0.45))',
              transform: `rotate(${item.rotateDeg}deg) ${isBounced ? 'scale(1.4) translateY(-10px)' : 'scale(1)'}`,
              transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              animation: `aetherDrift ${item.duration} ease-in-out infinite alternate`,
              animationDelay: item.delay
            }}
          >
            <img
              src={getAssetUrl(item.src)}
              alt={item.label}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                imageRendering: 'pixelated',
                pointerEvents: 'none',
                userSelect: 'none'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default AetherSpaceStickers;
