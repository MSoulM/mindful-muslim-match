import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SafeAreaProps {
  top?: boolean;
  bottom?: boolean;
  left?: boolean;
  right?: boolean;
  children: ReactNode;
  className?: string;
}

export const SafeArea = ({ 
  top = true, 
  bottom = true, 
  left = false, 
  right = false,
  children,
  className 
}: SafeAreaProps) => {
  return (
    <div
      className={cn(className)}
      style={{
        paddingTop: top ? 'env(safe-area-inset-top)' : undefined,
        paddingBottom: bottom ? 'env(safe-area-inset-bottom)' : undefined,
        paddingLeft: left ? 'env(safe-area-inset-left)' : undefined,
        paddingRight: right ? 'env(safe-area-inset-right)' : undefined,
      }}
    >
      {children}
    </div>
  );
};
