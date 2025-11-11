import { SkeletonBase } from './SkeletonBase';

export const SkeletonChaiChatCard = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border min-h-[90px]">
      {/* Left Border Indicator */}
      <div className="absolute left-0 w-1 h-full bg-neutral-200" />
      
      {/* Avatar */}
      <SkeletonBase className="w-12 h-12 rounded-full flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <SkeletonBase className="h-5 w-32 rounded" />
          <SkeletonBase className="h-5 w-12 rounded-full" />
        </div>
        <SkeletonBase className="h-4 w-24 mb-2 rounded" />
        <SkeletonBase className="h-4 w-40 rounded" />
      </div>
      
      {/* Chevron */}
      <SkeletonBase className="w-5 h-5 rounded flex-shrink-0" />
    </div>
  );
};
