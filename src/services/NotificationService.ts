import type { Notification as AppNotification } from '@/hooks/useNotifications';

type NotificationPermissionStatus = 'granted' | 'denied' | 'default';

class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermissionStatus = 'default';
  private onNotificationCallback?: (notification: AppNotification) => void;
  
  private constructor() {
    this.checkPermission();
  }
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  private checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission as NotificationPermissionStatus;
    }
  }
  
  async requestPermissions(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }
    
    if (this.permission === 'granted') {
      return true;
    }
    
    try {
      const result = await Notification.requestPermission();
      this.permission = result as NotificationPermissionStatus;
      return result === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  onNotification(callback: (notification: AppNotification) => void) {
    this.onNotificationCallback = callback;
  }
  
  async showNotification(
    title: string,
    options: {
      body: string;
      icon?: string;
      image?: string;
      badge?: string;
      tag?: string;
      data?: any;
    }
  ) {
    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }
    
    try {
      const notification = new Notification(title, {
        ...options,
        requireInteraction: false,
        silent: false
      });
      
      notification.onclick = () => {
        window.focus();
        notification.close();
        
        if (this.onNotificationCallback && options.data) {
          this.onNotificationCallback(options.data);
        }
      };
      
      return notification;
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }
  
  handleNotificationPress(notification: AppNotification) {
    // Deep linking based on notification type
    const routes: Record<AppNotification['type'], string> = {
      match: '/discover',
      message: `/messages`,
      chaichat: '/chaichat',
      dna: '/dna',
      achievement: '/dna',
      system: '/'
    };
    
    const route = routes[notification.type];
    if (route) {
      window.location.href = route;
    }
  }
  
  scheduleLocalNotification(
    title: string,
    body: string,
    triggerDate: Date,
    data?: any
  ) {
    const now = new Date();
    const delay = triggerDate.getTime() - now.getTime();
    
    if (delay <= 0) {
      console.warn('Trigger date is in the past');
      return;
    }
    
    setTimeout(() => {
      this.showNotification(title, {
        body,
        data,
        icon: '/placeholder.svg',
        badge: '/placeholder.svg'
      });
    }, delay);
  }
  
  // Simulate receiving a push notification (for testing)
  simulateNotification(notification: Omit<AppNotification, 'id' | 'timestamp'>) {
    const fullNotification: AppNotification = {
      ...notification,
      id: `notif-${Date.now()}`,
      timestamp: new Date()
    };
    
    if (this.onNotificationCallback) {
      this.onNotificationCallback(fullNotification);
    }
    
    if (document.hidden) {
      // Show browser notification if tab is not active
      this.showNotification(notification.title, {
        body: notification.body,
        image: notification.image,
        data: fullNotification
      });
    }
  }
  
  getPermissionStatus(): NotificationPermissionStatus {
    return this.permission;
  }
}

export const notificationService = NotificationService.getInstance();
