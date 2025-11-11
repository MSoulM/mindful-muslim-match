import { useId, forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface AccessibleInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  hideLabel?: boolean;
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  ({ label, error, description, required, hideLabel, className, ...props }, ref) => {
    const inputId = useId();
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;
    
    return (
      <div className="w-full">
        <label 
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium mb-1 text-foreground',
            hideLabel && 'sr-only'
          )}
        >
          {label}
          {required && (
            <span aria-label="required" className="text-semantic-error ml-1">
              *
            </span>
          )}
        </label>
        
        {description && !error && (
          <p id={descriptionId} className="text-sm text-muted-foreground mb-2">
            {description}
          </p>
        )}
        
        <input
          ref={ref}
          id={inputId}
          aria-required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : description ? descriptionId : undefined
          }
          className={cn(
            'w-full px-4 py-2 border rounded-lg',
            'bg-background text-foreground',
            'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error && 'border-semantic-error',
            className
          )}
          {...props}
        />
        
        {error && (
          <p id={errorId} role="alert" className="text-semantic-error text-sm mt-1">
            {error}
          </p>
        )}
      </div>
    );
  }
);

AccessibleInput.displayName = 'AccessibleInput';
