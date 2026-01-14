import { useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useStreak } from '@/hooks/useStreak';

export const StreakInitializer = () => {
  const { isSignedIn } = useAuth();
  const { recordActivity } = useStreak();

  useEffect(() => {
    if (isSignedIn) {
      recordActivity().catch((err) => {
        console.error('Failed to record streak activity:', err);
      });
    }
  }, [isSignedIn, recordActivity]);

  return null;
};
