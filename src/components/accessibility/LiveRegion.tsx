import { cn } from '@/lib/utils';

interface LiveRegionProps {
  message: string;
  role?: 'status' | 'alert';
  'aria-live'?: 'polite' | 'assertive';
  'aria-atomic'?: boolean;
  className?: string;
}

/**
 * Live region for screen reader announcements
 * Announces dynamic content changes to screen reader users
 */
export function LiveRegion({
  message,
  role = 'status',
  'aria-live': ariaLive = 'polite',
  'aria-atomic': ariaAtomic = true,
  className,
}: LiveRegionProps) {
  if (!message) return null;

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic={ariaAtomic}
      className={cn('sr-only', className)}
    >
      {message}
    </div>
  );
}
