import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/CustomButton';
import { MobileTextInput } from '@/components/ui/Input/MobileTextInput';
import { MobileTextArea } from '@/components/ui/Input/MobileTextArea';
import { MapPin } from 'lucide-react';
import CustomDatePicker from '@/components/ui/CustomDatePicker';
import { useUser } from '@/context/UserContext';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';
import { PhotoGallery } from '@/components/profile/PhotoGallery';
import { VoiceIntroRecorder } from '@/components/profile/VoiceIntroRecorder';

const EditProfileScreen = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const { updateProfile } = useProfile();
  
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
  });

  const [isSaving, setIsSaving] = useState(false);

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
      setOriginalFormData(initialData);
    }
  }, [user]);

  // Check if form has changed
  const hasChanged = () => {
    return (
      formData.name !== originalFormData.name ||
      formData.bio !== originalFormData.bio ||
      formData.location !== originalFormData.location ||
      (formData.birthdate?.getTime() !== originalFormData.birthdate?.getTime())
    );
  };

  const handleSave = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      await updateProfile({
        firstName: formData.name.split(' ')[0] || '',
        lastName: formData.name.split(' ').slice(1).join(' ') || '',
        bio: formData.bio,
        location: formData.location || undefined,
        birthdate: formData.birthdate ? formData.birthdate.toISOString().slice(0, 10) : undefined,
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

  if (!user) return null;

  return (
    <>
      <TopBar
        variant="back"
        title="Edit Profile"
        onBackClick={() => navigate('/profile')}
      />
      
      <ScreenContainer hasTopBar className="px-5">
        {/* Photo Gallery Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Your Photos</h2>
          <PhotoGallery />
        </div>

        {/* Voice Introduction Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">Voice Introduction</h2>
          <VoiceIntroRecorder />
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
            disabled={isSaving || !formData.name || !hasChanged()}
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