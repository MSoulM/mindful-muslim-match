import React, { useState, useEffect } from 'react';

interface DepthStats {
  surface_count: number;
  context_count: number;
  emotional_count: number;
  transformational_count: number;
  average_depth: number;
  total_shares: number;
}

export const DepthProgress: React.FC = () => {
  const [stats, setStats] = useState<DepthStats>({
    surface_count: 8,
    context_count: 12,
    emotional_count: 5,
    transformational_count: 2,
    average_depth: 2.1,
    total_shares: 27
  });
  
  useEffect(() => {
    fetchDepthStats();
  }, []);
  
  const fetchDepthStats = async () => {
    try {
      // In production, fetch from API
      // const response = await fetch('/api/user/depth-stats');
      // const data = await response.json();
      // setStats(data);
    } catch (error) {
      console.error('Failed to fetch depth stats:', error);
    }
  };
  
  const depthDistribution = [
    { 
      level: 'Surface', 
      count: stats.surface_count, 
      color: 'bg-muted', 
      multiplier: 1,
      description: 'Basic facts'
    },
    { 
      level: 'Context', 
      count: stats.context_count, 
      color: 'bg-blue-500', 
      multiplier: 2,
      description: 'With meaning'
    },
    { 
      level: 'Emotional', 
      count: stats.emotional_count, 
      color: 'bg-purple-500', 
      multiplier: 3,
      description: 'With feelings'
    },
    { 
      level: 'Transformational', 
      count: stats.transformational_count, 
      color: 'bg-amber-500', 
      multiplier: 5,
      description: 'Growth stories'
    }
  ];
  
  const totalPoints = depthDistribution.reduce((sum, item) => 
    sum + (item.count * item.multiplier), 0
  );
  
  return (
    <div className="bg-card rounded-lg border border-border p-6 space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-2">Your Sharing Depth</h3>
        <p className="text-sm text-muted-foreground">
          Quality matters more than quantity. Deeper shares build stronger DNA.
        </p>
      </div>
      
      {/* Average depth score */}
      <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg border border-primary/20">
        <div>
          <div className="text-sm text-muted-foreground">Average Depth</div>
          <div className="text-3xl font-bold text-primary">
            {stats.average_depth.toFixed(1)}
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-muted-foreground">Total Points</div>
          <div className="text-2xl font-semibold text-foreground">
            {totalPoints}
          </div>
        </div>
      </div>
      
      {/* Depth distribution */}
      <div className="space-y-3">
        {depthDistribution.map((item) => {
          const points = item.count * item.multiplier;
          const percentage = stats.total_shares > 0 
            ? (item.count / stats.total_shares) * 100 
            : 0;
          
          return (
            <div key={item.level} className="space-y-1">
              <div className="flex justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.level}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
                <span className="text-muted-foreground">
                  {item.count} × {item.multiplier}x = {points}pts
                </span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className={`h-full ${item.color} transition-all duration-800 ease-out`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Encouragement message */}
      {stats.transformational_count === 0 && stats.total_shares > 3 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg animate-in fade-in-50 duration-500">
          <div className="flex gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <div className="font-semibold text-amber-900 dark:text-amber-100">
                Try sharing a transformation story
              </div>
              <div className="text-sm text-amber-800 dark:text-amber-200 mt-1">
                Stories of growth and change (5x multiplier) create the deepest connections
              </div>
            </div>
          </div>
        </div>
      )}
      
      {stats.transformational_count > 0 && (
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex gap-3">
            <span className="text-2xl">🌟</span>
            <div>
              <div className="font-semibold text-foreground">
                You're building deep connections!
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Your transformational stories earn 5x DNA points and resonate deeply with matches
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
