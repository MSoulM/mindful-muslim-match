import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input/TextInput';
import { TextArea } from '@/components/ui/Input/TextArea';
import { Camera, MapPin, Calendar, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { compressImage } from '@/utils/imageCompression';
import { CropModal } from '@/components/ui/CropModal';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    location: user?.location || '',
    age: user?.age || '',
  });

  const [isSaving, setIsSaving] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Profile updated successfully!');
      navigate('/profile');
    }, 1000);
  };

  const handlePhotoEdit = () => {
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
      
      setPhotoPreview(previewUrl);
      toast.success('Photo cropped and uploaded successfully!');
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
            disabled={isCompressing}
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
                <span className="text-4xl font-bold text-white">{user.initials}</span>
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
              <Camera className="w-5 h-5 text-primary-foreground" />
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
            {isCompressing ? 'Compressing image...' : 'Tap to change photo'}
          </p>
          
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Full Name
            </label>
            <TextInput
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              placeholder="Enter your name"
              className="w-full"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Bio
            </label>
            <TextArea
              value={formData.bio}
              onChange={(value) => setFormData({ ...formData, bio: value })}
              placeholder="Tell others about yourself..."
              maxLength={150}
              rows={4}
              className="w-full resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.bio.length}/150 characters
            </p>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <TextInput
              value={formData.location}
              onChange={(value) => setFormData({ ...formData, location: value })}
              placeholder="City, Country"
              className="w-full"
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Age
            </label>
            <TextInput
              value={String(formData.age)}
              onChange={(value) => setFormData({ ...formData, age: value })}
              placeholder="Your age"
              type="number"
              className="w-full"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-8 pb-6">
          <Button
            size="lg"
            onClick={handleSave}
            disabled={isSaving || !formData.name}
            className="w-full"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </ScreenContainer>
    </>
  );
};

export default EditProfileScreen;
