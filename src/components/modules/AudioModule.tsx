import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Headphones, Speaker, RefreshCw, Check, Radio } from 'lucide-react';
import { playSound } from '../../utils/soundEngine';

export interface AudioDevice {
  id: string;
  name: string;
  type: 'headphones' | 'speaker' | 'default';
  status: string;
}

const FALLBACK_DEVICES: AudioDevice[] = [
  { id: 'dev-speakers', name: 'Speakers (Realtek High Definition Audio)', type: 'speaker', status: 'OK' },
  { id: 'dev-headphones', name: 'Headphones (USB Audio Device)', type: 'headphones', status: 'OK' }
];

export const AudioModule: React.FC = () => {
  const [devices, setDevices] = useState<AudioDevice[]>(FALLBACK_DEVICES);
  const [activeDeviceId, setActiveDeviceId] = useState<string>(FALLBACK_DEVICES[0].id);
  const [masterVolume, setMasterVolume] = useState<number>(75);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchDevices = async () => {
    setIsLoading(true);
    try {
      if (typeof window !== 'undefined' && (window as any).appDock?.getAudioDevices) {
        const result = await (window as any).appDock.getAudioDevices();
        if (Array.isArray(result) && result.length > 0) {
          setDevices(result);
          if (!result.some((d: AudioDevice) => d.id === activeDeviceId)) {
            setActiveDeviceId(result[0].id);
          }
        }
      }
    } catch {
      // Keep fallback list
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleSelectDevice = async (dev: AudioDevice) => {
    playSound('click');
    setActiveDeviceId(dev.id);
    if (typeof window !== 'undefined' && (window as any).appDock?.setAudioDevice) {
      await (window as any).appDock.setAudioDevice(dev.id);
    }
  };

  const handleToggleMute = async () => {
    playSound('click');
    setIsMuted((prev) => !prev);
    if (typeof window !== 'undefined' && (window as any).appDock?.toggleAudioMute) {
      await (window as any).appDock.toggleAudioMute();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setMasterVolume(val);
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
    if (typeof window !== 'undefined' && (window as any).appDock?.setMasterVolume) {
      (window as any).appDock.setMasterVolume(val);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 14px',
        boxSizing: 'border-box',
        color: 'var(--text-primary)',
        gap: '14px',
        userSelect: 'none'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Volume2 size={16} color="var(--accent, #3b82f6)" />
          <span style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.3px' }}>
            Audio Playback
          </span>
        </div>
        <button
          type="button"
          onClick={fetchDevices}
          disabled={isLoading}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'color 0.15s ease'
          }}
          title="Refresh audio endpoints"
        >
          <RefreshCw size={13} style={{ animation: isLoading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {/* Master Volume Slider & Mute Card */}
      <div
        style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--btn-border)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>Master Output</span>
          <span style={{ fontSize: '11px', color: isMuted ? '#ef4444' : 'var(--accent, #3b82f6)', fontWeight: 700 }}>
            {isMuted ? 'MUTED' : `${masterVolume}%`}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            onClick={handleToggleMute}
            style={{
              background: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'var(--bg-surface-hover)',
              border: `1px solid ${isMuted ? '#ef4444' : 'var(--btn-border)'}`,
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: isMuted ? '#ef4444' : 'var(--text-primary)',
              flexShrink: 0
            }}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            value={isMuted ? 0 : masterVolume}
            onChange={handleVolumeChange}
            style={{
              flex: 1,
              accentColor: 'var(--accent, #3b82f6)',
              cursor: 'pointer',
              height: '4px'
            }}
          />
        </div>
      </div>

      {/* Playback Endpoints List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '2px' }}>
          Available Output Endpoints
        </div>

        {devices.map((dev) => {
          const isSelected = activeDeviceId === dev.id;
          const isHeadphones = dev.type === 'headphones';

          return (
            <div
              key={dev.id}
              onClick={() => handleSelectDevice(dev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 10px',
                borderRadius: '7px',
                background: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-surface)',
                border: isSelected ? '1.5px solid var(--accent, #3b82f6)' : '1px solid var(--btn-border)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.background = 'var(--bg-surface)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1, paddingRight: '8px' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    background: isSelected ? 'var(--accent, #3b82f6)' : 'var(--bg-surface-hover)',
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isHeadphones ? <Headphones size={14} /> : <Speaker size={14} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                  <span
                    style={{
                      fontSize: '11.5px',
                      fontWeight: isSelected ? 600 : 500,
                      color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {dev.name}
                  </span>
                  <span style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                    {isHeadphones ? 'Headset / Earphones' : 'Speakers'}
                  </span>
                </div>
              </div>

              {isSelected && (
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--accent, #3b82f6)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Check size={11} strokeWidth={2.6} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

