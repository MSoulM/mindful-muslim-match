export type MemoryImportance = 'high' | 'medium' | 'low';

export type MemoryCategory = 'life_events' | 'preferences' | 'emotional_moments' | 'feedback';

export type EvolutionStage = 'learning' | 'personalization' | 'mature';

export interface ConversationMemory {
  id: string;
  summary: string;
  fullText: string;
  dateCreated: Date;
  importance: MemoryImportance;
  category: MemoryCategory;
  topics: string[];
  conversationId: string;
  metadata: {
    messageCount: number;
    emotionalTone?: string;
    userFeedback?: boolean;
  };
}

export interface MemorySettings {
  enableMemory: boolean;
  enablePersonalization: boolean;
  storageLimit: number;
  currentUsage: number;
}

export interface MemorySortOption {
  value: 'date' | 'importance' | 'topic';
  label: string;
}
