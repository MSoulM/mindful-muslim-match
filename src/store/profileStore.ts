import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface CategoryCompletion {
  id: string;
  name: string;
  percentage: number;
  contentCount: number;
  wordCount: number;
  topicsCovered: string[];
  requiredTopics: number;
}

export interface ProfileState {
  overallCompletion: number;
  categories: Record<string, CategoryCompletion>;
  balanceScore: number;
  balanceRating: 'excellent' | 'good' | 'needs-balance';
  chaiChatEligible: boolean;
  lastUpdated: Date;
  recentlyUpdatedCategory: string | null;
  newlyCoveredTopics: string[];
}

interface ProfileActions {
  updateCategory: (categoryId: string, updates: Partial<CategoryCompletion>) => void;
  updateOverallCompletion: (percentage: number) => void;
  updateBalance: (score: number, rating: 'excellent' | 'good' | 'needs-balance') => void;
  updateChaiChatEligibility: (eligible: boolean) => void;
  setRecentlyUpdatedCategory: (categoryId: string | null) => void;
  addNewlyCoveredTopics: (topicIds: string[]) => void;
  clearNewlyCoveredTopics: () => void;
  refreshProfile: () => Promise<void>;
}

interface ProfileStore extends ProfileState, ProfileActions {}

// Default category data
const defaultCategories: Record<string, CategoryCompletion> = {
  'values-beliefs': {
    id: 'values-beliefs',
    name: 'Values & Beliefs',
    percentage: 68,
    contentCount: 3,
    wordCount: 420,
    topicsCovered: ['religious-practice', 'spiritual-values', 'community-involvement'],
    requiredTopics: 4,
  },
  'interests-hobbies': {
    id: 'interests-hobbies',
    name: 'Interests & Hobbies',
    percentage: 45,
    contentCount: 2,
    wordCount: 280,
    topicsCovered: [],
    requiredTopics: 0, // Free-form
  },
  'relationship-goals': {
    id: 'relationship-goals',
    name: 'Relationship Goals',
    percentage: 55,
    contentCount: 2,
    wordCount: 340,
    topicsCovered: ['marriage-timeline'],
    requiredTopics: 3,
  },
  'lifestyle-personality': {
    id: 'lifestyle-personality',
    name: 'Lifestyle & Personality',
    percentage: 72,
    contentCount: 4,
    wordCount: 510,
    topicsCovered: [],
    requiredTopics: 0, // Free-form
  },
  'family-cultural': {
    id: 'family-cultural',
    name: 'Family & Cultural',
    percentage: 50,
    contentCount: 2,
    wordCount: 300,
    topicsCovered: ['family-involvement'],
    requiredTopics: 2,
  },
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      overallCompletion: 58,
      categories: defaultCategories,
      balanceScore: 72,
      balanceRating: 'good',
      chaiChatEligible: false,
      lastUpdated: new Date(),
      recentlyUpdatedCategory: null,
      newlyCoveredTopics: [],

      // Actions
      updateCategory: (categoryId, updates) =>
        set((state) => {
          const updatedCategory = {
            ...state.categories[categoryId],
            ...updates,
          };

          const newCategories = {
            ...state.categories,
            [categoryId]: updatedCategory,
          };

          // Recalculate overall completion
          const categoryPercentages = Object.values(newCategories).map(c => c.percentage);
          const newOverallCompletion = Math.round(
            categoryPercentages.reduce((sum, p) => sum + p, 0) / categoryPercentages.length
          );

          return {
            categories: newCategories,
            overallCompletion: newOverallCompletion,
            chaiChatEligible: newOverallCompletion >= 70,
            lastUpdated: new Date(),
          };
        }),

      updateOverallCompletion: (percentage) =>
        set({
          overallCompletion: percentage,
          chaiChatEligible: percentage >= 70,
          lastUpdated: new Date(),
        }),

      updateBalance: (score, rating) =>
        set({
          balanceScore: score,
          balanceRating: rating,
          lastUpdated: new Date(),
        }),

      updateChaiChatEligibility: (eligible) =>
        set({
          chaiChatEligible: eligible,
          lastUpdated: new Date(),
        }),

      setRecentlyUpdatedCategory: (categoryId) =>
        set({ recentlyUpdatedCategory: categoryId }),

      addNewlyCoveredTopics: (topicIds) =>
        set((state) => ({
          newlyCoveredTopics: [...state.newlyCoveredTopics, ...topicIds],
        })),

      clearNewlyCoveredTopics: () =>
        set({ newlyCoveredTopics: [] }),

      refreshProfile: async () => {
        // TODO: Fetch from backend when available
        // For now, this is a placeholder
        console.log('Profile refresh called');
      },
    }),
    {
      name: 'profile-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        overallCompletion: state.overallCompletion,
        categories: state.categories,
        balanceScore: state.balanceScore,
        balanceRating: state.balanceRating,
        chaiChatEligible: state.chaiChatEligible,
      }),
    }
  )
);

// Selectors
export const selectOverallCompletion = (state: ProfileStore) => state.overallCompletion;
export const selectCategory = (categoryId: string) => (state: ProfileStore) =>
  state.categories[categoryId];
export const selectAllCategories = (state: ProfileStore) => state.categories;
export const selectBalanceScore = (state: ProfileStore) => state.balanceScore;
export const selectChaiChatEligible = (state: ProfileStore) => state.chaiChatEligible;
export const selectRecentlyUpdatedCategory = (state: ProfileStore) => state.recentlyUpdatedCategory;
export const selectNewlyCoveredTopics = (state: ProfileStore) => state.newlyCoveredTopics;
