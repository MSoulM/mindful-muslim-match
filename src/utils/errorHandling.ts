import { toast } from 'sonner';
import { logError } from './errorLogging';

/**
 * Handles async operations with error handling and user feedback
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Operation failed'
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    console.error(errorMessage, error);

    // Show user-friendly error
    toast.error(errorMessage, {
      description: error instanceof Error ? error.message : 'Please try again'
    });

    // Log to error service
    logError(error instanceof Error ? error : new Error(String(error)), { 
      context: errorMessage 
    });

    return null;
  }
}

/**
 * API Error class
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Make API request with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      // Handle specific status codes
      switch (response.status) {
        case 400:
          throw new APIError(400, 'Invalid request', errorData);
        case 401:
          throw new APIError(401, 'Unauthorized - please log in', errorData);
        case 403:
          throw new APIError(403, 'Access denied', errorData);
        case 404:
          throw new APIError(404, 'Not found', errorData);
        case 429:
          throw new APIError(429, 'Too many requests - please slow down', errorData);
        case 500:
          throw new APIError(500, 'Server error - please try again later', errorData);
        default:
          throw new APIError(response.status, 'Request failed', errorData);
      }
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }

    // Network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new APIError(0, 'Network error - please check your connection');
    }

    throw new APIError(0, 'Unknown error occurred');
  }
}

/**
 * Rate limiter to prevent spam
 */
class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  private maxAttempts = 5;
  private windowMs = 60000; // 1 minute

  canProceed(key: string): boolean {
    const now = Date.now();
    const attempts = this.attempts.get(key) || [];

    // Remove old attempts outside window
    const recentAttempts = attempts.filter(
      time => now - time < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      const oldestAttempt = recentAttempts[0];
      const waitTime = Math.ceil((this.windowMs - (now - oldestAttempt)) / 1000);

      toast.warning('Too many attempts', {
        description: `Please wait ${waitTime} seconds before trying again`
      });

      return false;
    }

    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(key, recentAttempts);

    return true;
  }
}

export const rateLimiter = new RateLimiter();
