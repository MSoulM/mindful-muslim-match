import { useState, useEffect } from 'react';

export interface Notification {
  id: string;
  type: 'match' | 'message' | 'chaichat' | 'dna' | 'system' | 'achievement';
  title: string;
  body: string;
  icon?: string;
  image?: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: {
    badge?: string;
    progress?: number;
    action?: string;
  };
}

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'match',
    title: 'New Match Available!',
    body: 'Sarah from North London matches 95% with you',
    image: '/placeholder.svg',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/discover'
  },
  {
    id: '2',
    type: 'message',
    title: 'Amina Ahmed',
    body: 'As-salamu alaykum! I saw your profile and would love to chat...',
    image: '/placeholder.svg',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    read: false,
    actionUrl: '/messages',
    data: { badge: '3' }
  },
  {
    id: '3',
    type: 'chaichat',
    title: 'ChaiChat Conversation Complete',
    body: 'Your AI agents have finished discussing compatibility with Fatima',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/chaichat',
    data: { action: 'View Insights' }
  },
  {
    id: '4',
    type: 'achievement',
    title: 'DNA Milestone! 🎉',
    body: 'Your Values & Beliefs category reached Ultra Rare status',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/dna',
    data: { progress: 96 }
  },
  {
    id: '5',
    type: 'system',
    title: 'Weekly Matches Tomorrow',
    body: 'Your 3 new curated matches arrive Sunday at 9 AM',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    data: { action: 'Set Reminder' }
  }
];

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    // Load notifications from localStorage
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert timestamp strings back to Date objects
      const withDates = parsed.map((n: any) => ({
        ...n,
        timestamp: new Date(n.timestamp)
      }));
      setNotifications(withDates);
    } else {
      setNotifications(MOCK_NOTIFICATIONS);
    }
  }, []);
  
  useEffect(() => {
    // Save notifications to localStorage
    if (notifications.length > 0) {
      localStorage.setItem('notifications', JSON.stringify(notifications));
    }
  }, [notifications]);
  
  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: !n.read } : n)
    );
  };
  
  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };
  
  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date(),
      read: false
    };
    
    setNotifications(prev => [newNotification, ...prev]);
    return newNotification;
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification
  };
};
