import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Match {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  compatibility: number;
  bio: string;
  emoji: string;
  photoUrl?: string;
  insights?: string;
  chaiChat?: {
    topicsCount: number;
    strength: 'Strong' | 'Moderate' | 'Building';
    status: 'pending' | 'in-progress' | 'completed';
  };
  lastActive: Date;
  skipped?: boolean;
}

interface MatchesContextType {
  matches: Match[];
  loading: boolean;
  error: string | null;
  refreshMatches: () => Promise<void>;
  skipMatch: (matchId: string) => Promise<void>;
  currentMatchIndex: number;
}

const MatchesContext = createContext<MatchesContextType | null>(null);

const generateMockMatches = (): Match[] => [
  {
    id: 'match-1',
    name: 'Sarah',
    age: 28,
    location: 'North London',
    distance: '2.3 miles',
    compatibility: 95,
    bio: 'Family-oriented doctor who loves reading, hiking, and exploring new cuisines. Looking for someone who values both deen and duniya. Early mornings are my meditation time.',
    emoji: '👩‍⚕️',
    insights: 'Sarah shares your commitment to work-life balance and has expressed strong interest in community service. Your conversation revealed deep alignment on family values.',
    chaiChat: {
      topicsCount: 23,
      strength: 'Strong',
      status: 'completed'
    },
    lastActive: new Date()
  },
  {
    id: 'match-2',
    name: 'Layla',
    age: 26,
    location: 'East London',
    distance: '4.1 miles',
    compatibility: 91,
    bio: 'Creative soul teaching primary school. Passionate about education reform and child development. Weekends find me at museums or trying new recipes. Growth mindset is everything.',
    emoji: '👩‍🏫',
    insights: 'You both value continuous learning and have similar communication styles. The AI conversation showed beautiful intellectual chemistry.',
    chaiChat: {
      topicsCount: 18,
      strength: 'Strong',
      status: 'completed'
    },
    lastActive: new Date()
  },
  {
    id: 'match-3',
    name: 'Amina',
    age: 27,
    location: 'West London',
    distance: '3.7 miles',
    compatibility: 89,
    bio: 'Software engineer building solutions for social good. Balanced between technical challenges and creative pursuits. Love travel, photography, and deep conversations over chai.',
    emoji: '👩‍💻',
    insights: 'Professional compatibility is exceptional. Both value innovation and making a positive impact. Some lifestyle differences to explore further.',
    chaiChat: {
      topicsCount: 16,
      strength: 'Moderate',
      status: 'pending'
    },
    lastActive: new Date()
  }
];

export const MatchesProvider = ({ children }: { children: ReactNode }) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);
  
  const refreshMatches = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newMatches = generateMockMatches();
      setMatches(newMatches);
      setCurrentMatchIndex(0);
      
      // Persist to localStorage
      localStorage.setItem('matchme_matches', JSON.stringify(newMatches));
    } catch (err) {
      setError('Failed to load matches');
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const skipMatch = async (matchId: string) => {
    // Optimistic update
    setMatches(prev => {
      const updated = prev.filter(m => m.id !== matchId);
      localStorage.setItem('matchme_matches', JSON.stringify(updated));
      return updated;
    });
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (err) {
      // Revert on error
      console.error('Error skipping match:', err);
      refreshMatches();
    }
  };
  
  // Initial load
  useEffect(() => {
    const loadMatches = () => {
      try {
        const stored = localStorage.getItem('matchme_matches');
        if (stored) {
          setMatches(JSON.parse(stored));
        } else {
          refreshMatches();
        }
      } catch (err) {
        console.error('Failed to load matches from storage:', err);
        refreshMatches();
      }
    };
    
    loadMatches();
  }, []);
  
  return (
    <MatchesContext.Provider value={{
      matches,
      loading,
      error,
      refreshMatches,
      skipMatch,
      currentMatchIndex
    }}>
      {children}
    </MatchesContext.Provider>
  );
};

export const useMatches = () => {
  const context = useContext(MatchesContext);
  if (!context) {
    throw new Error('useMatches must be used within MatchesProvider');
  }
  return context;
};
