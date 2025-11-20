import { useState } from 'react';
import { SupportMode } from '@/components/chat/SupportMode';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function SupportModeTest() {
  const [showSupportMode, setShowSupportMode] = useState(false);

  return (
    <>
      <TopBar variant="back" title="Support Mode Test" />
      <ScreenContainer hasBottomNav={false}>
        <div className="p-6 space-y-6">
          <div className="bg-card rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold">Support Mode Component Test</h2>
            <p className="text-sm text-muted-foreground">
              This component displays when distress is detected in conversation. 
              It provides crisis resources, helpline numbers, and calming tools.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-muted/50 rounded-lg space-y-2">
                <h3 className="font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Features Included:
                </h3>
                <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                  <li>Warmer color scheme (rose/amber gradients)</li>
                  <li>Prominent helpline numbers (UK-based)</li>
                  <li>Calming breathing exercise with animations</li>
                  <li>Simplified interface focused on support</li>
                  <li>Quick access to human support escalation</li>
                  <li>Crisis banner at top with comforting message</li>
                </ul>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <h3 className="font-medium mb-2">Helplines Included:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Samaritans: 116 123 (24/7)</li>
                  <li>• Muslim Youth Helpline: 0808 808 2008</li>
                  <li>• Crisis Text Line: SHOUT to 85258</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setShowSupportMode(true)}
              className="w-full"
            >
              Trigger Support Mode
            </Button>
          </div>
        </div>
      </ScreenContainer>

      {showSupportMode && (
        <SupportMode
          userName="Sarah"
          onClose={() => setShowSupportMode(false)}
          onEscalate={() => {
            console.log('Escalating to human support...');
            alert('In production, this would connect to a human counselor.');
          }}
        />
      )}
    </>
  );
}
