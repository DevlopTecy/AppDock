import React from 'react';
import './loader.css';

interface UiverseLoaderProps {
  scale?: number;
  label?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const UiverseLoader: React.FC<UiverseLoaderProps> = ({
  scale = 1,
  label,
  className = '',
  style
}) => {
  return (
    <div className={`uiverse-loader-container ${className}`} style={style} role="status" aria-label={label || "Loading"}>
      <div
        className="uiverse-loader-box"
        style={{
          transform: scale !== 1 ? `scale(${scale})` : undefined,
          transformOrigin: 'center center'
        }}
      >
        <div className="square" id="sq1" />
        <div className="square" id="sq2" />
        <div className="square" id="sq3" />
        <div className="square" id="sq4" />
        <div className="square" id="sq5" />
        <div className="square" id="sq6" />
        <div className="square" id="sq7" />
        <div className="square" id="sq8" />
        <div className="square" id="sq9" />
      </div>
      {label && <span className="uiverse-loader-label">{label}</span>}
    </div>
  );
};

export default UiverseLoader;
