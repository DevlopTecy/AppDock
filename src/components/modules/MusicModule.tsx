import React, { useState, useEffect, useRef } from 'react';
import './music.css';

interface Track {
  title: string;
  artist: string;
  duration: number; // in seconds
}

interface WindowsMediaState {
  hasMedia: boolean;
  title?: string;
  artist?: string;
  albumTitle?: string;
  status?: string;
  thumbnail?: string;
  position?: number;
  duration?: number;
  sessionCount?: number;
  canSkipNext?: boolean;
  canSkipPrev?: boolean;
}

const PLAYLIST: Track[] = [
  { title: 'Synth Horizon', artist: 'Neon Dreams', duration: 204 },
  { title: 'Lo-Fi Raindrops', artist: 'Chill Nomad', duration: 165 },
  { title: 'Cyber Pulse', artist: 'RetroWave', duration: 190 }
];

export const MusicModule: React.FC = () => {
  const [windowsMedia, setWindowsMedia] = useState<WindowsMediaState | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isPlayingLocal, setIsPlayingLocal] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Global cleanup for AudioContext on module unmount to release audio driver resources
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
        audioCtxRef.current = null;
      }
    };
  }, []);

  // Poll Windows GSMTC Media State every 2.5 seconds
  useEffect(() => {
    let active = true;
    const pollMedia = async () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
        return;
      }
      try {
        if (typeof window !== 'undefined' && (window as any).appDock?.getMediaState) {
          const res = await (window as any).appDock.getMediaState();
          if (active && res) {
            setWindowsMedia(res.hasMedia ? res : null);
            if (res.hasMedia && typeof res.position === 'number') {
              setCurrentTime(res.position);
            }
          }
        }
      } catch {
        // Ignore poll error
      }
    };

    pollMedia();
    const interval = setInterval(pollMedia, 2500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const hasWinMedia = !!windowsMedia?.hasMedia;
  const isPlaying = hasWinMedia
    ? windowsMedia?.status === 'Playing'
    : isPlayingLocal;

  const currentTrack = PLAYLIST[trackIndex];
  const displayTitle = hasWinMedia ? (windowsMedia?.title || 'Windows Media') : currentTrack.title;
  const displayArtist = hasWinMedia
    ? (windowsMedia?.artist || windowsMedia?.albumTitle || 'Now Playing')
    : currentTrack.artist;

  // Accurate duration: real media duration from Windows or local synth track
  const totalDuration = hasWinMedia
    ? ((windowsMedia?.duration && windowsMedia.duration > 0) ? windowsMedia.duration : 0)
    : currentTrack.duration;

  // Can skip tracks: only when 2 or more videos/music detected in Windows OR next track is explicitly enabled
  const canSkip = hasWinMedia
    ? ((windowsMedia?.sessionCount ?? 1) >= 2 || !!windowsMedia?.canSkipNext)
    : PLAYLIST.length > 1;

  const formatTime = (sec: number) => {
    const sSec = Math.max(0, Math.floor(sec));
    const h = Math.floor(sSec / 3600);
    const m = Math.floor((sSec % 3600) / 60);
    const s = Math.floor(sSec % 60);
    if (h > 0) {
      return `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    }
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Local Web Audio synth tone player when no Windows media is playing
  useEffect(() => {
    if (!hasWinMedia && isPlayingLocal) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = audioCtxRef.current || new AudioCtx();
        audioCtxRef.current = ctx;

        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const notes = [220, 277.18, 329.63, 440, 554.37];
        const baseFreq = notes[trackIndex % notes.length];

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
      } catch {}
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
        oscillatorRef.current = null;
      }
    }

    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch {}
        oscillatorRef.current = null;
      }
    };
  }, [hasWinMedia, isPlayingLocal, trackIndex]);

  // Advance timeline position smoothly
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (!hasWinMedia) {
            if (prev >= currentTrack.duration) {
              setTrackIndex((i) => (i + 1) % PLAYLIST.length);
              return 0;
            }
            return prev + 1;
          } else {
            if (totalDuration > 0 && prev >= totalDuration) {
              return totalDuration;
            }
            return prev + 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, hasWinMedia, totalDuration, currentTrack.duration]);

  const handlePlayToggle = async () => {
    if (hasWinMedia) {
      if (typeof window !== 'undefined' && (window as any).appDock?.controlMedia) {
        await (window as any).appDock.controlMedia('Toggle');
      }
      setWindowsMedia((prev) => (prev ? { ...prev, status: prev.status === 'Playing' ? 'Paused' : 'Playing' } : null));
    } else {
      setIsPlayingLocal(!isPlayingLocal);
    }
  };

  const handleNext = async () => {
    if (!canSkip) return;
    if (hasWinMedia) {
      if (typeof window !== 'undefined' && (window as any).appDock?.controlMedia) {
        await (window as any).appDock.controlMedia('Next');
      }
    } else {
      if (isShuffle) {
        if (PLAYLIST.length > 1) {
          let nextIdx = trackIndex;
          while (nextIdx === trackIndex) {
            nextIdx = Math.floor(Math.random() * PLAYLIST.length);
          }
          setTrackIndex(nextIdx);
        } else {
          setTrackIndex(0);
        }
      } else {
        setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
      }
      setCurrentTime(0);
    }
  };

  const handlePrev = async () => {
    if (!canSkip) return;
    if (hasWinMedia) {
      if (typeof window !== 'undefined' && (window as any).appDock?.controlMedia) {
        await (window as any).appDock.controlMedia('Previous');
      }
    } else {
      setTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
      setCurrentTime(0);
    }
  };

  // Celestial galaxy disc SVG contents (100% circular with clipPath)
  const renderGalaxySVG = (idPrefix = 'disc') => (
    <svg width="128" height="128" viewBox="0 0 128 128" style={{ borderRadius: '50%', overflow: 'hidden' }}>
      <defs>
        <clipPath id={`${idPrefix}-circle-clip`}>
          <circle cx="64" cy="64" r="64" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${idPrefix}-circle-clip)`}>
        <circle cx="64" cy="64" r="64" fill="#09090b" />
        <circle cx="20" cy="20" r="2" fill="white" />
        <circle cx="40" cy="30" r="2" fill="white" />
        <circle cx="60" cy="10" r="2" fill="white" />
        <circle cx="80" cy="40" r="2" fill="white" />
        <circle cx="100" cy="20" r="2" fill="white" />
        <circle cx="120" cy="50" r="2" fill="white" />
        <circle cx="90" cy="30" r="10" fill="white" fillOpacity="0.5" />
        <circle cx="90" cy="30" r="8" fill="white" />
        <path d="M0 128 Q32 64 64 128 T128 128" fill="purple" stroke="black" strokeWidth="1" />
        <path d="M0 128 Q32 48 64 128 T128 128" fill="mediumpurple" stroke="black" strokeWidth="1" />
        <path d="M0 128 Q32 32 64 128 T128 128" fill="rebeccapurple" stroke="black" strokeWidth="1" />
        <path d="M0 128 Q16 64 32 128 T64 128" fill="purple" stroke="black" strokeWidth="1" />
        <path d="M64 128 Q80 64 96 128 T128 128" fill="mediumpurple" stroke="black" strokeWidth="1" />
      </g>
    </svg>
  );

  // Render disc content: Either album artwork or galaxy vinyl
  const renderDiscContent = (idPrefix: string, isMini = false) => {
    if (windowsMedia?.thumbnail && windowsMedia.thumbnail.length > 20) {
      return (
        <img
          src={windowsMedia.thumbnail}
          alt="Album art"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '50%',
            display: 'block'
          }}
        />
      );
    }
    return isMini ? (
      <div style={{ transform: 'scale(0.44)', transformOrigin: 'top left' }}>
        {renderGalaxySVG(idPrefix)}
      </div>
    ) : (
      renderGalaxySVG(idPrefix)
    );
  };

  return (
    <div className={`uiverse-music-container select-none ${isPlaying ? 'is-playing' : ''}`}>
      {/* Sliding Celestial Spinning Vinyl Disc on top */}
      <div className="top-disc-wrap">
        <div className="top-disc-svg">
          {renderDiscContent('top', false)}
        </div>
        <div className="top-disc-hole" />
      </div>

      {/* Main White Player Card */}
      <div className="player-card">
        {/* Row 1: Mini Spinning Vinyl + Track Information */}
        <div className="card-header-row">
          <div className="card-mini-disc">
            <div className="card-mini-disc-svg">
              {renderDiscContent('mini', true)}
            </div>
            <div className="card-mini-disc-hole" />
          </div>

          <div className="track-info-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <p className="track-title" title={displayTitle}>{displayTitle}</p>
            </div>
            <p className="track-artist" title={displayArtist}>{displayArtist}</p>
          </div>
        </div>

        {/* Row 2: Timeline Range Bar */}
        <div className="timeline-row">
          <span className="time-label">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={totalDuration > 0 ? totalDuration : 100}
            value={totalDuration > 0 ? Math.min(currentTime, totalDuration) : 0}
            onChange={(e) => setCurrentTime(parseInt(e.target.value))}
            className="timeline-slider"
            disabled={hasWinMedia}
            style={{ cursor: hasWinMedia ? 'default' : 'pointer' }}
          />
          <span className="time-label">
            {totalDuration > 0 ? formatTime(totalDuration) : (hasWinMedia ? 'Live' : formatTime(currentTrack.duration))}
          </span>
        </div>

        {/* Row 3: Playback Controls */}
        <div className="controls-row">
          {/* Repeat / Shuffle */}
          <button
            type="button"
            className="ctrl-btn"
            onClick={() => setIsShuffle(!isShuffle)}
            title={isShuffle ? 'Shuffle Mode' : 'Repeat Mode'}
            style={{ color: isShuffle ? '#7c3aed' : 'var(--text-muted)' }}
          >
            {isShuffle ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 3 21 3 21 8" />
                <line x1="4" y1="20" x2="21" y2="3" />
                <polyline points="21 16 21 21 16 21" />
                <line x1="15" y1="15" x2="21" y2="21" />
                <line x1="4" y1="4" x2="9" y2="9" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="17 1 21 5 17 9" />
                <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                <polyline points="7 23 3 19 7 15" />
                <path d="M21 13v2a4 4 0 0 1-4 4H3" />
              </svg>
            )}
          </button>

          {/* Skip Back */}
          <button
            type="button"
            className="ctrl-btn"
            onClick={handlePrev}
            disabled={!canSkip}
            title={canSkip ? "Previous Track" : "Previous (Requires 2+ active media apps or playlist)"}
            style={{
              opacity: canSkip ? 1 : 0.35,
              cursor: canSkip ? 'pointer' : 'not-allowed'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="19 20 9 12 19 4 19 20" />
              <line x1="5" y1="19" x2="5" y2="5" />
            </svg>
          </button>

          {/* Play / Pause Toggle */}
          <button
            type="button"
            className="ctrl-btn ctrl-btn-play"
            onClick={handlePlayToggle}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="6" y="4" width="4" height="16" />
                <rect x="14" y="4" width="4" height="16" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ marginLeft: '2px' }}>
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            )}
          </button>

          {/* Skip Forward */}
          <button
            type="button"
            className="ctrl-btn"
            onClick={handleNext}
            disabled={!canSkip}
            title={canSkip ? "Next Track" : "Next Track (Requires 2+ active media apps or playlist)"}
            style={{
              opacity: canSkip ? 1 : 0.35,
              cursor: canSkip ? 'pointer' : 'not-allowed'
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 4 15 12 5 20 5 4" />
              <line x1="19" y1="5" x2="19" y2="19" />
            </svg>
          </button>

          {/* Source Indicator / Status */}
          <div
            className="ctrl-btn"
            title={hasWinMedia ? 'Synced with Windows Media' : 'Built-in Synth Player'}
            style={{ color: hasWinMedia ? '#10b981' : 'var(--text-muted)', cursor: 'default' }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V18a1 1 0 0 1-2 0v-1.07A6 6 0 0 1 6.07 12H5a1 1 0 0 1 0-2h1.07A6 6 0 0 1 11 4.07V3a1 1 0 0 1 2 0v1.07A6 6 0 0 1 17.93 10H19a1 1 0 0 1 0 2h-1.07A6 6 0 0 1 13 16.93z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicModule;
