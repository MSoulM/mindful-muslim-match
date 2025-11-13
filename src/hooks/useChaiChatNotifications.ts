import { useState, useEffect } from 'react';

export interface ChaiChatNotification {
  id: string;
  matchId: string;
  matchName: string;
  type: 'ready' | 'in-progress';
  timestamp: Date;
  read: boolean;
}

export const useChaiChatNotifications = () => {
  const [chaiChatNotifications, setChaiChatNotifications] = useState<ChaiChatNotification[]>([]);
  
  useEffect(() => {
    // Load ChaiChat notifications from localStorage
    const stored = localStorage.getItem('chaichat_notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      const withDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setChaiChatNotifications(withDates);
    }
  }, []);
  
  useEffect(() => {
    // Save ChaiChat notifications to localStorage
    if (chaiChatNotifications.length > 0) {
      localStorage.setItem('chaichat_notifications', JSON.stringify(chaiChatNotifications));
    }
  }, [chaiChatNotifications]);
  
  const addChaiChatNotification = (matchId: string, matchName: string) => {
    const newNotification: ChaiChatNotification = {
      id: `chaichat-${Date.now()}`,
      matchId,
      matchName,
      type: 'ready',
      timestamp: new Date(),
      read: false
    };
    
    setChaiChatNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };
  
  const scheduleChaiChatReady = (matchId: string, matchName: string, delayMs: number = 5000) => {
    // Simulate ChaiChat being prepared and then ready
    setTimeout(() => {
      addChaiChatNotification(matchId, matchName);
    }, delayMs);
  };
  
  const markChaiChatAsRead = (id: string) => {
    setChaiChatNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };
  
  const markAllChaiChatAsRead = () => {
    setChaiChatNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  const deleteChaiChatNotification = (id: string) => {
    setChaiChatNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const unreadChaiChatCount = chaiChatNotifications.filter(n => !n.read && n.type === 'ready').length;
  
  return {
    chaiChatNotifications,
    unreadChaiChatCount,
    addChaiChatNotification,
    scheduleChaiChatReady,
    markChaiChatAsRead,
    markAllChaiChatAsRead,
    deleteChaiChatNotification
  };
};
