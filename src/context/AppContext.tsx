import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkError } from '@/components/ui/states/NetworkError';

interface AppContextType {
  isOnline: boolean;
  notificationCount: number;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  setNotificationCount: (count: number) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [notificationCount, setNotificationCount] = useState(5);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Load theme from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('matchme_theme');
    if (stored === 'dark' || stored === 'light') {
      setTheme(stored);
      document.documentElement.classList.toggle('dark', stored === 'dark');
    }
  }, []);
  
  // Save theme to localStorage
  const handleSetTheme = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    localStorage.setItem('matchme_theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };
  
  return (
    <AppContext.Provider value={{
      isOnline,
      notificationCount,
      theme,
      setTheme: handleSetTheme,
      setNotificationCount
    }}>
      {!isOnline && <NetworkError />}
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
