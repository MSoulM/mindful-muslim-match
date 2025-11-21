import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PremiumCard } from '@/components/ui/animated/PremiumCard';
import { SuccessCelebration } from '@/components/ui/animated/SuccessCelebration';
import { FloatingParticles } from '@/components/ui/animated/FloatingParticles';
import { Button } from '@/components/ui/CustomButton';
import { ReadMore } from '@/components/ui/ReadMore';
import { FormattedNumber } from '@/components/ui/FormattedNumber';
import { RelativeTime } from '@/components/ui/RelativeTime';
import { formatNumber, formatRelativeTime, truncateText } from '@/utils/formatters';
import { Sparkles, TrendingUp, Users, Heart, Clock, DollarSign, Award } from 'lucide-react';

export default function PremiumPolishDemo() {
  const navigate = useNavigate();
  const [showSuccess, setShowSuccess] = useState(false);

  const longText = `Muslim Soulmate AI uses advanced AI technology and Soul DNA matching to connect Muslims seeking meaningful relationships. Our comprehensive matching algorithm analyzes values, personality traits, lifestyle preferences, and goals to find your perfect match. With verified profiles, robust safety features, and a growing community of serious individuals, we're revolutionizing how Muslims find their life partners. Join thousands of users who have found lasting connections through our platform.`;

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Premium Polish Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto pb-20 relative">
        {/* Floating Background Particles */}
        <FloatingParticles count={20} />

        {/* Hero Section */}
        <div className="px-5 pt-6 pb-6">
          <PremiumCard variant="gradient" glow className="p-6 text-center">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Premium Polish Features
            </h1>
            <p className="text-sm text-muted-foreground">
              Explore the delightful touches that make this app special
            </p>
          </PremiumCard>
        </div>

        {/* Visual Polish Examples */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Visual Polish</h2>
          <div className="space-y-3">
            <PremiumCard variant="default" hover className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Default Card</h3>
              <p className="text-sm text-muted-foreground">
                Subtle shadows and depth with hover effects
              </p>
            </PremiumCard>

            <PremiumCard variant="glass" hover className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Glass Card</h3>
              <p className="text-sm text-muted-foreground">
                Glassmorphism with backdrop blur effect
              </p>
            </PremiumCard>

            <PremiumCard variant="gradient" hover glow className="p-5">
              <h3 className="font-semibold text-foreground mb-2">Gradient Card</h3>
              <p className="text-sm text-muted-foreground">
                Subtle gradient with premium glow shadow
              </p>
            </PremiumCard>
          </div>
        </div>

        {/* Number Formatting */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Smart Formatting</h2>
          <PremiumCard variant="glass" className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <FormattedNumber value={125847} animated />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-semantic-error" />
                <span className="text-sm text-muted-foreground">Matches Made</span>
              </div>
              <FormattedNumber value={45230} animated suffix=" matches" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-semantic-success" />
                <span className="text-sm text-muted-foreground">Success Rate</span>
              </div>
              <FormattedNumber value={94} animated suffix="%" />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                <span className="text-sm text-muted-foreground">Revenue (Raw)</span>
              </div>
              <span className="font-semibold text-foreground">
                {formatNumber(5847239, { style: 'currency' })}
              </span>
            </div>
          </PremiumCard>
        </div>

        {/* Relative Time */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Relative Time</h2>
          <PremiumCard variant="glass" className="p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Last active</p>
                <RelativeTime date={new Date(Date.now() - 1000 * 60 * 5)} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Joined</p>
                <RelativeTime date={new Date(Date.now() - 1000 * 60 * 60 * 24 * 7)} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Message sent</p>
                <p className="text-sm font-medium text-foreground">
                  {formatRelativeTime(new Date(Date.now() - 1000 * 60 * 60 * 2))}
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>

        {/* Text Truncation */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Smart Text</h2>
          <PremiumCard variant="glass" className="p-5">
            <h3 className="font-semibold text-foreground mb-3">About Our App</h3>
            <ReadMore text={longText} maxLength={100} />
            
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Manual truncation:</p>
              <p className="text-sm text-muted-foreground">
                {truncateText(longText, 80)}
              </p>
            </div>
          </PremiumCard>
        </div>

        {/* Success Celebration */}
        <div className="px-5 pb-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Celebrations</h2>
          <PremiumCard variant="gradient" className="p-5">
            <div className="text-center">
              <Award className="w-12 h-12 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Success Moments</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Celebrate achievements with confetti and animations
              </p>
              <Button onClick={() => setShowSuccess(true)}>
                Trigger Celebration
              </Button>
            </div>
          </PremiumCard>
        </div>

        {/* Navigation to Final Touches */}
        <div className="px-5 pb-8">
          <h2 className="text-sm font-semibold text-muted-foreground mb-3">Explore More</h2>
          <div className="space-y-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/settings/about')}
            >
              About Screen
            </Button>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/settings/feedback')}
            >
              Feedback Screen
            </Button>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/settings/privacy-policy')}
            >
              Privacy Policy
            </Button>
            
            <Button
              variant="secondary"
              fullWidth
              onClick={() => navigate('/settings/terms')}
            >
              Terms of Service
            </Button>
          </div>
        </div>
      </div>

      {/* Success Celebration Overlay */}
      <SuccessCelebration
        show={showSuccess}
        title="Awesome!"
        message="You've discovered the celebration feature"
        onComplete={() => setShowSuccess(false)}
      />
    </ScreenContainer>
  );
}
