import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { ArrowLeft, Star, X, Info, ChevronDown, ChevronUp, ShieldCheck, Image as ImageIcon, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import PhotoUploadPicker from '@/components/ui/PhotoUploadPicker';
import { supabase } from '@/lib/supabase';
import { useProfile } from '@/hooks/useProfile';
import { cn } from '@/lib/utils';
import { ONBOARDING_STEPS, PHOTO_GUIDELINES, PHOTO_UPLOAD, FILE_UPLOAD } from '@/config/onboardingConstants';
import type { Photo, PhotoUploadScreenProps } from '@/types/onboarding';
import type { ProfilePhoto } from '@/types/profile';

const TOTAL_STEPS = ONBOARDING_STEPS.TOTAL;
const CURRENT_STEP = ONBOARDING_STEPS.PROFILE_PHOTO;
const MAX_PHOTOS = PHOTO_UPLOAD.MAX_PHOTOS;

export const PhotoUploadScreen = ({ onNext, onBack, onSkip }: PhotoUploadScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (profile?.photos && profile.photos.length > 0) {
      const convertedPhotos: Photo[] = profile.photos.map(p => ({
        id: p.id,
        url: p.url,
        isMain: p.isPrimary,
        isVerified: p.approved || false
      }));
      setPhotos(convertedPhotos);
    }
  }, [profile]);

  const handleFileSelect = async (file: File) => {
    if (!user.id) {
      toast.error('You must be logged in to upload photos.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `photo_${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/images/${fileName}`;

      const { error } = await supabase.storage
        .from('users')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('users')
        .getPublicUrl(filePath);

      const newPhoto: Photo = {
        id: `${Date.now()}`,
        url: publicUrl,
        isMain: photos.length === 0 || !photos.some(p => p.isMain),
        isVerified: false
      };

      const updatedPhotos = [...photos, newPhoto];
      setPhotos(updatedPhotos);

      // Convert to ProfilePhoto format for database
      const profilePhotos: ProfilePhoto[] = updatedPhotos.map(p => ({
        id: p.id,
        url: p.url,
        isPrimary: p.isMain,
        approved: p.isVerified
      }));

      // Update Profiles table with new photos
      await updateProfile({
        photos: profilePhotos,
        primaryPhotoUrl: newPhoto.url
      });

      toast.success('Photo uploaded successfully!');
    } catch (err: any) {
      console.error('Error uploading photo:', err);
      toast.error('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePhoto = (id: string) => {
    toast.custom((t) => (
      <div className="flex flex-col gap-3 bg-white p-4 rounded-lg shadow-lg border border-neutral-200">
        <p className="font-semibold text-neutral-900">Are you sure you want to remove this photo?</p>
        <div className="flex gap-2">
          <button
            onClick={() => {
              toast.dismiss(t);
              confirmDeletePhoto(id);
            }}
            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t)}
            className="flex-1 px-3 py-2 bg-neutral-300 text-neutral-700 rounded-lg font-medium hover:bg-neutral-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), {
      position: 'top-center'
    });
  };

  const confirmDeletePhoto = (id: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== id);
      const photoToDelete = prev.find(p => p.id === id);
      
      if (photoToDelete && user?.id) {
        const filePath = `${user.id}/images/${photoToDelete.url.split('/').slice(-1)[0]}`;

        supabase.storage
          .from('users')
          .remove([filePath])
          .catch(err => {
            console.error('Failed to delete photo from storage:', err);
          });
      }
      
      if (filtered.length > 0 && !filtered.some(p => p.isMain)) {
        filtered[0].isMain = true;
        toast.success('Photo deleted. Main photo updated.');
      } else {
        toast.success('Photo deleted successfully!');
      }
      
      const profilePhotos: ProfilePhoto[] = filtered.map(p => ({
        id: p.id,
        url: p.url,
        isPrimary: p.isMain,
        approved: p.isVerified
      }));

      updateProfile({ 
        photos: profilePhotos,
        primaryPhotoUrl: filtered.find(p => p.isMain)?.url || null
      }).catch(err => {
        console.error('Failed to update photos in database:', err);
      });

      return filtered;
    });
  };

  const handleSetAsMain = (id: string) => {
    setPhotos(prev => {
      const updated = prev.map(p => ({
        ...p,
        isMain: p.id === id
      }));
      
      // Convert to ProfilePhoto format for database
      const profilePhotos: ProfilePhoto[] = updated.map(p => ({
        id: p.id,
        url: p.url,
        isPrimary: p.isMain,
        approved: p.isVerified
      }));

      // Update Profiles table
      updateProfile({ 
        photos: profilePhotos,
        primaryPhotoUrl: updated.find(p => p.isMain)?.url || null
      }).catch(err => {
        console.error('Failed to update main photo in database:', err);
      });

      return updated;
    });
    toast.success('Set as main photo!');
  };

  const handleContinue = () => {
    if (onNext) {
      onNext(photos);
    } else {
      navigate('/onboarding/dna-questionnaire', {
        state: {
          ...location.state,
          photos
        }
      });
    }
  };

  const handleAddLater = () => {
    if (onSkip) {
      onSkip();
    } else {
      navigate('/onboarding/dna-questionnaire', {
        state: location.state
      });
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/onboarding/religious-preferences');
    }
  };

  const progress = (CURRENT_STEP / TOTAL_STEPS) * 100;
  const hasMinimumPhotos = photos.length >= 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      <SafeArea top bottom>
        {/* Progress Bar */}
        <div className="w-full h-1 bg-neutral-200">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4">
          <button
            onClick={handleBack}
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-neutral-100 active:scale-95 transition-all"
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>

          <button
            onClick={handleAddLater}
            className="text-sm font-medium text-neutral-600 hover:text-primary px-4 py-2"
          >
            Skip
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-8">
          <div className="max-w-md mx-auto space-y-6">
            {/* Title Section */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Add Your Photos
              </h1>
              <p className="text-sm text-neutral-600">
                Profiles with photos get <span className="font-bold text-primary">10x more matches</span>
              </p>
            </div>

            {/* Photo Guidelines Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="w-full flex items-center justify-between p-4 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-blue-900">Photo Guidelines</span>
                </div>
                {showGuidelines ? (
                  <ChevronUp className="w-5 h-5 text-blue-600" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-blue-600" />
                )}
              </button>

              {showGuidelines && (
                <div className="px-4 pb-4 space-y-2">
                  {PHOTO_GUIDELINES.map((guideline, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <span className={guideline.valid ? "text-green-600" : "text-red-600"}>
                        {guideline.valid ? '✓' : '✗'}
                      </span>
                      <span className="text-blue-800">{guideline.text}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Photo Counter */}
            <div className="text-center text-sm text-neutral-600">
              {photos.length} of {MAX_PHOTOS} photos added
            </div>

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3">
              {/* Display uploaded photos - main photo first */}
              {photos
                .sort((a, b) => (b.isMain ? 1 : 0) - (a.isMain ? 1 : 0))
                .map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 group"
                >
                  <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Main Photo Badge */}
                  {photo.isMain && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 bg-[#D4A574] rounded-full">
                      <Star className="w-3 h-3 text-white fill-white" />
                      <span className="text-xs font-semibold text-white">Main</span>
                    </div>
                  )}

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!photo.isMain && (
                      <button
                        onClick={() => handleSetAsMain(photo.id)}
                        className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-neutral-100 active:scale-95 transition-all"
                        aria-label="Set as main"
                      >
                        <Star className="w-5 h-5 text-[#D4A574]" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-red-50 active:scale-95 transition-all"
                      aria-label="Delete photo"
                    >
                      <X className="w-5 h-5 text-red-600" />
                    </button>
                  </div>

                  {photo.isMain && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                      Main Photo
                    </div>
                  )}
                </div>
              ))}

              {/* Add Photo Button - Only show if photos are less than max */}
              {photos.length < MAX_PHOTOS && (
                <button
                  onClick={() => !isUploading && setShowPhotoOptions(true)}
                  disabled={isUploading}
                  className={cn(
                    "relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all",
                    "flex flex-col items-center justify-center gap-2",
                    isUploading 
                      ? "border-neutral-300 bg-neutral-50 cursor-not-allowed" 
                      : "border-neutral-300 bg-white hover:border-primary hover:bg-primary/5 active:scale-95"
                  )}
                >
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                    {isUploading ? (
                      <Loader className="w-6 h-6 text-primary animate-spin" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    )}
                  </div>
                  <span className="text-xs text-neutral-500">
                    {isUploading ? 'Uploading...' : 'Add Photo'}
                  </span>
                  {photos.length === 0 && !isUploading && (
                    <div className="absolute bottom-2 left-2 right-2 text-center">
                      <span className="text-xs font-medium text-neutral-600">Main Photo</span>
                    </div>
                  )}
                </button>
              )}
            </div>

            {/* Verification Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="font-semibold text-green-900">Get Verified</h3>
                  <p className="text-sm text-green-700">
                    Verify your profile for increased trust and better matches
                  </p>
                  <button className="text-sm font-semibold text-green-700 hover:text-green-800 underline">
                    Verify Now →
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4">
              <div className="text-center text-xs text-neutral-500 mb-2">
                Step {CURRENT_STEP} of {TOTAL_STEPS}
              </div>
              
              <Button
                onClick={handleContinue}
                disabled={!hasMinimumPhotos}
                className="w-full h-14 text-base font-semibold rounded-xl bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80"
              >
                Continue
              </Button>

              <Button
                onClick={handleAddLater}
                variant="outline"
                className="w-full h-12 text-base font-medium rounded-xl"
              >
                Add Photos Later
              </Button>
            </div>
          </div>
        </div>

        {/* Photo Options Bottom Sheet */}
        <PhotoUploadPicker
          isOpen={showPhotoOptions}
          onClose={() => setShowPhotoOptions(false)}
          options={{
            acceptTypes: 'image/*',
            maxSize: FILE_UPLOAD.MAX_SIZE_BYTES,
            onFileSelect: handleFileSelect,
            onError: (error) => toast.error(error)
          }}
        />
      </SafeArea>
    </div>
  );
};
