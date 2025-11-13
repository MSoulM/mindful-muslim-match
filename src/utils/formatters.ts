import { formatDistanceToNow, format } from 'date-fns';

/**
 * Format a number with K, M, B suffixes
 * @example formatNumber(1234) => "1.2K"
 */
export function formatNumber(
  value: number,
  options?: {
    decimals?: number;
    style?: 'decimal' | 'currency' | 'percent';
    currency?: string;
  }
): string {
  const { decimals = 1, style = 'decimal', currency = 'USD' } = options || {};

  if (style === 'currency') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (style === 'percent') {
    return `${value.toFixed(decimals)}%`;
  }

  // Format with K, M, B suffixes
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(decimals) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(decimals) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(decimals) + 'K';
  }
  return value.toString();
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date with a specific format
 */
export function formatDate(
  date: Date,
  formatString: string = 'MMM dd, yyyy'
): string {
  return format(date, formatString);
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}
