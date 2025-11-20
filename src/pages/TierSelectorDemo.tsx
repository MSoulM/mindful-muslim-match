import { useState } from 'react';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BottomNav } from '@/components/layout/BottomNav';
import { TierSelector } from '@/components/chaichat/TierSelector';
import { Button } from '@/components/ui/button';
import { BaseCard } from '@/components/ui/Cards/BaseCard';

const TierSelectorDemo = () => {
  const [selectedTier, setSelectedTier] = useState<'standard' | 'deep' | 'expert'>('deep');
  const [userType, setUserType] = useState<'free' | 'premium' | 'vip'>('premium');
  const [activeTab, setActiveTab] = useState('chaichat');

  return (
    <ScreenContainer>
      <TopBar variant="back" title="Intelligence Tiers" onBackClick={() => window.history.back()} />

      <div className="px-4 pt-4 pb-24 space-y-4">
        {/* Demo Controls */}
        <BaseCard>
          <h3 className="text-md font-semibold text-foreground mb-3">Demo Controls</h3>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">User Type</label>
              <div className="flex gap-2">
                <Button
                  variant={userType === 'free' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserType('free')}
                >
                  Free
                </Button>
                <Button
                  variant={userType === 'premium' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserType('premium')}
                >
                  Premium
                </Button>
                <Button
                  variant={userType === 'vip' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setUserType('vip')}
                >
                  VIP
                </Button>
              </div>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Selected Tier: <span className="font-semibold text-foreground">{selectedTier}</span>
              </p>
            </div>
          </div>
        </BaseCard>

        {/* Tier Selector Component */}
        <TierSelector
          selectedTier={selectedTier}
          onTierSelect={setSelectedTier}
          userType={userType}
          autoSelected={true}
          monthlyMatchEstimate={20}
        />

        {/* Info Card */}
        <BaseCard className="bg-blue-50 border-blue-200">
          <h4 className="text-sm font-semibold text-foreground mb-2">How It Works</h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• Standard: Fast basic screening using GPT-4o-mini ($0.002/match)</li>
            <li>• Deep: Comprehensive analysis with Claude Sonnet 3.5 ($0.035/match)</li>
            <li>• Expert: Premium analysis with optional human review ($0.08/match)</li>
          </ul>
        </BaseCard>
      </div>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </ScreenContainer>
  );
};

export default TierSelectorDemo;
