import { useState, useEffect } from 'react';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  
  useEffect(() => {
    // Load unread count from localStorage
    const stored = localStorage.getItem('unread_messages_count');
    if (stored) {
      setUnreadCount(parseInt(stored, 10));
    } else {
      // Default to 3 unread messages (matching the hardcoded data)
      setUnreadCount(3);
      localStorage.setItem('unread_messages_count', '3');
    }
  }, []);
  
  const updateUnreadCount = (count: number) => {
    setUnreadCount(count);
    localStorage.setItem('unread_messages_count', count.toString());
  };
  
  const decrementUnreadCount = () => {
    setUnreadCount(prev => {
      const newCount = Math.max(0, prev - 1);
      localStorage.setItem('unread_messages_count', newCount.toString());
      return newCount;
    });
  };
  
  return {
    unreadCount,
    updateUnreadCount,
    decrementUnreadCount
  };
};
