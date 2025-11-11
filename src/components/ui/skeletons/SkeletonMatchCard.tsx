import { SkeletonBase } from './SkeletonBase';

export const SkeletonMatchCard = () => {
  return (
    <div className="bg-background rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBase className="w-12 h-12 rounded-full" />
        <div className="flex-1">
          <SkeletonBase className="h-5 w-24 mb-2 rounded" />
          <SkeletonBase className="h-4 w-32 rounded" />
        </div>
        <SkeletonBase className="h-6 w-16 rounded-full" />
      </div>
      
      {/* Photo */}
      <SkeletonBase className="h-64 w-full rounded-xl mb-4" />
      
      {/* Bio */}
      <div className="space-y-2 mb-4">
        <SkeletonBase className="h-4 w-full rounded" />
        <SkeletonBase className="h-4 w-4/5 rounded" />
        <SkeletonBase className="h-4 w-3/4 rounded" />
      </div>
      
      {/* Button */}
      <SkeletonBase className="h-12 w-full rounded-full" />
    </div>
  );
};
