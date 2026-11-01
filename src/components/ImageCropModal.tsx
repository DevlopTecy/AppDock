import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ZoomIn, ZoomOut, RotateCcw, Check, Upload, Move } from 'lucide-react';
import { DockTheme } from '../types/dock';

interface ImageCropModalProps {
  isOpen: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedDataUrl: string) => void;
  onChooseAnother?: () => void;
  theme?: DockTheme;
}

export const ImageCropModal: React.FC<ImageCropModalProps> = ({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  onChooseAnother,
  theme
}) => {
  const [zoom, setZoom] = useState(1.0);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [cropShape, setCropShape] = useState<'squircle' | 'circle'>('squircle');

  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, panX: 0, panY: 0 });
  const imgRef = useRef<HTMLImageElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const VIEWPORT_SIZE = 220; // Size of the crop frame in pixels

  // Reset zoom & pan whenever a new image is loaded
  useEffect(() => {
    if (imageSrc) {
      setZoom(1.0);
      setPan({ x: 0, y: 0 });
      setImageLoaded(false);
    }
  }, [imageSrc, isOpen]);

  // Handle image load to measure dimensions
  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    imgRef.current = img;
    setImageLoaded(true);
    setZoom(1.0);
    setPan({ x: 0, y: 0 });
  };

  // Mouse drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      panX: pan.x,
      panY: pan.y
    };
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;
      setPan({
        x: dragStartRef.current.panX + deltaX,
        y: dragStartRef.current.panY + deltaY
      });
    },
    [isDragging]
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) setIsDragging(false);
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Mouse wheel for smooth zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setZoom((prev) => Math.max(1.0, Math.min(3.5, Number((prev + delta).toFixed(2)))));
  };

  // Compute transform and perform high-resolution canvas crop
  const handleSaveCrop = () => {
    if (!imgRef.current) return;
    const img = imgRef.current;

    const naturalW = img.naturalWidth || 200;
    const naturalH = img.naturalHeight || 200;

    // Base cover scale: image covers the 220px viewport at zoom 1.0
    const baseScale = Math.max(VIEWPORT_SIZE / naturalW, VIEWPORT_SIZE / naturalH);
    const activeScale = baseScale * zoom;

    const renderedW = naturalW * activeScale;
    const renderedH = naturalH * activeScale;

    // Viewport center
    const centerX = VIEWPORT_SIZE / 2 + pan.x;
    const centerY = VIEWPORT_SIZE / 2 + pan.y;

    const imgLeft = centerX - renderedW / 2;
    const imgTop = centerY - renderedH / 2;

    // Offscreen output canvas (128x128 for crisp dock rendering)
    const OUTPUT_SIZE = 128;
    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_SIZE;
    canvas.height = OUTPUT_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Scale from viewport coordinates to 128x128 canvas coordinates
    const scaleFactor = OUTPUT_SIZE / VIEWPORT_SIZE;
    const destX = imgLeft * scaleFactor;
    const destY = imgTop * scaleFactor;
    const destW = renderedW * scaleFactor;
    const destH = renderedH * scaleFactor;

    ctx.drawImage(img, destX, destY, destW, destH);
    const croppedDataUrl = canvas.toDataURL('image/png');

    onCropComplete(croppedDataUrl);
    onClose();
  };

  if (!isOpen || !imageSrc) return null;

  const currentTheme = theme || (typeof document !== 'undefined' ? (document.documentElement.getAttribute('data-theme') as DockTheme) : 'dark');
  const isDeathNote = currentTheme === 'deathnote';
  const isEldenRing = currentTheme === 'eldenring';

  return typeof document !== 'undefined'
    ? createPortal(
        <div
          className="image-crop-modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.78)',
            backdropFilter: 'blur(8px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div
            className="image-crop-modal-card"
            style={{
              width: '360px',
              maxWidth: '95vw',
              background: 'var(--bg-dock, #18181b)',
              border: isDeathNote
                ? '1px solid #a3262d'
                : isEldenRing
                  ? '1px solid #c5a15a'
                  : '1px solid var(--btn-border, rgba(255, 255, 255, 0.15))',
              borderRadius: '12px',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.65)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'modalScaleIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                background: 'var(--bg-header, rgba(255, 255, 255, 0.03))'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'var(--text-primary, #ffffff)',
                    fontFamily: isDeathNote ? 'var(--font-gothic)' : undefined
                  }}
                >
                  Edit Group Icon
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.08)',
                    color: 'var(--text-secondary, #a1a1aa)'
                  }}
                >
                  Discord Style
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="btn-dock"
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-muted, #71717a)'
                }}
              >
                <X size={14} />
              </button>
            </div>

            {/* Viewport / Crop Area */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '16px 16px 12px 16px',
                background: 'rgba(0, 0, 0, 0.25)'
              }}
            >
              {/* Outer Viewport Box */}
              <div
                ref={viewportRef}
                onMouseDown={handleMouseDown}
                onWheel={handleWheel}
                style={{
                  width: `${VIEWPORT_SIZE}px`,
                  height: `${VIEWPORT_SIZE}px`,
                  borderRadius: cropShape === 'circle' ? '50%' : '18px',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.55), 0 0 0 2px var(--accent, #3b82f6)',
                  userSelect: 'none',
                  touchAction: 'none'
                }}
                title="Click and drag to pan • Scroll to zoom"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  onLoad={handleImageLoad}
                  draggable={false}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: 'center center',
                    maxWidth: 'none',
                    minWidth: `${VIEWPORT_SIZE}px`,
                    minHeight: `${VIEWPORT_SIZE}px`,
                    objectFit: 'cover',
                    pointerEvents: 'none',
                    userSelect: 'none',
                    transition: isDragging ? 'none' : 'transform 0.05s ease-out'
                  }}
                />

                {/* Subtle Grid / Crosshair Guide */}
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    pointerEvents: 'none',
                    border: '1px dashed rgba(255, 255, 255, 0.3)',
                    borderRadius: cropShape === 'circle' ? '50%' : '18px'
                  }}
                />
              </div>

              {/* Pan / Move hint */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontSize: '10.5px',
                  color: 'var(--text-muted, #71717a)',
                  marginTop: '10px'
                }}
              >
                <Move size={12} />
                <span>Drag picture to position • Scroll to zoom</span>
              </div>
            </div>

            {/* Zoom Slider & Controls */}
            <div
              style={{
                padding: '10px 16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))'
              }}
            >
              {/* Zoom bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(1.0, Number((z - 0.2).toFixed(2))))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary, #a1a1aa)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>

                <input
                  type="range"
                  min="1"
                  max="3.5"
                  step="0.05"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  style={{
                    flex: 1,
                    accentColor: 'var(--accent, #3b82f6)',
                    cursor: 'pointer'
                  }}
                />

                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.2).toFixed(2))))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary, #a1a1aa)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px'
                  }}
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setZoom(1.0);
                    setPan({ x: 0, y: 0 });
                  }}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: '1px solid var(--btn-border, rgba(255, 255, 255, 0.1))',
                    borderRadius: '4px',
                    color: 'var(--text-secondary, #a1a1aa)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '3px 6px',
                    fontSize: '10px'
                  }}
                  title="Reset Position"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              </div>

              {/* Shape Toggle & Live Dock Preview */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setCropShape('squircle')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      border: cropShape === 'squircle' ? '1px solid var(--accent, #3b82f6)' : '1px solid var(--btn-border, rgba(255, 255, 255, 0.1))',
                      background: cropShape === 'squircle' ? 'var(--accent, #3b82f6)' : 'transparent',
                      color: cropShape === 'squircle' ? '#ffffff' : 'var(--text-secondary, #a1a1aa)'
                    }}
                  >
                    Rounded
                  </button>
                  <button
                    type="button"
                    onClick={() => setCropShape('circle')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      fontSize: '10.5px',
                      cursor: 'pointer',
                      border: cropShape === 'circle' ? '1px solid var(--accent, #3b82f6)' : '1px solid var(--btn-border, rgba(255, 255, 255, 0.1))',
                      background: cropShape === 'circle' ? 'var(--accent, #3b82f6)' : 'transparent',
                      color: cropShape === 'circle' ? '#ffffff' : 'var(--text-secondary, #a1a1aa)'
                    }}
                  >
                    Circle
                  </button>
                </div>

                {/* Dock Sidebar Preview Pill */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #71717a)' }}>Sidebar:</span>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: cropShape === 'circle' ? '50%' : '8px',
                      overflow: 'hidden',
                      background: 'rgba(0, 0, 0, 0.5)',
                      border: '1.5px solid var(--accent, #3b82f6)',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.35)',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={imageSrc}
                      alt=""
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: `translate(-50%, -50%) translate(${pan.x * (32 / VIEWPORT_SIZE)}px, ${pan.y * (32 / VIEWPORT_SIZE)}px) scale(${zoom})`,
                        transformOrigin: 'center center',
                        width: `${32}px`,
                        height: `${32}px`,
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                borderTop: '1px solid var(--border-subtle, rgba(255, 255, 255, 0.08))',
                background: 'var(--bg-header, rgba(255, 255, 255, 0.02))'
              }}
            >
              {onChooseAnother ? (
                <button
                  type="button"
                  onClick={onChooseAnother}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    background: 'transparent',
                    border: '1px solid var(--btn-border, rgba(255, 255, 255, 0.15))',
                    color: 'var(--text-secondary, #a1a1aa)',
                    cursor: 'pointer'
                  }}
                >
                  <Upload size={12} />
                  <span>Choose Another</span>
                </button>
              ) : (
                <div />
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    background: 'transparent',
                    border: '1px solid var(--btn-border, rgba(255, 255, 255, 0.15))',
                    color: 'var(--text-secondary, #a1a1aa)',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCrop}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '6px 14px',
                    borderRadius: '6px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    background: 'var(--accent, #3b82f6)',
                    border: 'none',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
                  }}
                >
                  <Check size={13} />
                  <span>Set Group Icon</span>
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;
};
