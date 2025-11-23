/**
 * Optimizes an image file to target approximately 300KB.
 * It resizes dimensions if too large and adjusts JPEG quality.
 */
export const optimizeImage = async (file: File, targetSizeKB: number = 300): Promise<Blob> => {
  const targetSizeBytes = targetSizeKB * 1024;
  const maxWidth = 1920; // Max width for "web" usage
  const maxHeight = 1920;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      let width = img.width;
      let height = img.height;

      // 1. Resize dimensions if too huge
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.floor(width * ratio);
        height = Math.floor(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Fill white background for transparent PNGs converted to JPEG
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      // 2. Iterative Quality Reduction
      // Binary search approach or step-down approach to find best quality under target size
      let minQ = 0.1;
      let maxQ = 1.0;
      let bestBlob: Blob | null = null;
      let attempts = 0;

      // Initial attempt at 0.9 to see where we stand
      const initialBlob = await canvasToBlob(canvas, 0.9);
      if (initialBlob.size <= targetSizeBytes) {
         resolve(initialBlob);
         return;
      }

      // If 0.9 is too big, binary search for the sweet spot
      while (attempts < 6) { // Limit iterations for performance
        const midQ = (minQ + maxQ) / 2;
        const blob = await canvasToBlob(canvas, midQ);
        
        if (blob.size <= targetSizeBytes) {
          bestBlob = blob;
          minQ = midQ; // Try to get better quality if possible
        } else {
          maxQ = midQ; // Quality too high, size too big
        }
        
        // If we are very close to target range or range is tiny, stop
        if (maxQ - minQ < 0.05) break;
        attempts++;
      }

      // Fallback: if even lowest quality is too big (rare for 300KB target on 1920px), return lowest valid or last best
      if (bestBlob) {
        resolve(bestBlob);
      } else {
        // If we couldn't get under target, return the smallest we got (approx minQ)
        const finalTry = await canvasToBlob(canvas, minQ);
        resolve(finalTry);
      }
    };

    img.onerror = (err) => reject(err);
    img.src = objectUrl;
  });
};

const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas to Blob failed'));
      },
      'image/jpeg',
      quality
    );
  });
};

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};
