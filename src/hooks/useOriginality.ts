import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { createSupabaseClient } from '@/integrations/supabase/client';

export interface OriginalityData {
  score: number;
  percentile: number | null;
  label: string;
  last_calculated_at: string | null;
  tooltip: string;
}

export function useOriginality() {
  const { getToken, isLoaded } = useAuth();
  const [originality, setOriginality] = useState<OriginalityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOriginality = useCallback(async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        setOriginality(null);
        return;
      }

      const supabase = createSupabaseClient(token);
      if (!supabase) {
        throw new Error('Failed to initialize Supabase client');
      }

      const { data: dnaData, error: dnaError } = await supabase
        .from('mysoul_dna_scores')
        .select('content_originality_score, content_originality_percentile, content_originality_calculated_at')
        .single();

      if (dnaError && dnaError.code !== 'PGRST116') {
        throw dnaError;
      }

      const score = dnaData?.content_originality_score ?? 50;
      const percentile = dnaData?.content_originality_percentile ?? null;
      const lastCalculatedAt = dnaData?.content_originality_calculated_at ?? null;

      const label = getOriginalityLabel(score);

      setOriginality({
        score,
        percentile,
        label,
        last_calculated_at: lastCalculatedAt,
        tooltip: 'How unique your perspective is compared to others'
      });

    } catch (err) {
      console.error('Error fetching originality:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOriginality({
        score: 50,
        percentile: null,
        label: 'Moderately Original',
        last_calculated_at: null,
        tooltip: 'How unique your perspective is compared to others'
      });
    } finally {
      setLoading(false);
    }
  }, [getToken, isLoaded]);

  useEffect(() => {
    fetchOriginality();
  }, [fetchOriginality]);

  return {
    originality,
    loading,
    error,
    refetch: fetchOriginality
  };
}

function getOriginalityLabel(score: number): string {
  if (score >= 90) return 'Ultra Original';
  if (score >= 70) return 'Highly Original';
  if (score >= 50) return 'Moderately Original';
  if (score >= 30) return 'Somewhat Common';
  return 'Very Common';
}
