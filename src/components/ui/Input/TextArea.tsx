import { forwardRef, TextareaHTMLAttributes, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface TextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  autoResize?: boolean;
  minRows?: number;
  maxRows?: number;
  className?: string;
}

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      error,
      helperText,
      maxLength,
      required = false,
      disabled = false,
      autoResize = true,
      minRows = 2,
      maxRows = 6,
      className,
      ...props
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    // Auto-resize functionality
    useEffect(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      
      // Reset height to calculate new height
      textarea.style.height = 'auto';
      
      // Calculate line height
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = lineHeight * minRows;
      const maxHeight = lineHeight * maxRows;
      
      // Set new height
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      
      textarea.style.height = `${newHeight}px`;
    }, [value, autoResize, minRows, maxRows]);

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            {label}
            {required && <span className="text-semantic-error ml-1">*</span>}
          </label>
        )}

        {/* Textarea */}
        <textarea
          ref={(node) => {
            textareaRef.current = node;
            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          rows={minRows}
          className={cn(
            'w-full px-4 py-3 text-md',
            'bg-white border rounded-xl',
            'transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-primary-forest focus:ring-offset-0',
            'placeholder:text-neutral-400',
            'disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed',
            'resize-none',
            error
              ? 'border-semantic-error focus:border-semantic-error focus:ring-semantic-error'
              : 'border-neutral-300 focus:border-primary-forest'
          )}
          {...props}
        />

        {/* Character Count and Helper Text */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1">
            {(error || helperText) && (
              <p
                className={cn(
                  'text-sm',
                  error ? 'text-semantic-error' : 'text-neutral-600'
                )}
              >
                {error || helperText}
              </p>
            )}
          </div>
          
          {maxLength && (
            <div
              className={cn(
                'text-xs ml-4',
                value.length > maxLength * 0.9 ? 'text-semantic-warning' : 'text-neutral-500'
              )}
            >
              {value.length}/{maxLength}
            </div>
          )}
        </div>
      </div>
    );
  }
);

TextArea.displayName = 'TextArea';
