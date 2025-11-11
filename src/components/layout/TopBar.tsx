import { motion } from 'framer-motion';
import { ChevronLeft, Bell } from 'lucide-react';
import { MSMLogo } from '@/components/brand/MSMLogo';
import { cn } from '@/lib/utils';

interface TopBarProps {
  variant?: 'logo' | 'back';
  title?: string;
  onBackClick?: () => void;
  notificationCount?: number;
  userInitials?: string;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
  loading?: boolean;
}

export const TopBar = ({
  variant = 'logo',
  title,
  onBackClick,
  notificationCount = 0,
  userInitials,
  onNotificationClick,
  onProfileClick,
  loading = false,
}: TopBarProps) => {
  // Loading skeleton state
  if (loading) {
    return (
      <div 
        className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100 shadow-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="h-14 px-4 sm:px-5 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-neutral-200 rounded-lg" />
            <div className="w-20 h-5 bg-neutral-200 rounded" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-neutral-200 rounded-full" />
            <div className="w-8 h-8 bg-neutral-200 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-neutral-100 shadow-sm"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="h-14 px-4 sm:px-5 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center min-w-0 flex-1">
          {variant === 'logo' ? (
            <MSMLogo variant="compact" onClick={() => window.location.href = '/'} />
          ) : (
            <motion.button
              onClick={onBackClick}
              className="flex items-center gap-2 min-h-[44px] -ml-2 px-2 touch-feedback"
              whileTap={{ scale: 0.97 }}
              aria-label="Go back"
            >
              <ChevronLeft className="w-6 h-6 text-neutral-700 flex-shrink-0" />
              <span className="text-base font-semibold text-neutral-900 truncate max-w-[200px]">
                {title || 'Back'}
              </span>
            </motion.button>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3 ml-4">
          {/* Notification Bell */}
          {onNotificationClick && (
            <motion.button
              onClick={onNotificationClick}
              className="relative min-w-[44px] min-h-[44px] flex items-center justify-center touch-feedback rounded-full"
              whileTap={{ scale: 0.9 }}
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount})` : ''}`}
            >
              <Bell className="w-5 h-5 text-neutral-700" />
              
              {/* Badge */}
              {notificationCount > 0 && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                  className="absolute top-2 right-2 w-[18px] h-[18px] rounded-full bg-semantic-error flex items-center justify-center"
                >
                  <span className="text-[10px] font-bold text-white leading-none">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                </motion.div>
              )}
            </motion.button>
          )}

          {/* Profile Avatar */}
          {userInitials && onProfileClick && (
            <motion.button
              onClick={onProfileClick}
              className="p-[5px] touch-feedback"
              whileTap={{ scale: 0.95 }}
              aria-label="Profile"
            >
              <div className="w-[34px] h-[34px] rounded-full bg-gradient-to-br from-primary-forest to-primary-gold flex items-center justify-center border-2 border-white shadow-lg">
                <span className="text-sm font-bold text-white leading-none">
                  {userInitials}
                </span>
              </div>
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
