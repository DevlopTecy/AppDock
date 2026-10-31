import React, { useState } from 'react';
import { getAssetUrl } from '../../utils/assets';

interface StickerItem {
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

const PACK_STICKERS: StickerItem[] = [
  { id: 'shooting_star', src: '/stickers/shooting_star.png', label: 'Rainbow Comet', top: '130px', left: '8%', width: 52, duration: '4s', delay: '0.2s', rotateDeg: -15 },
  { id: 'bunny_astro', src: '/stickers/bunny_astronaut.png', label: 'Astro Bunny Waving', top: '220px', right: '10%', width: 52, duration: '4.8s', delay: '0.5s', rotateDeg: 6 },
  { id: 'cat_astro', src: '/stickers/cat_astronaut.png', label: 'Astro Cat with Cookie', top: '340px', left: '10%', width: 52, duration: '4.6s', delay: '0.8s', rotateDeg: -6 },
  { id: 'boba', src: '/stickers/boba_cup.png', label: 'Zero-G Boba Cup', bottom: '85px', left: '14%', width: 44, duration: '4.4s', delay: '0.3s', rotateDeg: -14 },
  { id: 'saturn', src: '/stickers/saturn_planet.png', label: 'Smiling Saturn', bottom: '70px', right: '14%', width: 50, duration: '5s', delay: '0s', rotateDeg: -10 }
];

export const KawaiiSpaceStickers: React.FC = () => {
  const [bouncedId, setBouncedId] = useState<string | null>(null);

  const handleStickerClick = (id: string) => {
    setBouncedId(id);
    setTimeout(() => setBouncedId(null), 600);
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
      {PACK_STICKERS.map((st) => {
        const isBounced = bouncedId === st.id;
        return (
          <div
            key={st.id}
            title={`${st.label} (Click to bounce!)`}
            onClick={() => handleStickerClick(st.id)}
            style={{
              position: 'absolute',
              top: st.top,
              bottom: st.bottom,
              left: st.left,
              right: st.right,
              width: `${st.width}px`,
              pointerEvents: 'auto',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 10px rgba(160, 110, 200, 0.35))',
              transform: `rotate(${st.rotateDeg}deg) ${isBounced ? 'scale(1.35)' : 'scale(1)'}`,
              transition: 'transform 0.22s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              animation: `kawaiiStickerDrift ${st.duration} ease-in-out infinite alternate`,
              animationDelay: st.delay
            }}
          >
            <img
              src={getAssetUrl(st.src)}
              alt={st.label}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
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

export default KawaiiSpaceStickers;
