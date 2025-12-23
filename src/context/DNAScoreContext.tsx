/**
 * DNA Score Context
 * Provides global access to DNA score state and recalculation trigger
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useDNAScore, DNAScore, RarityTier, RARITY_CONFIG } from '@/hooks/useDNAScore';

interface DNAScoreContextValue {
  dnaScore: DNAScore | null;
  loading: boolean;
  error: string | null;
  recalculateScore: () => Promise<void>;
  refetch: () => Promise<void>;
  rarityConfig: ReturnType<typeof import('@/hooks/useDNAScore').getRarityConfig> | null;
}

const DNAScoreContext = createContext<DNAScoreContextValue | undefined>(undefined);

export function DNAScoreProvider({ children }: { children: ReactNode }) {
  const dnaScoreHook = useDNAScore();

  return (
    <DNAScoreContext.Provider value={dnaScoreHook}>
      {children}
    </DNAScoreContext.Provider>
  );
}

export function useDNAScoreContext(): DNAScoreContextValue {
  const context = useContext(DNAScoreContext);
  if (context === undefined) {
    throw new Error('useDNAScoreContext must be used within a DNAScoreProvider');
  }
  return context;
}

// Re-export types for convenience
export type { DNAScore, RarityTier };
export { RARITY_CONFIG };
