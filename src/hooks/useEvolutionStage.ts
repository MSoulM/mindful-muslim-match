import { useState, useEffect } from 'react';
import { EvolutionStage } from '@/types/memory.types';

interface EvolutionData {
  stage: EvolutionStage;
  currentWeek: number;
  progressPercentage: number;
  daysInStage: number;
  daysUntilNext: number | null;
  hasTransitioned: boolean;
}

const STAGE_THRESHOLDS = {
  learning: { minWeeks: 0, maxWeeks: 4 },
  personalization: { minWeeks: 4, maxWeeks: 12 },
  mature: { minWeeks: 12, maxWeeks: Infinity },
};

export const useEvolutionStage = () => {
  const [evolutionData, setEvolutionData] = useState<EvolutionData>({
    stage: 'learning',
    currentWeek: 1,
    progressPercentage: 0,
    daysInStage: 0,
    daysUntilNext: null,
    hasTransitioned: false,
  });

  useEffect(() => {
    // Get account creation date from localStorage (mock data for now)
    const accountCreatedDate = localStorage.getItem('account_created_date');
    const createdAt = accountCreatedDate 
      ? new Date(accountCreatedDate)
      : new Date(Date.now() - 14 * 24 * 60 * 60 * 1000); // Default: 2 weeks ago

    // Calculate days since account creation
    const daysSinceCreation = Math.floor(
      (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );
    const weeksSinceCreation = daysSinceCreation / 7;

    // Determine stage
    let stage: EvolutionStage = 'learning';
    let daysInStage = daysSinceCreation;
    let daysUntilNext: number | null = null;
    let progressPercentage = 0;

    if (weeksSinceCreation >= STAGE_THRESHOLDS.mature.minWeeks) {
      stage = 'mature';
      daysInStage = daysSinceCreation - (STAGE_THRESHOLDS.mature.minWeeks * 7);
      daysUntilNext = null; // Already at final stage
      progressPercentage = 100;
    } else if (weeksSinceCreation >= STAGE_THRESHOLDS.personalization.minWeeks) {
      stage = 'personalization';
      daysInStage = daysSinceCreation - (STAGE_THRESHOLDS.personalization.minWeeks * 7);
      const totalDaysInPersonalization = (STAGE_THRESHOLDS.mature.minWeeks - STAGE_THRESHOLDS.personalization.minWeeks) * 7;
      daysUntilNext = totalDaysInPersonalization - daysInStage;
      progressPercentage = 33 + ((daysInStage / totalDaysInPersonalization) * 34); // 33-67%
    } else {
      stage = 'learning';
      daysInStage = daysSinceCreation;
      const totalDaysInLearning = STAGE_THRESHOLDS.personalization.minWeeks * 7;
      daysUntilNext = totalDaysInLearning - daysInStage;
      progressPercentage = (daysInStage / totalDaysInLearning) * 33; // 0-33%
    }

    // Check for stage transitions
    const lastStage = localStorage.getItem('last_evolution_stage');
    const hasTransitioned = lastStage !== null && lastStage !== stage;

    if (hasTransitioned) {
      localStorage.setItem('last_evolution_stage', stage);
      // Trigger notification
      localStorage.setItem('evolution_transition', JSON.stringify({
        from: lastStage,
        to: stage,
        timestamp: Date.now(),
      }));
    } else if (!lastStage) {
      localStorage.setItem('last_evolution_stage', stage);
    }

    setEvolutionData({
      stage,
      currentWeek: Math.ceil(weeksSinceCreation),
      progressPercentage: Math.round(progressPercentage),
      daysInStage,
      daysUntilNext,
      hasTransitioned,
    });
  }, []);

  return evolutionData;
};
