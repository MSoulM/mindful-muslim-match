import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { useProfile } from '@/hooks/useProfile';
import { Profile } from '@/types/profile';

// User is just Profile from Supabase
export type User = Profile;

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const { user: ClerkUser, isSignedIn } = useClerkUser();
  const { profile, isLoading: profileLoading, updateProfile } = useProfile();
  const [loading, setLoading] = useState(true);

  // Sync loading state with profile loading
  useEffect(() => {
    setLoading(profileLoading);
  }, [profileLoading]);

  const updateUser = async (updates: Partial<User>) => {
    if (!profile) throw new Error('No user profile loaded');
    try {
      await updateProfile(updates);
    } catch (error) {
      console.error('Failed to update user profile:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clerk handles logout, but we can clear local data if needed
    localStorage.removeItem('matchme_user');
    localStorage.removeItem('matchme_matches');
    localStorage.removeItem('matchme_dna');
  };

  // Return null user if not signed in
  const user = isSignedIn && profile ? profile : null;

  return (
    <UserContext.Provider value={{ user, loading, updateUser, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
