import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FeatureCard } from '@/components/ui/Cards/FeatureCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit2, 
  Sliders, 
  Shield, 
  Bell, 
  Settings, 
  HelpCircle, 
  Pause,
  Camera 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useDNA } from '@/context/DNAContext';
import { useApp } from '@/context/AppContext';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { user, logout } = useUser();
  const { overallScore } = useDNA();
  const { notificationCount } = useApp();

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'profile') return;
    navigate(`/${tabId}`);
  };

  const handleSignOut = () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      logout();
      navigate('/');
    }
  };

  const handlePauseProfile = () => {
    console.log('Pause profile');
  };

  const handleEditAvatar = () => {
    console.log('Edit avatar');
  };

  const handleEditProfile = () => {
    console.log('Edit profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <TopBar 
        variant="logo" 
        notificationCount={notificationCount}
        userInitials={user.initials}
        onNotificationClick={() => navigate('/notifications')}
        onProfileClick={() => {}}
      />
      
      <ScreenContainer 
        hasTopBar 
        hasBottomNav
        padding={false}
      >
        {/* Profile Header */}
        <div className="bg-background p-6 text-center relative">
          <button
            onClick={handleEditProfile}
            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground"
          >
            <Edit2 className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleEditAvatar}
            className="relative inline-block mb-4"
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{user.initials}</span>
            </div>
            <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-background">
              <Camera className="w-4 h-4 text-primary-foreground" />
            </div>
          </motion.button>

          {/* Name & Bio */}
          <h1 className="text-2xl font-bold text-foreground mb-1">{user.name}</h1>
          <p className="text-sm text-muted-foreground mb-2">{user.location} • {user.age}</p>
          <p className="text-sm text-foreground/80 max-w-md mx-auto">
            {user.bio}
          </p>
        </div>

        {/* Quick Stats Card */}
        <div className="mx-5 mb-5 -mt-2">
          <div className="bg-gradient-to-br from-primary/80 to-primary rounded-2xl p-4 shadow-lg">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-white">{overallScore}%</div>
                <div className="text-xs text-white/80">DNA</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user.matchCount}</div>
                <div className="text-xs text-white/80">Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user.activeDays}d</div>
                <div className="text-xs text-white/80">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Sections */}
        <div className="flex flex-col gap-0.5 mb-8">
          <FeatureCard
            icon={<Edit2 className="w-6 h-6" />}
            title="Edit Profile"
            description="Photos, bio, basics"
            onClick={() => console.log('Edit profile')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Sliders className="w-6 h-6" />}
            title="Preferences"
            description="Age, location, values"
            onClick={() => console.log('Preferences')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Privacy & Safety"
            description="Block, report, visibility"
            onClick={() => console.log('Privacy')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Bell className="w-6 h-6" />}
            title="Notifications"
            onClick={() => console.log('Notifications')}
            className="rounded-none"
            rightElement={
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                On
              </Badge>
            }
          />
          
          <FeatureCard
            icon={<Settings className="w-6 h-6" />}
            title="Account Settings"
            description="Email, password, plan"
            onClick={() => console.log('Account settings')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<HelpCircle className="w-6 h-6" />}
            title="Help & Support"
            description="FAQs, contact us"
            onClick={() => navigate('/help')}
            className="rounded-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="px-5 space-y-3 mt-8">
          <Button
            variant="secondary"
            size="lg"
            onClick={handlePauseProfile}
            className="w-full border-orange-500 text-orange-500 hover:bg-orange-50"
          >
            <Pause className="w-5 h-5 mr-2" />
            Pause Profile
          </Button>
          
          <button
            onClick={handleSignOut}
            className="w-full text-center text-muted-foreground py-3 text-sm"
          >
            Sign Out
          </button>
        </div>

        {/* Footer */}
        <div className="text-center py-6 pb-24">
          <p className="text-xs text-muted-foreground mb-1">MuslimSoulmate.ai v2.1.0</p>
          <a href="#" className="text-xs text-primary hover:underline">
            Terms & Privacy
          </a>
        </div>
      </ScreenContainer>

      <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default ProfileScreen;
