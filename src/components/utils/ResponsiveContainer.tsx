import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
  center?: boolean;
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

/**
 * Responsive container that adapts to different screen sizes
 */
export function ResponsiveContainer({
  children,
  className,
  maxWidth = 'lg',
  padding = true,
  center = true,
}: ResponsiveContainerProps) {
  return (
    <div
      className={cn(
        'w-full',
        maxWidthClasses[maxWidth],
        center && 'mx-auto',
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-4',
  md: 'gap-6',
  lg: 'gap-8',
};

/**
 * Responsive grid that adapts columns based on screen size
 */
export function ResponsiveGrid({
  children,
  className,
  cols = { xs: 1, sm: 2, md: 2, lg: 3, xl: 4 },
  gap = 'md',
}: ResponsiveGridProps) {
  const gridColsClasses = [
    cols.xs && `grid-cols-${cols.xs}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div className={cn('grid', gridColsClasses, gapClasses[gap], className)}>
      {children}
    </div>
  );
}

interface ResponsiveShowProps {
  children: ReactNode;
  above?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  below?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  only?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Conditionally render children based on screen size
 */
export function ResponsiveShow({ children, above, below, only }: ResponsiveShowProps) {
  const { isXs, isSm, isMd, isLg, isXl } = useResponsive();

  let shouldShow = true;

  if (only) {
    shouldShow =
      (only === 'xs' && isXs) ||
      (only === 'sm' && isSm) ||
      (only === 'md' && isMd) ||
      (only === 'lg' && isLg) ||
      (only === 'xl' && isXl);
  } else {
    if (above) {
      shouldShow =
        (above === 'xs' && !isXs) ||
        (above === 'sm' && (isMd || isLg || isXl)) ||
        (above === 'md' && (isLg || isXl)) ||
        (above === 'lg' && isXl);
    }
    if (below) {
      shouldShow =
        shouldShow &&
        ((below === 'sm' && isXs) ||
         (below === 'md' && (isXs || isSm)) ||
         (below === 'lg' && (isXs || isSm || isMd)) ||
         (below === 'xl' && (isXs || isSm || isMd || isLg)));
    }
  }

  return shouldShow ? <>{children}</> : null;
}

interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl';
  responsive?: boolean;
}

/**
 * Responsive text that scales appropriately
 */
export function ResponsiveText({
  children,
  className,
  size = 'base',
  responsive = true,
}: ResponsiveTextProps) {
  const sizeClasses = responsive
    ? {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-sm sm:text-base',
        lg: 'text-base sm:text-lg',
        xl: 'text-lg sm:text-xl',
        '2xl': 'text-xl sm:text-2xl',
        '3xl': 'text-2xl sm:text-3xl lg:text-4xl',
      }
    : {
        xs: 'text-xs',
        sm: 'text-sm',
        base: 'text-base',
        lg: 'text-lg',
        xl: 'text-xl',
        '2xl': 'text-2xl',
        '3xl': 'text-3xl',
      };

  return <span className={cn(sizeClasses[size], className)}>{children}</span>;
}
