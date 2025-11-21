import { useState, useEffect, useCallback } from 'react';
import { PersonalityAdjustment, AdjustmentHistory, AdjustmentType } from '@/types/personality.types';

const STORAGE_KEY = 'mmagent_personality_adjustments';

const DEFAULT_SETTINGS = {
  warmth: 7,
  formality: 5,
  energy: 6,
  empathy: 8,
};

export const usePersonalityAdjustment = () => {
  const [history, setHistory] = useState<AdjustmentHistory>({
    adjustments: [],
    currentSettings: DEFAULT_SETTINGS,
  });
  const [pendingAdjustment, setPendingAdjustment] = useState<PersonalityAdjustment | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory({
          adjustments: parsed.adjustments.map((adj: any) => ({
            ...adj,
            timestamp: new Date(adj.timestamp),
            feedbackTimestamp: adj.feedbackTimestamp ? new Date(adj.feedbackTimestamp) : undefined,
          })),
          currentSettings: parsed.currentSettings || DEFAULT_SETTINGS,
        });
      }
    } catch (error) {
      console.error('Error loading personality adjustments:', error);
    }
  }, []);

  // Save history to localStorage
  const saveHistory = useCallback((updatedHistory: AdjustmentHistory) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
      setHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving personality adjustments:', error);
    }
  }, []);

  // Record new adjustment
  const recordAdjustment = useCallback((
    adjustmentType: AdjustmentType,
    reason: string,
    newSettings: PersonalityAdjustment['newSettings']
  ) => {
    const adjustment: PersonalityAdjustment = {
      id: `adj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      adjustmentType,
      reason,
      previousSettings: history.currentSettings,
      newSettings,
    };

    const updatedHistory: AdjustmentHistory = {
      adjustments: [adjustment, ...history.adjustments],
      currentSettings: newSettings,
    };

    saveHistory(updatedHistory);
    setPendingAdjustment(adjustment);

    return adjustment.id;
  }, [history, saveHistory]);

  // Submit feedback on adjustment
  const submitFeedback = useCallback((
    adjustmentId: string,
    feedback: 'liked' | 'disliked'
  ) => {
    const updatedAdjustments = history.adjustments.map(adj =>
      adj.id === adjustmentId
        ? { ...adj, userFeedback: feedback, feedbackTimestamp: new Date() }
        : adj
    );

    const updatedHistory: AdjustmentHistory = {
      ...history,
      adjustments: updatedAdjustments,
    };

    saveHistory(updatedHistory);
    setPendingAdjustment(null);
  }, [history, saveHistory]);

  // Revert adjustment
  const revertAdjustment = useCallback((adjustmentId: string) => {
    const adjustment = history.adjustments.find(adj => adj.id === adjustmentId);
    if (!adjustment) return;

    // Mark as reverted
    const updatedAdjustments = history.adjustments.map(adj =>
      adj.id === adjustmentId
        ? { ...adj, userFeedback: 'reverted' as const, feedbackTimestamp: new Date() }
        : adj
    );

    // Restore previous settings
    const updatedHistory: AdjustmentHistory = {
      adjustments: updatedAdjustments,
      currentSettings: adjustment.previousSettings,
    };

    saveHistory(updatedHistory);
    setPendingAdjustment(null);
  }, [history, saveHistory]);

  // Dismiss pending adjustment notification
  const dismissPendingAdjustment = useCallback(() => {
    setPendingAdjustment(null);
  }, []);

  // Get adjustment stats
  const getAdjustmentStats = useCallback(() => {
    const total = history.adjustments.length;
    const liked = history.adjustments.filter(adj => adj.userFeedback === 'liked').length;
    const disliked = history.adjustments.filter(adj => adj.userFeedback === 'disliked').length;
    const reverted = history.adjustments.filter(adj => adj.userFeedback === 'reverted').length;
    const noFeedback = history.adjustments.filter(adj => !adj.userFeedback).length;

    return { total, liked, disliked, reverted, noFeedback };
  }, [history.adjustments]);

  return {
    history,
    currentSettings: history.currentSettings,
    pendingAdjustment,
    recordAdjustment,
    submitFeedback,
    revertAdjustment,
    dismissPendingAdjustment,
    getAdjustmentStats,
  };
};
