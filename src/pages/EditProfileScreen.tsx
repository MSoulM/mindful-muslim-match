import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Button } from '@/components/ui/Button';
import { TextInput } from '@/components/ui/Input/TextInput';
import { TextArea } from '@/components/ui/Input/TextArea';
import { Camera, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';

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
    toast.info('Photo upload coming soon!');
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
        {/* Profile Photo Section */}
        <div className="text-center mb-8">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handlePhotoEdit}
            className="relative inline-block"
          >
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
              <span className="text-4xl font-bold text-white">{user.initials}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary flex items-center justify-center border-4 border-background shadow-lg">
              <Camera className="w-5 h-5 text-primary-foreground" />
            </div>
          </motion.button>
          <p className="text-sm text-muted-foreground mt-3">
            Tap to change photo
          </p>
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
