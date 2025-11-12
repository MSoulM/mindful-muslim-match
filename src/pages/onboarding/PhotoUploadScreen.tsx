import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Camera, Image as ImageIcon, Star, X, Info, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { SafeArea } from '@/components/utils/SafeArea';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PhotoUploadScreenProps {
  onNext?: (photos: Photo[]) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

export interface Photo {
  id: string;
  uri: string;
  isMain: boolean;
  isVerified: boolean;
}

const TOTAL_STEPS = 7;
const CURRENT_STEP = 3;
const MAX_PHOTOS = 6;

const guidelines = [
  { text: 'Clear face visible (no sunglasses)', valid: true },
  { text: 'Modest clothing', valid: true },
  { text: 'Recent photos (within 2 years)', valid: true },
  { text: 'Smile! Show your personality', valid: true },
  { text: 'No group photos as main', valid: false },
  { text: 'No filters or heavy editing', valid: false }
];

export const PhotoUploadScreen = ({ onNext, onBack, onSkip }: PhotoUploadScreenProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showGuidelines, setShowGuidelines] = useState(true);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const uri = e.target?.result as string;
      const newPhoto: Photo = {
        id: Date.now().toString(),
        uri,
        isMain: photos.length === 0,
        isVerified: false
      };
      
      setPhotos(prev => [...prev, newPhoto]);
    };
    
    reader.readAsDataURL(file);
    setShowPhotoOptions(false);
  };

  const handleDeletePhoto = (id: string) => {
    if (confirm('Remove this photo?')) {
      setPhotos(prev => {
        const filtered = prev.filter(p => p.id !== id);
        // If we deleted the main photo, make the first remaining one main
        if (filtered.length > 0 && !filtered.some(p => p.isMain)) {
          filtered[0].isMain = true;
        }
        return filtered;
      });
    }
  };

  const handleSetAsMain = (id: string) => {
    setPhotos(prev => prev.map(p => ({
      ...p,
      isMain: p.id === id
    })));
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
                  {guidelines.map((guideline, index) => (
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

            {/* Photo Grid */}
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: MAX_PHOTOS }).map((_, index) => {
                const photo = photos[index];
                
                if (photo) {
                  return (
                    <div
                      key={photo.id}
                      className="relative aspect-[3/4] rounded-xl overflow-hidden bg-neutral-100 group"
                    >
                      <img
                        src={photo.uri}
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

                      {/* Index Label */}
                      {index === 0 && (
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                          Main Photo
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={index}
                    onClick={() => setShowPhotoOptions(true)}
                    disabled={photos.length >= MAX_PHOTOS}
                    className={cn(
                      "relative aspect-[3/4] rounded-xl border-2 border-dashed transition-all",
                      "flex flex-col items-center justify-center gap-2",
                      photos.length >= MAX_PHOTOS
                        ? "border-neutral-200 bg-neutral-50 cursor-not-allowed"
                        : "border-neutral-300 bg-white hover:border-primary hover:bg-primary/5 active:scale-95"
                    )}
                  >
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-neutral-400" />
                    </div>
                    <span className="text-xs text-neutral-500">Add Photo</span>
                    {index === 0 && photos.length === 0 && (
                      <div className="absolute bottom-2 left-2 right-2 text-center">
                        <span className="text-xs font-medium text-neutral-600">Main Photo</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Photo Counter */}
            <div className="text-center text-sm text-neutral-600">
              {photos.length} of {MAX_PHOTOS} photos added
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
        {showPhotoOptions && (
          <div 
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={() => setShowPhotoOptions(false)}
          >
            <div 
              className="w-full bg-white rounded-t-3xl p-6 space-y-3"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-12 h-1 bg-neutral-300 rounded-full mx-auto mb-4" />
              
              <h3 className="text-lg font-bold text-center mb-4">Add Photo</h3>
              
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-full h-14 bg-primary text-white rounded-xl flex items-center justify-center gap-3 font-semibold active:scale-95 transition-all cursor-pointer">
                  <Camera className="w-5 h-5" />
                  Take Photo
                </div>
              </label>

              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <div className="w-full h-14 bg-white border-2 border-primary text-primary rounded-xl flex items-center justify-center gap-3 font-semibold active:scale-95 transition-all cursor-pointer">
                  <ImageIcon className="w-5 h-5" />
                  Choose from Gallery
                </div>
              </label>

              <button
                onClick={() => setShowPhotoOptions(false)}
                className="w-full h-12 text-neutral-600 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SafeArea>
    </div>
  );
};
