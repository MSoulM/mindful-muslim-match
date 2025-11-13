/**
 * UserManagementRow Component
 * Compact user row for admin lists
 */

import { User, Shield, AlertTriangle, Ban, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export type UserStatus = 'active' | 'suspended' | 'banned' | 'deleted';
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

interface UserManagementRowProps {
  user: {
    id: string;
    name: string;
    email: string;
    photo?: string;
    accountStatus: UserStatus;
    verificationStatus: VerificationStatus;
    dnaScore?: number;
    reportsCount?: number;
    lastActive: string;
  };
  onViewDetails?: () => void;
  onQuickAction?: (action: 'verify' | 'suspend' | 'ban') => void;
  showActions?: boolean;
  compact?: boolean;
  className?: string;
}

export const UserManagementRow = ({
  user,
  onViewDetails,
  onQuickAction,
  showActions = true,
  compact = false,
  className,
}: UserManagementRowProps) => {
  const getStatusBadge = () => {
    const variants: Record<UserStatus, { color: string; icon: any }> = {
      active: { color: 'bg-green-100 text-green-800', icon: Check },
      suspended: { color: 'bg-orange-100 text-orange-800', icon: AlertTriangle },
      banned: { color: 'bg-red-100 text-red-800', icon: Ban },
      deleted: { color: 'bg-gray-100 text-gray-800', icon: User },
    };

    const config = variants[user.accountStatus];
    const Icon = config.icon;

    return (
      <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', config.color)}>
        <Icon className="h-3 w-3" />
        {user.accountStatus}
      </span>
    );
  };

  const getVerificationIcon = () => {
    if (user.verificationStatus === 'verified') {
      return <Shield className="h-4 w-4 text-blue-600" />;
    }
    if (user.verificationStatus === 'pending') {
      return <Shield className="h-4 w-4 text-orange-600" />;
    }
    return null;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors',
        onViewDetails && 'cursor-pointer',
        className
      )}
      onClick={onViewDetails}
    >
      {/* Avatar */}
      <Avatar className={compact ? 'h-8 w-8' : 'h-10 w-10'}>
        <AvatarImage src={user.photo} />
        <AvatarFallback>
          <User className="h-5 w-5" />
        </AvatarFallback>
      </Avatar>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className={cn('font-semibold truncate', compact ? 'text-sm' : 'text-base')}>
            {user.name}
          </p>
          {getVerificationIcon()}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-muted-foreground truncate', compact ? 'text-xs' : 'text-sm')}>
            {user.email}
          </p>
          {user.dnaScore !== undefined && (
            <Badge variant="secondary" className="text-xs">
              DNA {user.dnaScore}%
            </Badge>
          )}
          {user.reportsCount !== undefined && user.reportsCount > 0 && (
            <Badge variant="destructive" className="text-xs">
              {user.reportsCount} reports
            </Badge>
          )}
        </div>
        {!compact && (
          <p className="text-xs text-muted-foreground mt-1">
            Last active: {new Date(user.lastActive).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {getStatusBadge()}
      </div>

      {/* Quick Actions */}
      {showActions && onQuickAction && (
        <div className="flex gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          {user.verificationStatus !== 'verified' && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onQuickAction('verify')}
              title="Verify user"
            >
              <Shield className="h-4 w-4" />
            </Button>
          )}
          {user.accountStatus === 'active' && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onQuickAction('suspend')}
                title="Suspend user"
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                onClick={() => onQuickAction('ban')}
                title="Ban user"
              >
                <Ban className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
