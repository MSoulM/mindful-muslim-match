import { AlertCircle } from 'lucide-react';
import { Button } from '../Button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
  className?: string;
}

export const ErrorState = ({
  title = 'Something went wrong',
  description = 'We encountered an error. Please try again.',
  onRetry,
  fullScreen = false,
  className
}: ErrorStateProps) => {
  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'py-12';

  return (
    <div className={cn(containerClass, 'px-8', className)}>
      <div className="text-center max-w-sm mx-auto">
        {/* Error Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        
        {/* Title */}
        <h3 className="text-lg font-bold text-foreground mb-2">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {description}
        </p>
        
        {/* Retry Button */}
        {onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            className="min-w-[120px]"
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
