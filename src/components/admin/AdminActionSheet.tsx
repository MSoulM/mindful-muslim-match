/**
 * AdminActionSheet Component
 * Bottom sheet for admin actions with confirmation
 */

import { useState } from 'react';
import {
  Shield,
  Ban,
  AlertTriangle,
  Mail,
  Trash2,
  FileText,
  CheckCircle,
} from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export type AdminActionType = 'verify' | 'suspend' | 'ban' | 'warning' | 'delete_content' | 'note';

interface AdminAction {
  type: AdminActionType;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  variant: 'default' | 'warning' | 'destructive';
  requiresReason: boolean;
}

interface AdminActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: {
    name: string;
    email: string;
  };
  onAction: (action: AdminActionType, reason: string) => Promise<void>;
}

const actions: AdminAction[] = [
  {
    type: 'verify',
    label: 'Verify User',
    description: 'Mark user as verified',
    icon: Shield,
    variant: 'default',
    requiresReason: false,
  },
  {
    type: 'warning',
    label: 'Send Warning',
    description: 'Send official warning to user',
    icon: Mail,
    variant: 'warning',
    requiresReason: true,
  },
  {
    type: 'suspend',
    label: 'Suspend Account',
    description: 'Temporarily suspend user access',
    icon: AlertTriangle,
    variant: 'warning',
    requiresReason: true,
  },
  {
    type: 'ban',
    label: 'Ban User',
    description: 'Permanently ban user from platform',
    icon: Ban,
    variant: 'destructive',
    requiresReason: true,
  },
  {
    type: 'delete_content',
    label: 'Delete Content',
    description: 'Remove specific content',
    icon: Trash2,
    variant: 'destructive',
    requiresReason: true,
  },
  {
    type: 'note',
    label: 'Add Admin Note',
    description: 'Add internal note (not visible to user)',
    icon: FileText,
    variant: 'default',
    requiresReason: true,
  },
];

export const AdminActionSheet = ({
  open,
  onOpenChange,
  targetUser,
  onAction,
}: AdminActionSheetProps) => {
  const [selectedAction, setSelectedAction] = useState<AdminActionType | null>(null);
  const [reason, setReason] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const handleExecute = async () => {
    if (!selectedAction) return;

    const action = actions.find((a) => a.type === selectedAction);
    if (action?.requiresReason && !reason.trim()) {
      return;
    }

    try {
      setIsExecuting(true);
      await onAction(selectedAction, reason);
      onOpenChange(false);
      setSelectedAction(null);
      setReason('');
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCancel = () => {
    setSelectedAction(null);
    setReason('');
  };

  const currentAction = selectedAction ? actions.find((a) => a.type === selectedAction) : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto rounded-t-2xl">
        <SheetHeader>
          <SheetTitle>Admin Actions</SheetTitle>
          <SheetDescription>
            Actions for {targetUser.name} ({targetUser.email})
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {!selectedAction ? (
            /* Action Selection */
            <div className="grid grid-cols-1 gap-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.type}
                    onClick={() => setSelectedAction(action.type)}
                    className="flex items-center gap-3 p-4 rounded-lg border hover:bg-muted transition-colors text-left"
                  >
                    <div
                      className={`p-2 rounded-lg ${
                        action.variant === 'destructive'
                          ? 'bg-red-50 text-red-600'
                          : action.variant === 'warning'
                          ? 'bg-orange-50 text-orange-600'
                          : 'bg-blue-50 text-blue-600'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{action.label}</p>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    {action.requiresReason && (
                      <Badge variant="outline" className="text-xs">
                        Requires reason
                      </Badge>
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            /* Action Confirmation */
            <div className="space-y-4">
              {currentAction && (
                <>
                  <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                    {(() => {
                      const Icon = currentAction.icon;
                      return <Icon className="h-5 w-5" />;
                    })()}
                    <div>
                      <p className="font-semibold">{currentAction.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {currentAction.description}
                      </p>
                    </div>
                  </div>

                  {currentAction.requiresReason && (
                    <div className="space-y-2">
                      <Label htmlFor="reason">
                        Reason <span className="text-red-600">*</span>
                      </Label>
                      <Textarea
                        id="reason"
                        placeholder="Provide a detailed reason for this action..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={4}
                      />
                      <p className="text-xs text-muted-foreground">
                        This will be logged in the admin audit trail
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant={currentAction.variant === 'destructive' ? 'destructive' : 'default'}
                      className="flex-1"
                      onClick={handleExecute}
                      disabled={isExecuting || (currentAction.requiresReason && !reason.trim())}
                    >
                      {isExecuting ? (
                        'Executing...'
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm {currentAction.label}
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={isExecuting}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
