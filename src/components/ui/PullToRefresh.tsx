import { ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  children: ReactNode;
  onRefresh: () => Promise<void>;
}

export const PullToRefresh = ({ children, onRefresh }: PullToRefreshProps) => {
  const { pullDistance, isRefreshing, handlers } = usePullToRefresh(onRefresh);
  
  const pullProgress = Math.min((pullDistance / 80) * 100, 100);
  const showIndicator = pullDistance > 20 || isRefreshing;
  
  return (
    <div className="relative h-full" {...handlers}>
      {/* Pull Indicator */}
      {showIndicator && (
        <div 
          className="absolute top-0 left-0 right-0 flex justify-center transition-transform z-50"
          style={{ 
            transform: `translateY(${isRefreshing ? 0 : pullDistance - 40}px)`,
            opacity: isRefreshing ? 1 : pullProgress / 100
          }}
        >
          <div className="bg-background rounded-full shadow-lg p-2 border border-border">
            {isRefreshing ? (
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <RefreshCw 
                className="w-6 h-6 text-primary transition-transform"
                style={{ transform: `rotate(${pullProgress * 3.6}deg)` }}
              />
            )}
          </div>
        </div>
      )}
      
      {/* Content */}
      <div 
        className="h-full"
        style={{ 
          transform: isRefreshing ? 'translateY(40px)' : `translateY(${pullDistance * 0.5}px)`,
          transition: isRefreshing ? 'transform 0.2s' : 'none'
        }}
      >
        {children}
      </div>
    </div>
  );
};
