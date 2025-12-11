/**
 * Generate thumbnail from video file
 */

export interface VideoThumbnailOptions {
  width?: number;
  quality?: number;
  timeOffset?: number; // Time in seconds to capture frame (default: 1 second)
}

const DEFAULT_OPTIONS: VideoThumbnailOptions = {
  width: 400,
  quality: 0.8,
  timeOffset: 1
};

/**
 * Generate a thumbnail from a video file by capturing a frame
 */
export async function generateVideoThumbnail(
  file: File,
  options: VideoThumbnailOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('Could not get canvas context'));
      return;
    }

    let objectUrl: string | null = null;
    let resolved = false;

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    const handleSuccess = (thumbnail: string) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      resolve(thumbnail);
    };

    const handleError = (error: Error) => {
      if (resolved) return;
      resolved = true;
      cleanup();
      reject(error);
    };

    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = 'anonymous';

    video.onloadedmetadata = () => {
      try {
        // Set video time to capture frame (use 10% of duration or timeOffset, whichever is smaller)
        const seekTime = Math.min(opts.timeOffset!, video.duration * 0.1);
        video.currentTime = seekTime;
      } catch (error) {
        handleError(new Error('Failed to seek video'));
      }
    };

    video.onseeked = () => {
      try {
        // Calculate thumbnail dimensions maintaining aspect ratio
        const aspectRatio = video.videoHeight / video.videoWidth;
        canvas.width = opts.width!;
        canvas.height = Math.round(opts.width! * aspectRatio);

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64
        const thumbnail = canvas.toDataURL('image/jpeg', opts.quality);
        handleSuccess(thumbnail);
      } catch (error) {
        handleError(new Error('Failed to capture video frame'));
      }
    };

    video.onerror = (e) => {
      handleError(new Error('Failed to load video'));
    };

    // Create object URL for video
    objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    // Timeout fallback
    setTimeout(() => {
      if (!resolved) {
        handleError(new Error('Video thumbnail generation timed out'));
      }
    }, 10000); // 10 second timeout
  });
}

