import { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, RotateCw } from 'lucide-react';

export interface PhotoPickerOptions {
  acceptTypes?: string;
  maxSize?: number; // in bytes
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
}

interface PhotoUploadPickerProps {
  isOpen: boolean;
  onClose: () => void;
  options?: Partial<PhotoPickerOptions>;
}

export const PhotoUploadPicker = ({
  isOpen,
  onClose,
  options = {}
}: PhotoUploadPickerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mode, setMode] = useState<'menu' | 'camera' | 'preview'>('menu');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const galleryInputRef = useRef<HTMLInputElement>(null);

  const {
    maxSize = (options?.maxSize | 10) * 1024 * 1024,
    onFileSelect,
    onError
  } = options;

  const startCamera = async (mode: 'user' | 'environment') => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }

      setError(null);
      setMode('camera');
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Camera access denied or not available.');
      onError?.('Camera access denied or not available.');
    }
  }

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      if (!blob) return;

      if(blob.size > maxSize) {
        onError?.(`Photo exceeds maximum size of ${maxSize / (1024 * 1024)} MB.`);
        return;
      }

      const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
      const photoURL = URL.createObjectURL(file);
      setCapturedPhoto(photoURL);
      setMode('preview');
    }, 'image/png', 0.9);
  }

  const confirmPhoto = () => {
    if (!capturedPhoto) return;

    fetch(capturedPhoto)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `photo_${Date.now()}.png`, { type: 'image/png' });
        onFileSelect(file);
        cleanupAndClose();
      });
  }

  const switchCamera = () => {
    const newMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newMode);
    startCamera(newMode);
  }

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file && file.type.startsWith('image/') && file.size <= maxSize) {
      onFileSelect(file);
      cleanupAndClose();
    } else {
      onError?.(`Please select an image file under ${maxSize / (1024 * 1024)} MB.`);
      return;
    }
  }

  const cleanupAndClose = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (capturedPhoto) URL.revokeObjectURL(capturedPhoto);
    setCapturedPhoto(null);
    setMode('menu');
    setError(null);
    onClose();
  }

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (capturedPhoto) URL.revokeObjectURL(capturedPhoto);
    };
  }, [capturedPhoto]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50" onClick={cleanupAndClose} />
      <div className="fixed inset-x-0 bottom-0 z-50">
        {mode === 'menu' && (
          <div className="bg-white rounded-t-3xl p-6 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />
            <h3 className="text-lg font-bold text-center">Add Photo</h3>

            {error && <p className="text-red-500 text-center text-sm">{error}</p>}

            <button
              onClick={() => startCamera('environment')}
              className="w-full h-14 bg-primary text-white rounded-xl flex items-center justify-center gap-3 font-semibold active:scale-95 transition"
            >
              <Camera className="w-5 h-5" />
              Take Photo
            </button>

            <label className="block">
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleGallerySelect}
                className="hidden"
              />
              <button
                onClick={() => galleryInputRef.current?.click()}
                className="w-full h-14 bg-white border-2 border-primary text-primary rounded-xl flex items-center justify-center gap-3 font-semibold active:scale-95 transition"
              >
                <ImageIcon className="w-5 h-5" />
                Choose from Gallery
              </button>
            </label>

            <button
              onClick={cleanupAndClose}
              className="w-full h-12 text-neutral-600 font-medium hover:bg-neutral-100 rounded-xl transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Camera View */}
        {mode === 'camera' && (
          <div className="relative bg-black h-screen max-h-screen" onClick={e => e.stopPropagation()}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />

            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex justify-between">
              <button onClick={cleanupAndClose} className="bg-black/50 p-3 rounded-full">
                <X className="w-6 h-6 text-white" />
              </button>
              <button onClick={switchCamera} className="bg-black/50 p-3 rounded-full">
                <RotateCw className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Capture Button */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
              <button
                onClick={takePhoto}
                className="bg-white rounded-full p-4 shadow-2xl active:scale-90 transition"
              >
                <div className="w-16 h-16 bg-white rounded-full border-4 border-gray-300" />
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {mode === 'preview' && capturedPhoto && (
          <div className="bg-black h-screen flex flex-col" onClick={e => e.stopPropagation()}>
            <img src={capturedPhoto} alt="Captured" className="flex-1 w-full object-contain" />

            <div className="p-6 bg-white space-y-4">
              <div className="flex gap-4">
                <button
                  onClick={() => setMode('camera')}
                  className="flex-1 h-12 border-2 border-gray-300 rounded-xl font-semibold"
                >
                  Retake
                </button>
                <button
                  onClick={confirmPhoto}
                  className="flex-1 h-12 bg-primary text-white rounded-xl font-semibold"
                >
                  Use Photo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
};

export default PhotoUploadPicker;
