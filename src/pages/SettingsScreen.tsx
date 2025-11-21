import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { FeatureCard } from '@/components/ui/Cards/FeatureCard';
import { Switch } from '@/components/ui/switch';
import { 
  Mail, Phone, CheckCircle, Globe, Bell, Palette, 
  Eye, UserX, Lock, HelpCircle, MessageSquare, 
  FileText, PauseCircle, Trash2, Info, Send, Shield, Brain
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/CustomButton';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { MMAgentSettings } from '@/components/settings/MMAgentSettings';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';

export default function SettingsScreen() {
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('light');
  const { isAdmin } = useAdminCheck();
  
  // Mock data - in production, this would come from user profile/database
  const userPersonality: UserPersonalityType = 'wise_aunty';
  const daysAgo = 12; // Days since personality was assigned

  const handleNotificationToggle = (checked: boolean) => {
    setNotificationsEnabled(checked);
    localStorage.setItem('notifications-enabled', JSON.stringify(checked));
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Settings"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20">
        {/* My Agent Section */}
        <div className="px-5 pt-6 pb-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">My Agent</h2>
          <MMAgentSettings 
            personalityType={userPersonality}
            daysAgo={daysAgo}
          />
        </div>

        {/* Account Section */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Account</h2>
          <div className="space-y-2">
            <FeatureCard
              icon={<Mail className="w-6 h-6" />}
              title="Email & Password"
              description="ahmed@example.com"
              onClick={() => {/* Navigate to email settings */}}
            />
            
            <FeatureCard
              icon={<Phone className="w-6 h-6" />}
              title="Phone Number"
              description="+44 7*** ***234"
              onClick={() => {/* Navigate to phone settings */}}
              rightElement={
                <Badge variant="default" className="bg-semantic-success/10 text-semantic-success border-semantic-success/20">
                  Verified
                </Badge>
              }
            />
            
            <FeatureCard
              icon={<CheckCircle className="w-6 h-6" />}
              title="Verification Status"
              description="Profile verified"
              onClick={() => {/* Navigate to verification */}}
              rightElement={
                <CheckCircle className="w-5 h-5 text-semantic-success" />
              }
            />
          </div>
        </div>

        {/* Preferences Section */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Preferences</h2>
          <div className="space-y-2">
            <FeatureCard
              icon={<Globe className="w-6 h-6" />}
              title="Language"
              description="English (UK)"
              onClick={() => {/* Navigate to language settings */}}
            />
            
            <FeatureCard
              icon={<Bell className="w-6 h-6" />}
              title="Notifications"
              onClick={() => navigate('/settings/notifications')}
              rightElement={
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={handleNotificationToggle}
                  onClick={(e) => e.stopPropagation()}
                />
              }
            />
            
            <FeatureCard
              icon={<Palette className="w-6 h-6" />}
              title="App Theme"
              description="Light"
              onClick={() => {/* Navigate to theme settings */}}
            />
          </div>
        </div>

        {/* Privacy Section */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Privacy</h2>
          <div className="space-y-2">
            <FeatureCard
              icon={<Brain className="w-6 h-6" />}
              title="MMAgent Memory"
              description="Manage conversation memories"
              onClick={() => navigate('/memory')}
            />
            
            <FeatureCard
              icon={<Eye className="w-6 h-6" />}
              title="Profile Visibility"
              description="Visible to matches"
              onClick={() => navigate('/settings/privacy')}
            />
            
            <FeatureCard
              icon={<UserX className="w-6 h-6" />}
              title="Block List"
              description="3 users blocked"
              onClick={() => navigate('/settings/privacy#blocked')}
            />
            
            <FeatureCard
              icon={<Lock className="w-6 h-6" />}
              title="Data & Privacy"
              description="Manage your data"
              onClick={() => navigate('/settings/privacy#data')}
            />
          </div>
        </div>

        {/* Support Section */}
        <div className="px-5 py-4">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Support</h2>
          <div className="space-y-2">
            {/* Admin-only Analytics Link */}
            {isAdmin && (
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-primary" />}
                title="Admin Analytics"
                description="Platform-wide metrics"
                onClick={() => navigate('/admin/analytics')}
                rightElement={
                  <Badge variant="default" className="bg-primary/10 text-primary border-primary/20">
                    Admin
                  </Badge>
                }
              />
            )}
            
            <FeatureCard
              icon={<HelpCircle className="w-6 h-6" />}
              title="Help Center"
              onClick={() => navigate('/help')}
            />
            
            <FeatureCard
              icon={<MessageSquare className="w-6 h-6" />}
              title="Send Feedback"
              description="Share your thoughts"
              onClick={() => navigate('/settings/feedback')}
            />
            
            <FeatureCard
              icon={<Info className="w-6 h-6" />}
              title="About"
              description="v2.1.0"
              onClick={() => navigate('/settings/about')}
            />
            
            <FeatureCard
              icon={<FileText className="w-6 h-6" />}
              title="Terms & Privacy"
              description="Legal information"
              onClick={() => navigate('/settings/terms')}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="px-5 py-4 pb-8">
          <h2 className="text-sm font-semibold text-semantic-error mb-3">Danger Zone</h2>
          <div className="space-y-3">
            <Button
              variant="secondary"
              className="w-full border-semantic-warning text-semantic-warning hover:bg-semantic-warning/10"
              onClick={() => {/* Navigate to pause account */}}
            >
              <PauseCircle className="w-5 h-5 mr-2" />
              Pause Account
            </Button>
            
            <Button
              variant="ghost"
              className="w-full text-semantic-error hover:bg-semantic-error/10"
              onClick={() => navigate('/settings/delete-account')}
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </ScreenContainer>
  );
}
