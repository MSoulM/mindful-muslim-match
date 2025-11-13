import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

const colorVariants: Record<string, string> = {
  primary: 'text-primary',
  white: 'text-foreground',
  neutral: 'text-muted-foreground',
};

export const LoadingSpinner = ({ 
  size = 'md', 
  color = 'primary',
  className 
}: LoadingSpinnerProps) => {
  const dimension = sizeMap[size];

  return (
    <div className={cn('inline-flex items-center justify-center', className)} role="status" aria-label="Loading">
      <svg
        className={cn('animate-spin', colorVariants[color])}
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
};
