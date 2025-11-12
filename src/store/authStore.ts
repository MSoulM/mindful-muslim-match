import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, AuthActions } from '@/types/store.types';

interface AuthStore extends AuthState, AuthActions {}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      session: null,
      token: null,
      isLoading: true,
      isAuthenticated: false,

      // Actions
      setAuth: (user, session) =>
        set({
          user,
          session,
          token: session?.access_token || null,
          isAuthenticated: !!user,
          isLoading: false,
        }),

      clearAuth: () =>
        set({
          user: null,
          session: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        }),

      setLoading: (loading) =>
        set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist essential auth data
        user: state.user,
        token: state.token,
      }),
    }
  )
);

// Selectors
export const selectUser = (state: AuthStore) => state.user;
export const selectIsAuthenticated = (state: AuthStore) => state.isAuthenticated;
export const selectToken = (state: AuthStore) => state.token;
export const selectIsLoading = (state: AuthStore) => state.isLoading;
