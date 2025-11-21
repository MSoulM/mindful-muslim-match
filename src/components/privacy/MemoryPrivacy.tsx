import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Lock,
  Unlock,
  Download,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Clock,
  CheckCircle,
  FileText,
  Eye,
} from 'lucide-react';
import { useMemoryPrivacy } from '@/hooks/useMemoryPrivacy';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface MemoryPrivacyProps {
  onNavigateToMemories?: () => void;
  onNavigateToConsent?: () => void;
}

export const MemoryPrivacy = ({
  onNavigateToMemories,
  onNavigateToConsent,
}: MemoryPrivacyProps) => {
  const {
    consent,
    consentHistory,
    encryptionStatus,
    isLoading,
    grantConsent,
    revokeConsent,
    requestDataExport,
    deleteAllMemories,
  } = useMemoryPrivacy();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showConsentHistory, setShowConsentHistory] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleToggleMemory = (checked: boolean) => {
    if (checked) {
      grantConsent();
      toast.success('Memory storage enabled', {
        description: 'MMAgent can now remember your conversations',
      });
    } else {
      revokeConsent();
      toast.info('Memory storage disabled', {
        description: 'No new memories will be created',
      });
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const exportRequest = await requestDataExport();
      
      toast.success('Export request submitted', {
        description: 'You will receive a download link shortly',
      });

      // Simulate download after processing
      setTimeout(() => {
        if (exportRequest.downloadUrl) {
          toast.success('Export ready!', {
            description: 'Your data is ready to download',
            action: {
              label: 'Download',
              onClick: () => {
                // Simulate download
                toast.info('Downloading memory data...');
              },
            },
          });
        }
      }, 2000);
    } catch (error) {
      toast.error('Export failed', {
        description: 'Please try again later',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAll = async () => {
    try {
      await deleteAllMemories();
      setShowDeleteDialog(false);
      toast.success('All memories deleted', {
        description: 'Your conversation history has been permanently removed',
      });
    } catch (error) {
      toast.error('Deletion failed', {
        description: 'Please try again later',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Master Toggle */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground mb-1">
              Memory Storage
            </h3>
            <p className="text-sm text-muted-foreground">
              Allow MMAgent to remember our conversations
            </p>
          </div>
          <Switch
            checked={consent.granted}
            onCheckedChange={handleToggleMemory}
          />
        </div>

        {consent.granted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200"
          >
            <div className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-emerald-700 leading-relaxed">
                  All memories are encrypted using {encryptionStatus.algorithm} and stored securely.
                  Your data is never shared with third parties.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!consent.granted && consent.revokedAt && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200"
          >
            <div className="flex items-start gap-2">
              <Unlock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700">
                Memory storage is currently disabled. Enable it to get personalized guidance.
              </p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Encryption Status */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground">
              Security & Encryption
            </h3>
            <p className="text-xs text-muted-foreground">
              Your data protection details
            </p>
          </div>
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 border-emerald-200">
            Active
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Encryption</span>
            <span className="font-medium text-foreground">{encryptionStatus.algorithm}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-border">
            <span className="text-muted-foreground">Key Version</span>
            <span className="font-medium text-foreground">{encryptionStatus.keyVersion}</span>
          </div>
          {encryptionStatus.lastRotated && (
            <div className="flex items-center justify-between py-2 border-t border-border">
              <span className="text-muted-foreground">Last Rotated</span>
              <span className="font-medium text-foreground">
                {formatDistanceToNow(encryptionStatus.lastRotated, { addSuffix: true })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-semibold text-foreground mb-3">
          Your Data
        </h3>

        <div className="space-y-2">
          <button
            onClick={onNavigateToMemories}
            className={cn(
              'w-full py-2.5 px-3 text-left flex items-center justify-between',
              'rounded-lg transition-colors',
              'hover:bg-muted'
            )}
          >
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                View stored memories
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={handleExportData}
            disabled={isExporting}
            className={cn(
              'w-full py-2.5 px-3 text-left flex items-center justify-between',
              'rounded-lg transition-colors',
              'hover:bg-muted',
              isExporting && 'opacity-50 cursor-not-allowed'
            )}
          >
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                {isExporting ? 'Exporting...' : 'Export memories (JSON)'}
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={onNavigateToMemories}
            className={cn(
              'w-full py-2.5 px-3 text-left flex items-center justify-between',
              'rounded-lg transition-colors',
              'hover:bg-muted'
            )}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Delete specific memories
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </button>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className={cn(
              'w-full py-2.5 px-3 text-left flex items-center justify-between',
              'rounded-lg transition-colors',
              'hover:bg-red-50 text-red-600'
            )}
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Delete all memories
              </span>
            </div>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Consent History */}
      <div className="bg-card rounded-xl border border-border p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-foreground">
            Consent History
          </h3>
          <button
            onClick={() => setShowConsentHistory(!showConsentHistory)}
            className="text-xs text-primary hover:underline"
          >
            {showConsentHistory ? 'Hide' : 'View full log'}
          </button>
        </div>

        {consent.grantedAt && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <p>
              Memory storage enabled{' '}
              {formatDistanceToNow(consent.grantedAt, { addSuffix: true })}
            </p>
          </div>
        )}

        {showConsentHistory && consentHistory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-3 space-y-2 pt-3 border-t border-border"
          >
            {consentHistory.slice(0, 5).map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-2 p-2 bg-muted rounded-lg"
              >
                <div className="p-1 bg-background rounded">
                  {entry.action === 'granted' && <CheckCircle className="w-3 h-3 text-green-600" />}
                  {entry.action === 'revoked' && <Unlock className="w-3 h-3 text-amber-600" />}
                  {entry.action === 'modified' && <FileText className="w-3 h-3 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-foreground capitalize">
                    {entry.action}
                  </p>
                  {entry.details && (
                    <p className="text-[10px] text-muted-foreground">
                      {entry.details}
                    </p>
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formatDistanceToNow(entry.timestamp, { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>

      {/* GDPR Notice */}
      <div className="bg-muted rounded-lg p-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Your Rights:</strong> Under GDPR, you have the right to
          access, rectify, erase, restrict processing, object to processing, and data portability.
          You can exercise these rights at any time using the controls above.
        </p>
      </div>

      {/* Delete All Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Delete All Memories?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will permanently delete all stored conversation memories. This action cannot be undone.
              </p>
              <p className="font-medium text-foreground">
                Your MMAgent will lose all context and personalization.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAll}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All Memories
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
