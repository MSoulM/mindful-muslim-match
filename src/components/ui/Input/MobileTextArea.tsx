import { forwardRef, TextareaHTMLAttributes, useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTextAreaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
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
  showClearButton?: boolean;
  showSuccessIndicator?: boolean;
  isValid?: boolean;
  floatingLabel?: boolean;
  onValidate?: (value: string) => string | undefined;
  validateOnBlur?: boolean;
}

export const MobileTextArea = forwardRef<HTMLTextAreaElement, MobileTextAreaProps>(
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
      minRows = 3,
      maxRows = 8,
      className,
      showClearButton = true,
      showSuccessIndicator = false,
      isValid,
      floatingLabel = false,
      onValidate,
      validateOnBlur = true,
      autoFocus,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>(error);
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(() => {
      setInternalError(error);
    }, [error]);

    // Auto-focus on mount if specified
    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        textareaRef.current.focus();
      }
    }, [autoFocus]);

    // Auto-resize functionality
    useEffect(() => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      
      // Reset height to calculate new height
      textarea.style.height = 'auto';
      
      // Calculate line height
      const computedStyle = getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight);
      const paddingTop = parseInt(computedStyle.paddingTop);
      const paddingBottom = parseInt(computedStyle.paddingBottom);
      
      const minHeight = (lineHeight * minRows) + paddingTop + paddingBottom;
      const maxHeight = (lineHeight * maxRows) + paddingTop + paddingBottom;
      
      // Set new height
      const scrollHeight = textarea.scrollHeight;
      const newHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight));
      
      textarea.style.height = `${newHeight}px`;
    }, [value, autoResize, minRows, maxRows]);

    const hasValue = value.length > 0;
    const showLabel = floatingLabel ? (isFocused || hasValue) : true;

    const handleBlur = () => {
      setIsFocused(false);
      if (validateOnBlur && onValidate && hasValue) {
        const validationError = onValidate(value);
        setInternalError(validationError);
      }
    };

    const handleClear = () => {
      onChange('');
      setInternalError(undefined);
      textareaRef.current?.focus();
    };

    const showSuccess = showSuccessIndicator && hasValue && !internalError && (isValid !== undefined ? isValid : true);

    return (
      <div className={cn('w-full', className)}>
        {/* Label */}
        {!floatingLabel && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Textarea Container */}
        <div className="relative">
          {/* Floating Label */}
          {floatingLabel && (
            <label
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none z-10',
                'text-muted-foreground',
                showLabel
                  ? 'top-2 text-xs'
                  : 'top-4 text-base',
                isFocused && 'text-primary'
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}

          {/* Textarea - 16px font size minimum to prevent iOS zoom */}
          <textarea
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              textareaRef.current = node;
            }}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (internalError) setInternalError(undefined);
            }}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={disabled}
            rows={minRows}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            className={cn(
              'w-full px-4 text-base', // 16px minimum font size
              'bg-background border rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
              'placeholder:text-muted-foreground',
              'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
              'resize-none',
              floatingLabel ? (hasValue || isFocused ? 'pt-7 pb-3' : 'py-4') : 'py-3',
              (showClearButton || showSuccess) && 'pr-12',
              internalError
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : isFocused
                ? 'border-primary'
                : 'border-input'
            )}
            {...props}
          />

          {/* Right Side Actions */}
          {(showClearButton || showSuccess) && (
            <div className="absolute right-4 top-4 flex items-center gap-2">
              {/* Success Indicator */}
              {showSuccess && (
                <Check className="w-5 h-5 text-green-500" />
              )}

              {/* Clear Button */}
              {showClearButton && hasValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label="Clear textarea"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Helper Text, Error, or Character Count */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex-1">
            {(internalError || helperText) && (
              <p
                className={cn(
                  'text-sm',
                  internalError ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {internalError || helperText}
              </p>
            )}
          </div>

          {maxLength && (
            <div
              className={cn(
                'text-xs ml-4',
                value.length > maxLength * 0.9 ? 'text-amber-500' : 'text-muted-foreground'
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

MobileTextArea.displayName = 'MobileTextArea';
