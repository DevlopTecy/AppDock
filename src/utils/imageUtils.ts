/**
 * Compresses an image File to a base64 JPEG data URL.
 * Scales down to fit within maxSizePx × maxSizePx while preserving aspect ratio.
 */
export async function compressImageToBase64(
  file: File,
  maxSizePx = 1600,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const { width, height } = img;
        let targetW = width;
        let targetH = height;

        // Scale down proportionally if either dimension exceeds maxSizePx
        if (width > maxSizePx || height > maxSizePx) {
          const ratio = Math.min(maxSizePx / width, maxSizePx / height);
          targetW = Math.round(width * ratio);
          targetH = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0, targetW, targetH);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
