import { useState, useEffect } from 'react';

/**
 * Hook to get and sync the custom MMAgent name from localStorage
 * Returns the custom name if set, otherwise returns null
 */
export const useAgentName = () => {
  const [agentName, setAgentName] = useState<string | null>(null);

  useEffect(() => {
    // Load initial value
    const savedName = localStorage.getItem('mmAgentCustomName');
    setAgentName(savedName);

    // Listen for storage changes (cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'mmAgentCustomName') {
        setAgentName(e.newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Listen for custom event (same-tab updates)
    const handleCustomEvent = () => {
      const savedName = localStorage.getItem('mmAgentCustomName');
      setAgentName(savedName);
    };

    window.addEventListener('agentNameUpdated', handleCustomEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('agentNameUpdated', handleCustomEvent);
    };
  }, []);

  return agentName;
};

/**
 * Utility function to update the agent name and trigger cross-component sync
 */
export const updateAgentName = (name: string) => {
  if (name.trim()) {
    localStorage.setItem('mmAgentCustomName', name.trim());
  } else {
    localStorage.removeItem('mmAgentCustomName');
  }
  
  // Dispatch custom event for same-tab updates
  window.dispatchEvent(new Event('agentNameUpdated'));
};
