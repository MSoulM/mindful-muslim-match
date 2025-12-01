import { motion } from 'framer-motion';
import { Heart, MessageCircle, Coffee, TrendingUp, Gift, ChevronLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { CommunicationPrefs, CommunicationPrefsScreenProps } from '@/types/onboarding';
import {
  COMMUNICATION_PREFS_SCREEN,
  NOTIFICATION_TYPES,
  EMAIL_DIGEST_OPTIONS
} from '@/config/onboardingConstants';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';

// Icon map for dynamic icon rendering
const iconMap = {
  Heart,
  MessageCircle,
  Coffee,
  TrendingUp,
  Gift
};

export default function CommunicationPrefsScreen({ onNext, onBack }: CommunicationPrefsScreenProps) {
  const { settings, isLoading, isSaving, saveCommunicationPrefs } = useNotificationSettings();
  const [prefs, setPrefs] = useState<CommunicationPrefs>({
    newMatches: true,
    messages: true,
    chaiChatUpdates: true,
    weeklyInsights: false,
    promotions: false,
    emailDigest: 'weekly',
    quietHours: false,
    quietHoursFrom: '22:00',
    quietHoursTo: '07:00',
    noPrayerTimes: false
  });

  useEffect(() => {
    setPrefs({
      newMatches: settings.newMatches,
      messages: settings.messages,
      chaiChatUpdates: settings.chaiChatUpdates,
      weeklyInsights: settings.weeklyInsights,
      promotions: settings.promotions,
      emailDigest: settings.emailDigest,
      quietHours: settings.quietHours,
      quietHoursFrom: settings.quietHoursFrom,
      quietHoursTo: settings.quietHoursTo,
      noPrayerTimes: settings.noPrayerTimes
    });
  }, [settings]);

  const handleToggle = (key: keyof CommunicationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmailDigestChange = (value: 'daily' | 'weekly' | 'never') => {
    setPrefs(prev => ({ ...prev, emailDigest: value }));
  };

  const handleSave = async () => {
    try {
      await saveCommunicationPrefs(prefs);
      onNext(prefs);
    } catch (error) {
      console.error('Failed to save communication preferences', error);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 pt-safe border-b border-border">
        <button
          onClick={onBack}
          className="p-2 hover:bg-accent rounded-full transition-colors"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-foreground">{COMMUNICATION_PREFS_SCREEN.title}</h1>
          <p className="text-sm text-muted-foreground">{COMMUNICATION_PREFS_SCREEN.subtitle}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Step {COMMUNICATION_PREFS_SCREEN.STEP} of {COMMUNICATION_PREFS_SCREEN.TOTAL_STEPS}</span>
          <span className="text-sm font-medium text-primary">{COMMUNICATION_PREFS_SCREEN.finalStepLabel}</span>
        </div>
        <div className="w-full h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div
            initial={{ width: '86%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 pb-24 overflow-y-auto">
        {/* Notification Types */}
        <div className="space-y-3 mb-6">
          {NOTIFICATION_TYPES.map((type, index) => {
            const IconComponent = iconMap[type.icon as keyof typeof iconMap];
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <IconComponent className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {type.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
                <Switch
                  checked={prefs[type.id as keyof CommunicationPrefs] as boolean}
                  onCheckedChange={() => handleToggle(type.id as keyof CommunicationPrefs)}
                  className="flex-shrink-0"
                />
              </motion.div>
            );
          })}
        </div>

        {/* Email Preferences */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-3">{COMMUNICATION_PREFS_SCREEN.emailUpdatesTitle}</h2>
          <div className="space-y-2">
            {EMAIL_DIGEST_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleEmailDigestChange(option.value as 'daily' | 'weekly' | 'never')}
                className={cn(
                  'w-full flex items-start gap-3 p-4 rounded-xl border-2 transition-all',
                  prefs.emailDigest === option.value
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-card hover:border-primary/50'
                )}
              >
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5',
                  prefs.emailDigest === option.value
                    ? 'border-primary bg-primary'
                    : 'border-border'
                )}>
                  {prefs.emailDigest === option.value && (
                    <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                  )}
                </div>
                <div className="flex-1 text-left">
                  <div className="font-semibold text-foreground mb-1">{option.label}</div>
                  <div className="text-sm text-muted-foreground">{option.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quiet Hours */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">{COMMUNICATION_PREFS_SCREEN.quietHoursTitle}</h2>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex-1">
              <Label htmlFor="quiet-hours" className="text-base font-semibold">
                {COMMUNICATION_PREFS_SCREEN.enableQuietHoursLabel}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {COMMUNICATION_PREFS_SCREEN.quietHoursDescription}
              </p>
            </div>
            <Switch
              id="quiet-hours"
              checked={prefs.quietHours}
              onCheckedChange={() => handleToggle('quietHours')}
            />
          </div>

          {prefs.quietHours && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex gap-3"
            >
              <div className="flex-1 p-4 bg-muted rounded-xl">
                <Label className="text-sm text-muted-foreground mb-2 block">{COMMUNICATION_PREFS_SCREEN.quietHoursFromLabel}</Label>
                <input
                  type="time"
                  value={prefs.quietHoursFrom ?? ''}
                  onChange={(e) => setPrefs(prev => ({ ...prev, quietHoursFrom: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </div>
              <div className="flex-1 p-4 bg-muted rounded-xl">
                <Label className="text-sm text-muted-foreground mb-2 block">{COMMUNICATION_PREFS_SCREEN.quietHoursToLabel}</Label>
                <input
                  type="time"
                  value={prefs.quietHoursTo ?? ''}
                  onChange={(e) => setPrefs(prev => ({ ...prev, quietHoursTo: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex-1">
              <Label htmlFor="prayer-times" className="text-base font-semibold">
                {COMMUNICATION_PREFS_SCREEN.respectPrayerTimesLabel}
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                {COMMUNICATION_PREFS_SCREEN.respectPrayerTimesDescription}
              </p>
            </div>
            <Switch
              id="prayer-times"
              checked={prefs.noPrayerTimes}
              onCheckedChange={() => handleToggle('noPrayerTimes')}
            />
          </div>
        </div>
      </div>

      {/* Fixed Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 pb-safe">
        <Button
          onClick={handleSave}
          className="w-full h-14 text-base"
          size="lg"
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Saving...' : COMMUNICATION_PREFS_SCREEN.completeButton}
        </Button>
      </div>
    </div>
  );
}
