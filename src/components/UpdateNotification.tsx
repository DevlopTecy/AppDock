import React, { useState, useEffect, useRef } from 'react';
import { ArrowUpCircle, Download, RotateCw, X, Sparkles, ExternalLink, AlertCircle } from 'lucide-react';
import { DockTheme } from '../types/dock';

export interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
  downloadUrl?: string;
  htmlUrl?: string;
}

interface UpdateNotificationProps {
  theme?: DockTheme;
  githubRepo?: string;
}

export const UpdateNotification: React.FC<UpdateNotificationProps> = ({ theme }) => {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [showManualFallback, setShowManualFallback] = useState(false);
  const watchdogTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mockupdate') === '1' || params.get('mockupdate') === 'true') {
        setUpdateInfo({
          version: '1.0.5',
          releaseNotes: 'Fixed dock transitions and updated theme rendering.',
          downloadUrl: 'https://github.com/DevlopTecy/AppDock/releases/download/v1.0.5/AppDock-Setup-1.0.5.exe',
          htmlUrl: 'https://github.com/DevlopTecy/AppDock/releases/tag/v1.0.5'
        });
      }
    }

    if (typeof window === 'undefined' || !(window as any).appDock) return;

    const cleanupAvailable = (window as any).appDock.onUpdateAvailable?.((info: UpdateInfo) => {
      setUpdateInfo(info);
      setIsDismissed(false);
      setDownloadError(null);
      setShowManualFallback(false);
    });

    const cleanupProgress = (window as any).appDock.onUpdateProgress?.((progress: { percent: number }) => {
      setDownloadProgress(progress.percent);
      setIsDownloading(true);
      setDownloadError(null);
      if (progress.percent > 0 && watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
        setShowManualFallback(false);
      }
    });

    const cleanupDownloaded = (window as any).appDock.onUpdateDownloaded?.(() => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      setIsDownloading(false);
      setIsReadyToInstall(true);
      setDownloadProgress(100);
      setDownloadError(null);
      setShowManualFallback(false);
    });

    const cleanupError = (window as any).appDock.onUpdateError?.((err: string) => {
      if (watchdogTimerRef.current) {
        clearTimeout(watchdogTimerRef.current);
        watchdogTimerRef.current = null;
      }
      console.warn('[UpdateNotification] onUpdateError:', err);
      setIsDownloading(false);
      setDownloadError(typeof err === 'string' ? err : 'Update download failed');
      setShowManualFallback(true);
    });

    return () => {
      if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
      if (cleanupAvailable) cleanupAvailable();
      if (cleanupProgress) cleanupProgress();
      if (cleanupDownloaded) cleanupDownloaded();
      if (cleanupError) cleanupError();
    };
  }, []);

  if (!updateInfo || isDismissed) return null;

  const fallbackUrl =
    updateInfo.downloadUrl ||
    updateInfo.htmlUrl ||
    `https://github.com/DevlopTecy/AppDock/releases/tag/v${updateInfo.version}`;

  const openManualDownload = () => {
    if (typeof window !== 'undefined' && (window as any).appDock?.openExternalUrl) {
      (window as any).appDock.openExternalUrl(fallbackUrl);
    }
  };

  const handleAction = async () => {
    if (typeof window === 'undefined' || !(window as any).appDock) return;

    if (isReadyToInstall) {
      (window as any).appDock.quitAndInstall?.();
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);
    setShowManualFallback(false);

    // Watchdog timer: if stuck at 0% for more than 10 seconds, reveal the manual browser download option
    if (watchdogTimerRef.current) clearTimeout(watchdogTimerRef.current);
    watchdogTimerRef.current = setTimeout(() => {
      setShowManualFallback(true);
    }, 10000);

    try {
      const res = await (window as any).appDock.downloadUpdate?.();
      if (!res || !res.success) {
        console.warn('[UpdateNotification] downloadUpdate error result:', res);
        setIsDownloading(false);
        setShowManualFallback(true);
        if (res?.error) {
          setDownloadError(res.error);
        }
      }
    } catch (err: any) {
      console.warn('[UpdateNotification] downloadUpdate exception:', err);
      setIsDownloading(false);
      setShowManualFallback(true);
      setDownloadError(err?.message || 'Download could not start');
    }
  };

  const isDeathNote = theme === 'deathnote';
  const isAether = theme === 'aether';
  const isKawaii = theme === 'kawaii';

  return (
    <div
      style={{
        position: 'absolute',
        top: '46px',
        left: '10px',
        right: '10px',
        zIndex: 55,
        padding: '10px 12px',
        borderRadius: isAether ? '4px' : '10px',
        background: isDeathNote
          ? 'rgba(18, 18, 18, 0.95)'
          : isAether
            ? 'rgba(20, 48, 76, 0.95)'
            : isKawaii
              ? 'rgba(255, 235, 240, 0.95)'
              : 'rgba(24, 24, 27, 0.95)',
        border: isDeathNote
          ? '1.5px solid #a3262d'
          : isAether
            ? '1.5px solid #ffdf59'
            : isKawaii
              ? '1.5px solid #ffb6c1'
              : '1.5px solid var(--text-primary)',
        boxShadow: isDeathNote
          ? '0 4px 20px rgba(163, 38, 45, 0.45)'
          : isAether
            ? '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 0 8px rgba(77, 181, 255, 0.3)'
            : '0 8px 24px rgba(0, 0, 0, 0.35)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        animation: 'slideDown 0.25s ease-out'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Sparkles size={14} color={isAether ? '#ffdf59' : isDeathNote ? '#e05a61' : 'var(--text-primary)'} />
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              color: isAether ? '#ffdf59' : isDeathNote ? '#eae6df' : 'var(--text-primary)',
              fontFamily: isDeathNote ? 'var(--font-gothic)' : undefined,
              letterSpacing: isDeathNote ? '0.4px' : undefined
            }}
          >
            Update Available: v{updateInfo.version}
          </span>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          title="Dismiss for now"
          aria-label="Dismiss notification"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: '2px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <X size={13} />
        </button>
      </div>

      <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
        {isReadyToInstall
          ? 'Update downloaded and ready to install!'
          : downloadError
            ? `Download interrupted: ${downloadError}`
            : isDownloading
              ? `Downloading update (${downloadProgress ?? 0}%)...`
              : 'A new release is ready with the latest features and bug fixes.'}
      </div>

      {/* Download Progress Bar */}
      {isDownloading && (
        <div
          style={{
            width: '100%',
            height: '4px',
            borderRadius: '2px',
            background: 'var(--bg-surface)',
            overflow: 'hidden',
            marginTop: '2px'
          }}
        >
          <div
            style={{
              width: `${Math.max(downloadProgress ?? 0, 5)}%`,
              height: '100%',
              background: isAether ? '#ffdf59' : isDeathNote ? '#a3262d' : 'var(--text-primary)',
              transition: 'width 0.2s ease'
            }}
          />
        </div>
      )}

      {/* Manual download option if stuck or errored */}
      {showManualFallback && (
        <button
          type="button"
          onClick={openManualDownload}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '4px 6px',
            fontSize: '10px',
            fontWeight: 600,
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: isAether ? '#ffdf59' : isDeathNote ? '#ff8080' : 'var(--text-primary)',
            cursor: 'pointer',
            marginTop: '2px'
          }}
        >
          <ExternalLink size={11} />
          <span>Stuck? Download Setup Directly (Browser)</span>
        </button>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '6px', marginTop: '3px' }}>
        <button
          onClick={handleAction}
          className="btn-primary"
          style={{
            flex: 1,
            padding: '5px 8px',
            fontSize: '11px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            cursor: 'pointer',
            borderRadius: isAether ? '3px' : '6px',
            background: isAether ? '#5c3e23' : isDeathNote ? '#a3262d' : undefined,
            color: isAether ? '#ffdf59' : undefined,
            border: isAether ? '1px solid #ffdf59' : undefined
          }}
        >
          {isReadyToInstall ? (
            <>
              <RotateCw size={12} />
              <span>Restart & Update</span>
            </>
          ) : isDownloading ? (
            <>
              <Download size={12} className="animate-spin" />
              <span>Downloading...</span>
            </>
          ) : (
            <>
              <ArrowUpCircle size={12} />
              <span>Update Now</span>
            </>
          )}
        </button>

        <button
          onClick={() => setIsDismissed(true)}
          style={{
            padding: '5px 10px',
            fontSize: '10.5px',
            borderRadius: isAether ? '3px' : '6px',
            background: 'transparent',
            border: '1px solid var(--btn-border)',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          Later
        </button>
      </div>
    </div>
  );
};

export default UpdateNotification;
