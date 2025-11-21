import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CulturalProfile as CulturalProfileComponent, 
  type CulturalProfile 
} from '@/components/onboarding/CulturalProfile';
import { TopBar } from '@/components/layout/TopBar';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { toast } from 'sonner';

export default function CulturalProfileDemo() {
  const navigate = useNavigate();
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = (profile: CulturalProfile) => {
    console.log('Cultural profile complete:', profile);
    
    toast.success('Cultural profile created!', {
      description: `Primary: ${profile.primaryBackground}, Strength: ${profile.strength}`
    });

    setIsComplete(true);
    
    // Navigate to next onboarding step
    setTimeout(() => {
      navigate('/profile');
    }, 2000);
  };

  const handleSkip = () => {
    toast.info('Cultural profile skipped', {
      description: 'You can complete this later in settings'
    });
    navigate('/profile');
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Cultural Background"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-b from-primary/5 to-transparent">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Share Your Cultural Heritage
          </h1>
          <p className="text-muted-foreground">
            Help us understand your background for better matches
          </p>
        </div>

        {/* Cultural Profile Component */}
        <div className="flex-1 overflow-y-auto">
          <CulturalProfileComponent
            onComplete={handleComplete}
            onSkip={handleSkip}
            initialLocation="London, UK"
            allowMultiple={true}
          />
        </div>

        {/* Footer tip */}
        {!isComplete && (
          <div className="p-4 bg-muted/30 border-t">
            <p className="text-xs text-center text-muted-foreground">
              🌍 We celebrate all backgrounds and mixed heritage
            </p>
          </div>
        )}
      </div>
    </ScreenContainer>
  );
}
