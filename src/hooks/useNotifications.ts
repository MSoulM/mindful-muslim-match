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
    title: 'New Match Available',
    body: '{agent} found a potential match for you',
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
    title: 'ChaiChat Analysis Complete',
    body: '{agent} has finished analyzing your compatibility - check the results',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    read: false,
    actionUrl: '/chaichat',
    data: { action: 'View Insights' }
  },
  {
    id: '4',
    type: 'achievement',
    title: 'DNA Milestone! 🎉',
    body: '{agent} congratulates you - your Values & Beliefs reached Ultra Rare status!',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/dna',
    data: { progress: 96 }
  },
  {
    id: '5',
    type: 'system',
    title: 'Weekly Check-In',
    body: 'Time for your weekly check-in with {agent}',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    data: { action: 'Start Chat' }
  },
  {
    id: '6',
    type: 'dna',
    title: 'New Insight Available',
    body: '{agent} has discovered something interesting about you',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/insights',
    data: { action: 'Review Insight' }
  },
  {
    id: '7',
    type: 'system',
    title: 'Profile Suggestion',
    body: '{agent} has a suggestion to improve your profile',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    read: true,
    actionUrl: '/profile'
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
