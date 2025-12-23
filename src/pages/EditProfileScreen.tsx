import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/CustomButton';
import { MobileTextInput } from '@/components/ui/Input/MobileTextInput';
import { MobileTextArea } from '@/components/ui/Input/MobileTextArea';
import { Camera, MapPin, X } from 'lucide-react';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { toast } from 'sonner';
import { Toast } from '@/components/ui/Feedback/Toast';
import { compressImage } from '@/utils/imageCompression';
import { CropModal } from '@/components/ui/CropModal';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken } = useAuth();
  const { updateProfile } = useProfile();
  const { isGold } = useSubscriptionTier();
  
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    location: '',
    birthdate: undefined as Date | undefined,
  });

  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    bio: '',
    location: '',
    birthdate: undefined as Date | undefined,
    photoUrl: null as string | null,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(user?.primaryPhotoUrl || null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [paywallToast, setPaywallToast] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    description?: string;
  }>({
    isOpen: false,
    type: 'warning',
    title: ''
  });

  // Sync form data when user profile loads
  useEffect(() => {
    if (user) {
      const initialData = {
        name: [user.firstName, user.lastName].filter(Boolean).join(' '),
        bio: user.bio || '',
        location: user.location || '',
        birthdate: user.birthdate ? new Date(user.birthdate) : undefined,
      };
      setFormData(initialData);
      setOriginalFormData({
        ...initialData,
        photoUrl: user.primaryPhotoUrl || null,
      });
      if (user.primaryPhotoUrl) {
        setPhotoPreview(user.primaryPhotoUrl);
      }
    }
  }, [user]);

  // Check if form has changed
  const hasChanged = () => {
    return (
      formData.name !== originalFormData.name ||
      formData.bio !== originalFormData.bio ||
      formData.location !== originalFormData.location ||
      (formData.birthdate?.getTime() !== originalFormData.birthdate?.getTime()) ||
      photoPreview !== originalFormData.photoUrl
    );
  };

  // Upload the photo independently, returns the public URL or null on failure
  const uploadPhoto = async (): Promise<string | null> => {
    if (!user || !photoFile) return photoPreview;

    try {
      setIsUploadingPhoto(true);

      const userId = user.id;
      const filePath = `${userId}/avatar_images/${Date.now()}`;
      
      const { error: uploadError } = await supabase.storage
        .from('users')
        .upload(filePath, photoFile, { cacheControl: '3600', upsert: true });

      console.log('uploadError', uploadError);
      
      if (uploadError) {
        throw new Error(uploadError.message || 'Failed to upload avatar');
      }
      
      const { data } = supabase.storage
        .from('users')
        .getPublicUrl(filePath);
      
      const publicUrl = data.publicUrl;
      toast.success('Photo uploaded successfully!');

      // Once uploaded, we can clear the local file but keep the preview + URL
      setPhotoFile(null);
      setPhotoPreview(publicUrl);

      return publicUrl;
    } catch (error) {
      console.error('Failed to upload photo:', error);
      toast.error('Failed to upload photo.');
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      let uploadedPhotoUrl = photoPreview;

      // If there is a pending local photo file, upload it first
      if (photoFile) {
        const newUrl = await uploadPhoto();
        if (newUrl) {
          uploadedPhotoUrl = newUrl;
        }
      }

      await updateProfile({
        firstName: formData.name.split(' ')[0] || '',
        lastName: formData.name.split(' ')[1] || '',
        bio: formData.bio,
        location: formData.location || undefined,
        birthdate: formData.birthdate ? formData.birthdate.toISOString().slice(0, 10) : undefined,
        primaryPhotoUrl: uploadedPhotoUrl || undefined,
      });

      toast.success('Profile updated successfully!');
      navigate('/profile');
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoEdit = () => {
    if (!isGold) {
      setPaywallToast({
        isOpen: true,
        type: 'warning',
        title: 'Subscribe to Gold to add photos',
        description: 'Upgrade to Gold to upload photos and enhance your profile.'
      });
      return;
    }
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast.error('Image must be smaller than 20MB');
      return;
    }

    try {
      setIsCompressing(true);
      
      // Create preview URL for cropping
      const previewUrl = URL.createObjectURL(file);
      setImageToCrop(previewUrl);
      setCropModalOpen(true);
    } catch (error) {
      console.error('Error loading image:', error);
      toast.error('Failed to load image');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      setIsCompressing(true);

      // Convert blob to file for compression
      const croppedFile = new File([croppedImageBlob], 'cropped-image.jpg', {
        type: 'image/jpeg',
      });

      // Compress the cropped image
      const compressedFile = await compressImage(croppedFile, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.8,
        maxSizeMB: 2,
      });

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);
      
      // Clean up old preview if exists
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
      
      // Store the compressed file and preview
      setPhotoFile(compressedFile);
      setPhotoPreview(previewUrl);
      toast.success('Photo cropped successfully!');
    } catch (error) {
      console.error('Error processing cropped image:', error);
      toast.error('Failed to process cropped image');
    } finally {
      setIsCompressing(false);
      
      // Clean up crop image URL
      if (imageToCrop) {
        URL.revokeObjectURL(imageToCrop);
        setImageToCrop(null);
      }
    }
  };

  const handleRemovePhoto = () => {
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!user) return null;

  const displayInitials = user?.firstName?.[0] && user?.lastName?.[0] 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  if (!user) return null;

  return (
    <>
      <CropModal
        open={cropModalOpen}
        image={imageToCrop || ''}
        onClose={() => {
          setCropModalOpen(false);
          if (imageToCrop) {
            URL.revokeObjectURL(imageToCrop);
            setImageToCrop(null);
          }
        }}
        onCropComplete={handleCropComplete}
      />

      <TopBar
        variant="back"
        title="Edit Profile"
        onBackClick={() => navigate('/profile')}
      />
      
      <ScreenContainer hasTopBar className="px-5">
        {/* Profile Photo Section */}
        <div className="text-center mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePhotoEdit}
            disabled={isCompressing || isUploadingPhoto}
            className="relative inline-block"
          >
            {photoPreview ? (
              <img 
                src={photoPreview} 
                alt="Profile preview"
                className="w-32 h-32 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">{displayInitials}</span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
              {isUploadingPhoto ? (
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera className="w-5 h-5 text-primary-foreground" />
              )}
            </div>
          </motion.button>
          
          {photoPreview && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={handleRemovePhoto}
              className="mt-3 text-sm text-destructive hover:text-destructive/80 flex items-center gap-2 mx-auto"
            >
              <X className="w-4 h-4" />
              Remove photo
            </motion.button>
          )}
          
          <p className="text-sm text-muted-foreground mt-3">
            {isUploadingPhoto
              ? 'Uploading photo...'
              : isCompressing
              ? 'Compressing image...'
              : 'Tap to change photo'}
          </p>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <MobileTextInput
            label="Full Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="Enter your name"
            required
            autoFocus
            floatingLabel={false}
          />

          {/* Bio */}
          <MobileTextArea
            label="Bio"
            value={formData.bio}
            onChange={(value) => setFormData({ ...formData, bio: value })}
            placeholder="Tell others about yourself..."
            maxLength={150}
            minRows={4}
            maxRows={6}
            floatingLabel={false}
          />

          {/* Location */}
          <MobileTextInput
            label="Location"
            value={formData.location}
            onChange={(value) => setFormData({ ...formData, location: value })}
            placeholder="City, Country"
            icon={<MapPin className="w-5 h-5" />}
            floatingLabel={false}
          />

          <div>
            <label className="text-sm font-semibold text-foreground block mb-2">Date of Birth</label>
            <CustomDatePicker
              value={formData.birthdate}
              onChange={(d) => setFormData(prev => ({ ...prev, birthdate: d ?? undefined }))}
              minDate={new Date('1940-01-01')}
              maxDate={new Date()}
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pb-6">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={isSaving || isUploadingPhoto || !formData.name || !hasChanged()}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </ScreenContainer>

      {/* Paywall Toast */}
      <Toast
        type={paywallToast.type}
        title={paywallToast.title}
        description={paywallToast.description}
        isOpen={paywallToast.isOpen}
        onClose={() => setPaywallToast(prev => ({ ...prev, isOpen: false }))}
        duration={5000}
        position="top-right"
      />
    </>
  );
};

export default EditProfileScreen;
