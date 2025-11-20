import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Calendar, Users, Zap, Bell, Crown, CheckCircle2, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface BatchSchedule {
  scheduledDate: string;
  scheduledTime: string;
  expectedCompletion: string;
  queuePosition?: number;
  totalInQueue: number;
  estimatedProcessingMinutes: number;
}

interface BatchProcessingNotificationProps {
  schedule: BatchSchedule;
  variant?: 'full' | 'compact' | 'toast';
  showEducation?: boolean;
  allowPriorityRequest?: boolean;
  onPriorityRequest?: () => void;
  onEnableNotifications?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const BatchProcessingNotification = ({
  schedule,
  variant = 'full',
  showEducation = true,
  allowPriorityRequest = false,
  onPriorityRequest,
  onEnableNotifications,
  onDismiss,
  className
}: BatchProcessingNotificationProps) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    // Check if notifications are enabled
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  const handleEnableNotifications = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          if (onEnableNotifications) onEnableNotifications();
          toast({
            title: "Notifications Enabled",
            description: "We'll notify you when your insights are ready",
          });
        }
      });
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  if (isDismissed) return null;

  // Compact variant for inline use
  if (variant === 'compact') {
    return (
      <CompactBatchStatus schedule={schedule} />
    );
  }

  // Toast variant for quick notifications
  if (variant === 'toast') {
    return (
      <ToastBatchNotification schedule={schedule} onDismiss={handleDismiss} />
    );
  }

  // Full variant with all details
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl shadow-lg overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white relative">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Content Queued for Analysis</h3>
            <p className="text-sm text-blue-100">
              Your submission is in the processing pipeline
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Batch Schedule Info */}
        <div className="bg-white rounded-xl p-4 border-2 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Processing scheduled for:
                </p>
                <p className="text-lg font-bold text-blue-600">
                  {schedule.scheduledDate} at {schedule.scheduledTime}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground mb-1">
                  Expected insights available:
                </p>
                <p className="text-base font-semibold text-purple-600">
                  {schedule.expectedCompletion}
                </p>
              </div>
            </div>

            {schedule.queuePosition && (
              <div className="flex items-start gap-3 pt-3 border-t border-border">
                <Users className="w-5 h-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-foreground mb-2">
                    Queue Status:
                  </p>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      Position #{schedule.queuePosition}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      of {schedule.totalInQueue} total
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-3 border-t border-border">
              <Zap className="w-4 h-4 text-yellow-600" />
              <span className="text-sm text-muted-foreground">
                Estimated processing: ~{schedule.estimatedProcessingMinutes} minutes
              </span>
            </div>
          </div>
        </div>

        {/* Priority Option */}
        {allowPriorityRequest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Crown className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Need Results Faster?
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Premium members can request priority processing for immediate analysis
                </p>
                <Button
                  onClick={onPriorityRequest}
                  size="sm"
                  className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  Request Priority Processing
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Notification Settings */}
        {!notificationsEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-2 border-green-300 rounded-xl p-4"
          >
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-bold text-foreground mb-1">
                  Get Notified When Ready
                </h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Enable notifications to receive an alert when your insights are available
                </p>
                <Button
                  onClick={handleEnableNotifications}
                  size="sm"
                  variant="outline"
                  className="border-green-300 text-green-700 hover:bg-green-50"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Educational Messaging */}
        {showEducation && (
          <EducationalMessage />
        )}
      </div>
    </motion.div>
  );
};

// ==================== COMPACT STATUS ====================

interface CompactBatchStatusProps {
  schedule: BatchSchedule;
  className?: string;
}

const CompactBatchStatus = ({ schedule, className }: CompactBatchStatusProps) => {
  const daysUntil = calculateDaysUntil(schedule.scheduledDate);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-3",
        className
      )}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <Clock className="w-4 h-4 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">
            Processing in {daysUntil} days
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {schedule.scheduledDate} • {schedule.totalInQueue} in queue
          </p>
        </div>
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          Queued
        </Badge>
      </div>
    </motion.div>
  );
};

// ==================== TOAST NOTIFICATION ====================

interface ToastBatchNotificationProps {
  schedule: BatchSchedule;
  onDismiss: () => void;
}

const ToastBatchNotification = ({ schedule, onDismiss }: ToastBatchNotificationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white border-2 border-blue-300 rounded-xl p-4 shadow-xl max-w-md"
    >
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-bold text-foreground mb-1">
            Content Queued Successfully
          </h4>
          <p className="text-sm text-muted-foreground mb-2">
            Processing scheduled for {schedule.scheduledDate}
          </p>
          <p className="text-xs text-muted-foreground">
            We'll notify you when insights are ready
          </p>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-muted rounded transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

// ==================== EDUCATIONAL MESSAGE ====================

const EducationalMessage = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-300 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h4 className="text-sm font-bold text-foreground mb-2">
            Why Batch Processing?
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            We batch process content weekly to ensure highest quality insights
            while keeping costs sustainable. This allows us to offer premium
            matching at affordable prices.
          </p>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="mt-3 pt-3 border-t border-gray-300 space-y-2"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Better Quality:</span> Batch
                    processing allows deeper AI analysis
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Cost Efficient:</span> Group
                    processing reduces per-user costs by 75%
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Sustainable Pricing:</span> Keeps
                    our service affordable for everyone
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-blue-600 hover:underline mt-2 font-medium"
          >
            {isExpanded ? 'Show less' : 'Learn more'}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ==================== HELPER FUNCTIONS ====================

const calculateDaysUntil = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const today = new Date();
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// ==================== BATCH STATUS BADGE ====================

interface BatchStatusBadgeProps {
  status: 'queued' | 'processing' | 'completed' | 'failed';
  className?: string;
}

export const BatchStatusBadge = ({ status, className }: BatchStatusBadgeProps) => {
  const config = {
    queued: {
      label: 'Queued',
      className: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: Clock
    },
    processing: {
      label: 'Processing',
      className: 'bg-purple-100 text-purple-700 border-purple-300',
      icon: Zap
    },
    completed: {
      label: 'Completed',
      className: 'bg-green-100 text-green-700 border-green-300',
      icon: CheckCircle2
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-100 text-red-700 border-red-300',
      icon: X
    }
  };

  const { label, className: statusClass, icon: Icon } = config[status];

  return (
    <Badge
      variant="outline"
      className={cn('border-2 font-semibold', statusClass, className)}
    >
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
};
