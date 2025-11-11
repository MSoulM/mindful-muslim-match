import { cn } from '@/lib/utils';

interface SkeletonBaseProps {
  className?: string;
}

export const SkeletonBase = ({ className }: SkeletonBaseProps) => {
  return (
    <div
      className={cn(
        'animate-pulse',
        'bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100',
        'bg-[length:1000px_100%]',
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
};
