import { useState, useEffect, useCallback } from 'react';
import { ConversationMemory, MemorySettings, MemoryImportance, MemoryCategory, EvolutionStage } from '@/types/memory.types';

const STORAGE_KEY = 'mmgent_memories';
const SETTINGS_KEY = 'mmgent_memory_settings';
const MAX_MEMORIES = 100;

const DEFAULT_SETTINGS: MemorySettings = {
  enableMemory: true,
  enablePersonalization: true,
  storageLimit: MAX_MEMORIES,
  currentUsage: 0,
};

// Mock data for demonstration
const generateMockMemories = (): ConversationMemory[] => [
  {
    id: '1',
    summary: 'Discussion about wedding planning and family involvement',
    fullText: 'User shared concerns about balancing traditional expectations with modern wedding preferences. Emphasized importance of family harmony while maintaining personal vision.',
    dateCreated: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    importance: 'high',
    category: 'life_events',
    topics: ['wedding', 'family', 'traditions'],
    conversationId: 'conv_001',
    metadata: { messageCount: 12, emotionalTone: 'hopeful', userFeedback: true }
  },
  {
    id: '2',
    summary: 'Preference for direct communication over subtle hints',
    fullText: 'User expressed strong preference for open, honest communication. Values directness and clarity in relationships. Appreciates partners who express needs clearly.',
    dateCreated: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    importance: 'high',
    category: 'preferences',
    topics: ['communication', 'honesty', 'relationships'],
    conversationId: 'conv_002',
    metadata: { messageCount: 8, emotionalTone: 'assertive' }
  },
  {
    id: '3',
    summary: 'Celebrated job promotion and career milestone',
    fullText: 'User shared excitement about receiving promotion at work. Discussed balancing career growth with family planning goals. Agent provided congratulations and explored priorities.',
    dateCreated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    importance: 'high',
    category: 'emotional_moments',
    topics: ['career', 'achievement', 'work-life balance'],
    conversationId: 'conv_003',
    metadata: { messageCount: 15, emotionalTone: 'joyful', userFeedback: true }
  },
  {
    id: '4',
    summary: 'Adjusted MMAgent tone to be more encouraging',
    fullText: 'User requested agent to provide more positive reinforcement and encouragement. Wanted less analytical tone, more warmth and celebration of progress.',
    dateCreated: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000),
    importance: 'medium',
    category: 'feedback',
    topics: ['agent-tone', 'personalization'],
    conversationId: 'conv_004',
    metadata: { messageCount: 5, userFeedback: true }
  },
  {
    id: '5',
    summary: 'Discussion about managing work stress and self-care',
    fullText: 'User opened up about feeling overwhelmed with work deadlines. Agent provided Islamic perspective on balance and suggested practical self-care strategies.',
    dateCreated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    importance: 'medium',
    category: 'emotional_moments',
    topics: ['stress', 'self-care', 'wellness'],
    conversationId: 'conv_005',
    metadata: { messageCount: 10, emotionalTone: 'concerned' }
  },
];

export const useMemoryManagement = () => {
  const [memories, setMemories] = useState<ConversationMemory[]>([]);
  const [settings, setSettings] = useState<MemorySettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load memories and settings from localStorage
  useEffect(() => {
    try {
      const storedMemories = localStorage.getItem(STORAGE_KEY);
      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      
      if (storedMemories) {
        const parsed = JSON.parse(storedMemories);
        setMemories(parsed.map((m: any) => ({
          ...m,
          dateCreated: new Date(m.dateCreated)
        })));
      } else {
        // Initialize with mock data
        const mockData = generateMockMemories();
        setMemories(mockData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData));
      }
      
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      } else {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
      }
    } catch (error) {
      console.error('Error loading memories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save memories to localStorage
  const saveMemories = useCallback((updatedMemories: ConversationMemory[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedMemories));
      setMemories(updatedMemories);
    } catch (error) {
      console.error('Error saving memories:', error);
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = useCallback((updatedSettings: MemorySettings) => {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, []);

  // Delete individual memory
  const deleteMemory = useCallback((memoryId: string) => {
    const filtered = memories.filter(m => m.id !== memoryId);
    saveMemories(filtered);
    saveSettings({ ...settings, currentUsage: filtered.length });
  }, [memories, settings, saveMemories, saveSettings]);

  // Clear all memories
  const clearAllMemories = useCallback(() => {
    saveMemories([]);
    saveSettings({ ...settings, currentUsage: 0 });
  }, [settings, saveMemories, saveSettings]);

  // Update settings
  const updateSettings = useCallback((partial: Partial<MemorySettings>) => {
    saveSettings({ ...settings, ...partial });
  }, [settings, saveSettings]);

  // Export memories
  const exportMemories = useCallback(() => {
    const dataStr = JSON.stringify(memories, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mmgent-memories-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [memories]);

  // Calculate evolution stage
  const getEvolutionStage = useCallback((): EvolutionStage => {
    const memoryCount = memories.length;
    if (memoryCount < 10) return 'learning';
    if (memoryCount < 50) return 'personalization';
    return 'mature';
  }, [memories.length]);

  // Get memories by category
  const getMemoriesByCategory = useCallback((category: MemoryCategory) => {
    return memories.filter(m => m.category === category);
  }, [memories]);

  // Sort memories
  const sortMemories = useCallback((sortBy: 'date' | 'importance' | 'topic') => {
    const sorted = [...memories].sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.dateCreated.getTime() - a.dateCreated.getTime();
        case 'importance':
          const importanceOrder: Record<MemoryImportance, number> = { high: 3, medium: 2, low: 1 };
          return importanceOrder[b.importance] - importanceOrder[a.importance];
        case 'topic':
          return a.topics[0]?.localeCompare(b.topics[0] || '') || 0;
        default:
          return 0;
      }
    });
    return sorted;
  }, [memories]);

  return {
    memories,
    settings,
    isLoading,
    storageUsed: memories.length,
    storageLimit: MAX_MEMORIES,
    evolutionStage: getEvolutionStage(),
    deleteMemory,
    clearAllMemories,
    updateSettings,
    exportMemories,
    getMemoriesByCategory,
    sortMemories,
  };
};
