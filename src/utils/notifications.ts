import { toast } from 'sonner';

/**
 * Notification Utilities
 * Centralized toast notification functions for MuslimSoulmate.ai
 */

// Success notification
export function notifySuccess(
  message: string,
  options?: {
    description?: string;
    duration?: number;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
) {
  toast.success(message, {
    description: options?.description,
    duration: options?.duration || 4000,
    action: options?.action,
  });
}

// Error notification
export function notifyError(
  message: string,
  options?: {
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    };
  }
) {
  toast.error(message, {
    description: options?.description,
    duration: 6000, // Errors stay longer
    action: options?.action,
  });
}

// Info notification
export function notifyInfo(
  message: string,
  options?: {
    description?: string;
    duration?: number;
  }
) {
  toast.info(message, {
    description: options?.description,
    duration: options?.duration || 4000,
  });
}

// Warning notification
export function notifyWarning(
  message: string,
  options?: {
    description?: string;
    duration?: number;
  }
) {
  toast.warning(message, {
    description: options?.description,
    duration: options?.duration || 5000,
  });
}

// Loading notification (with promise)
export function notifyLoading<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string;
    error: string;
  }
) {
  toast.promise(promise, {
    loading: messages.loading,
    success: messages.success,
    error: messages.error,
  });
  
  return promise;
}

// Custom toast with component
export function notifyCustom(
  component: (id: string | number) => React.ReactElement,
  options?: {
    duration?: number;
    position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  }
) {
  return toast.custom(component, {
    duration: options?.duration || 5000,
    position: options?.position,
  });
}
