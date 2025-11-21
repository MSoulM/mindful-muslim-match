import { useState, useEffect } from 'react';
import { Network } from '@capacitor/network';

interface Insight {
  id: string;
  category: string;
  text: string;
  confidence: number;
  source: string;
  approved?: boolean;
  timestamp: string;
}

interface UseOfflineInsightsReturn {
  insights: Insight[];
  isOffline: boolean;
  pendingApprovals: number;
  approveInsight: (id: string) => void;
  rejectInsight: (id: string) => void;
  syncWhenOnline: () => Promise<void>;
}

/**
 * Hook for offline insight review capability
 * Allows users to review and approve insights even without internet
 */
export function useOfflineInsights(): UseOfflineInsightsReturn {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingApprovals, setPendingApprovals] = useState(0);

  useEffect(() => {
    // Load cached insights from localStorage
    const cached = localStorage.getItem('cached_insights');
    if (cached) {
      setInsights(JSON.parse(cached));
    }

    // Monitor network status
    setupNetworkListener();

    // Load pending approvals count
    const pending = localStorage.getItem('pending_approvals');
    if (pending) {
      setPendingApprovals(JSON.parse(pending).length);
    }
  }, []);

  const setupNetworkListener = async () => {
    // Check if we're on native platform
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      const status = await Network.getStatus();
      setIsOffline(!status.connected);

      await Network.addListener('networkStatusChange', (status) => {
        setIsOffline(!status.connected);
        
        // Auto-sync when coming back online
        if (status.connected) {
          syncWhenOnline();
        }
      });
    } else {
      // Fallback for web
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', () => {
        setIsOffline(false);
        syncWhenOnline();
      });
      window.addEventListener('offline', () => setIsOffline(true));
    }
  };

  const approveInsight = (id: string) => {
    // Update local state
    const updated = insights.map(insight =>
      insight.id === id ? { ...insight, approved: true } : insight
    );
    setInsights(updated);
    
    // Cache updated insights
    localStorage.setItem('cached_insights', JSON.stringify(updated));
    
    // Queue approval for sync
    const pending = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
    pending.push({ id, action: 'approve', timestamp: new Date().toISOString() });
    localStorage.setItem('pending_approvals', JSON.stringify(pending));
    setPendingApprovals(pending.length);
    
    // Try to sync immediately if online
    if (!isOffline) {
      syncWhenOnline();
    }
  };

  const rejectInsight = (id: string) => {
    // Update local state
    const updated = insights.map(insight =>
      insight.id === id ? { ...insight, approved: false } : insight
    );
    setInsights(updated);
    
    // Cache updated insights
    localStorage.setItem('cached_insights', JSON.stringify(updated));
    
    // Queue rejection for sync
    const pending = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
    pending.push({ id, action: 'reject', timestamp: new Date().toISOString() });
    localStorage.setItem('pending_approvals', JSON.stringify(pending));
    setPendingApprovals(pending.length);
    
    // Try to sync immediately if online
    if (!isOffline) {
      syncWhenOnline();
    }
  };

  const syncWhenOnline = async () => {
    if (isOffline) return;

    try {
      const pending = JSON.parse(localStorage.getItem('pending_approvals') || '[]');
      
      if (pending.length === 0) return;

      // Batch submit all pending approvals
      // In production, this would call your API
      console.log('Syncing pending approvals:', pending);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear pending after successful sync
      localStorage.removeItem('pending_approvals');
      setPendingApprovals(0);
      
    } catch (error) {
      console.error('Sync error:', error);
      // Keep pending approvals for retry
    }
  };

  return {
    insights,
    isOffline,
    pendingApprovals,
    approveInsight,
    rejectInsight,
    syncWhenOnline
  };
}
