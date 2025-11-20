import { useState } from 'react';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { SemanticProfileCompletion } from '@/components/profile/SemanticProfileCompletion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Toaster } from '@/components/ui/toaster';

const ProfileCompletionTest = () => {
  const [completion, setCompletion] = useState(67);

  const testCases = [
    { value: 30, label: '30% (Red)', description: 'Should show red circle, Bronze badge' },
    { value: 50, label: '50% (Yellow)', description: 'Should show yellow circle, Silver badge' },
    { value: 67, label: '67% (Yellow)', description: 'Default - 3% away from eligibility' },
    { value: 75, label: '75% (Green)', description: 'Should show green circle, Gold badge, eligible message' },
    { value: 95, label: '95% (Green)', description: 'Should show Diamond badge, NO CTA button' },
    { value: 100, label: '100% (Green)', description: 'Complete - NO CTA button' },
  ];

  return (
    <div className="min-h-screen bg-muted">
      <TopBar variant="back" title="Profile Completion Test" onBackClick={() => window.history.back()} />
      
      <ScreenContainer hasTopBar padding={false}>
        {/* Test Controls */}
        <div className="bg-background p-6 mb-1 border-b">
          <h2 className="font-semibold text-lg mb-3">Test Different Completion Levels</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Current completion: <span className="font-semibold text-foreground">{completion}%</span>
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {testCases.map((test) => (
              <Button
                key={test.value}
                variant={completion === test.value ? "default" : "outline"}
                size="sm"
                onClick={() => setCompletion(test.value)}
                className="text-xs"
              >
                {test.label}
              </Button>
            ))}
          </div>

          {/* Expected Behavior */}
          <div className="mt-4 p-3 bg-muted rounded-lg">
            <p className="text-xs font-semibold text-foreground mb-1">Expected Behavior:</p>
            <p className="text-xs text-muted-foreground">
              {testCases.find(t => t.value === completion)?.description}
            </p>
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="bg-background p-6 mb-1">
          <h3 className="font-semibold mb-3">Verification Checklist:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="text-xs">Visual</Badge>
              <div className="flex-1 text-muted-foreground">
                <div>✓ Circular progress visible</div>
                <div>✓ Animates on load (0% → actual%)</div>
                <div>✓ Colors: Red (0-30%), Yellow (31-69%), Green (70-100%)</div>
                <div>✓ Percentage number centered in circle</div>
              </div>
            </div>
            
            <div className="flex items-start gap-2 pt-2">
              <Badge variant="outline" className="text-xs">Responsive</Badge>
              <div className="flex-1 text-muted-foreground">
                <div>✓ 120px circle on mobile (375px)</div>
                <div>✓ 150px circle on desktop (1024px+)</div>
                <div>✓ Full-width button on mobile</div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Badge variant="outline" className="text-xs">Functionality</Badge>
              <div className="flex-1 text-muted-foreground">
                <div>✓ Red at 30%, Yellow at 50%, Green at 75%</div>
                <div>✓ CTA button disappears at 95%+ and 100%</div>
              </div>
            </div>

            <div className="flex items-start gap-2 pt-2">
              <Badge variant="outline" className="text-xs">Text</Badge>
              <div className="flex-1 text-muted-foreground">
                <div>✓ "3% away" at 67%</div>
                <div>✓ "ChaiChat Eligible" at 75%+</div>
                <div>✓ Correct badge: Bronze (0-40%), Silver (41-69%), Gold (70-89%), Diamond (90-100%)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Under Test */}
        <div className="p-6 bg-background">
          <SemanticProfileCompletion 
            completion={completion}
            onCompleteProfile={() => alert('Complete Profile clicked!')}
          />
        </div>

        {/* Device Size Indicator */}
        <div className="p-6 bg-muted">
          <p className="text-xs text-center text-muted-foreground">
            💡 Use the device preview buttons (📱/💻) above the preview to test responsive behavior
          </p>
        </div>
      </ScreenContainer>
      <Toaster />
    </div>
  );
};

export default ProfileCompletionTest;
