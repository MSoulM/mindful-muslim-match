import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { PersonalityChange } from '@/components/settings/PersonalityChange';
import { UserPersonalityType } from '@/types/onboarding';
import { toast } from 'sonner';

export default function PersonalityChangeDemo() {
  const navigate = useNavigate();
  
  // Demo state - in production, these would come from database
  const [currentPersonality] = useState<UserPersonalityType>('wise_aunty');
  const [accountCreatedDate] = useState(new Date(Date.now() - 8 * 24 * 60 * 60 * 1000)); // 8 days ago
  const [hasChangedPersonality] = useState(false);

  const handlePersonalityChange = (newPersonality: UserPersonalityType, reason: string) => {
    console.log('Personality change:', { newPersonality, reason });
    
    // In production, this would update the database
    toast.success('Personality updated!', {
      description: `You're now working with your new MMAgent`
    });

    // Navigate back after a delay
    setTimeout(() => {
      navigate('/settings');
    }, 2000);
  };

  return (
    <ScreenContainer>
      <TopBar 
        variant="back"
        title="Change MMAgent Personality"
        onBackClick={() => navigate(-1)}
      />

      <div className="flex-1 overflow-y-auto p-6 pb-20">
        <PersonalityChange
          currentPersonality={currentPersonality}
          accountCreatedDate={accountCreatedDate}
          hasChangedPersonality={hasChangedPersonality}
          onPersonalityChange={handlePersonalityChange}
        />
      </div>
    </ScreenContainer>
  );
}
