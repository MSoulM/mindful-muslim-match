import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BehavioralInsights } from '@/components/profile/BehavioralInsights';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function BehavioralInsightsDemo() {
  const navigate = useNavigate();
  
  const [demoProfile, setDemoProfile] = useState<
    'thoughtful' | 'quick' | 'expressive'
  >('thoughtful');

  const profiles = {
    thoughtful: {
      responseSpeed: 'thoughtful' as const,
      messageStyle: 'detailed' as const,
      activityHours: [19, 20, 21, 22, 23],
      emojiUsage: 'moderate' as const,
    },
    quick: {
      responseSpeed: 'immediate' as const,
      messageStyle: 'brief' as const,
      activityHours: [7, 8, 9, 12, 13, 17, 18],
      emojiUsage: 'minimal' as const,
    },
    expressive: {
      responseSpeed: 'quick' as const,
      messageStyle: 'medium' as const,
      activityHours: [10, 11, 14, 15, 16, 20, 21],
      emojiUsage: 'expressive' as const,
    },
  };

  return (
    <ScreenContainer>
      <TopBar
        variant="back"
        title="Behavioral Insights Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        {/* Profile Selector */}
        <Card className="p-4">
          <h3 className="font-semibold text-foreground mb-3">
            Demo Profiles
          </h3>
          <div className="flex gap-2">
            <Button
              variant={demoProfile === 'thoughtful' ? 'default' : 'outline'}
              onClick={() => setDemoProfile('thoughtful')}
              className="flex-1"
            >
              Thoughtful
            </Button>
            <Button
              variant={demoProfile === 'quick' ? 'default' : 'outline'}
              onClick={() => setDemoProfile('quick')}
              className="flex-1"
            >
              Quick
            </Button>
            <Button
              variant={demoProfile === 'expressive' ? 'default' : 'outline'}
              onClick={() => setDemoProfile('expressive')}
              className="flex-1"
            >
              Expressive
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Switch between profiles to see how insights adapt
          </p>
        </Card>

        {/* Insights Component */}
        <BehavioralInsights insights={profiles[demoProfile]} />

        {/* Info Card */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-medium text-foreground mb-2">About This Component</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Shows communication patterns in positive framing</li>
            <li>• No raw data exposed, only interpreted insights</li>
            <li>• Animated progress bars and activity visualization</li>
            <li>• Mobile-first responsive design</li>
            <li>• Privacy-conscious with clear controls</li>
          </ul>
        </Card>
      </div>
    </ScreenContainer>
  );
}
