import { SkeletonBase } from './SkeletonBase';

interface SkeletonMessageProps {
  align?: 'left' | 'right';
}

export const SkeletonMessage = ({ align = 'left' }: SkeletonMessageProps) => {
  return (
    <div className={`flex gap-3 ${align === 'right' ? 'flex-row-reverse' : ''}`}>
      <SkeletonBase className="w-8 h-8 rounded-full shrink-0" />
      <div className="max-w-[70%]">
        <SkeletonBase className="h-20 w-48 rounded-2xl" />
        <SkeletonBase className="h-3 w-16 mt-1 rounded" />
      </div>
    </div>
  );
};
