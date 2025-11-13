import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenContainer } from '@/components/layout/ScreenContainer';
import { TopBar } from '@/components/layout/TopBar';
import { BaseCard } from '@/components/ui/Cards/BaseCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AccessibleIcon, AccessibleIconButton } from '@/components/accessibility/AccessibleIcon';
import { LiveRegion } from '@/components/accessibility/LiveRegion';
import { KeyboardShortcutsModal, useKeyboardShortcutsModal } from '@/components/accessibility/KeyboardShortcutsModal';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAccessibilityPreferences, useScreenReaderAnnouncement, useKeyboardUser } from '@/hooks/useAccessibility';
import { 
  Eye, EyeOff, Volume2, VolumeX, Keyboard, 
  CheckCircle2, AlertCircle, Info, Heart, Star,
  Maximize, Mouse, Accessibility
} from 'lucide-react';
import { toast } from 'sonner';

export default function AccessibilityDemo() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const { open: shortcutsOpen, setOpen: setShortcutsOpen } = useKeyboardShortcutsModal();
  const { announcement, announce } = useScreenReaderAnnouncement();
  const preferences = useAccessibilityPreferences();
  const isKeyboardUser = useKeyboardUser();
  
  const [testAnnouncement, setTestAnnouncement] = useState('');
  const [touchTargetCompliance, setTouchTargetCompliance] = useState(true);

  // Register keyboard shortcuts for demo
  useKeyboardShortcuts([
    {
      key: 't',
      ctrl: true,
      handler: () => {
        announce('Toggling test announcement');
        setTestAnnouncement('This is a test announcement for screen readers');
        setTimeout(() => setTestAnnouncement(''), 3000);
      },
      description: 'Test screen reader announcement',
    },
  ]);

  const handleAnnounce = (message: string) => {
    announce(message);
    setTestAnnouncement(message);
    toast.success('Announced to screen readers', {
      description: message,
    });
    setTimeout(() => setTestAnnouncement(''), 3000);
  };

  return (
    <>
      <ScreenContainer>
        <TopBar
          variant="back"
          title="Accessibility Features"
          onBackClick={() => navigate(-1)}
        />

        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20" id="main-content">
          {/* Live Region for Announcements */}
          <LiveRegion message={testAnnouncement} />

          <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                Accessibility System
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Comprehensive accessibility features ensuring the app is usable by everyone, 
                following WCAG 2.1 AA standards.
              </p>
            </div>

            {/* User Preferences Detection */}
            <BaseCard className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20">
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Detected Preferences</h2>
                <Badge variant="outline" className="bg-background">
                  System
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <span className="text-sm">Reduced Motion</span>
                  <Badge variant={preferences.prefersReducedMotion ? 'default' : 'outline'}>
                    {preferences.prefersReducedMotion ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <span className="text-sm">High Contrast</span>
                  <Badge variant={preferences.prefersHighContrast ? 'default' : 'outline'}>
                    {preferences.prefersHighContrast ? 'On' : 'Off'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <span className="text-sm">Color Scheme</span>
                  <Badge variant="outline">{preferences.prefersColorScheme}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                  <span className="text-sm">Keyboard Navigation</span>
                  <Badge variant={isKeyboardUser ? 'default' : 'outline'}>
                    {isKeyboardUser ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </BaseCard>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="screen-reader">Screen Reader</TabsTrigger>
                <TabsTrigger value="keyboard">Keyboard</TabsTrigger>
                <TabsTrigger value="visual">Visual</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Accessibility Features</h3>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Eye,
                        title: 'Screen Reader Support',
                        description: 'ARIA labels, semantic HTML, live regions',
                        status: 'Complete',
                      },
                      {
                        icon: Keyboard,
                        title: 'Keyboard Navigation',
                        description: 'Tab order, focus management, shortcuts',
                        status: 'Complete',
                      },
                      {
                        icon: Maximize,
                        title: 'Touch Targets',
                        description: '44x44px minimum for all interactive elements',
                        status: 'Complete',
                      },
                      {
                        icon: Eye,
                        title: 'Visual Accessibility',
                        description: 'WCAG AA contrast, high contrast mode support',
                        status: 'Complete',
                      },
                    ].map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-4 p-4 bg-muted rounded-lg"
                      >
                        <feature.icon className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <h4 className="font-medium text-foreground mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </div>
                        <Badge variant="default" className="flex-shrink-0">
                          {feature.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </BaseCard>

                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">WCAG 2.1 Compliance</h3>
                  <div className="space-y-3">
                    {[
                      { level: 'A', criteria: 'Perceivable, Operable, Understandable', met: true },
                      { level: 'AA', criteria: 'Enhanced contrast, text size, touch targets', met: true },
                      { level: 'AAA', criteria: 'Enhanced readability, no time limits', met: false },
                    ].map((level, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-4 bg-muted rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          {level.met ? (
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                          ) : (
                            <AlertCircle className="w-6 h-6 text-amber-500" />
                          )}
                          <div>
                            <h4 className="font-medium">WCAG {level.level}</h4>
                            <p className="text-sm text-muted-foreground">{level.criteria}</p>
                          </div>
                        </div>
                        <Badge variant={level.met ? 'default' : 'outline'}>
                          {level.met ? 'Met' : 'Partial'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </BaseCard>
              </TabsContent>

              {/* Screen Reader Tab */}
              <TabsContent value="screen-reader" className="space-y-6">
                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Screen Reader Testing</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Test live region announcements for screen reader users. These messages 
                    are announced without moving focus.
                  </p>

                  {testAnnouncement && (
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-2">
                        <Volume2 className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                            Currently Announcing:
                          </p>
                          <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                            {testAnnouncement}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Button
                      onClick={() => handleAnnounce('Welcome! This is a polite announcement.')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <Volume2 className="w-4 h-4 mr-2" />
                      Polite Announcement
                    </Button>
                    <Button
                      onClick={() => handleAnnounce('Alert! This is an assertive announcement that interrupts.')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Assertive Announcement
                    </Button>
                    <Button
                      onClick={() => handleAnnounce('Success! Your action was completed successfully.')}
                      className="w-full justify-start"
                      variant="outline"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Success Message
                    </Button>
                  </div>
                </BaseCard>

                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Accessible Icons</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Icons include proper ARIA labels for screen readers
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                      <AccessibleIcon icon={Heart} label="Like" />
                      <span className="text-xs text-center">Like Icon</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                      <AccessibleIcon icon={Star} label="Favorite" />
                      <span className="text-xs text-center">Favorite Icon</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                      <AccessibleIcon icon={Info} label="Information" />
                      <span className="text-xs text-center">Info Icon</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 p-4 bg-muted rounded-lg">
                      <AccessibleIcon icon={CheckCircle2} label="Complete" />
                      <span className="text-xs text-center">Complete Icon</span>
                    </div>
                  </div>
                </BaseCard>
              </TabsContent>

              {/* Keyboard Tab */}
              <TabsContent value="keyboard" className="space-y-6">
                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Keyboard Shortcuts</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Press <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">?</kbd> + <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">Shift</kbd> to view all shortcuts
                  </p>

                  <Button
                    onClick={() => setShortcutsOpen(true)}
                    className="w-full"
                  >
                    <Keyboard className="w-4 h-4 mr-2" />
                    View Keyboard Shortcuts
                  </Button>

                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="font-medium mb-3">Try These Shortcuts:</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">Ctrl</kbd> + 
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">D</kbd>
                        <span className="text-muted-foreground ml-auto">Go to Discover</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">Ctrl</kbd> + 
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">M</kbd>
                        <span className="text-muted-foreground ml-auto">Go to Messages</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">Ctrl</kbd> + 
                        <kbd className="px-2 py-1 bg-background rounded text-xs font-mono">T</kbd>
                        <span className="text-muted-foreground ml-auto">Test Announcement</span>
                      </li>
                    </ul>
                  </div>
                </BaseCard>

                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Focus Management</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All interactive elements have visible focus indicators
                  </p>

                  <div className="space-y-3">
                    <Button className="w-full" variant="default">
                      Primary Button (Tab to focus)
                    </Button>
                    <Button className="w-full" variant="outline">
                      Secondary Button
                    </Button>
                    <Button className="w-full" variant="ghost">
                      Ghost Button
                    </Button>
                  </div>

                  {isKeyboardUser && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <p className="text-sm text-green-900 dark:text-green-100">
                        ✓ Keyboard navigation detected! Focus indicators are visible.
                      </p>
                    </div>
                  )}
                </BaseCard>
              </TabsContent>

              {/* Visual Tab */}
              <TabsContent value="visual" className="space-y-6">
                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Touch Target Compliance</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All interactive elements meet the 44x44px minimum touch target size
                  </p>

                  <div className="flex items-center justify-between mb-4">
                    <Label htmlFor="touch-targets">Show Touch Targets</Label>
                    <Switch
                      id="touch-targets"
                      checked={touchTargetCompliance}
                      onCheckedChange={setTouchTargetCompliance}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <AccessibleIconButton
                      icon={Heart}
                      label="Like"
                      className={touchTargetCompliance ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                    />
                    <AccessibleIconButton
                      icon={Star}
                      label="Favorite"
                      className={touchTargetCompliance ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                    />
                    <AccessibleIconButton
                      icon={CheckCircle2}
                      label="Complete"
                      className={touchTargetCompliance ? 'ring-2 ring-green-500 ring-offset-2' : ''}
                    />
                  </div>

                  {touchTargetCompliance && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                      <p className="text-xs text-green-900 dark:text-green-100">
                        Green rings indicate 44x44px touch target areas
                      </p>
                    </div>
                  )}
                </BaseCard>

                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">Contrast Ratios</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    All text meets WCAG AA contrast requirements (4.5:1 for normal text, 3:1 for large text)
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 bg-foreground text-background rounded-lg">
                      <p className="font-medium">High Contrast Text</p>
                      <p className="text-sm mt-1">Contrast ratio: 21:1 (AAA)</p>
                    </div>
                    <div className="p-4 bg-primary text-primary-foreground rounded-lg">
                      <p className="font-medium">Primary Color Text</p>
                      <p className="text-sm mt-1">Contrast ratio: 7:1 (AA)</p>
                    </div>
                    <div className="p-4 bg-secondary text-secondary-foreground rounded-lg">
                      <p className="font-medium">Secondary Color Text</p>
                      <p className="text-sm mt-1">Contrast ratio: 5:1 (AA)</p>
                    </div>
                  </div>
                </BaseCard>

                <BaseCard>
                  <h3 className="font-semibold text-lg mb-4">High Contrast Mode</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Application automatically adapts to system high contrast preferences
                  </p>

                  {preferences.prefersHighContrast ? (
                    <div className="p-4 bg-foreground text-background rounded-lg">
                      <CheckCircle2 className="w-6 h-6 mb-2" />
                      <p className="font-medium">High Contrast Mode Active</p>
                      <p className="text-sm mt-1">
                        Your system preference for high contrast is enabled.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted rounded-lg">
                      <Info className="w-6 h-6 mb-2 text-muted-foreground" />
                      <p className="font-medium">Standard Contrast</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable high contrast in your system settings to test this feature.
                      </p>
                    </div>
                  )}
                </BaseCard>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </ScreenContainer>

      <KeyboardShortcutsModal open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </>
  );
}
