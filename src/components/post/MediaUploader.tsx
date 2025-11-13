/**
 * MediaUploader Component
 * Handles photo/video uploads with preview and validation
 */

import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video';
  isUploading?: boolean;
}

interface MediaUploaderProps {
  value: MediaFile[];
  onChange: (files: MediaFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

export const MediaUploader = ({
  value,
  onChange,
  maxFiles = 5,
  maxSizeMB = 5,
  accept = 'image/*,video/*',
  className,
}: MediaUploaderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles: MediaFile[] = [];
    const currentCount = value.length;

    Array.from(files).forEach((file, index) => {
      if (currentCount + newFiles.length >= maxFiles) return;

      // Validate file size
      if (file.size > maxSizeMB * 1024 * 1024) {
        console.warn(`File ${file.name} exceeds ${maxSizeMB}MB`);
        return;
      }

      // Determine type
      const type = file.type.startsWith('video/') ? 'video' : 'image';

      // Create preview
      const preview = URL.createObjectURL(file);

      newFiles.push({
        id: `${Date.now()}-${index}`,
        file,
        preview,
        type,
      });
    });

    onChange([...value, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleRemove = (id: string) => {
    const fileToRemove = value.find((f) => f.id === id);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    onChange(value.filter((f) => f.id !== id));
  };

  const canAddMore = value.length < maxFiles;

  return (
    <div className={className}>
      {/* Upload Area */}
      {canAddMore && (
        <Card
          className={cn(
            'border-2 border-dashed transition-colors cursor-pointer',
            isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
          )}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="p-8 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium mb-1">Upload photos or videos</p>
            <p className="text-xs text-muted-foreground mb-4">
              Drag & drop or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Max {maxFiles} files • {maxSizeMB}MB each
            </p>
          </div>
        </Card>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={accept}
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {value.map((media) => (
            <div key={media.id} className="relative aspect-square group">
              <Card className="overflow-hidden h-full">
                {media.type === 'image' ? (
                  <img
                    src={media.preview}
                    alt="Upload preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="relative w-full h-full bg-muted flex items-center justify-center">
                    <Video className="h-8 w-8 text-muted-foreground" />
                    <video
                      src={media.preview}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                )}

                {media.isUploading && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemove(media.id);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>

                <div className="absolute bottom-2 left-2">
                  <div className="bg-background/90 rounded-full p-1">
                    {media.type === 'image' ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <Video className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-2">
        {value.length} / {maxFiles} files uploaded
      </p>
    </div>
  );
};
