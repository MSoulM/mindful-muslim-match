import { ComponentType } from 'react';

interface SkeletonListProps {
  count?: number;
  component: ComponentType;
  className?: string;
}

export const SkeletonList = ({ 
  count = 3, 
  component: Component,
  className = 'space-y-3'
}: SkeletonListProps) => {
  return (
    <div className={className}>
      {Array.from({ length: count }).map((_, i) => (
        <Component key={i} />
      ))}
    </div>
  );
};
