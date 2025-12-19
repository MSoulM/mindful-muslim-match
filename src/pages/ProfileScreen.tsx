import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { FeatureCard } from '@/components/ui/Cards/FeatureCard';
import { Button } from '@/components/ui/CustomButton';
import { Badge } from '@/components/ui/badge';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { DepthProgress } from '@/components/profile/DepthProgress';
import { SemanticProfileCompletion } from '@/components/profile/SemanticProfileCompletion';
import { ChaiChatEligibilityTracker } from '@/components/profile/ChaiChatEligibilityTracker';
import { CategoryBalancePentagon } from '@/components/profile/CategoryBalancePentagon';
import { ContentTypeDistribution } from '@/components/profile/ContentTypeDistribution';
import { ErrorBoundary } from '@/components/utils/ErrorBoundary';
import { ProfileErrorFallback } from '@/components/errors/ProfileErrorFallback';
import { 
  Edit2, 
  Sliders, 
  Shield, 
  Bell, 
  Settings, 
  HelpCircle, 
  Pause,
  Camera,
  Crown,
  ChevronRight,
  Mic
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUser } from '@/context/UserContext';
import { useDNA } from '@/context/DNAContext';
import { useApp } from '@/context/AppContext';
import { usePremium } from '@/hooks/usePremium';

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const { user, logout } = useUser();
  const { overallScore } = useDNA();
  const { notificationCount } = useApp();
  const { premiumState } = usePremium();
  const { signOut } = useClerk();
  
  
  // Check if user is premium
  const isPremium = premiumState.isSubscribed;


  // Category completion data (defaults are set in useProfile hook)
  const categoryProgress = user?.categoryProgress || {
    values: user?.valuesCompletion ?? 0,
    interests: user?.interestsCompletion ?? 0,
    goals: user?.goalsCompletion ?? 0,
    lifestyle: user?.lifestyleCompletion ?? 0,
    family: user?.familyCompletion ?? 0,
  };

  // Content type data (defaults are set in useProfile hook)
  const contentTypeData = user?.contentTypeData || {
    text: user?.textCount ?? 0,
    photo: user?.photoCount ?? 0,
    voice: user?.voiceCount ?? 0,
    video: user?.videoCount ?? 0,
  };


  // Avatar logic
  const avatarUrl = user?.primaryPhotoUrl || '';
  const displayInitials = user?.firstName?.[0] && user?.lastName?.[0]
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : 'U';

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    if (tabId === 'profile') return;
    navigate(`/${tabId}`);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/sign-in');
  };

  const handlePauseProfile = () => {
    console.log('Pause profile');
  };

  const handleEditAvatar = () => {
    console.log('Edit avatar');
  };

  const handleEditProfile = () => {
    navigate('/edit-profile');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      <TopBar 
        variant="logo" 
        notificationCount={notificationCount}
        onNotificationClick={() => navigate('/notifications')}
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
            className="inline-block mb-4"
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center">
                <span className="text-3xl font-bold text-white">{displayInitials}</span>
              </div>
            )}
          </motion.button>

          {/* Name & Bio */}
          <h1 className="text-2xl font-bold text-foreground mb-1">{[user.firstName, user.lastName].filter(Boolean).join(' ')}</h1>
          <p className="text-sm text-muted-foreground mb-2">
            {user.location}
            {user.birthdate ? ` • Age ${Math.floor((Date.now() - new Date(user.birthdate).getTime()) / (365.25 * 24 * 60 * 60 * 1000))}` : ''}
          </p>
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
                <div className="text-2xl font-bold text-white">{user.matchCount ?? 0}</div>
                <div className="text-xs text-white/80">Matches</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{user.activeDays ?? 0}d</div>
                <div className="text-xs text-white/80">Active</div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Status Card */}
        <div className="mx-5 mb-5">
          {isPremium ? (
            <BaseCard
              padding="md"
              className="bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Premium Member</h3>
                    <p className="text-xs text-muted-foreground">All features unlocked</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/manage-subscription')}
                  className="text-primary hover:text-primary/80"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </BaseCard>
          ) : (
            <BaseCard
              padding="md"
              interactive
              onClick={() => navigate('/premium')}
              className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Free Member</h3>
                    <p className="text-xs text-muted-foreground">Upgrade to unlock all features</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-primary flex-shrink-0" />
              </div>
            </BaseCard>
          )}
        </div>

        {/* ChaiChat Eligibility Tracker (shows when <70%) */}
        <ErrorBoundary>
          <div className="mx-5">
            <ChaiChatEligibilityTracker 
              currentCompletion={67}
              onCompleteProfile={() => navigate('/edit-profile')}
            />
          </div>
        </ErrorBoundary>

        {/* Profile Completion */}
        <ErrorBoundary fallback={<ProfileErrorFallback />}>
          <div className="mx-5 mb-5">
            <SemanticProfileCompletion 
              onCompleteProfile={() => navigate('/edit-profile')}
            />
          </div>
        </ErrorBoundary>

        {/* Pentagon Visualization */}
        <div className="mx-5 mb-5">
          <CategoryBalancePentagon
            valuesCompletion={categoryProgress.values}
            interestsCompletion={categoryProgress.interests}
            goalsCompletion={categoryProgress.goals}
            lifestyleCompletion={categoryProgress.lifestyle}
            familyCompletion={categoryProgress.family}
          />
        </div>

        {/* Content Type Distribution */}
        <ErrorBoundary>
          <div className="mx-5 mb-5">
            <ContentTypeDistribution
              textCount={contentTypeData.text}
              photoCount={contentTypeData.photo}
              voiceCount={contentTypeData.voice}
              videoCount={contentTypeData.video}
            />
          </div>
        </ErrorBoundary>

        {/* Depth Progress */}
        <ErrorBoundary>
          <div className="mx-5 mb-5">
            <DepthProgress />
          </div>
        </ErrorBoundary>

        {/* Profile Sections */}
        <div className="flex flex-col gap-0.5 mb-8">
          <FeatureCard
            icon={<Edit2 className="w-6 h-6" />}
            title="Edit Profile"
            description="Photos, bio, basics"
            onClick={() => navigate('/edit-profile')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Mic className="w-6 h-6" />}
            title="Voice Onboarding"
            description="Record your voice introduction"
            onClick={() => navigate('/onboarding/voice-demo')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Sliders className="w-6 h-6" />}
            title="Preferences"
            description="Age, location, values"
            onClick={() => navigate('/preferences')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Privacy & Safety"
            description="Block, report, visibility"
            onClick={() => navigate('/settings/privacy')}
            className="rounded-none"
          />
          
          <FeatureCard
            icon={<Bell className="w-6 h-6" />}
            title="Notifications"
            onClick={() => navigate('/settings/notification-preferences')}
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
            onClick={() => navigate('/settings')}
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
            className="w-full text-center text-muted-foreground py-3 text-sm hover:bg-muted rounded-lg"
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
