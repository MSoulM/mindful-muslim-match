import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Volume2, Moon, ArrowLeft } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { NotificationCategory } from '@/components/settings/NotificationCategory';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';
import { useToast } from '@/hooks/use-toast';

export const NotificationPreferencesScreen = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    notificationState,
    togglePush,
    toggleCategory,
    toggleCategoryOption,
    toggleEmail,
    setEmailFrequency,
    updateQuietHours,
    toggleSounds,
    toggleVibration,
  } = useNotificationPreferences();

  const [hasChanges, setHasChanges] = useState(false);

  const handleSave = () => {
    setHasChanges(false);
    toast({
      title: 'Preferences saved',
      description: 'Your notification settings have been updated.',
    });
  };

  const markChanged = () => {
    if (!hasChanges) setHasChanges(true);
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
            
            <div className="space-y-3">
              {notificationState.categories.map((category) => (
                <NotificationCategory
                  key={category.id}
                  icon={<Bell className="w-5 h-5" />}
                  title={category.label}
                  description={category.description}
                  enabled={category.enabled}
                  onToggle={(enabled) => {
                    toggleCategory(category.id, enabled);
                    markChanged();
                  }}
                  options={category.options}
                  onOptionToggle={(optionId, enabled) => {
                    toggleCategoryOption(category.id, optionId, enabled);
                    markChanged();
                  }}
                />
              ))}
            </div>
          </section>
          
          {/* Email Notifications */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Email Updates</h2>
            
            <div className="space-y-4 bg-card rounded-lg border border-border p-4">
              <RadioGroup
                value={notificationState.emailFrequency}
                onValueChange={(value: any) => {
                  setEmailFrequency(value);
                  markChanged();
                }}
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
                  checked={notificationState.quietHours.enabled}
                  onCheckedChange={(checked) => {
                    updateQuietHours({ enabled: checked });
                    markChanged();
                  }}
                />
              </div>
              
              {notificationState.quietHours.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Start Time
                      </Label>
                      <input
                        type="time"
                        value={notificationState.quietHours.start}
                        onChange={(e) => {
                          updateQuietHours({ start: e.target.value });
                          markChanged();
                        }}
                        className="w-full px-3 py-2 rounded-md border border-border bg-background"
                      />
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        End Time
                      </Label>
                      <input
                        type="time"
                        value={notificationState.quietHours.end}
                        onChange={(e) => {
                          updateQuietHours({ end: e.target.value });
                          markChanged();
                        }}
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
                      checked={notificationState.quietHours.includePrayerTimes}
                      onCheckedChange={(checked) => {
                        updateQuietHours({ includePrayerTimes: checked });
                        markChanged();
                      }}
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
                  checked={notificationState.inAppSounds}
                  onCheckedChange={(checked) => {
                    toggleSounds(checked);
                    markChanged();
                  }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="vibration" className="text-sm font-medium">
                  Vibration
                </Label>
                <Switch
                  id="vibration"
                  checked={notificationState.vibration}
                  onCheckedChange={(checked) => {
                    toggleVibration(checked);
                    markChanged();
                  }}
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
