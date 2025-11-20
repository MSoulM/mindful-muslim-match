import { useState } from 'react';
import { PersonalityCard } from '@/components/profile/PersonalityCard';
import { PersonalityType, PERSONALITIES } from '@/components/onboarding/PersonalityQuiz';
import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/card';

const PersonalityCardTest = () => {
  const { toast } = useToast();
  const [currentPersonality, setCurrentPersonality] = useState<PersonalityType>('warm_supportive');

  const handleChangePersonality = (personality: PersonalityType) => {
    setCurrentPersonality(personality);
    const config = PERSONALITIES[personality];
    
    toast({
      title: 'Personality Changed!',
      description: `MMAgent is now ${config.name} - ${config.tagline}`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="back" title="Personality Card Test" onBackClick={() => window.history.back()} />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            MMAgent Personality Display
          </h1>
          <p className="text-muted-foreground">
            View and change your AI guide's personality
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Personality Card */}
          <div className="lg:col-span-2">
            <PersonalityCard
              currentPersonality={currentPersonality}
              onChangePersonality={handleChangePersonality}
              showChangeButton={true}
            />
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-3">Features Tested</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>Current personality display</li>
                <li>Avatar and name</li>
                <li>Description and traits</li>
                <li>Sample responses (3 per personality)</li>
                <li>Change personality button</li>
                <li>Settings dialog with all 4 options</li>
                <li>Preview before confirming</li>
                <li>Current personality indicator</li>
                <li>Smooth animations</li>
              </ul>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Current Selection</h3>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
                  {PERSONALITIES[currentPersonality].avatar}
                </div>
                <div>
                  <p className="font-medium">{PERSONALITIES[currentPersonality].name}</p>
                  <p className="text-xs text-muted-foreground">
                    {PERSONALITIES[currentPersonality].tagline}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {PERSONALITIES[currentPersonality].traits.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-primary/5 border-primary/20">
              <h3 className="font-semibold mb-2">All Personalities</h3>
              <div className="space-y-3">
                {(Object.entries(PERSONALITIES) as [PersonalityType, typeof PERSONALITIES[PersonalityType]][]).map(
                  ([key, config]) => (
                    <div
                      key={key}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded",
                        currentPersonality === key && "bg-primary/10"
                      )}
                    >
                      <span className="text-xl">{config.avatar}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{config.name}</p>
                        <p className="text-xs text-muted-foreground">{config.tagline}</p>
                      </div>
                      {currentPersonality === key && (
                        <span className="text-xs text-primary">✓</span>
                      )}
                    </div>
                  )
                )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Test Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setCurrentPersonality('warm_supportive')}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted text-left"
                >
                  Set to Amina (Warm)
                </button>
                <button
                  onClick={() => setCurrentPersonality('cheerful_energetic')}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted text-left"
                >
                  Set to Zara (Cheerful)
                </button>
                <button
                  onClick={() => setCurrentPersonality('calm_thoughtful')}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted text-left"
                >
                  Set to Amir (Calm)
                </button>
                <button
                  onClick={() => setCurrentPersonality('wise_gentle')}
                  className="w-full px-3 py-2 bg-background border border-border rounded text-sm hover:bg-muted text-left"
                >
                  Set to Noor (Spiritual)
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityCardTest;

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
