import { formatRelativeTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface RelativeTimeProps {
  date: Date;
  className?: string;
}

export const RelativeTime = ({ date, className }: RelativeTimeProps) => {
  return (
    <time 
      dateTime={date.toISOString()}
      className={cn('text-sm font-medium text-foreground', className)}
    >
      {formatRelativeTime(date)}
    </time>
  );
};
