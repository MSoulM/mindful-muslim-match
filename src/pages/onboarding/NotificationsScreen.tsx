import { motion } from 'framer-motion';
import { Bell, Lock, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { NotificationsScreenProps } from '@/types/onboarding';
import {
  NOTIFICATIONS_SCREEN,
  NOTIFICATION_BENEFITS
} from '@/config/onboardingConstants';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

export default function NotificationsScreen({ onAllow, onSkip }: NotificationsScreenProps) {
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const { updateChannelFlags, isSaving } = useNotificationSettings();

  const handleAllow = async () => {
    try {
      setIsRequestingPermission(true);
      let granted = true;

      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        granted = permission === 'granted';
      }

      await updateChannelFlags({ pushEnabled: granted });

      setTimeout(() => {
        setIsRequestingPermission(false);
        onAllow();
      }, 300);
    } catch (error) {
      console.error('Failed to enable notifications', error);
      setIsRequestingPermission(false);
    }
  };

  const handleSkip = async () => {
    try {
      await updateChannelFlags({ pushEnabled: false });
    } catch (error) {
      console.error('Failed to update notification preference', error);
    } finally {
      onSkip();
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pt-safe">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {NOTIFICATIONS_SCREEN.STEP} of {NOTIFICATIONS_SCREEN.TOTAL_STEPS}
          </span>
        </div>
        <button
          onClick={handleSkip}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
          aria-label="Skip"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <div className="px-4 pb-6">
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: `${(NOTIFICATIONS_SCREEN.STEP - 1) / NOTIFICATIONS_SCREEN.TOTAL_STEPS * 100}%` }}
            animate={{ width: `${NOTIFICATIONS_SCREEN.STEP / NOTIFICATIONS_SCREEN.TOTAL_STEPS * 100}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {/* Animated Bell Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            <div className="w-[120px] h-[120px] bg-primary/10 rounded-full flex items-center justify-center">
              <Bell className="w-16 h-16 text-primary" />
            </div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-2 -right-2 w-8 h-8 bg-semantic-error rounded-full flex items-center justify-center text-white text-xs font-bold"
            >
              3
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">{NOTIFICATIONS_SCREEN.title}</h1>
          <p className="text-base text-muted-foreground">
            {NOTIFICATIONS_SCREEN.subtitle}
          </p>
        </div>

        {/* Benefits List */}
        <div className="space-y-4 mb-6">
          {NOTIFICATION_BENEFITS.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className="flex items-start gap-4 p-4 bg-card rounded-xl border border-border"
            >
              <div className="text-3xl flex-shrink-0">{benefit.icon}</div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {benefit.title}
                </h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Privacy Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-start gap-3 p-4 bg-muted rounded-xl"
        >
          <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            {NOTIFICATIONS_SCREEN.privacyNote}
          </p>
        </motion.div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-safe">
        <div className="space-y-3">
          <Button
            onClick={handleAllow}
            disabled={isRequestingPermission || isSaving}
            className="w-full h-14 text-base"
            size="lg"
          >
            {isRequestingPermission ? NOTIFICATIONS_SCREEN.enablingButton : NOTIFICATIONS_SCREEN.enableButton}
          </Button>
          <button
            onClick={handleSkip}
            className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
          >
            {NOTIFICATIONS_SCREEN.skipButton}
          </button>
        </div>
      </div>
    </div>
  );
}
