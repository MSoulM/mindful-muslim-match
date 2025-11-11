import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  initials: string;
  profilePhoto?: string;
  emoji: string;
  dnaScore: number;
  matchCount: number;
  activeDays: number;
  values: string[];
  preferences: {
    ageRange: [number, number];
    distance: number;
    values: string[];
  };
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  updateUser: (updates: Partial<User>) => Promise<void>;
  logout: () => void;
}

const UserContext = createContext<UserContextType | null>(null);

const mockUserData: User = {
  id: 'user-1',
  name: 'Ahmed Khan',
  age: 32,
  location: 'London, UK',
  bio: 'Seeking a life partner to build a blessed family together. Software engineer with a passion for community service.',
  initials: 'AK',
  emoji: '👨‍💻',
  dnaScore: 95,
  matchCount: 12,
  activeDays: 67,
  values: ['Family First', 'Faith', 'Growth', 'Community'],
  preferences: {
    ageRange: [25, 35],
    distance: 50,
    values: ['Family', 'Faith', 'Career', 'Health']
  }
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Load from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = localStorage.getItem('matchme_user');
        if (stored) {
          setUser(JSON.parse(stored));
        } else {
          // Load default/mock user
          setUser(mockUserData);
          localStorage.setItem('matchme_user', JSON.stringify(mockUserData));
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(mockUserData);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, []);
  
  const updateUser = async (updates: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...updates };
      localStorage.setItem('matchme_user', JSON.stringify(updated));
      return updated;
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('matchme_user');
    localStorage.removeItem('matchme_matches');
    localStorage.removeItem('matchme_dna');
  };
  
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
