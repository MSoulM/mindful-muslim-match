import { ReactNode, KeyboardEvent as ReactKeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface KeyboardNavigableProps {
  onEnter?: () => void;
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  children: ReactNode;
  className?: string;
  role?: string;
  ariaLabel?: string;
}

export const KeyboardNavigable = ({
  onEnter,
  onEscape,
  onArrowUp,
  onArrowDown,
  onArrowLeft,
  onArrowRight,
  children,
  className,
  role = 'button',
  ariaLabel,
}: KeyboardNavigableProps) => {
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    switch(e.key) {
      case 'Enter':
      case ' ':
        if (onEnter) {
          e.preventDefault();
          onEnter();
        }
        break;
      case 'Escape':
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        break;
      case 'ArrowUp':
        if (onArrowUp) {
          e.preventDefault();
          onArrowUp();
        }
        break;
      case 'ArrowDown':
        if (onArrowDown) {
          e.preventDefault();
          onArrowDown();
        }
        break;
      case 'ArrowLeft':
        if (onArrowLeft) {
          e.preventDefault();
          onArrowLeft();
        }
        break;
      case 'ArrowRight':
        if (onArrowRight) {
          e.preventDefault();
          onArrowRight();
        }
        break;
    }
  };
  
  return (
    <div 
      onKeyDown={handleKeyDown} 
      tabIndex={0}
      role={role}
      aria-label={ariaLabel}
      className={cn('focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2', className)}
    >
      {children}
    </div>
  );
};
