import { SkeletonBase } from './SkeletonBase';

export const SkeletonDiscoverScreen = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Agent Message Skeleton */}
      <div className="flex gap-3 p-4 bg-card rounded-xl">
        <SkeletonBase className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBase className="h-4 w-24 rounded" />
          <SkeletonBase className="h-3 w-full rounded" />
          <SkeletonBase className="h-3 w-4/5 rounded" />
        </div>
      </div>

      {/* Match Cards Skeleton */}
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 p-4">
            <SkeletonBase className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <SkeletonBase className="h-5 w-32 mb-2 rounded" />
              <SkeletonBase className="h-4 w-48 rounded" />
            </div>
            <SkeletonBase className="h-8 w-20 rounded-full" />
          </div>

          {/* Photo */}
          <SkeletonBase className="h-80 w-full" />

          {/* Bio */}
          <div className="p-4 space-y-2">
            <SkeletonBase className="h-4 w-full rounded" />
            <SkeletonBase className="h-4 w-5/6 rounded" />
            <SkeletonBase className="h-4 w-4/6 rounded" />
          </div>

          {/* Actions */}
          <div className="p-4 pt-0 space-y-3">
            <SkeletonBase className="h-12 w-full rounded-full" />
            <SkeletonBase className="h-10 w-32 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
