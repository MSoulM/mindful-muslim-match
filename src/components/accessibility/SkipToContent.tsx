import { cn } from '@/lib/utils';

interface SkipLink {
  href: string;
  label: string;
}

interface SkipToContentProps {
  links?: SkipLink[];
  className?: string;
}

/**
 * Skip navigation links for keyboard users
 * Allows users to skip repetitive navigation and jump to main content
 */
export function SkipToContent({ 
  links = [
    { href: '#main-content', label: 'Skip to main content' },
    { href: '#bottom-nav', label: 'Skip to navigation' },
  ],
  className 
}: SkipToContentProps) {
  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)}>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={cn(
            'fixed top-4 left-4 z-[9999]',
            'px-4 py-2 bg-primary text-primary-foreground',
            'rounded-lg font-medium',
            'focus:outline-none focus:ring-4 focus:ring-ring',
            'transition-all duration-200',
            'shadow-lg'
          )}
        >
          {link.label}
        </a>
      ))}
    </div>
  );
}
