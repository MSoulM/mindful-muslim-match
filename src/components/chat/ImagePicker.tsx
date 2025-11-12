import { useRef, useState } from 'react';
import { X, Image as ImageIcon, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ImagePickerProps {
  onSelect: (files: File[]) => void;
  onCancel: () => void;
  maxFiles?: number;
  maxSizeMB?: number;
}

export const ImagePicker = ({
  onSelect,
  onCancel,
  maxFiles = 5,
  maxSizeMB = 10
}: ImagePickerProps) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      return 'Only image files are allowed';
    }

    // Validate file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `Image size must be less than ${maxSizeMB}MB`;
    }

    return null;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate total number of files
    if (selectedFiles.length + files.length > maxFiles) {
      setError(`You can only select up to ${maxFiles} images`);
      return;
    }

    // Validate each file
    for (const file of files) {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    setError(null);

    // Create previews
    const newFiles = [...selectedFiles, ...files];
    const newPreviews: string[] = [];

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setSelectedFiles(newFiles);
  };

  const handleRemoveImage = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const handleSend = () => {
    if (selectedFiles.length > 0) {
      onSelect(selectedFiles);
    }
  };

  const handleBrowse = () => {
    fileInputRef.current?.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm"
    >
      <div className="h-full flex flex-col safe-area">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <span className="text-sm font-medium">
            Select Images ({selectedFiles.length}/{maxFiles})
          </span>
          <Button
            onClick={handleSend}
            disabled={selectedFiles.length === 0}
            className="min-w-[60px]"
          >
            Send
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 bg-destructive/10 border-b border-destructive/20"
          >
            <p className="text-sm text-destructive text-center">{error}</p>
          </motion.div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {selectedFiles.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-1">No images selected</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Choose up to {maxFiles} images to share
                </p>
                <Button onClick={handleBrowse}>
                  Browse Gallery
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <AnimatePresence>
                {previews.map((preview, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="relative aspect-square rounded-lg overflow-hidden bg-muted"
                  >
                    <img
                      src={preview}
                      alt={`Selected ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 h-8 w-8 rounded-full bg-destructive/90 text-destructive-foreground flex items-center justify-center hover:bg-destructive transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>

                    {/* File info */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                      <p className="text-xs text-white truncate">
                        {selectedFiles[index].name}
                      </p>
                      <p className="text-xs text-white/70">
                        {(selectedFiles[index].size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add more button */}
              {selectedFiles.length < maxFiles && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleBrowse}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-2"
                >
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Add More</span>
                </motion.button>
              )}
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </motion.div>
  );
};
