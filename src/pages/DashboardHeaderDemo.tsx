import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { UserPersonalityType } from '@/types/onboarding';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useSubscriptionTier } from '@/hooks/useSubscriptionTier';
import { Toast } from '@/components/ui/Feedback/Toast';

export default function DashboardHeaderDemo() {
  const navigate = useNavigate();
  const [hasNewInsights, setHasNewInsights] = useState(true);
  const { isGold } = useSubscriptionTier();
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
  
  // Mock personality type - in production this would come from user profile
  const personalityType: UserPersonalityType = 'wise_aunty';

  const handleChatClick = () => {
    if (!isGold) {
      setPaywallToast({
        isOpen: true,
        type: 'warning',
        title: 'Subscribe to Gold to chat with your MyAgent',
        description: 'Upgrade to Gold to unlock AI-powered conversations with your personal agent.'
      });
      return;
    }
    navigate('/agent-chat');
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Dashboard Header Demo"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto p-6 pb-20 space-y-6">
        {/* Demo Instructions */}
        <Card className="p-6 bg-muted/50">
          <h2 className="text-lg font-semibold mb-3">Demo Instructions</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• The header displays your custom agent name if set (via Settings)</li>
            <li>• Falls back to personality type name if no custom name</li>
            <li>• Greeting message adapts based on whether agent is named</li>
            <li>• "New" badge appears when hasNewInsights is true</li>
            <li>• Click the button to test navigation</li>
          </ul>
        </Card>

        {/* Live Demo */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Live Demo</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setHasNewInsights(!hasNewInsights)}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Toggle Insights Badge
            </Button>
          </div>

          <DashboardHeader
            personalityType={personalityType}
            onChatClick={handleChatClick}
            hasNewInsights={hasNewInsights}
          />
        </div>

        {/* Variations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">All Personality Variants</h3>
          <div className="space-y-4">
            {(['wise_aunty', 'modern_scholar', 'spiritual_guide', 'cultural_bridge'] as UserPersonalityType[]).map((type) => (
              <DashboardHeader
                key={type}
                personalityType={type}
                hasNewInsights={false}
              />
            ))}
          </div>
        </Card>

        {/* Testing Notes */}
        <Card className="p-6 bg-accent/5">
          <h3 className="text-lg font-semibold mb-3">Testing Notes</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong>To test custom name:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-2">
              <li>Go to Settings (via navigation)</li>
              <li>Find "My Agent" section at the top</li>
              <li>Click the edit button and enter a custom name</li>
              <li>Save and return to this demo</li>
              <li>The header should now show your custom name</li>
            </ol>
          </div>
        </Card>
      </div>

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
    </ScreenContainer>
  );
}
