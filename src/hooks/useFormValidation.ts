import { useState, useCallback, useRef, useEffect } from 'react';

interface ValidationRule {
  required?: { value: boolean; message: string };
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  pattern?: { value: RegExp; message: string };
  validate?: (value: string) => string | undefined;
}

interface FieldConfig {
  [fieldName: string]: ValidationRule;
}

interface FormState {
  [fieldName: string]: string;
}

interface FormErrors {
  [fieldName: string]: string | undefined;
}

interface TouchedFields {
  [fieldName: string]: boolean;
}

interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  debounceMs?: number;
}

export const useFormValidation = (
  fieldConfigs: FieldConfig,
  options: UseFormValidationOptions = {}
) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    debounceMs = 300,
  } = options;

  const [formState, setFormState] = useState<FormState>({});
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [isValidating, setIsValidating] = useState(false);
  const debounceTimers = useRef<{ [key: string]: NodeJS.Timeout }>({});

  // Validate a single field
  const validateField = useCallback(
    (fieldName: string, value: string): string | undefined => {
      const rules = fieldConfigs[fieldName];
      if (!rules) return undefined;

      // Required validation
      if (rules.required?.value && !value.trim()) {
        return rules.required.message;
      }

      // Only validate other rules if field has value
      if (!value.trim()) return undefined;

      // Min length validation
      if (rules.minLength && value.length < rules.minLength.value) {
        return rules.minLength.message;
      }

      // Max length validation
      if (rules.maxLength && value.length > rules.maxLength.value) {
        return rules.maxLength.message;
      }

      // Pattern validation
      if (rules.pattern && !rules.pattern.value.test(value)) {
        return rules.pattern.message;
      }

      // Custom validation
      if (rules.validate) {
        return rules.validate(value);
      }

      return undefined;
    },
    [fieldConfigs]
  );

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(fieldConfigs).forEach((fieldName) => {
      const value = formState[fieldName] || '';
      const error = validateField(fieldName, value);
      if (error) {
        newErrors[fieldName] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [formState, fieldConfigs, validateField]);

  // Handle field change with debounced validation
  const handleChange = useCallback(
    (fieldName: string, value: string) => {
      setFormState((prev) => ({ ...prev, [fieldName]: value }));

      // Clear error immediately on change
      if (errors[fieldName]) {
        setErrors((prev) => ({ ...prev, [fieldName]: undefined }));
      }

      if (validateOnChange) {
        // Clear existing timer
        if (debounceTimers.current[fieldName]) {
          clearTimeout(debounceTimers.current[fieldName]);
        }

        // Set new timer for validation
        debounceTimers.current[fieldName] = setTimeout(() => {
          const error = validateField(fieldName, value);
          setErrors((prev) => ({ ...prev, [fieldName]: error }));
          setIsValidating(false);
        }, debounceMs);

        setIsValidating(true);
      }
    },
    [errors, validateOnChange, debounceMs, validateField]
  );

  // Handle field blur
  const handleBlur = useCallback(
    (fieldName: string) => {
      setTouched((prev) => ({ ...prev, [fieldName]: true }));

      if (validateOnBlur) {
        const value = formState[fieldName] || '';
        const error = validateField(fieldName, value);
        setErrors((prev) => ({ ...prev, [fieldName]: error }));
      }
    },
    [formState, validateOnBlur, validateField]
  );

  // Reset form
  const resetForm = useCallback(() => {
    setFormState({});
    setErrors({});
    setTouched({});
    
    // Clear all debounce timers
    Object.values(debounceTimers.current).forEach(clearTimeout);
    debounceTimers.current = {};
  }, []);

  // Set field value programmatically
  const setFieldValue = useCallback((fieldName: string, value: string) => {
    setFormState((prev) => ({ ...prev, [fieldName]: value }));
  }, []);

  // Set field error programmatically
  const setFieldError = useCallback((fieldName: string, error: string | undefined) => {
    setErrors((prev) => ({ ...prev, [fieldName]: error }));
  }, []);

  // Get field props for easy integration
  const getFieldProps = useCallback(
    (fieldName: string) => ({
      value: formState[fieldName] || '',
      onChange: (value: string) => handleChange(fieldName, value),
      onBlur: () => handleBlur(fieldName),
      error: touched[fieldName] ? errors[fieldName] : undefined,
      onValidate: (value: string) => validateField(fieldName, value),
    }),
    [formState, touched, errors, handleChange, handleBlur, validateField]
  );

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      Object.values(debounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  // Check if form has errors
  const hasErrors = Object.values(errors).some((error) => error !== undefined);

  // Check if form is dirty (has any changes)
  const isDirty = Object.keys(formState).length > 0;

  return {
    formState,
    errors,
    touched,
    isValidating,
    handleChange,
    handleBlur,
    validateField,
    validateForm,
    resetForm,
    setFieldValue,
    setFieldError,
    getFieldProps,
    hasErrors,
    isDirty,
  };
};

// Common validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^[\d\s\-\(\)]+$/,
  url: /^https?:\/\/.+/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphabetic: /^[a-zA-Z\s]+$/,
  numeric: /^\d+$/,
};

// Common validation rules
export const commonValidations = {
  email: {
    required: { value: true, message: 'Email is required' },
    pattern: {
      value: validationPatterns.email,
      message: 'Please enter a valid email address',
    },
  },
  password: {
    required: { value: true, message: 'Password is required' },
    minLength: { value: 8, message: 'Password must be at least 8 characters' },
  },
  name: {
    required: { value: true, message: 'Name is required' },
    minLength: { value: 2, message: 'Name must be at least 2 characters' },
    maxLength: { value: 50, message: 'Name must not exceed 50 characters' },
  },
  phone: {
    required: { value: true, message: 'Phone number is required' },
    validate: (value: string) => {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length !== 10) {
        return 'Phone number must be 10 digits';
      }
      return undefined;
    },
  },
};
