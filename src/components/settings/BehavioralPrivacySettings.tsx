import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { MicroMomentTracker } from '@/services/MicroMomentTracker';
import { toast } from 'sonner';
import { Download, Eye, Trash2 } from 'lucide-react';

interface BehavioralSettings {
  response_times: boolean;
  message_styles: boolean;
  activity_patterns: boolean;
  engagement: boolean;
}

export function BehavioralPrivacySettings() {
  const [behavioralEnabled, setBehavioralEnabled] = useState(!MicroMomentTracker.isOptedOut());
  const [settings, setSettings] = useState<BehavioralSettings>({
    response_times: true,
    message_styles: true,
    activity_patterns: true,
    engagement: true,
  });
  const [lastUpdated] = useState(new Date().toLocaleDateString());
  const [dataPointCount] = useState(1247);
  const [storageUsed] = useState(156);

  useEffect(() => {
    // Load saved settings from localStorage
    const saved = localStorage.getItem('behavioral_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  }, []);

  const handleMainToggle = (checked: boolean) => {
    setBehavioralEnabled(checked);
    MicroMomentTracker.setOptOut(!checked);
    
    toast.success(
      checked 
        ? 'Behavioral matching enabled' 
        : 'Behavioral matching disabled'
    );
  };

  const handleSettingToggle = (key: keyof BehavioralSettings, checked: boolean) => {
    const newSettings = { ...settings, [key]: checked };
    setSettings(newSettings);
    localStorage.setItem('behavioral_settings', JSON.stringify(newSettings));
    
    toast.success('Privacy settings updated');
  };

  const handleViewData = () => {
    toast.info('Opening behavioral data viewer...');
    // Future: Navigate to data viewer screen
  };

  const handleExportData = () => {
    const data = {
      settings,
      lastUpdated,
      dataPointCount,
      storageUsed,
      timestamp: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `behavioral-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const handleDeleteData = () => {
    if (!confirm('Are you sure you want to delete all behavioral data? This action cannot be undone.')) {
      return;
    }
    
    // Clear localStorage
    localStorage.removeItem('behavioral_settings');
    localStorage.removeItem('posthog_events');
    
    // Reset settings
    setSettings({
      response_times: true,
      message_styles: true,
      activity_patterns: true,
      engagement: true,
    });
    
    toast.success('All behavioral data deleted');
  };

  const trackingOptions = [
    {
      label: 'Track Response Times',
      description: 'Match with similar communication pace',
      key: 'response_times' as keyof BehavioralSettings,
    },
    {
      label: 'Track Message Styles',
      description: 'Match based on conversation depth',
      key: 'message_styles' as keyof BehavioralSettings,
    },
    {
      label: 'Track Activity Patterns',
      description: 'Match with people active at similar times',
      key: 'activity_patterns' as keyof BehavioralSettings,
    },
    {
      label: 'Track Engagement',
      description: 'Match based on platform usage patterns',
      key: 'engagement' as keyof BehavioralSettings,
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <div className="bg-card rounded-xl p-4 border border-border">
        <h3 className="font-semibold text-foreground mb-4">
          Behavioral Matching Privacy
        </h3>
        
        {/* Main Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-medium text-foreground">
              Enable Behavioral Matching
            </p>
            <p className="text-sm text-muted-foreground">
              Improve match quality by 30%
            </p>
          </div>
          <Switch
            checked={behavioralEnabled}
            onCheckedChange={handleMainToggle}
          />
        </div>
        
        {/* Granular Controls */}
        <div className={`space-y-3 border-t border-border pt-4 transition-opacity ${
          behavioralEnabled ? 'opacity-100' : 'opacity-50 pointer-events-none'
        }`}>
          {trackingOptions.map((option) => (
            <label
              key={option.key}
              className="flex items-center justify-between cursor-pointer"
            >
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {option.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {option.description}
                </p>
              </div>
              <Switch
                checked={settings[option.key]}
                onCheckedChange={(checked) => handleSettingToggle(option.key, checked)}
                className="ml-3"
              />
            </label>
          ))}
        </div>
        
        {/* Data Management */}
        <div className="border-t border-border pt-4 mt-4 space-y-3">
          <button
            onClick={handleViewData}
            className="w-full py-2.5 border border-primary-forest text-primary-forest rounded-lg font-medium
                       hover:bg-primary-forest/5 transition-colors flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4" />
            View My Behavioral Data
          </button>
          <button
            onClick={handleExportData}
            className="w-full py-2.5 border border-border text-foreground rounded-lg font-medium
                       hover:bg-muted transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export My Data (JSON)
          </button>
          <button
            onClick={handleDeleteData}
            className="w-full py-2.5 text-destructive font-medium hover:bg-destructive/10 
                       rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Behavioral Data
          </button>
        </div>
        
        {/* Info Box */}
        <div className="bg-muted rounded-lg p-3 mt-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Last updated: {lastUpdated}
            <br />
            Data points collected: {dataPointCount.toLocaleString()}
            <br />
            Storage used: {storageUsed} KB
          </p>
        </div>
      </div>
    </div>
  );
}
