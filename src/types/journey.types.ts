/**
 * Journey Milestone System Types
 */

export type JourneyStage = 'seed' | 'sprout' | 'growth' | 'rooted' | 'transcendent';

export interface DNAConfidence {
  overall: number;
  surface: number;
  behavioral: number;
  emotional: number;
  values: number;
  relational: number;
  evolution: number;
}

export interface ProgressToNext {
  meaningful_shares: number;
  required_shares: number;
  mmagent_chats: number;
  required_chats: number;
  match_conversations?: number;
  required_conversations?: number;
}

export interface JourneyStatus {
  current_stage: JourneyStage;
  dna_confidence: DNAConfidence;
  progress_to_next: ProgressToNext;
  unlocked_features: string[];
  badges_earned: string[];
  days_in_current_stage: number;
}

export interface StageInfo {
  id: JourneyStage;
  name: string;
  icon: string;
  description: string;
  dnaRange: { min: number; max: number };
  timeEstimate: string;
  color: string;
  glowColor: string;
  features: string[];
  restrictions: string[];
}

export interface MilestoneReward {
  id: string;
  stage: JourneyStage;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface JourneyEvent {
  event_type: 'meaningful_share' | 'mmagent_chat' | 'match_conversation' | 'dna_update';
  metadata?: Record<string, any>;
}
