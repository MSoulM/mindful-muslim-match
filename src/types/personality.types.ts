export type AdjustmentType = 
  | 'warmer'
  | 'more_formal'
  | 'more_casual'
  | 'more_empathetic'
  | 'more_direct'
  | 'more_encouraging'
  | 'more_analytical';

export interface PersonalityAdjustment {
  id: string;
  timestamp: Date;
  adjustmentType: AdjustmentType;
  reason: string;
  previousSettings: {
    warmth: number;
    formality: number;
    energy: number;
    empathy: number;
  };
  newSettings: {
    warmth: number;
    formality: number;
    energy: number;
    empathy: number;
  };
  userFeedback?: 'liked' | 'disliked' | 'reverted';
  feedbackTimestamp?: Date;
}

export interface AdjustmentHistory {
  adjustments: PersonalityAdjustment[];
  currentSettings: {
    warmth: number;
    formality: number;
    energy: number;
    empathy: number;
  };
}
