import { SkeletonBase } from './SkeletonBase';

export const SkeletonMessageCard = () => {
  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-background border-b border-border min-h-[72px]">
      {/* Avatar */}
      <SkeletonBase className="w-12 h-12 rounded-full flex-shrink-0" />
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <SkeletonBase className="h-5 w-28 mb-2 rounded" />
        <SkeletonBase className="h-4 w-48 rounded" />
      </div>
      
      {/* Meta */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <SkeletonBase className="h-3 w-8 rounded" />
        <SkeletonBase className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
};
