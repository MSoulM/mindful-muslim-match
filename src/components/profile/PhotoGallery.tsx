import { useState, useCallback } from 'react';
import { Camera, Plus, Star, Trash2, GripVertical, AlertCircle, Loader2 } from 'lucide-react';
import { useProfilePhotos, ProfilePhoto } from '@/hooks/useProfilePhotos';
import { PhotoUploadPicker } from '@/components/ui/PhotoUploadPicker';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MAX_PHOTOS = 6;

export function PhotoGallery() {
  const { photos, isLoading, isUploading, uploadPhoto, deletePhoto, setPrimaryPhoto, reorderPhotos } = useProfilePhotos();
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState<string | null>(null);
  const [draggedPhoto, setDraggedPhoto] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setIsPickerOpen(false);
    await uploadPhoto(file, photos.length === 0);
  }, [uploadPhoto, photos.length]);

  const handleDelete = useCallback(async () => {
    if (photoToDelete) {
      await deletePhoto(photoToDelete);
      setPhotoToDelete(null);
    }
  }, [photoToDelete, deletePhoto]);

  const handleSetPrimary = useCallback(async (photoId: string) => {
    await setPrimaryPhoto(photoId);
  }, [setPrimaryPhoto]);

  const handleDragStart = useCallback((photoId: string) => {
    setDraggedPhoto(photoId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedPhoto || draggedPhoto === targetId) return;
  }, [draggedPhoto]);

  const handleDrop = useCallback(async (targetId: string) => {
    if (!draggedPhoto || draggedPhoto === targetId) {
      setDraggedPhoto(null);
      return;
    }

    const currentOrder = photos.map(p => p.id);
    const draggedIndex = currentOrder.indexOf(draggedPhoto);
    const targetIndex = currentOrder.indexOf(targetId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDraggedPhoto(null);
      return;
    }

    // Reorder
    const newOrder = [...currentOrder];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedPhoto);

    await reorderPhotos(newOrder);
    setDraggedPhoto(null);
  }, [draggedPhoto, photos, reorderPhotos]);

  const approvedPhotos = photos.filter(p => p.moderationStatus !== 'rejected');
  const rejectedPhotos = photos.filter(p => p.moderationStatus === 'rejected');
  const canAddMore = approvedPhotos.length < MAX_PHOTOS;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Photos</h3>
        <span className="text-sm text-muted-foreground">
          {approvedPhotos.length}/{MAX_PHOTOS}
        </span>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3">
        {approvedPhotos.map((photo) => (
          <div
            key={photo.id}
            draggable
            onDragStart={() => handleDragStart(photo.id)}
            onDragOver={(e) => handleDragOver(e, photo.id)}
            onDrop={() => handleDrop(photo.id)}
            className={cn(
              "relative aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing",
              photo.isPrimary ? "border-primary" : "border-border",
              draggedPhoto === photo.id && "opacity-50 scale-95",
              photo.moderationStatus === 'pending' && "opacity-70",
              photo.moderationStatus === 'manual_review' && "border-yellow-500"
            )}
          >
            <img
              src={photo.url}
              alt="Profile photo"
              className="w-full h-full object-cover"
            />

            {/* Drag handle */}
            <div className="absolute top-1 left-1 p-1 bg-black/50 rounded-md">
              <GripVertical className="w-4 h-4 text-white" />
            </div>

            {/* Primary badge */}
            {photo.isPrimary && (
              <div className="absolute top-1 right-1 p-1 bg-primary rounded-full">
                <Star className="w-3 h-3 text-white fill-white" />
              </div>
            )}

            {/* Pending/Review badge */}
            {photo.moderationStatus === 'pending' && (
              <div className="absolute bottom-0 left-0 right-0 bg-yellow-500/90 text-white text-xs text-center py-1">
                Pending Review
              </div>
            )}

            {photo.moderationStatus === 'manual_review' && (
              <div className="absolute bottom-0 left-0 right-0 bg-orange-500/90 text-white text-xs text-center py-1">
                Under Review
              </div>
            )}

            {/* Actions overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              {!photo.isPrimary && photo.approved && (
                <button
                  onClick={() => handleSetPrimary(photo.id)}
                  className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                  title="Set as primary"
                >
                  <Star className="w-4 h-4 text-primary" />
                </button>
              )}
              <button
                onClick={() => setPhotoToDelete(photo.id)}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                title="Delete photo"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </button>
            </div>
          </div>
        ))}

        {/* Add photo button */}
        {canAddMore && (
          <button
            onClick={() => setIsPickerOpen(true)}
            disabled={isUploading}
            className={cn(
              "aspect-square rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 transition-colors",
              isUploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"
            )}
          >
            {isUploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <Plus className="w-8 h-8 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Add Photo</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Rejected photos section */}
      {rejectedPhotos.length > 0 && (
        <div className="mt-6 p-4 bg-destructive/10 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <h4 className="font-medium text-destructive">Rejected Photos</h4>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {rejectedPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-xl overflow-hidden border-2 border-destructive opacity-60"
              >
                <img
                  src={photo.url}
                  alt="Rejected photo"
                  className="w-full h-full object-cover grayscale"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => setPhotoToDelete(photo.id)}
                    className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                    title="Delete photo"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
                {photo.rejectionReason && (
                  <div className="absolute bottom-0 left-0 right-0 bg-destructive/90 text-white text-xs text-center py-1 px-2 truncate">
                    {photo.rejectionReason}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo requirements hint */}
      <p className="text-xs text-muted-foreground text-center">
        Add up to 6 photos. Drag to reorder. Tap the star to set your primary photo.
      </p>

      {/* Photo picker */}
      <PhotoUploadPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        options={{
          maxSize: 5 * 1024 * 1024,
          onFileSelect: handleFileSelect,
          onError: (error) => console.error('Photo picker error:', error),
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The photo will be permanently removed from your profile.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
