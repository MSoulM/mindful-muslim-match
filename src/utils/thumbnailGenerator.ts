/**
 * Generate blurred thumbnails for progressive image loading
 */

export interface ThumbnailOptions {
  width?: number;
  quality?: number;
  blur?: number;
}

const DEFAULT_OPTIONS: ThumbnailOptions = {
  width: 100,
  quality: 0.6,
  blur: 10
};

/**
 * Generate a small blurred thumbnail for placeholder display
 */
export async function generateThumbnail(
  file: File,
  options: ThumbnailOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Skip for videos
  if (file.type.startsWith('video/')) {
    return '';
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const aspectRatio = img.height / img.width;
        
        canvas.width = opts.width!;
        canvas.height = Math.round(opts.width! * aspectRatio);

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Apply blur filter
        ctx.filter = `blur(${opts.blur}px)`;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Convert to base64 with low quality
        const thumbnail = canvas.toDataURL('image/jpeg', opts.quality);
        resolve(thumbnail);
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnails for multiple images
 */
export async function generateThumbnails(
  files: File[],
  options: ThumbnailOptions = {}
): Promise<string[]> {
  return Promise.all(files.map(file => generateThumbnail(file, options)));
}
