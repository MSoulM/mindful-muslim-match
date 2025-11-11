import { SkeletonBase } from './SkeletonBase';

export const SkeletonInsightCard = () => {
  return (
    <div className="bg-background rounded-xl p-4 border-l-4 border-orange-400">
      <div className="flex justify-between items-start mb-3">
        <SkeletonBase className="h-5 w-24 rounded-full" />
        <SkeletonBase className="h-5 w-12 rounded" />
      </div>
      <SkeletonBase className="h-6 w-40 mb-2 rounded" />
      <div className="space-y-1.5 mb-3">
        <SkeletonBase className="h-4 w-full rounded" />
        <SkeletonBase className="h-4 w-4/5 rounded" />
      </div>
      <SkeletonBase className="h-16 w-full rounded-lg mb-3" />
      <div className="flex gap-2">
        <SkeletonBase className="h-10 flex-1 rounded-full" />
        <SkeletonBase className="h-10 flex-1 rounded-full" />
      </div>
    </div>
  );
};
