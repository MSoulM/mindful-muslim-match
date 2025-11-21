import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useAgentName } from '@/hooks/useAgentName';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPersonalityType } from '@/components/onboarding/PersonalityAssessment';

interface NamePromptBannerProps {
  personalityType: UserPersonalityType;
}

const personalityEmojis: Record<UserPersonalityType, string> = {
  wise_aunty: '👵',
  modern_scholar: '👨‍🎓',
  spiritual_guide: '🕌',
  cultural_bridge: '🌉'
};

const personalityNames: Record<UserPersonalityType, string> = {
  wise_aunty: 'Wise Aunty',
  modern_scholar: 'Modern Scholar',
  spiritual_guide: 'Spiritual Guide',
  cultural_bridge: 'Cultural Bridge'
};

export function NamePromptBanner({ personalityType }: NamePromptBannerProps) {
  const navigate = useNavigate();
  const agentName = useAgentName();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has custom name
    if (agentName) {
      setIsVisible(false);
      return;
    }

    // Check if prompt was dismissed
    const dismissed = localStorage.getItem('namePromptDismissed');
    if (dismissed === 'true') {
      setIsVisible(false);
      return;
    }

    // Check days since assignment
    const assignedDateStr = localStorage.getItem('personalityAssignedDate');
    if (!assignedDateStr) {
      // If no date stored, store current date and don't show yet
      localStorage.setItem('personalityAssignedDate', new Date().toISOString());
      setIsVisible(false);
      return;
    }

    const assignedDate = new Date(assignedDateStr);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - assignedDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysSince >= 3) {
      setIsVisible(true);
    }
  }, [agentName]);

  const handleDismiss = () => {
    localStorage.setItem('namePromptDismissed', 'true');
    setIsVisible(false);
  };

  const handleAddName = () => {
    navigate('/settings');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="mx-4 mt-4 p-4 bg-gradient-to-r from-accent/10 to-secondary/10 rounded-lg border border-border/50">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarFallback className="bg-primary/10 text-2xl">
              {personalityEmojis[personalityType]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-foreground">Make your journey more personal</p>
            <p className="text-sm text-muted-foreground">
              Give your {personalityNames[personalityType]} a name
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddName}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Add Name
          </button>
          <button
            onClick={handleDismiss}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
