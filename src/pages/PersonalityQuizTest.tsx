import { useState } from 'react';
import { PersonalityQuiz, PersonalityType, PERSONALITIES } from '@/components/onboarding/PersonalityQuiz';
import { useToast } from '@/hooks/use-toast';
import { TopBar } from '@/components/layout/TopBar';
import { Card } from '@/components/ui/card';

const PersonalityQuizTest = () => {
  const { toast } = useToast();
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const handleComplete = (personality: PersonalityType) => {
    setSelectedPersonality(personality);
    setQuizCompleted(true);
    
    const config = PERSONALITIES[personality];
    toast({
      title: 'Personality Selected!',
      description: `You'll be guided by ${config.name} - ${config.tagline}`,
    });
  };

  const handleSkip = () => {
    toast({
      title: 'Quiz Skipped',
      description: 'You can set your MMAgent personality later in settings',
    });
  };

  const handleReset = () => {
    setSelectedPersonality(null);
    setQuizCompleted(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar variant="back" title="Personality Quiz Test" onBackClick={() => window.history.back()} />
      
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground mb-3">
            Choose Your MMAgent Personality
          </h1>
          <p className="text-muted-foreground">
            Answer 3 quick questions to find your perfect AI guide
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quiz Section */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              {quizCompleted && selectedPersonality ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">
                    {PERSONALITIES[selectedPersonality].avatar}
                  </div>
                  <h2 className="text-2xl font-bold mb-2">
                    {PERSONALITIES[selectedPersonality].name}
                  </h2>
                  <p className="text-lg text-primary font-medium mb-4">
                    {PERSONALITIES[selectedPersonality].tagline}
                  </p>
                  <p className="text-muted-foreground mb-8">
                    {PERSONALITIES[selectedPersonality].description}
                  </p>
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
                  >
                    Take Quiz Again
                  </button>
                </div>
              ) : (
                <PersonalityQuiz
                  onComplete={handleComplete}
                  onSkip={handleSkip}
                />
              )}
            </Card>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Meet the Personalities</h3>
              <div className="space-y-4">
                {Object.entries(PERSONALITIES).map(([key, config]) => (
                  <div key={key} className="flex gap-3 items-start">
                    <span className="text-2xl">{config.avatar}</span>
                    <div>
                      <p className="font-medium text-sm">{config.name}</p>
                      <p className="text-xs text-muted-foreground">{config.tagline}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-3">Features Tested</h3>
              <ul className="text-sm text-muted-foreground space-y-2 list-disc list-inside">
                <li>3-question quiz flow</li>
                <li>Progress bar (1/3, 2/3, 3/3)</li>
                <li>Weighted scoring system</li>
                <li>4 personality types</li>
                <li>Result screen with traits</li>
                <li>Retake quiz option</li>
                <li>Back/Next navigation</li>
                <li>Skip functionality</li>
                <li>Smooth animations</li>
              </ul>
            </Card>

            {selectedPersonality && (
              <Card className="p-6 bg-primary/5 border-primary/20">
                <h3 className="font-semibold mb-2">Selected Personality</h3>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{PERSONALITIES[selectedPersonality].avatar}</span>
                  <div>
                    <p className="font-medium">{PERSONALITIES[selectedPersonality].name}</p>
                    <p className="text-xs text-muted-foreground">
                      {PERSONALITIES[selectedPersonality].tagline}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {PERSONALITIES[selectedPersonality].traits.map((trait) => (
                    <span
                      key={trait}
                      className="px-2 py-1 bg-primary/20 text-primary rounded-full text-xs font-medium"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalityQuizTest;
