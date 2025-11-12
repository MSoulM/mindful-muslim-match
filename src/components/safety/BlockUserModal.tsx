import { AlertTriangle } from 'lucide-react';
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
import { Button } from '@/components/ui/button';

interface BlockUserModalProps {
  isOpen: boolean;
  userName: string;
  userId: string;
  onBlock: () => void;
  onCancel: () => void;
  onReportInstead?: () => void;
  showReport?: boolean;
}

export const BlockUserModal = ({
  isOpen,
  userName,
  userId,
  onBlock,
  onCancel,
  onReportInstead,
  showReport = true
}: BlockUserModalProps) => {
  
  const handleBlock = () => {
    // Add to blocked users list
    const blocked = JSON.parse(localStorage.getItem('matchme_blocked_users') || '[]');
    if (!blocked.some((u: any) => u.userId === userId)) {
      blocked.push({
        userId,
        userName,
        blockedAt: new Date().toISOString()
      });
      localStorage.setItem('matchme_blocked_users', JSON.stringify(blocked));
    }
    onBlock();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <AlertDialogTitle className="text-center text-xl">
            Block {userName}?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            They won't be able to message you or see your profile.
            This action can be undone in settings.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {showReport && onReportInstead && (
          <div className="bg-accent p-4 rounded-lg">
            <p className="text-sm text-foreground mb-2">
              Consider reporting if this user violated our guidelines
            </p>
            <button
              onClick={onReportInstead}
              className="text-sm font-semibold text-primary hover:underline"
            >
              Report Instead
            </button>
          </div>
        )}

        <AlertDialogFooter className="gap-2 sm:gap-2">
          <AlertDialogCancel asChild>
            <Button variant="outline" className="flex-1" onClick={onCancel}>
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button 
              variant="destructive" 
              className="flex-1"
              onClick={handleBlock}
            >
              Block User
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};