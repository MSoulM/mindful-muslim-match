import { StreakInitializer } from './StreakInitializer';
import { MilestonePopup } from './MilestonePopup';
import { useStreak } from '@/hooks/useStreak';

export const StreakManager = () => {
  const { 
    showMilestonePopup, 
    milestoneReached, 
    milestoneReward, 
    dismissMilestone,
    status 
  } = useStreak();

  return (
    <>
      <StreakInitializer />
      {showMilestonePopup && milestoneReached && milestoneReward && (
        <MilestonePopup
          isOpen={showMilestonePopup}
          onClose={dismissMilestone}
          milestone={milestoneReached}
          reward={milestoneReward}
          streak={status?.currentStreak || 0}
        />
      )}
    </>
  );
};
