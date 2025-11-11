import { SkeletonBase } from './SkeletonBase';

export const SkeletonDNACategory = () => {
  return (
    <div className="bg-background rounded-xl p-4 flex items-center gap-4">
      <SkeletonBase className="w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <SkeletonBase className="h-5 w-32 mb-2 rounded" />
        <div className="flex gap-3">
          <SkeletonBase className="h-4 w-16 rounded" />
          <SkeletonBase className="h-4 w-20 rounded" />
          <SkeletonBase className="h-4 w-16 rounded" />
        </div>
      </div>
      <SkeletonBase className="w-5 h-5 rounded" />
    </div>
  );
};
