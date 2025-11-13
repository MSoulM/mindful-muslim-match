import { SkeletonBase } from './SkeletonBase';

export const SkeletonDNAScreen = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Header Stats */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <div className="text-center space-y-4">
          <SkeletonBase className="h-8 w-48 mx-auto rounded" />
          <SkeletonBase className="h-32 w-32 mx-auto rounded-full" />
          <SkeletonBase className="h-6 w-64 mx-auto rounded" />
          
          <div className="grid grid-cols-3 gap-4 pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <SkeletonBase className="h-8 w-16 mx-auto mb-2 rounded" />
                <SkeletonBase className="h-4 w-20 mx-auto rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DNA Categories */}
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-card rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-4">
              {/* Icon */}
              <SkeletonBase className="w-12 h-12 rounded-full flex-shrink-0" />

              {/* Content */}
              <div className="flex-1">
                <SkeletonBase className="h-5 w-40 mb-2 rounded" />
                <SkeletonBase className="h-4 w-56 rounded" />
              </div>

              {/* Progress */}
              <div className="text-right">
                <SkeletonBase className="h-8 w-16 mb-1 rounded" />
                <SkeletonBase className="h-3 w-20 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
