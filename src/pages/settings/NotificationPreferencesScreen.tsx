import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Volume2, Moon, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface NotificationPreferences {
  push: {
    matches: boolean;
    messages: boolean;
    chaiChatUpdates: boolean;
    weeklyInsights: boolean;
    achievements: boolean;
    promotions: boolean;
  };
  email: {
    frequency: 'instant' | 'daily' | 'weekly' | 'never';
    digest: boolean;
    newsletters: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
    includePrayerTimes: boolean;
  };
  sound: {
    enabled: boolean;
    vibration: boolean;
  };
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  push: {
    matches: true,
    messages: true,
    chaiChatUpdates: true,
    weeklyInsights: true,
    achievements: true,
    promotions: false
  },
  email: {
    frequency: 'daily',
    digest: true,
    newsletters: false
  },
  quietHours: {
    enabled: false,
    start: '22:00',
    end: '07:00',
    includePrayerTimes: false
  },
  sound: {
    enabled: true,
    vibration: true
  }
};

export const NotificationPreferencesScreen = () => {
  const navigate = useNavigate();
  const [preferences, setPreferences] = useState<NotificationPreferences>(DEFAULT_PREFERENCES);
  const [hasChanges, setHasChanges] = useState(false);
  
  const updatePreference = <K extends keyof NotificationPreferences>(
    category: K,
    key: keyof NotificationPreferences[K],
    value: any
  ) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasChanges(true);
  };
  
  const handleSave = () => {
    localStorage.setItem('notification_preferences', JSON.stringify(preferences));
    setHasChanges(false);
    // Show success toast
  };
  
  return (
    <ScreenContainer>
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Notification Preferences</h1>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6 pb-24">
          {/* Push Notifications */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Push Notifications</h2>
            </div>
            
            <div className="space-y-4 bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="matches" className="text-sm font-medium">
                    New Matches
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When we find someone special for you
                  </p>
                </div>
                <Switch
                  id="matches"
                  checked={preferences.push.matches}
                  onCheckedChange={(checked) => updatePreference('push', 'matches', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="messages" className="text-sm font-medium">
                    Messages
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When someone sends you a message
                  </p>
                </div>
                <Switch
                  id="messages"
                  checked={preferences.push.messages}
                  onCheckedChange={(checked) => updatePreference('push', 'messages', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="chaichat" className="text-sm font-medium">
                    ChaiChat Updates
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    When AI analysis is complete
                  </p>
                </div>
                <Switch
                  id="chaichat"
                  checked={preferences.push.chaiChatUpdates}
                  onCheckedChange={(checked) => updatePreference('push', 'chaiChatUpdates', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="insights" className="text-sm font-medium">
                    Weekly Insights
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your weekly match updates
                  </p>
                </div>
                <Switch
                  id="insights"
                  checked={preferences.push.weeklyInsights}
                  onCheckedChange={(checked) => updatePreference('push', 'weeklyInsights', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="achievements" className="text-sm font-medium">
                    Achievements
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    DNA milestones and badges
                  </p>
                </div>
                <Switch
                  id="achievements"
                  checked={preferences.push.achievements}
                  onCheckedChange={(checked) => updatePreference('push', 'achievements', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="promotions" className="text-sm font-medium">
                    Promotions & Tips
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Feature updates and tips
                  </p>
                </div>
                <Switch
                  id="promotions"
                  checked={preferences.push.promotions}
                  onCheckedChange={(checked) => updatePreference('push', 'promotions', checked)}
                />
              </div>
            </div>
          </section>
          
          {/* Email Notifications */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Email Updates</h2>
            
            <div className="space-y-4 bg-card rounded-lg border border-border p-4">
              <RadioGroup
                value={preferences.email.frequency}
                onValueChange={(value) => updatePreference('email', 'frequency', value as any)}
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="instant" id="instant" />
                  <Label htmlFor="instant" className="flex-1">
                    <span className="font-medium">Instant</span>
                    <p className="text-sm text-muted-foreground">
                      Get emails as notifications happen
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="daily" id="daily" />
                  <Label htmlFor="daily" className="flex-1">
                    <span className="font-medium">Daily Digest</span>
                    <p className="text-sm text-muted-foreground">
                      One email per day with all updates
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="weekly" id="weekly" />
                  <Label htmlFor="weekly" className="flex-1">
                    <span className="font-medium">Weekly Summary</span>
                    <p className="text-sm text-muted-foreground">
                      Weekly recap of activity (Recommended)
                    </p>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="never" id="never" />
                  <Label htmlFor="never" className="flex-1">
                    <span className="font-medium">No Emails</span>
                    <p className="text-sm text-muted-foreground">
                      Push notifications only
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </section>
          
          {/* Quiet Hours */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Moon className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Quiet Hours</h2>
            </div>
            
            <div className="space-y-4 bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="quietHours" className="text-sm font-medium">
                    Enable Quiet Hours
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pause notifications during certain hours
                  </p>
                </div>
                <Switch
                  id="quietHours"
                  checked={preferences.quietHours.enabled}
                  onCheckedChange={(checked) => updatePreference('quietHours', 'enabled', checked)}
                />
              </div>
              
              {preferences.quietHours.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Start Time
                      </Label>
                      <input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => updatePreference('quietHours', 'start', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        End Time
                      </Label>
                      <input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => updatePreference('quietHours', 'end', e.target.value)}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="prayerTimes" className="text-sm font-medium">
                        Respect Prayer Times
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Auto-silence during prayer times
                      </p>
                    </div>
                    <Switch
                      id="prayerTimes"
                      checked={preferences.quietHours.includePrayerTimes}
                      onCheckedChange={(checked) => updatePreference('quietHours', 'includePrayerTimes', checked)}
                    />
                  </div>
                </>
              )}
            </div>
          </section>
          
          {/* Sound & Vibration */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Sound & Vibration</h2>
            </div>
            
            <div className="space-y-4 bg-card rounded-lg border border-border p-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="sound" className="text-sm font-medium">
                  Sound
                </Label>
                <Switch
                  id="sound"
                  checked={preferences.sound.enabled}
                  onCheckedChange={(checked) => updatePreference('sound', 'enabled', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration" className="text-sm font-medium">
                  Vibration
                </Label>
                <Switch
                  id="vibration"
                  checked={preferences.sound.vibration}
                  onCheckedChange={(checked) => updatePreference('sound', 'vibration', checked)}
                />
              </div>
            </div>
          </section>
        </div>
      </ScrollArea>
      
      {/* Save Button */}
      {hasChanges && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t border-border safe-bottom">
          <Button onClick={handleSave} className="w-full">
            Save Preferences
          </Button>
        </div>
      )}
    </ScreenContainer>
  );
};
