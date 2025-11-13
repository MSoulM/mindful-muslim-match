import { SkeletonBase } from './SkeletonBase';

export const SkeletonMessagesScreen = () => {
  return (
    <div className="space-y-2 pb-4">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="flex gap-3 p-4 hover:bg-muted/50 transition-colors">
          {/* Avatar */}
          <SkeletonBase className="w-14 h-14 rounded-full flex-shrink-0" />

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <SkeletonBase className="h-5 w-32 rounded" />
              <SkeletonBase className="h-4 w-16 rounded" />
            </div>
            <SkeletonBase className="h-4 w-full rounded mb-1" />
            <SkeletonBase className="h-4 w-2/3 rounded" />
          </div>

          {/* Badge */}
          {i % 3 === 0 && (
            <SkeletonBase className="w-6 h-6 rounded-full flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
};
