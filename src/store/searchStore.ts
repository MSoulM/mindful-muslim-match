import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SearchState, SearchActions } from '@/types/store.types';

interface SearchStore extends SearchState, SearchActions {}

const defaultFilters = {
  ageRange: [18, 50] as [number, number],
  distance: 50,
  location: undefined,
  interests: undefined,
  education: undefined,
  religion: undefined,
  minCompatibility: undefined,
};

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      // Initial state
      filters: defaultFilters,
      results: [],
      savedSearches: [],
      isSearching: false,

      // Actions
      setFilters: (filters) =>
        set((state) => ({
          filters: { ...state.filters, ...filters },
        })),

      resetFilters: () =>
        set({ filters: defaultFilters }),

      setResults: (results) =>
        set({ results, isSearching: false }),

      clearResults: () =>
        set({ results: [] }),

      addSavedSearch: (search) =>
        set((state) => ({
          savedSearches: [...state.savedSearches, search],
        })),

      removeSavedSearch: (id) =>
        set((state) => ({
          savedSearches: state.savedSearches.filter((s) => s.id !== id),
        })),

      setSearching: (isSearching) =>
        set({ isSearching }),
    }),
    {
      name: 'search-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filters: state.filters,
        savedSearches: state.savedSearches,
        // Don't persist results - refresh on new session
      }),
    }
  )
);

// Selectors
export const selectFilters = (state: SearchStore) => state.filters;
export const selectResults = (state: SearchStore) => state.results;
export const selectSavedSearches = (state: SearchStore) => state.savedSearches;
export const selectIsSearching = (state: SearchStore) => state.isSearching;

export const selectFilteredResults = (minCompatibility?: number) => (state: SearchStore) =>
  minCompatibility
    ? state.results.filter((r) => (r.compatibility || 0) >= minCompatibility)
    : state.results;
