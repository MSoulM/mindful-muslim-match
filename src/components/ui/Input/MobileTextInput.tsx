import { useState, forwardRef, InputHTMLAttributes, useEffect, useRef } from 'react';
import { Eye, EyeOff, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileTextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'tel' | 'number' | 'url' | 'password';
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  maxLength?: number;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  showSuccessIndicator?: boolean;
  isValid?: boolean;
  floatingLabel?: boolean;
  onValidate?: (value: string) => string | undefined;
  validateOnBlur?: boolean;
  fieldId?: string;
  onNext?: () => void;
  onSubmit?: () => void;
  returnKeyType?: 'next' | 'done' | 'go' | 'search';
}

export const MobileTextInput = forwardRef<HTMLInputElement, MobileTextInputProps>(
  (
    {
      label,
      placeholder,
      value,
      onChange,
      type = 'text',
      error,
      helperText,
      icon,
      maxLength,
      required = false,
      disabled = false,
      className,
      showClearButton = true,
      showSuccessIndicator = false,
      isValid,
      floatingLabel = true,
      onValidate,
      validateOnBlur = true,
      autoFocus,
      fieldId,
      onNext,
      onSubmit,
      returnKeyType,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [internalError, setInternalError] = useState<string | undefined>(error);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
      setInternalError(error);
    }, [error]);

    // Auto-focus on mount if specified
    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus();
      }
    }, [autoFocus]);

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasValue = value.length > 0;
    const showLabel = floatingLabel ? (isFocused || hasValue) : true;
    const showPlaceholder = !floatingLabel || isFocused || !hasValue;

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
      inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // If returnKeyType is 'done' or onSubmit is provided, submit
        if (returnKeyType === 'done' || onSubmit) {
          onSubmit?.();
        } 
        // If returnKeyType is 'next' or onNext is provided, go to next field
        else if (returnKeyType === 'next' || onNext) {
          onNext?.();
        }
      }
      
      // Call original onKeyDown if provided
      props.onKeyDown?.(e);
    };

    // Determine if input is valid
    const showSuccess = showSuccessIndicator && hasValue && !internalError && (isValid !== undefined ? isValid : true);

    return (
      <div className={cn('w-full', className)}>
        {/* Label - always visible when not floating */}
        {!floatingLabel && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Floating Label */}
          {floatingLabel && (
            <label
              className={cn(
                'absolute left-4 transition-all duration-200 pointer-events-none',
                'text-muted-foreground',
                icon && 'left-12',
                showLabel
                  ? 'top-2 text-xs'
                  : 'top-1/2 -translate-y-1/2 text-base',
                isFocused && 'text-primary'
              )}
            >
              {label}
              {required && <span className="text-destructive ml-1">*</span>}
            </label>
          )}

          {/* Left Icon */}
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5">
              {icon}
            </div>
          )}

          {/* Input - 16px font size minimum to prevent iOS zoom */}
          <input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              // @ts-ignore
              inputRef.current = node;
            }}
            type={inputType}
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              if (internalError) setInternalError(undefined);
            }}
            placeholder={showPlaceholder ? placeholder : undefined}
            maxLength={maxLength}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            enterKeyHint={returnKeyType}
            inputMode={
              type === 'email' ? 'email' :
              type === 'tel' ? 'tel' :
              type === 'number' ? 'numeric' :
              type === 'url' ? 'url' :
              'text'
            }
            className={cn(
              'w-full px-4 text-base', // 16px minimum font size
              'bg-background border rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
              'placeholder:text-muted-foreground',
              'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
              '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
              floatingLabel ? (hasValue || isFocused ? 'pt-6 pb-2' : 'py-3') : 'py-3',
              icon && 'pl-12',
              (type === 'password' || showClearButton || showSuccess) && 'pr-12',
              internalError
                ? 'border-destructive focus:border-destructive focus:ring-destructive'
                : isFocused
                ? 'border-primary'
                : 'border-input'
            )}
            {...props}
          />

          {/* Right Side Actions */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Success Indicator */}
            {showSuccess && (
              <Check className="w-5 h-5 text-green-500" />
            )}

            {/* Clear Button */}
            {showClearButton && hasValue && !disabled && type !== 'password' && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Clear input"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Password Toggle */}
            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            )}
          </div>
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

          {maxLength && hasValue && (
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

MobileTextInput.displayName = 'MobileTextInput';
