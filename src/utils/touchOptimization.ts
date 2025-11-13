/**
 * Touch Optimization Utilities
 * Helpers for ensuring optimal touch interactions on mobile devices
 */

/**
 * Minimum touch target size in pixels (WCAG 2.1 Level AAA)
 */
export const MIN_TOUCH_TARGET = 44;

/**
 * Recommended spacing between touch targets
 */
export const TOUCH_TARGET_SPACING = 8;

/**
 * Check if an element meets minimum touch target requirements
 */
export const validateTouchTarget = (element: HTMLElement): boolean => {
  const rect = element.getBoundingClientRect();
  return rect.width >= MIN_TOUCH_TARGET && rect.height >= MIN_TOUCH_TARGET;
};

/**
 * Get touch-friendly CSS classes for elements
 */
export const getTouchClasses = (variant: 'button' | 'link' | 'icon' = 'button'): string => {
  const baseClasses = [
    'touch-manipulation', // Optimize for touch
    'select-none', // Prevent text selection
    'transition-all',
    'duration-200',
  ];

  const variantClasses = {
    button: [
      'min-w-[44px]',
      'min-h-[44px]',
      'active:scale-[0.97]',
      'active:opacity-90',
    ],
    link: [
      'min-h-[44px]',
      'inline-flex',
      'items-center',
      'active:opacity-70',
    ],
    icon: [
      'w-11',
      'h-11',
      'flex',
      'items-center',
      'justify-center',
      'active:scale-90',
    ],
  };

  return [...baseClasses, ...variantClasses[variant]].join(' ');
};

/**
 * Active state styles for touch feedback
 */
export const activeStateStyles = {
  // Standard button press
  button: {
    transform: 'scale(0.97)',
    opacity: 0.9,
  },
  
  // Icon button press
  icon: {
    transform: 'scale(0.9)',
  },
  
  // Card/surface press
  card: {
    transform: 'scale(0.98)',
    boxShadow: 'none',
  },
  
  // Link press
  link: {
    opacity: 0.7,
  },
};

/**
 * Platform-specific ripple effect configuration
 */
export const getRippleConfig = () => {
  const isAndroid = /android/i.test(navigator.userAgent);
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  
  return {
    enabled: isAndroid || isIOS,
    style: isAndroid ? 'ripple' : 'highlight',
    duration: isAndroid ? 300 : 200,
  };
};

/**
 * Prevent ghost clicks on mobile (iOS double-tap zoom)
 */
export const preventGhostClick = (callback: () => void) => {
  let lastTap = 0;
  
  return (event: React.TouchEvent | React.MouseEvent) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTap;
    
    if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
      event.preventDefault();
      return;
    }
    
    lastTap = now;
    callback();
  };
};

/**
 * Calculate safe area for touch targets near edges
 */
export const getSafeAreaInsets = () => {
  const style = getComputedStyle(document.documentElement);
  
  return {
    top: parseInt(style.getPropertyValue('--sat') || '0'),
    right: parseInt(style.getPropertyValue('--sar') || '0'),
    bottom: parseInt(style.getPropertyValue('--sab') || '0'),
    left: parseInt(style.getPropertyValue('--sal') || '0'),
  };
};

/**
 * Expand touch target with invisible padding
 * Use this for small visual elements that need larger hit areas
 */
export const expandTouchTarget = (visualSize: number): React.CSSProperties => {
  const expansion = Math.max(0, (MIN_TOUCH_TARGET - visualSize) / 2);
  
  return {
    padding: `${expansion}px`,
    margin: `-${expansion}px`,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
};
