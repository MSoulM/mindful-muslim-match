import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Trait {
  id: string;
  name: string;
  score: number;
  description: string;
  trend: 'up' | 'down' | 'stable';
}

export interface DNACategory {
  id: string;
  name: string;
  icon: string;
  score: number;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Ultra Rare';
  percentile: number;
  traits: Trait[];
  timeline: number[];
  color: string;
}

interface DNAContextType {
  categories: DNACategory[];
  overallScore: number;
  loading: boolean;
  updateTrait: (categoryId: string, traitId: string, score: number) => Promise<void>;
  refreshDNA: () => Promise<void>;
}

const DNAContext = createContext<DNAContextType | null>(null);

const generateMockDNACategories = (): DNACategory[] => [
  {
    id: 'values',
    name: 'Values & Beliefs',
    icon: '🙏',
    score: 98,
    rarity: 'Ultra Rare',
    percentile: 99,
    color: 'from-emerald-500 to-teal-600',
    traits: [
      { id: 'faith', name: 'Faith Alignment', score: 98, description: 'Strong religious values', trend: 'stable' },
      { id: 'family', name: 'Family Values', score: 96, description: 'Family-oriented mindset', trend: 'up' }
    ],
    timeline: [85, 88, 92, 95, 98]
  },
  {
    id: 'interests',
    name: 'Interests & Hobbies',
    icon: '🎨',
    score: 92,
    rarity: 'Epic',
    percentile: 95,
    color: 'from-purple-500 to-pink-600',
    traits: [
      { id: 'creative', name: 'Creative Pursuits', score: 90, description: 'Artistic interests', trend: 'up' },
      { id: 'intellectual', name: 'Intellectual Curiosity', score: 94, description: 'Love of learning', trend: 'stable' }
    ],
    timeline: [78, 82, 86, 89, 92]
  },
  {
    id: 'personality',
    name: 'Personality Traits',
    icon: '💫',
    score: 88,
    rarity: 'Rare',
    percentile: 88,
    color: 'from-blue-500 to-indigo-600',
    traits: [
      { id: 'emotional', name: 'Emotional Intelligence', score: 92, description: 'High EQ', trend: 'up' },
      { id: 'growth', name: 'Growth Mindset', score: 84, description: 'Continuous improvement', trend: 'stable' }
    ],
    timeline: [72, 76, 80, 84, 88]
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Habits',
    icon: '🌿',
    score: 85,
    rarity: 'Rare',
    percentile: 82,
    color: 'from-green-500 to-emerald-600',
    traits: [
      { id: 'routine', name: 'Healthy Routines', score: 88, description: 'Consistent habits', trend: 'up' },
      { id: 'balance', name: 'Work-Life Balance', score: 82, description: 'Balanced lifestyle', trend: 'stable' }
    ],
    timeline: [68, 72, 77, 81, 85]
  },
  {
    id: 'goals',
    name: 'Life Goals',
    icon: '🎯',
    score: 94,
    rarity: 'Epic',
    percentile: 96,
    color: 'from-orange-500 to-red-600',
    traits: [
      { id: 'family-goals', name: 'Family-Centered', score: 96, description: 'Building a family', trend: 'stable' },
      { id: 'career', name: 'Career Ambitions', score: 92, description: 'Professional growth', trend: 'up' }
    ],
    timeline: [82, 86, 89, 92, 94]
  }
];

export const DNAProvider = ({ children }: { children: ReactNode }) => {
  const [categories, setCategories] = useState<DNACategory[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const calculateOverallScore = (cats: DNACategory[]) => {
    if (cats.length === 0) return 0;
    const total = cats.reduce((sum, cat) => sum + cat.score, 0);
    return Math.round(total / cats.length);
  };
  
  const refreshDNA = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const newCategories = generateMockDNACategories();
      setCategories(newCategories);
      setOverallScore(calculateOverallScore(newCategories));
      
      // Persist to localStorage
      localStorage.setItem('matchme_dna', JSON.stringify(newCategories));
    } catch (err) {
      console.error('Error refreshing DNA:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const updateTrait = async (categoryId: string, traitId: string, score: number) => {
    setCategories(prev => {
      const updated = prev.map(cat => {
        if (cat.id !== categoryId) return cat;
        
        return {
          ...cat,
          traits: cat.traits.map(trait => 
            trait.id === traitId ? { ...trait, score } : trait
          )
        };
      });
      
      // Recalculate overall score
      setOverallScore(calculateOverallScore(updated));
      
      // Persist
      localStorage.setItem('matchme_dna', JSON.stringify(updated));
      
      return updated;
    });
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
  };
  
  // Initial load
  useEffect(() => {
    const loadDNA = () => {
      try {
        const stored = localStorage.getItem('matchme_dna');
        if (stored) {
          const data = JSON.parse(stored);
          setCategories(data);
          setOverallScore(calculateOverallScore(data));
          setLoading(false);
        } else {
          refreshDNA();
        }
      } catch (err) {
        console.error('Failed to load DNA from storage:', err);
        refreshDNA();
      }
    };
    
    loadDNA();
  }, []);
  
  return (
    <DNAContext.Provider value={{
      categories,
      overallScore,
      loading,
      updateTrait,
      refreshDNA
    }}>
      {children}
    </DNAContext.Provider>
  );
};

export const useDNA = () => {
  const context = useContext(DNAContext);
  if (!context) {
    throw new Error('useDNA must be used within DNAProvider');
  }
  return context;
};
