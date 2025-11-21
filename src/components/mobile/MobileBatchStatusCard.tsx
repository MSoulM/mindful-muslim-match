import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Upload, 
  Share2, 
  Settings, 
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useOfflineInsights } from '@/hooks/useOfflineInsights';
import { useProgressiveUpload } from '@/hooks/useProgressiveUpload';
import { useLowBandwidthMode } from '@/hooks/useLowBandwidthMode';
import { whatsappIntegration } from '@/utils/whatsappIntegration';
import { notifySuccess, notifyError } from '@/utils/notifications';
import { cn } from '@/lib/utils';

interface MobileBatchStatusCardProps {
  batchInfo?: {
    insights: number;
    processingDate: string;
    queuePosition?: number;
  };
}

export const MobileBatchStatusCard = ({ batchInfo }: MobileBatchStatusCardProps) => {
  const [whatsappEnabled, setWhatsappEnabled] = useState(
    whatsappIntegration.areWhatsAppNotificationsEnabled()
  );

  const { isRegistered, registerForPushNotifications } = usePushNotifications();
  const { isOffline, pendingApprovals, syncWhenOnline } = useOfflineInsights();
  const { uploads } = useProgressiveUpload();
  const {
    isLowBandwidth,
    dataSaverEnabled,
    enableDataSaver,
    disableDataSaver,
    connectionQuality
  } = useLowBandwidthMode();

  const handleEnablePushNotifications = async () => {
    try {
      await registerForPushNotifications();
      notifySuccess('Push notifications enabled!');
    } catch (error) {
      notifyError('Failed to enable notifications');
    }
  };

  const handleToggleWhatsApp = () => {
    const newState = !whatsappEnabled;
    setWhatsappEnabled(newState);
    whatsappIntegration.setWhatsAppNotifications(newState);
    
    if (newState) {
      notifySuccess('WhatsApp updates enabled');
    } else {
      notifySuccess('WhatsApp updates disabled');
    }
  };

  const handleShareViaWhatsApp = async () => {
    try {
      await whatsappIntegration.sendBatchStatusUpdate({
        type: 'queued',
        insightCount: batchInfo?.insights,
        position: batchInfo?.queuePosition,
        estimatedTime: batchInfo?.processingDate
      });
      notifySuccess('Shared via WhatsApp');
    } catch (error) {
      notifyError('Failed to share');
    }
  };

  const activeUploads = uploads.filter(u => 
    u.status === 'uploading' || u.status === 'pending'
  );

  return (
    <Card className="p-4 space-y-4 bg-background border-border">
      {/* Network Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-5 h-5 text-destructive" />
          ) : (
            <Wifi className="w-5 h-5 text-primary" />
          )}
          <div>
            <p className="text-sm font-medium text-foreground">
              {isOffline ? 'Offline Mode' : 'Connected'}
            </p>
            {connectionQuality && (
              <p className="text-xs text-muted-foreground">
                {connectionQuality.type.toUpperCase()} • {connectionQuality.effectiveType.toUpperCase()}
              </p>
            )}
          </div>
        </div>
        
        {isLowBandwidth && (
          <Badge variant="outline" className="text-warning">
            Low Bandwidth
          </Badge>
        )}
      </div>

      {/* Pending Sync Indicator */}
      {pendingApprovals > 0 && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="text-sm text-foreground">
              {pendingApprovals} approvals pending sync
            </span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={syncWhenOnline}
            disabled={isOffline}
          >
            Sync Now
          </Button>
        </div>
      )}

      {/* Active Uploads */}
      {activeUploads.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Active Uploads</p>
          {activeUploads.map((upload) => (
            <div key={upload.fileName} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate max-w-[200px]">
                  {upload.fileName}
                </span>
                <span className="text-foreground">{upload.progress}%</span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mobile Features */}
      <div className="grid grid-cols-2 gap-2">
        {/* Push Notifications */}
        <Button
          variant={isRegistered ? "secondary" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={handleEnablePushNotifications}
          disabled={isRegistered}
        >
          {isRegistered ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Push Enabled
            </>
          ) : (
            <>
              <Settings className="w-4 h-4 mr-2" />
              Enable Push
            </>
          )}
        </Button>

        {/* WhatsApp Updates */}
        <Button
          variant={whatsappEnabled ? "secondary" : "outline"}
          size="sm"
          className="w-full justify-start"
          onClick={handleToggleWhatsApp}
        >
          <Share2 className="w-4 h-4 mr-2" />
          WhatsApp {whatsappEnabled ? 'On' : 'Off'}
        </Button>

        {/* Data Saver */}
        <Button
          variant={dataSaverEnabled ? "secondary" : "outline"}
          size="sm"
          className="w-full justify-start col-span-2"
          onClick={dataSaverEnabled ? disableDataSaver : enableDataSaver}
        >
          <Settings className="w-4 h-4 mr-2" />
          Data Saver {dataSaverEnabled ? 'Enabled' : 'Disabled'}
        </Button>
      </div>

      {/* Share Status via WhatsApp */}
      {batchInfo && (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleShareViaWhatsApp}
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share Status via WhatsApp
        </Button>
      )}

      {/* Data Saver Info */}
      {dataSaverEnabled && (
        <div className="text-xs text-muted-foreground p-2 rounded bg-muted">
          💡 Data saver active: Images load at low quality, videos disabled
        </div>
      )}
    </Card>
  );
};
