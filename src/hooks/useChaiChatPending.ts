import { useState, useEffect } from 'react';

export const useChaiChatPending = () => {
  const [pendingCount, setPendingCount] = useState(0);
  
  useEffect(() => {
    // Load pending count from localStorage
    const stored = localStorage.getItem('chaichat_pending_count');
    if (stored) {
      setPendingCount(parseInt(stored, 10));
    } else {
      // Default to 2 pending reviews (matching the hardcoded data)
      setPendingCount(2);
      localStorage.setItem('chaichat_pending_count', '2');
    }
  }, []);
  
  const updatePendingCount = (count: number) => {
    setPendingCount(count);
    localStorage.setItem('chaichat_pending_count', count.toString());
  };
  
  return {
    pendingCount,
    updatePendingCount
  };
};
