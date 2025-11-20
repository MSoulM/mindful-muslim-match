import { useState } from 'react';
import { UserStateIndicator, UserState, EngagementLevel, ConcernType } from '@/components/chat/UserStateIndicator';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const UserStateIndicatorTest = () => {
  const [userState, setUserState] = useState<UserState>({
    profileCompletion: 75,
    lastMatchDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    engagementLevel: 'moderate',
    currentConcern: 'no_responses',
    concernMessage: 'Try being more proactive in conversations'
  });

  const updateProfileCompletion = (value: number) => {
    setUserState(prev => ({ ...prev, profileCompletion: value }));
  };

  const updateEngagement = (level: EngagementLevel) => {
    setUserState(prev => ({ ...prev, engagementLevel: level }));
  };

  const updateConcern = (concern: ConcernType) => {
    setUserState(prev => ({ ...prev, currentConcern: concern }));
  };

  const updateMatchDate = (daysAgo: number) => {
    const date = daysAgo > 0 
      ? new Date(Date.now() - 1000 * 60 * 60 * 24 * daysAgo)
      : undefined;
    setUserState(prev => ({ ...prev, lastMatchDate: date }));
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="back" title="User State Indicator Test" onBackClick={() => window.history.back()} />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            User State Display System
          </h1>
          <p className="text-muted-foreground">
            Visual indicators for profile status and engagement
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Display Variants */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Full Variant</h3>
              <UserStateIndicator userState={userState} variant="full" />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Compact Variant</h3>
              <UserStateIndicator userState={userState} variant="compact" />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Inline Variant (Chat Header)</h3>
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full" />
                  <div>
                    <p className="font-medium text-sm">Chat with MMAgent</p>
                    <UserStateIndicator userState={userState} variant="inline" />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Color Coding Examples</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-muted-foreground">
                    Green = Positive (80%+ completion, Active engagement)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-sm text-muted-foreground">
                    Amber = Neutral (50-79% completion, Moderate engagement)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-muted-foreground">
                    Red = Concern (&lt;50% completion, Inactive)
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Features Tested</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Profile completion progress</li>
                <li>Days since match reminder</li>
                <li>Engagement level badge</li>
                <li>Current concern pills</li>
                <li>Color coding system</li>
                <li>State-based icons</li>
                <li>Tooltips with explanations</li>
                <li>3 display variants</li>
                <li>Non-intrusive design</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Profile Completion</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm mb-1">
                  <span>Current: {userState.profileCompletion}%</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => updateProfileCompletion(30)}>
                    30%
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateProfileCompletion(60)}>
                    60%
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => updateProfileCompletion(90)}>
                    90%
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Engagement Level</h3>
              <div className="space-y-2">
                <Button
                  size="sm"
                  variant={userState.engagementLevel === 'active' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => updateEngagement('active')}
                >
                  Active
                </Button>
                <Button
                  size="sm"
                  variant={userState.engagementLevel === 'moderate' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => updateEngagement('moderate')}
                >
                  Moderate
                </Button>
                <Button
                  size="sm"
                  variant={userState.engagementLevel === 'inactive' ? 'default' : 'outline'}
                  className="w-full"
                  onClick={() => updateEngagement('inactive')}
                >
                  Inactive
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Days Since Match</h3>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateMatchDate(3)}>
                  3 days ago
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateMatchDate(10)}>
                  10 days ago (shows reminder)
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateMatchDate(0)}>
                  No matches yet
                </Button>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Current Concern</h3>
              <div className="space-y-2">
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateConcern('no_matches')}>
                  No Matches
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateConcern('no_responses')}>
                  Low Response
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateConcern('profile_incomplete')}>
                  Profile Incomplete
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateConcern('long_gap')}>
                  Long Absence
                </Button>
                <Button size="sm" variant="outline" className="w-full" onClick={() => updateConcern(null)}>
                  None
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStateIndicatorTest;
