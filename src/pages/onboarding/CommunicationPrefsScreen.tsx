import { motion } from 'framer-motion';
import { Heart, MessageCircle, Coffee, TrendingUp, Gift, ChevronLeft } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface CommunicationPrefsScreenProps {
  onNext: (prefs: CommunicationPrefs) => void;
  onBack: () => void;
}

interface CommunicationPrefs {
  newMatches: boolean;
  messages: boolean;
  chaiChatUpdates: boolean;
  weeklyInsights: boolean;
  promotions: boolean;
  emailDigest: 'daily' | 'weekly' | 'never';
  quietHours: boolean;
  quietHoursFrom?: string;
  quietHoursTo?: string;
  noPrayerTimes: boolean;
}

const notificationTypes = [
  {
    id: 'newMatches',
    icon: Heart,
    title: 'New Matches',
    description: 'Get notified when you have a new match',
    defaultOn: true
  },
  {
    id: 'messages',
    icon: MessageCircle,
    title: 'Messages',
    description: 'New messages from your matches',
    defaultOn: true
  },
  {
    id: 'chaiChatUpdates',
    icon: Coffee,
    title: 'ChaiChat Updates',
    description: 'AI conversation analysis complete',
    defaultOn: true
  },
  {
    id: 'weeklyInsights',
    icon: TrendingUp,
    title: 'Weekly Insights',
    description: 'Your compatibility stats and tips',
    defaultOn: false
  },
  {
    id: 'promotions',
    icon: Gift,
    title: 'Promotions & Tips',
    description: 'Special offers and app updates',
    defaultOn: false
  }
];

export default function CommunicationPrefsScreen({ onNext, onBack }: CommunicationPrefsScreenProps) {
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

  const handleToggle = (key: keyof CommunicationPrefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleEmailDigestChange = (value: 'daily' | 'weekly' | 'never') => {
    setPrefs(prev => ({ ...prev, emailDigest: value }));
  };

  const handleSave = () => {
    onNext(prefs);
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
          <h1 className="text-xl font-bold text-foreground">Customize Notifications</h1>
          <p className="text-sm text-muted-foreground">Choose what you'd like to know about</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">Step 7 of 7</span>
          <span className="text-sm font-medium text-primary">Final Step!</span>
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
          {notificationTypes.map((type, index) => {
            const Icon = type.icon;
            return (
              <motion.div
                key={type.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border"
              >
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
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
          <h2 className="text-lg font-semibold text-foreground mb-3">Email Updates</h2>
          <div className="space-y-2">
            {[
              { value: 'daily', label: 'Daily Digest', description: 'Get updates every day' },
              { value: 'weekly', label: 'Weekly Summary', description: 'Recommended - once a week' },
              { value: 'never', label: 'No Emails', description: 'App notifications only' }
            ].map((option) => (
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
          <h2 className="text-lg font-semibold text-foreground">Quiet Hours</h2>
          
          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex-1">
              <Label htmlFor="quiet-hours" className="text-base font-semibold">
                Enable Quiet Hours
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                No notifications during sleep time
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
                <Label className="text-sm text-muted-foreground mb-2 block">From</Label>
                <input
                  type="time"
                  value={prefs.quietHoursFrom}
                  onChange={(e) => setPrefs(prev => ({ ...prev, quietHoursFrom: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </div>
              <div className="flex-1 p-4 bg-muted rounded-xl">
                <Label className="text-sm text-muted-foreground mb-2 block">To</Label>
                <input
                  type="time"
                  value={prefs.quietHoursTo}
                  onChange={(e) => setPrefs(prev => ({ ...prev, quietHoursTo: e.target.value }))}
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                />
              </div>
            </motion.div>
          )}

          <div className="flex items-center justify-between p-4 bg-card rounded-xl border border-border">
            <div className="flex-1">
              <Label htmlFor="prayer-times" className="text-base font-semibold">
                Respect Prayer Times
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                No notifications during Salah
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
        <Button onClick={handleSave} className="w-full h-14 text-base" size="lg">
          Complete Setup
        </Button>
      </div>
    </div>
  );
}
