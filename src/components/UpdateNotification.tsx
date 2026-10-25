import React, { useState, useEffect } from 'react';
import { ArrowUpCircle, Download, RotateCw, X, Sparkles } from 'lucide-react';
import { DockTheme } from '../types/dock';

export interface UpdateInfo {
  version: string;
  releaseNotes?: string;
  releaseDate?: string;
  downloadUrl?: string;
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('mockupdate') === '1' || params.get('mockupdate') === 'true') {
        setUpdateInfo({
          version: '1.0.1',
          releaseNotes: 'Fixed dock transitions and updated theme rendering.',
          downloadUrl: 'https://github.com/AppDock/AppDock/releases/tag/v1.0.1'
        });
      }
    }

    if (typeof window === 'undefined' || !(window as any).appDock) return;

    const cleanupAvailable = (window as any).appDock.onUpdateAvailable?.((info: UpdateInfo) => {
      setUpdateInfo(info);
      setIsDismissed(false);
    });

    const cleanupProgress = (window as any).appDock.onUpdateProgress?.((progress: { percent: number }) => {
      setDownloadProgress(progress.percent);
      setIsDownloading(true);
    });

    const cleanupDownloaded = (window as any).appDock.onUpdateDownloaded?.(() => {
      setIsDownloading(false);
      setIsReadyToInstall(true);
      setDownloadProgress(100);
    });

    return () => {
      if (cleanupAvailable) cleanupAvailable();
      if (cleanupProgress) cleanupProgress();
      if (cleanupDownloaded) cleanupDownloaded();
    };
  }, []);

  if (!updateInfo || isDismissed) return null;

  const handleAction = async () => {
    if (typeof window === 'undefined' || !(window as any).appDock) return;

    if (isReadyToInstall) {
      (window as any).appDock.quitAndInstall?.();
      return;
    }

    setIsDownloading(true);
    const res = await (window as any).appDock.downloadUpdate?.();
    if (!res || !res.success) {
      // In development mode or if native updater is not active, open download URL
      if (updateInfo.downloadUrl) {
        (window as any).appDock.openExternalUrl?.(updateInfo.downloadUrl);
      }
      setIsDownloading(false);
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
              width: `${downloadProgress ?? 10}%`,
              height: '100%',
              background: isAether ? '#ffdf59' : isDeathNote ? '#a3262d' : 'var(--text-primary)',
              transition: 'width 0.2s ease'
            }}
          />
        </div>
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
