import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { notifySuccess, notifyError } from '@/utils/notifications';

interface UsePushNotificationsReturn {
  isRegistered: boolean;
  token: string | null;
  registerForPushNotifications: () => Promise<void>;
  sendBatchCompletionNotification: (batchInfo: { insights: number; date: string }) => void;
}

/**
 * Hook for managing push notifications on native mobile
 * Used for batch processing completion alerts
 */
export function usePushNotifications(): UsePushNotificationsReturn {
  const [isRegistered, setIsRegistered] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we're on native platform
    if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
      setupPushNotifications();
    }
  }, []);

  const setupPushNotifications = async () => {
    try {
      // Request permission
      const permResult = await PushNotifications.requestPermissions();
      
      if (permResult.receive === 'granted') {
        // Register with FCM/APNs
        await PushNotifications.register();
        
        // Listen for registration success
        await PushNotifications.addListener('registration', (token) => {
          setToken(token.value);
          setIsRegistered(true);
          
          // Store token in backend for sending notifications
          localStorage.setItem('push_token', token.value);
        });

        // Listen for registration errors
        await PushNotifications.addListener('registrationError', (error) => {
          console.error('Push registration error:', error);
          notifyError('Failed to enable notifications');
        });

        // Listen for notification received while app is open
        await PushNotifications.addListener('pushNotificationReceived', (notification) => {
          notifySuccess(
            notification.title || 'New Notification',
            { description: notification.body }
          );
        });

        // Listen for notification tapped (opens app)
        await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
          const data = notification.notification.data;
          
          // Navigate to insights if batch completion notification
          if (data?.type === 'batch_complete') {
            window.location.href = '/insights';
          }
        });
      }
    } catch (error) {
      console.error('Push notification setup error:', error);
    }
  };

  const registerForPushNotifications = async () => {
    await setupPushNotifications();
  };

  const sendBatchCompletionNotification = (batchInfo: { insights: number; date: string }) => {
    // This would be called from backend when batch completes
    // Here we just show local notification as demo
    if (isRegistered) {
      notifySuccess(
        'Batch Processing Complete! 🎉',
        {
          description: `${batchInfo.insights} new insights are ready to review`,
          duration: 8000,
          action: {
            label: 'View Insights',
            onClick: () => window.location.href = '/insights'
          }
        }
      );
    }
  };

  return {
    isRegistered,
    token,
    registerForPushNotifications,
    sendBatchCompletionNotification
  };
}
