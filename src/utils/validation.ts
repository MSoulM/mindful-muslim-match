interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validate content text input
 */
export function validateContent(content: string): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!content || content.trim().length === 0) {
    errors.content = 'Content is required';
  } else if (content.length < 20) {
    errors.content = 'Content must be at least 20 characters';
  } else if (content.length > 5000) {
    errors.content = 'Content must be less than 5000 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate category selection
 */
export function validateCategory(categoryId: string | null): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!categoryId) {
    errors.category = 'Please select a category';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate file upload
 */
export function validateFile(file: File | null, maxSizeMB: number = 10): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!file) {
    errors.file = 'Please select a file';
    return { isValid: false, errors };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    errors.file = `File size must be less than ${maxSizeMB}MB`;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: Record<string, string> = {};
  
  if (!email || email.trim().length === 0) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Invalid email format';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(html: string): string {
  // Basic sanitization - remove script tags and event handlers
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');
}
