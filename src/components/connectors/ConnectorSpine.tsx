import React from 'react';
import { Music2, CloudSun, CalendarDays } from 'lucide-react';
import { DockPosition, CompanionModuleType } from '../../types/dock';
import './connector.css';

interface ConnectorSpineProps {
  dockPosition: DockPosition;
  isExpanded: boolean;
  activeModule: CompanionModuleType;
  onSelectModule: (mod: CompanionModuleType) => void;
}

export const ConnectorSpine: React.FC<ConnectorSpineProps> = ({
  dockPosition,
  isExpanded,
  activeModule,
  onSelectModule
}) => {
  if (!isExpanded) return null;

  const isLeft = dockPosition === 'left';
  const isRight = dockPosition === 'right';
  const isTop = dockPosition === 'top';

  const modules: {
    id: 'music' | 'weather' | 'calendar';
    name: string;
    icon: React.ReactNode;
    color: string;
    handleClass: string;
  }[] = [
    {
      id: 'music',
      name: 'Music Player',
      icon: <Music2 size={16} strokeWidth={2.2} />,
      color: '#a855f7',
      handleClass: 'music-handle'
    },
    {
      id: 'weather',
      name: 'Weather Module',
      icon: <CloudSun size={16} strokeWidth={2.2} />,
      color: '#f59e0b',
      handleClass: 'weather-handle'
    },
    {
      id: 'calendar',
      name: 'Calendar & Schedule',
      icon: <CalendarDays size={16} strokeWidth={2.2} />,
      color: '#10b981',
      handleClass: 'calendar-handle'
    }
  ];

  const handleToggle = (id: 'music' | 'weather' | 'calendar') => {
    if (activeModule === id) {
      onSelectModule(null);
    } else {
      onSelectModule(id);
    }
  };

  return (
    <div
      className={`connector-spine ${isTop ? 'top-spine' : ''}`}
      style={{
        margin: isLeft ? '0 0 0 6px' : isRight ? '0 6px 0 0' : '0 0 0 8px'
      }}
    >
      {/* Central Connector Trunk Stem */}
      <div className="connector-stem" />

      {modules.map((m, idx) => {
        const isActive = activeModule === m.id;
        return (
          <button
            key={m.id}
            type="button"
            className={`small-handle-btn ${m.handleClass} ${isActive ? 'is-active' : ''}`}
            onClick={() => handleToggle(m.id)}
            title={m.name}
            aria-label={m.name}
            style={{
              animation: `fadeInSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 0.05}s backwards`
            }}
          >
            {/* Inner Glass Layer */}
            <div className="handle-inner-glass" />

            {/* Glowing Icon */}
            <div className="handle-icon">{m.icon}</div>

            {/* Glowing Active Indicator Dot */}
            {isActive && (
              <span
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '4px',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: '#ffffff',
                  boxShadow: '0 0 8px #ffffff',
                  zIndex: 4
                }}
              />
            )}

            {/* Tooltip Badge */}
            <span
              className="handle-tooltip"
              style={{
                left: isTop ? '50%' : isLeft ? '46px' : undefined,
                right: isRight ? '46px' : undefined,
                top: isTop ? '46px' : undefined,
                transform: isTop ? 'translateX(-50%)' : undefined
              }}
            >
              {m.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default ConnectorSpine;
