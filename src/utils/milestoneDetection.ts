import { toast } from 'sonner';
import { MilestoneToast } from '@/components/notifications/MilestoneToast';
import { TopicCoveredToast } from '@/components/notifications/TopicCoveredToast';
import { BalanceImprovedToast } from '@/components/notifications/BalanceImprovedToast';
import confetti from 'canvas-confetti';
import { getTopicById, getCategoryConfig, CategoryType } from '@/config/topicRequirements';

export interface MilestoneCheckData {
  oldOverallCompletion: number;
  newOverallCompletion: number;
  wasChaiChatEligible: boolean;
  isChaiChatEligible: boolean;
  categoryId: string;
  oldCategoryCompletion: number;
  newCategoryCompletion: number;
  newTopicsCovered?: string[];
  oldBalanceScore?: number;
  newBalanceScore?: number;
  balanceRating?: 'excellent' | 'good' | 'needs-balance';
}

// Trigger confetti animation
function triggerConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#0A3A2E', '#D4A574', '#F8B4D9'];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  })();
}

export function checkAndNotifyMilestones(data: MilestoneCheckData, navigate?: (path: string) => void) {
  // Priority 1: ChaiChat Unlocked (70% threshold)
  if (!data.wasChaiChatEligible && data.isChaiChatEligible) {
    setTimeout(() => {
      toast.success('🎉 ChaiChat Unlocked!', {
        description: "You've reached 70% profile completion!",
        duration: 10000,
        action: navigate ? {
          label: 'See How It Works',
          onClick: () => navigate('/chaichat/hub'),
        } : undefined,
      });

      // Trigger confetti animation
      triggerConfetti();

      // Save celebration flag
      localStorage.setItem('chaichat_celebration_shown', 'true');
    }, 2000);

    return; // Only show one major milestone at a time
  }

  // Priority 2: Category Completed (100%)
  if (data.oldCategoryCompletion < 100 && data.newCategoryCompletion === 100) {
    const categoryConfig = getCategoryConfig(data.categoryId as CategoryType);
    
    setTimeout(() => {
      toast.success('🎯 Category Completed!', {
        description: `${categoryConfig?.categoryName || 'Category'} is now at 100%`,
        duration: 6000,
      });
    }, 2000);

    return;
  }

  // Priority 3: Diamond Profile (90%)
  if (data.oldOverallCompletion < 90 && data.newOverallCompletion >= 90) {
    setTimeout(() => {
      toast.success('💎 Diamond Profile Achieved!', {
        description: "You're in the top tier of profile completion!",
        duration: 8000,
        action: navigate ? {
          label: 'View Your Profile',
          onClick: () => navigate('/profile'),
        } : undefined,
      });

      triggerConfetti();
    }, 2000);

    return;
  }

  // Priority 4: New Topics Covered
  if (data.newTopicsCovered && data.newTopicsCovered.length > 0) {
    const categoryConfig = getCategoryConfig(data.categoryId as CategoryType);
    
    data.newTopicsCovered.forEach((topicId, index) => {
      const topic = getTopicById(data.categoryId as CategoryType, topicId);
      
      setTimeout(() => {
        toast.success('Topic Covered! ✓', {
          description: `${topic?.name || 'Topic'} in ${categoryConfig?.categoryName || 'Category'}`,
          duration: 4000,
        });
      }, 2500 + index * 500); // Stagger multiple topic notifications
    });
  }

  // Priority 5: Balance Score Improved Significantly
  if (
    data.oldBalanceScore !== undefined &&
    data.newBalanceScore !== undefined &&
    data.newBalanceScore - data.oldBalanceScore >= 10 &&
    data.balanceRating
  ) {
    const ratingLabels = {
      excellent: 'Excellent Balance',
      good: 'Good Balance',
      'needs-balance': 'Improving',
    };
    
    setTimeout(() => {
      toast.success('Balance Score Improved!', {
        description: `${data.oldBalanceScore} → ${data.newBalanceScore} - ${ratingLabels[data.balanceRating!]}`,
        duration: 5000,
      });
    }, 3000);
  }
}
