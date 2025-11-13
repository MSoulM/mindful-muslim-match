import { useState, forwardRef, InputHTMLAttributes, useEffect } from 'react';
import { Phone, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhoneInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type' | 'value'> {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  helperText?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showClearButton?: boolean;
  showSuccessIndicator?: boolean;
  isValid?: boolean;
  floatingLabel?: boolean;
  countryCode?: string;
}

// Format phone number: (123) 456-7890
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  
  if (cleaned.length <= 3) {
    return cleaned;
  } else if (cleaned.length <= 6) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
  } else {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
  }
};

// Remove formatting from phone number
const unformatPhoneNumber = (value: string): string => {
  return value.replace(/\D/g, '');
};

export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(
  (
    {
      label,
      placeholder = '(123) 456-7890',
      value,
      onChange,
      error,
      helperText,
      required = false,
      disabled = false,
      className,
      showClearButton = true,
      showSuccessIndicator = false,
      isValid,
      floatingLabel = true,
      countryCode = '+44',
      autoFocus,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [displayValue, setDisplayValue] = useState('');

    useEffect(() => {
      // Format the initial value
      setDisplayValue(formatPhoneNumber(value));
    }, [value]);

    const hasValue = displayValue.length > 0;
    const showLabel = floatingLabel ? (isFocused || hasValue) : true;
    const showPlaceholder = !floatingLabel || isFocused || !hasValue;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const cleaned = unformatPhoneNumber(inputValue);
      
      // Limit to 10 digits
      if (cleaned.length <= 10) {
        const formatted = formatPhoneNumber(cleaned);
        setDisplayValue(formatted);
        onChange(cleaned);
      }
    };

    const handleClear = () => {
      setDisplayValue('');
      onChange('');
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text');
      const cleaned = unformatPhoneNumber(pastedText);
      
      if (cleaned.length <= 10) {
        const formatted = formatPhoneNumber(cleaned);
        setDisplayValue(formatted);
        onChange(cleaned);
      }
    };

    // Validate phone number (10 digits)
    const isPhoneValid = isValid !== undefined ? isValid : (hasValue && unformatPhoneNumber(displayValue).length === 10);
    const showSuccess = showSuccessIndicator && isPhoneValid;

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
                'absolute left-14 transition-all duration-200 pointer-events-none',
                'text-muted-foreground',
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

          {/* Country Code */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground">
            <Phone className="w-5 h-5" />
            <span className="text-base font-medium">{countryCode}</span>
          </div>

          {/* Input - 16px font size minimum to prevent iOS zoom */}
          <input
            ref={ref}
            type="tel"
            value={displayValue}
            onChange={handleChange}
            onPaste={handlePaste}
            placeholder={showPlaceholder ? placeholder : undefined}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            inputMode="tel"
            autoComplete="tel"
            autoFocus={autoFocus}
            className={cn(
              'w-full px-4 text-base', // 16px minimum font size
              'bg-background border rounded-lg',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0',
              'placeholder:text-muted-foreground',
              'disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed',
              floatingLabel ? (hasValue || isFocused ? 'pt-6 pb-2' : 'py-3') : 'py-3',
              'pl-20', // Space for country code
              'pr-12', // Space for actions
              error
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
            {showClearButton && hasValue && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-muted-foreground hover:text-foreground transition-colors"
                tabIndex={-1}
                aria-label="Clear phone number"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Helper Text or Error */}
        {(error || helperText) && (
          <p
            className={cn(
              'mt-2 text-sm',
              error ? 'text-destructive' : 'text-muted-foreground'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
