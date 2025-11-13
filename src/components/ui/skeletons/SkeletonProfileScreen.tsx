import { SkeletonBase } from './SkeletonBase';

export const SkeletonProfileScreen = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Profile Header */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar */}
          <SkeletonBase className="w-32 h-32 rounded-full" />
          
          {/* Name and Location */}
          <div className="space-y-2 w-full">
            <SkeletonBase className="h-8 w-48 mx-auto rounded" />
            <SkeletonBase className="h-4 w-56 mx-auto rounded" />
          </div>

          {/* Bio */}
          <div className="space-y-2 w-full pt-2">
            <SkeletonBase className="h-4 w-full rounded" />
            <SkeletonBase className="h-4 w-5/6 mx-auto rounded" />
            <SkeletonBase className="h-4 w-4/6 mx-auto rounded" />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 w-full pt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center">
                <SkeletonBase className="h-8 w-16 mx-auto mb-2 rounded" />
                <SkeletonBase className="h-4 w-20 mx-auto rounded" />
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full pt-4">
            <SkeletonBase className="h-12 flex-1 rounded-full" />
            <SkeletonBase className="h-12 w-12 rounded-full" />
          </div>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="bg-card rounded-2xl p-6 shadow-sm">
        <SkeletonBase className="h-6 w-32 mb-4 rounded" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SkeletonBase key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="bg-card rounded-2xl p-6 shadow-sm space-y-4">
        <SkeletonBase className="h-6 w-32 rounded" />
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <SkeletonBase className="w-5 h-5 rounded" />
            <SkeletonBase className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
};
