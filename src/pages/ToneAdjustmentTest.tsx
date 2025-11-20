import { useState } from 'react';
import { ToneAdjustment } from '@/components/settings/ToneAdjustment';
import { PersonalityType, PERSONALITIES } from '@/components/onboarding/PersonalityQuiz';
import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/card';

const ToneAdjustmentTest = () => {
  const { toast } = useToast();
  const [currentPersonality] = useState<PersonalityType>('warm_supportive');

  const handleSave = (settings: any) => {
    console.log('Saved tone settings:', settings);
    toast({
      title: 'Settings Saved',
      description: 'Tone preferences updated successfully',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="back" title="Tone Adjustment Test" onBackClick={() => window.history.back()} />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            MMAgent Tone Customization
          </h1>
          <p className="text-muted-foreground">
            Adjust how your AI guide communicates with you
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Tone Adjustment Component */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <ToneAdjustment
                currentPersonality={currentPersonality}
                onSave={handleSave}
              />
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Features Tested</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>4 tone sliders (Warmth, Formality, Energy, Empathy)</li>
                <li>Numeric display (X/10)</li>
                <li>Min/max labels</li>
                <li>Live preview with 500ms debounce</li>
                <li>4 preset combinations</li>
                <li>Reset to defaults</li>
                <li>Save settings</li>
                <li>Personality context</li>
                <li>Loading state on preview</li>
                <li>LocalStorage persistence</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Current Personality</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl">
                  {PERSONALITIES[currentPersonality].avatar}
                </div>
                <div>
                  <p className="font-medium text-sm">{PERSONALITIES[currentPersonality].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PERSONALITIES[currentPersonality].tagline}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Tone adjustments will customize how {PERSONALITIES[currentPersonality].name} speaks with you
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Preset Descriptions</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Default</p>
                  <p className="text-xs text-muted-foreground">Balanced for general use</p>
                </div>
                <div>
                  <p className="font-medium">Professional</p>
                  <p className="text-xs text-muted-foreground">More formal and structured</p>
                </div>
                <div>
                  <p className="font-medium">Friendly</p>
                  <p className="text-xs text-muted-foreground">Warm and casual tone</p>
                </div>
                <div>
                  <p className="font-medium">Supportive</p>
                  <p className="text-xs text-muted-foreground">High empathy and understanding</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2">Tone Settings Info</h3>
              <p className="text-xs text-muted-foreground">
                Settings are saved to localStorage and persist across sessions. 
                Preview updates automatically after 500ms of inactivity.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ToneAdjustmentTest;
