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
  { id: 'saturn', src: '/stickers/saturn_planet.png', label: 'Smiling Saturn', top: '12px', right: '48%', width: 56, duration: '4.8s', delay: '0s', rotateDeg: -10 },
  { id: 'moon', src: '/stickers/crescent_moon.png', label: 'Sleepy Crescent Moon', top: '10px', right: '32%', width: 44, duration: '5.2s', delay: '0.4s', rotateDeg: 12 },
  { id: 'zerog', src: '/stickers/zerog_cloud.png', label: 'ZERO-G! Cloud', top: '12px', right: '4%', width: 66, duration: '4.6s', delay: '0.8s', rotateDeg: 5 },
  { id: 'shooting_star', src: '/stickers/shooting_star.png', label: 'Rainbow Comet', top: '75px', left: '12%', width: 58, duration: '3.9s', delay: '0.2s', rotateDeg: -15 },
  { id: 'ufo_alien', src: '/stickers/ufo_alien.png', label: 'Cute Alien in UFO', top: '120px', left: '44%', width: 54, duration: '4.5s', delay: '0.3s', rotateDeg: -6 },
  { id: 'bunny_astro', src: '/stickers/bunny_astronaut.png', label: 'Astro Bunny Waving', top: '175px', left: '36%', width: 58, duration: '5s', delay: '0.5s', rotateDeg: 6 },
  { id: 'cat_astro', src: '/stickers/cat_astronaut.png', label: 'Astro Cat with Cookie', top: '240px', left: '50%', width: 58, duration: '4.7s', delay: '0.8s', rotateDeg: -6 },
  { id: 'bear_astro', src: '/stickers/bear_astronaut.png', label: 'Bear Hugging Star', top: '165px', right: '12%', width: 52, duration: '5.3s', delay: '0.6s', rotateDeg: 8 },
  { id: 'rocket', src: '/stickers/rocket_ship.png', label: 'Sparkly Heart Rocket', top: '125px', right: '18%', width: 46, duration: '3.8s', delay: '0.1s', rotateDeg: 32 },
  { id: 'donut', src: '/stickers/galaxy_donut.png', label: 'Cosmic Galaxy Donut', top: '220px', left: '14%', width: 48, duration: '4.9s', delay: '0.4s', rotateDeg: -12 },
  { id: 'boba', src: '/stickers/boba_cup.png', label: 'Zero-G Boba Cup', bottom: '90px', left: '15%', width: 45, duration: '4.4s', delay: '0.3s', rotateDeg: -14 },
  { id: 'strawberry', src: '/stickers/strawberry_astro.png', label: 'Strawberry Astronaut', bottom: '155px', left: '42%', width: 44, duration: '4.6s', delay: '0.7s', rotateDeg: 10 },
  { id: 'candy', src: '/stickers/space_candy.png', label: 'Smiling Space Candy', bottom: '34px', right: '14%', width: 48, duration: '4.7s', delay: '0.4s', rotateDeg: 16 },
  { id: 'cupcake', src: '/stickers/planet_cupcake.png', label: 'Saturn Cupcake', top: '285px', right: '18%', width: 52, duration: '5.1s', delay: '0.2s', rotateDeg: -8 },
  { id: 'telescope', src: '/stickers/telescope.png', label: 'Cute Telescope', bottom: '135px', right: '22%', width: 50, duration: '4.2s', delay: '0.5s', rotateDeg: -15 },
  { id: 'earth', src: '/stickers/earth_bandage.png', label: 'Earth with Bandage', bottom: '38px', left: '38%', width: 46, duration: '5.4s', delay: '0.6s', rotateDeg: 5 },
  { id: 'cloud_rainbow', src: '/stickers/floating_cloud.png', label: 'Floating Cloud Banner', bottom: '24px', left: '10%', width: 62, duration: '4.8s', delay: '0.3s', rotateDeg: -4 },
  { id: 'ufo_beam', src: '/stickers/ufo_heart_beam.png', label: 'UFO Heart Beam', bottom: '80px', right: '12%', width: 48, duration: '4.3s', delay: '0.9s', rotateDeg: 6 }
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
